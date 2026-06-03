import { Application } from '../models/Application.js';
import { Student } from '../models/Student.js';
import { Internship } from '../models/Internship.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { notifyUser } from '../services/notification.service.js';
import { applyForInternship } from '../services/application.service.js';
import { enqueueEmail } from '../jobs/emailQueue.js';
import logger from '../utils/logger.js';
import { formatStudentProfile, formatResumeAsset } from '../utils/formatStudentProfile.js';

const VALID_TRANSITIONS = {
  applied: ['shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['interview_scheduled', 'rejected'],
  interview_scheduled: ['offered', 'rejected'],
  offered: ['accepted', 'rejected'],
  accepted: ['active'],
  active: ['completed'],
};

export const apply = asyncHandler(async (req, res) => {
  const { application, internship } = await applyForInternship({
    userId: req.user._id,
    firstName: req.user.firstName,
    internshipId: req.body.internshipId,
    coverLetter: req.body.coverLetter,
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
    resumeAtApplication: formatResumeAsset(a.resumeSnapshot),
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
