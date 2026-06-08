import { getEmailQueue } from './emailQueue.js';
import { sendEmail } from '../services/email.service.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { connectRedis, disconnectRedis } from '../config/redis.js';
import logger from '../utils/logger.js';

const STATUS_LABELS = {
  applied: 'Applied',
  shortlisted: '🎉 Shortlisted',
  interview_scheduled: '📅 Interview Scheduled',
  offered: '🎊 Offer Extended',
  accepted: 'Accepted',
  active: 'Internship Active',
  completed: '✅ Completed',
  rejected: 'Not Selected',
  withdrawn: 'Withdrawn',
};

const STATUS_COLOR = {
  shortlisted: '#3d63f8',
  interview_scheduled: '#8b5cf6',
  offered: '#22c55e',
  accepted: '#22c55e',
  active: '#3d63f8',
  completed: '#22c55e',
  rejected: '#ef4444',
  withdrawn: '#9ca3af',
};

function card(content) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">${content}</div>`;
}

function header(title) {
  return `<div style="margin-bottom:24px"><span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#111827">${title}</span></div>`;
}

function footer() {
  return `<p style="color:#9ca3af;font-size:12px;margin:32px 0 0;border-top:1px solid #f3f4f6;padding-top:20px">Internship Management Platform — <a href="mailto:yashpahwa1209@gmail.com" style="color:#9ca3af">yashpahwa1209@gmail.com</a></p>`;
}

async function start() {
  await connectDatabase();
  await connectRedis();

  const queue = getEmailQueue();

  queue.process('application-confirmation', async (job) => {
    const { to, name, internshipTitle } = job.data;
    await sendEmail({
      to,
      subject: `Application submitted — ${internshipTitle}`,
      text: `Hi ${name},\n\nYour application for "${internshipTitle}" was received. We'll notify you when the status changes.\n\n— IMP`,
      html: card(`
        ${header('Application received')}
        <p style="color:#374151;margin:0 0 12px">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151;margin:0 0 20px">Your application for <strong>${internshipTitle}</strong> was submitted successfully.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="color:#6b7280;font-size:13px;margin:0">You'll receive an email whenever your application status changes. You can also track progress from your dashboard.</p>
        </div>
        <p style="color:#374151;margin:0">Good luck! 🚀</p>
        ${footer()}
      `),
    });
  });

  queue.process('application-status', async (job) => {
    const { to, name, internshipTitle, status } = job.data;
    const label = STATUS_LABELS[status] || status;
    const color = STATUS_COLOR[status] || '#6b7280';
    const isPositive = ['shortlisted', 'interview_scheduled', 'offered', 'accepted', 'active', 'completed'].includes(status);

    await sendEmail({
      to,
      subject: `Application update — ${internshipTitle}`,
      text: `Hi ${name},\n\nYour application for "${internshipTitle}" status is now: ${label}.\n\n— IMP`,
      html: card(`
        ${header('Application update')}
        <p style="color:#374151;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151;margin:0 0 20px">Your application for <strong>${internshipTitle}</strong> has been updated.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px;border-left:4px solid ${color}">
          <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:4px">New status</span>
          <span style="font-size:18px;font-weight:700;color:${color}">${label}</span>
        </div>
        ${isPositive
          ? '<p style="color:#374151;margin:0">Congratulations on this progress! Log in to your dashboard for more details.</p>'
          : '<p style="color:#374151;margin:0">Thank you for applying. Keep exploring other opportunities on IMP!</p>'
        }
        ${footer()}
      `),
    });
  });

  queue.process('task.assigned', async (job) => {
    const { to, name, taskTitle, taskDescription, deadline } = job.data;
    const deadlineStr = deadline ? new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

    await sendEmail({
      to,
      subject: `New task assigned — ${taskTitle}`,
      text: `Hi ${name},\n\nYou have a new task: "${taskTitle}".\n${taskDescription ? `\n${taskDescription}\n` : ''}${deadlineStr ? `\nDue: ${deadlineStr}` : ''}\n\n— IMP`,
      html: card(`
        ${header('New task assigned')}
        <p style="color:#374151;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151;margin:0 0 20px">You've been assigned a new task.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px">
          <span style="font-size:16px;font-weight:700;color:#111827;display:block;margin-bottom:6px">${taskTitle}</span>
          ${taskDescription ? `<p style="color:#6b7280;font-size:14px;margin:0 0 12px">${taskDescription}</p>` : ''}
          ${deadlineStr ? `<span style="font-size:13px;color:#ef4444;font-weight:600">Due: ${deadlineStr}</span>` : ''}
        </div>
        <p style="color:#374151;margin:0">Log in to your dashboard to view and submit the task.</p>
        ${footer()}
      `),
    });
  });

  queue.process('task.reviewed', async (job) => {
    const { to, name, taskTitle, status, feedback } = job.data;
    const color = status === 'approved' ? '#22c55e' : status === 'rejected' ? '#ef4444' : '#f59e0b';
    const label = status === 'approved' ? '✅ Approved' : status === 'rejected' ? '❌ Rejected' : '🔄 Revision Requested';

    await sendEmail({
      to,
      subject: `Task reviewed — ${taskTitle}`,
      text: `Hi ${name},\n\nYour task "${taskTitle}" has been reviewed: ${label}.\n${feedback ? `\nFeedback: ${feedback}` : ''}\n\n— IMP`,
      html: card(`
        ${header('Task reviewed')}
        <p style="color:#374151;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151;margin:0 0 20px">Your task <strong>${taskTitle}</strong> has been reviewed.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px;border-left:4px solid ${color}">
          <span style="font-size:16px;font-weight:700;color:${color}">${label}</span>
          ${feedback ? `<p style="color:#6b7280;font-size:14px;margin:10px 0 0">${feedback}</p>` : ''}
        </div>
        ${footer()}
      `),
    });
  });

  logger.info('Email worker started');
}

start().catch((err) => {
  logger.error('Email worker failed', { message: err.message });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await getEmailQueue().close();
  await disconnectRedis();
  await disconnectDatabase();
  process.exit(0);
});
