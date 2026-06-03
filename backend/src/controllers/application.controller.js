import { Application } from '../models/Application.js';
import { Internship } from '../models/Internship.js';
import { Student } from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { notifyUser } from '../services/notification.service.js';

const VALID_TRANSITIONS = {
  applied: ['shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['interview_scheduled', 'rejected'],
  interview_scheduled: ['offered', 'rejected'],
  offered: ['accepted', 'rejected'],
  accepted: ['active'],
  active: ['completed'],
};

export const apply = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.body.internshipId);
  if (!internship || internship.status !== 'published') {
    throw new ApiError(400, 'INTERNSHIP_CLOSED', 'Internship not available');
  }

  const student = await Student.findOne({ userId: req.user._id });
  if (!student) throw new ApiError(400, 'VALIDATION_ERROR', 'Student profile not found');

  const existing = await Application.findOne({ studentId: student._id, internshipId: internship._id });
  if (existing) throw new ApiError(409, 'ALREADY_APPLIED', 'Already applied');

  const application = await Application.create({
    studentId: student._id,
    internshipId: internship._id,
    companyId: internship.companyId,
    userId: req.user._id,
    coverLetter: req.body.coverLetter,
    resumeSnapshot: student.resume
      ? {
          url: student.resume.url,
          filename: student.resume.filename,
          uploadedAt: student.resume.uploadedAt,
        }
      : undefined,
    status: 'applied',
    statusHistory: [{ status: 'applied', by: req.user._id, note: 'Application submitted' }],
  });

  await Internship.findByIdAndUpdate(internship._id, { $inc: { applicationCount: 1 } });

  const hrUsers = await import('../models/User.js').then((m) =>
    m.User.find({ companyId: internship.companyId, role: ROLES.COMPANY_HR })
  );
  for (const hr of hrUsers) {
    await notifyUser(hr._id, 'application.new', 'New application', `${req.user.firstName} applied for ${internship.title}`, {
      applicationId: application._id,
    });
  }

  await notifyUser(req.user._id, 'application.submitted', 'Application submitted', `You applied for ${internship.title}`, {
    applicationId: application._id,
  });

  res.status(201).json({ success: true, data: formatApp(application, internship) });
});

export const list = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: req.user._id });
    filter.studentId = student?._id;
  } else if (req.user.role === ROLES.COMPANY_HR) {
    filter.companyId = req.user.companyId;
    if (req.query.internshipId) filter.internshipId = req.query.internshipId;
    if (req.query.status) filter.status = req.query.status;
  }

  const apps = await Application.find(filter)
    .populate('internshipId', 'title type location')
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: apps.map((a) => formatApp(a, a.internshipId)) });
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

  await notifyUser(
    application.userId,
    'application.status_changed',
    'Application update',
    `Your application status is now: ${req.body.status}`,
    { applicationId: application._id, status: req.body.status }
  );

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

function formatApp(a, internship) {
  const student = a.studentId;
  return {
    id: a._id,
    status: a.status,
    coverLetter: a.coverLetter,
    appliedAt: a.appliedAt,
    internship: internship
      ? { id: internship._id, title: internship.title, type: internship.type, location: internship.location }
      : a.internshipId
        ? { id: a.internshipId._id, title: a.internshipId.title }
        : undefined,
    student: student?.userId
      ? {
          name: `${student.userId.firstName || ''} ${student.userId.lastName || ''}`.trim(),
          email: student.userId.email,
          university: student.university,
        }
      : undefined,
  };
}
