import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Internship } from '../models/Internship.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { notifyUser } from './notification.service.js';
import { enqueueEmail } from '../jobs/emailQueue.js';
import logger from '../utils/logger.js';

export async function applyForInternship({ userId, firstName, internshipId, coverLetter, resumeOverride, formResponses }) {
  if (!mongoose.Types.ObjectId.isValid(internshipId)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid internship id');
  }

  const session = await mongoose.startSession();
  let application;

  try {
    session.startTransaction();

    const student = await Student.findOne({ userId }).session(session);
    if (!student) throw new ApiError(400, 'VALIDATION_ERROR', 'Student profile not found');

    const existing = await Application.findOne({
      studentId: student._id,
      internshipId,
    }).session(session);
    if (existing) throw new ApiError(409, 'ALREADY_APPLIED', 'Already applied');

    const internship = await Internship.findOneAndUpdate(
      { _id: internshipId, status: 'published', openings: { $gt: 0 } },
      { $inc: { openings: -1, applicationCount: 1 } },
      { new: true, session }
    ).lean();

    if (!internship) throw new ApiError(400, 'INTERNSHIP_CLOSED', 'Internship not available or no openings');

    if (internship.requireResume && !resumeOverride) {
      await Internship.findByIdAndUpdate(internshipId, { $inc: { openings: 1, applicationCount: -1 } }).session(session);
      throw new ApiError(400, 'RESUME_REQUIRED', 'This internship requires you to attach a resume.');
    }

    const requiredQuestions = (internship.applicationForm || []).filter((q) => q.required);
    for (const q of requiredQuestions) {
      const resp = (formResponses || []).find((r) => r.questionId === q.id);
      const answer = resp?.answer;
      const empty = !answer || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && answer.length === 0);
      if (empty) {
        await Internship.findByIdAndUpdate(internshipId, { $inc: { openings: 1, applicationCount: -1 } }).session(session);
        throw new ApiError(400, 'FORM_INCOMPLETE', `"${q.question}" is required`);
      }
    }

    const [created] = await Application.create(
      [
        {
          studentId: student._id,
          internshipId: internship._id,
          companyId: internship.companyId,
          userId,
          coverLetter,
          resumeSnapshot: resumeOverride || (student.resume
            ? {
                url: student.resume.url,
                filename: student.resume.filename,
                uploadedAt: student.resume.uploadedAt,
              }
            : undefined),
          formResponses: (formResponses || []).map((r) => ({
            questionId: r.questionId,
            question: r.question,
            answer: r.answer,
          })),
          status: 'applied',
          statusHistory: [{ status: 'applied', by: userId, note: 'Application submitted' }],
        },
      ],
      { session }
    );

    application = created;
    await session.commitTransaction();
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }

  const internship = await Internship.findById(internshipId).select('title companyId').lean();

  const hrUsers = await User.find({ companyId: internship.companyId, role: ROLES.COMPANY_HR })
    .select('email firstName')
    .lean();

  for (const hr of hrUsers) {
    await notifyUser(hr._id, 'application.new', 'New application', `${firstName} applied for ${internship.title}`, {
      applicationId: application._id,
    });
  }

  await notifyUser(userId, 'application.submitted', 'Application submitted', `You applied for ${internship.title}`, {
    applicationId: application._id,
  });

  const studentUser = await User.findById(userId).select('email firstName').lean();
  if (studentUser?.email) {
    await enqueueEmail('application-confirmation', {
      to: studentUser.email,
      name: studentUser.firstName,
      internshipTitle: internship.title,
    }).catch((e) => logger.warn('Email queue failed', { message: e.message }));
  }

  return { application, internship };
}
