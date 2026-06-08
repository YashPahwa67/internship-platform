import PDFDocument from 'pdfkit';
import { Application } from '../models/Application.js';
import { Student } from '../models/Student.js';
import { Internship } from '../models/Internship.js';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { notifyUser } from '../services/notification.service.js';
import { applyForInternship } from '../services/application.service.js';
import { enqueueEmail } from '../jobs/emailQueue.js';
import logger from '../utils/logger.js';
import { formatStudentProfile, formatResumeAsset } from '../utils/formatStudentProfile.js';
import { uploadBuffer, resourceTypeForMime } from '../utils/cloudinary.util.js';
import { config } from '../config/env.js';

const VALID_TRANSITIONS = {
  applied: ['shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['interview_scheduled', 'rejected'],
  interview_scheduled: ['offered', 'rejected'],
  offered: ['accepted', 'rejected'],
  accepted: ['active'],
  active: ['completed'],
};

export const apply = asyncHandler(async (req, res) => {
  let resumeOverride;
  if (req.file?.buffer && config.isCloudinaryConfigured) {
    const result = await uploadBuffer(req.file.buffer, {
      resourceType: resourceTypeForMime(req.file.mimetype),
      cloudinaryOptions: {
        folder: `${config.cloudinary.folder}/resumes`,
        resource_type: 'raw',
        use_filename: true,
      },
    });
    resumeOverride = {
      url: result.secure_url,
      publicId: result.public_id,
      filename: req.file.originalname,
      uploadedAt: new Date(),
    };
  }

  let formResponses;
  try {
    formResponses = req.body.formResponses ? JSON.parse(req.body.formResponses) : undefined;
  } catch {
    formResponses = undefined;
  }

  const applicantFields = {
    name: req.body.applicantName || undefined,
    university: req.body.applicantUniversity || undefined,
    rollNo: req.body.applicantRollNo || undefined,
    cgpa: req.body.applicantCgpa !== undefined && req.body.applicantCgpa !== '' ? parseFloat(req.body.applicantCgpa) : undefined,
  };

  const { application, internship } = await applyForInternship({
    userId: req.user._id,
    firstName: req.user.firstName,
    internshipId: req.body.internshipId,
    coverLetter: req.body.coverLetter,
    resumeOverride,
    formResponses,
    applicantFields,
  });
  res.status(201).json({ success: true, data: formatApp(application, internship) });
});

export const list = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: req.user._id }).lean();
    filter.studentId = student?._id;
  } else if (req.user.role === ROLES.COMPANY_HR) {
    filter.companyId = req.user.companyId;
    if (req.query.internshipId) filter.internshipId = req.query.internshipId;
    if (req.query.status) filter.status = req.query.status;
  }

  const includeFullProfile = req.user.role === ROLES.COMPANY_HR || req.user.role === ROLES.ADMIN;

  const apps = await Application.find(filter)
    .populate('internshipId', 'title type location')
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName email' },
    })
    .sort({ createdAt: -1 })
    .lean();

  if (includeFullProfile) {
    res.set('Cache-Control', 'no-store');
  }

  res.json({
    success: true,
    data: apps.map((a) => formatApp(a, a.internshipId, { fullProfile: includeFullProfile })),
  });
});

export const getById = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };

  if (req.user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: req.user._id }).lean();
    filter.studentId = student?._id;
  } else if (req.user.role === ROLES.COMPANY_HR) {
    filter.companyId = req.user.companyId;
  }

  const app = await Application.findOne(filter)
    .populate('internshipId', 'title type location description')
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName email' },
    })
    .lean();

  if (!app) throw new ApiError(404, 'NOT_FOUND', 'Application not found');

  const fullProfile =
    req.user.role === ROLES.COMPANY_HR || req.user.role === ROLES.ADMIN;

  if (fullProfile) {
    res.set('Cache-Control', 'no-store');
  }

  res.json({
    success: true,
    data: formatApp(app, app.internshipId, { fullProfile }),
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, companyId: req.user.companyId });
  if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found');

  const allowed = VALID_TRANSITIONS[application.status] || [];
  if (!allowed.includes(req.body.status)) {
    throw new ApiError(400, 'INVALID_STATUS_TRANSITION', `Cannot transition from ${application.status} to ${req.body.status}`);
  }

  application.status = req.body.status;
  application.statusHistory.push({
    status: req.body.status,
    by: req.user._id,
    note: req.body.note,
  });
  await application.save();

  const internship = await Internship.findById(application.internshipId).select('title').lean();
  await notifyUser(
    application.userId,
    'application.status_changed',
    'Application update',
    `Your application status is now: ${req.body.status}`,
    { applicationId: application._id, status: req.body.status }
  );

  const studentUser = await User.findById(application.userId).select('email firstName').lean();
  if (studentUser?.email && internship) {
    await enqueueEmail('application-status', {
      to: studentUser.email,
      name: studentUser.firstName,
      internshipTitle: internship.title,
      status: req.body.status,
    }).catch((e) => logger.warn('Email queue failed', { message: e.message }));
  }

  res.json({ success: true, data: formatApp(application) });
});

