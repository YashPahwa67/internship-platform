import { Task } from '../models/Task.js';
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { notifyUser } from '../services/notification.service.js';
import { enqueueEmail } from '../jobs/emailQueue.js';
import logger from '../utils/logger.js';

export const list = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === ROLES.STUDENT) {
    filter.assignedTo = req.user._id;
  } else if (req.user.role === ROLES.COMPANY_HR || req.user.role === ROLES.MENTOR) {
    if (req.query.applicationId) filter.applicationId = req.query.applicationId;
    else {
      const apps = await Application.find({ companyId: req.user.companyId }).select('_id');
      filter.applicationId = { $in: apps.map((a) => a._id) };
    }
  }
  if (req.query.status) filter.status = req.query.status;

  const tasks = await Task.find(filter).sort({ deadline: 1 }).lean();
  res.json({ success: true, data: tasks.map(formatTask) });
});

export const create = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.body.applicationId);
  if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found');
  if (application.companyId.toString() !== req.user.companyId?.toString()) {
    throw new ApiError(403, 'FORBIDDEN', 'Not your company application');
  }

  const task = await Task.create({
    applicationId: application._id,
    assignedBy: req.user._id,
    assignedTo: application.userId,
    title: req.body.title,
    description: req.body.description,
    deadline: req.body.deadline,
    priority: req.body.priority || 'medium',
    status: 'pending',
  });

  await notifyUser(
    application.userId,
    'task.assigned',
    'New task assigned',
    `Task: ${task.title}`,
    { taskId: task._id }
  );

  const student = await User.findById(application.userId).select('email firstName').lean();
  if (student?.email) {
    await enqueueEmail('task.assigned', {
      to: student.email,
      name: student.firstName,
      taskTitle: task.title,
      taskDescription: task.description,
      deadline: task.deadline,
    }).catch((e) => logger.warn('Email queue failed', { message: e.message }));
  }

  res.status(201).json({ success: true, data: formatTask(task) });
});

export const submit = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
  if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found');

  task.status = 'submitted';
  task.submission = { notes: req.body.notes, submittedAt: new Date() };
  await task.save();

  await notifyUser(task.assignedBy, 'task.submitted', 'Task submitted', `${task.title} was submitted`, {
    taskId: task._id,
  });

  res.json({ success: true, data: formatTask(task) });
});

export const review = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found');

  task.status = req.body.status;
  task.review = {
    feedback: req.body.feedback,
    rating: req.body.rating,
    reviewedAt: new Date(),
    reviewedBy: req.user._id,
  };
  await task.save();

  await notifyUser(task.assignedTo, 'task.reviewed', 'Task reviewed', `Feedback on: ${task.title}`, {
    taskId: task._id,
  });

  const student = await User.findById(task.assignedTo).select('email firstName').lean();
  if (student?.email) {
    await enqueueEmail('task.reviewed', {
      to: student.email,
      name: student.firstName,
      taskTitle: task.title,
      status: req.body.status,
      feedback: req.body.feedback,
    }).catch((e) => logger.warn('Email queue failed', { message: e.message }));
  }

  res.json({ success: true, data: formatTask(task) });
});

function formatTask(t) {
  return {
    id: t._id,
    applicationId: t.applicationId,
    title: t.title,
    description: t.description,
    deadline: t.deadline,
    status: t.status,
    priority: t.priority,
    submission: t.submission,
    review: t.review,
    createdAt: t.createdAt,
  };
}