export const withdraw = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const application = await Application.findOne({ _id: req.params.id, studentId: student._id });
  if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found');
  if (!['applied', 'shortlisted'].includes(application.status)) {
    throw new ApiError(400, 'INVALID_STATUS_TRANSITION', 'Cannot withdraw at this stage');
  }
  application.status = 'withdrawn';
  application.statusHistory.push({ status: 'withdrawn', by: req.user._id });
  await application.save();
  res.json({ success: true, data: formatApp(application) });
});

export const submitStudentReview = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const app = await Application.findOne({ _id: req.params.id, studentId: student?._id, status: 'completed' });
  if (!app) throw new ApiError(404, 'NOT_FOUND', 'Completed application not found');
  if (app.studentReview?.submittedAt) throw new ApiError(400, 'ALREADY_REVIEWED', 'Review already submitted');

  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'VALIDATION_ERROR', 'Rating must be 1–5');

  app.studentReview = { rating, comment, submittedAt: new Date() };
  await app.save();
  res.json({ success: true, data: { rating, comment } });
});

export const submitCompanyReview = asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, companyId: req.user.companyId, status: 'completed' });
  if (!app) throw new ApiError(404, 'NOT_FOUND', 'Completed application not found');
  if (app.companyReview?.submittedAt) throw new ApiError(400, 'ALREADY_REVIEWED', 'Review already submitted');

  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'VALIDATION_ERROR', 'Rating must be 1–5');

  app.companyReview = { rating, comment, submittedAt: new Date() };
  await app.save();
  res.json({ success: true, data: { rating, comment } });
});

export const getCertificate = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const app = await Application.findOne({ _id: req.params.id, studentId: student?._id, status: 'completed' })
    .populate('internshipId', 'title type duration')
    .lean();
  if (!app) throw new ApiError(404, 'NOT_FOUND', 'Completed application not found');

  const company = await Company.findById(app.companyId).lean();
  const studentUser = await User.findById(req.user._id).lean();
  const studentName = student?.fullName || `${studentUser?.firstName || ''} ${studentUser?.lastName || ''}`.trim();

  const doc = new PDFDocument({ size: 'A4', margin: 60 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="certificate-${app._id}.pdf"`);
  doc.pipe(res);

  doc.font('Helvetica-Bold').fontSize(28).text('Certificate of Completion', { align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(14).fillColor('#555')
    .text('This certifies that', { align: 'center' });
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#111')
    .text(studentName, { align: 'center' });
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(14).fillColor('#555')
    .text('has successfully completed the internship', { align: 'center' });
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#111')
    .text(app.internshipId?.title || 'Internship Program', { align: 'center' });
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(14).fillColor('#555')
    .text(`at ${company?.name || 'the company'}`, { align: 'center' });
  doc.moveDown(1.5);
  const completedDate = app.statusHistory?.findLast?.(h => h.status === 'completed')?.at || new Date();
  doc.font('Helvetica').fontSize(12).fillColor('#777')
    .text(`Completed: ${new Date(completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11).fillColor('#aaa')
    .text(`Certificate ID: ${app._id}`, { align: 'center' });

  doc.end();
});

export const exportCsv = asyncHandler(async (req, res) => {
  const filter = { companyId: req.user.companyId };
  if (req.query.internshipId) filter.internshipId = req.query.internshipId;
  if (req.query.status) filter.status = req.query.status;

  const apps = await Application.find(filter)
    .populate('internshipId', 'title')
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'email firstName lastName' } })
    .sort({ createdAt: -1 })
    .lean();

  const esc = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };

  const header = ['Name', 'Email', 'University', 'Roll No', 'CGPA', 'Skills', 'Internship', 'Status', 'Applied At', 'Resume URL'];
  const rows = apps.map((a) => {
    const snap = a.applicantSnapshot || {};
    const student = a.studentId;
    const user = student?.userId;
    const name = snap.name || student?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '';
    const email = snap.email || user?.email || '';
    const skills = (student?.skills || []).join('; ');
    return [
      esc(name), esc(email), esc(snap.university || student?.college || ''),
      esc(snap.rollNo || ''), esc(snap.cgpa ?? ''),
      esc(skills), esc(a.internshipId?.title || ''),
      esc(a.status), esc(a.appliedAt ? new Date(a.appliedAt).toISOString().split('T')[0] : ''),
      esc(a.resumeSnapshot?.url || ''),
    ].join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  const filename = `applications-${req.query.status || 'all'}-${Date.now()}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

function formatApp(a, internship, options = {}) {
  const { fullProfile = false } = options;
  const student = a.studentId;

  let studentPayload;
  if (fullProfile && student && typeof student === 'object') {
    studentPayload = formatStudentProfile(student);
  } else if (student?.userId) {
    studentPayload = {
      name: `${student.userId.firstName || ''} ${student.userId.lastName || ''}`.trim(),
      email: student.userId.email,
      college: student.college || student.university,
    };
  }

  return {
    id: a._id,
    status: a.status,
    coverLetter: a.coverLetter,
    appliedAt: a.appliedAt,
    applicantSnapshot: a.applicantSnapshot,
    resumeAtApplication: formatResumeAsset(a.resumeSnapshot),
    formResponses: a.formResponses || [],
    internship: internship
      ? {
          id: internship._id,
          title: internship.title,
          type: internship.type,
          location: internship.location,
          description: internship.description,
        }
      : a.internshipId
        ? { id: a.internshipId._id, title: a.internshipId.title }
        : undefined,
    student: studentPayload,
  };
}
