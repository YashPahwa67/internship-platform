import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { config } from '../config/env.js';

let _etherealTransporter = null;

async function getTransporter() {
  if (config.smtp.host) {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port || 587,
      secure: (config.smtp.port || 587) === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }

  // Dev fallback — Ethereal captures emails, prints preview URL to terminal
  if (!_etherealTransporter) {
    const testAccount = await nodemailer.createTestAccount();
    _etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info('Ethereal dev account created', { user: testAccount.user });
  }
  return _etherealTransporter;
}

export async function sendOtpEmail({ to, firstName, otp }) {
  const name = firstName || 'there';
  const subject = `${otp} is your Internship Platform verification code`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#111827;margin:0 0 8px">Verify your email</h2>
      <p style="color:#6b7280;margin:0 0 32px">Hi ${name}, use the code below to complete your registration.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px">
        <span style="font-size:40px;font-weight:700;letter-spacing:16px;color:#111827;font-family:monospace">${otp}</span>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0">This code expires in <strong>10 minutes</strong>. If you didn't create an account, ignore this email.</p>
    </div>`;
  const text = `Hi ${name},\n\nYour verification code: ${otp}\n\nExpires in 10 minutes.`;
  return sendEmail({ to, subject, html, text });
}

export async function sendPasswordResetOtp({ to, firstName, otp }) {
  const name = firstName || 'there';
  const subject = `${otp} – reset your Internship Platform password`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#111827;margin:0 0 8px">Reset your password</h2>
      <p style="color:#6b7280;margin:0 0 32px">Hi ${name}, use the code below to reset your password. If you didn't request this, ignore this email.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px">
        <span style="font-size:40px;font-weight:700;letter-spacing:16px;color:#111827;font-family:monospace">${otp}</span>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0">Expires in <strong>10 minutes</strong>.</p>
    </div>`;
  const text = `Hi ${name},\n\nPassword reset code: ${otp}\n\nExpires in 10 minutes.`;
  return sendEmail({ to, subject, html, text });
}

export async function sendEmailChangeOtp({ to, firstName, otp }) {
  const name = firstName || 'there';
  const subject = `${otp} – confirm your new email address`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#111827;margin:0 0 8px">Confirm new email</h2>
      <p style="color:#6b7280;margin:0 0 32px">Hi ${name}, enter this code to confirm <strong>${to}</strong> as your new email address.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px">
        <span style="font-size:40px;font-weight:700;letter-spacing:16px;color:#111827;font-family:monospace">${otp}</span>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0">Expires in <strong>10 minutes</strong>. If you didn't request this, ignore it.</p>
    </div>`;
  const text = `Hi ${name},\n\nYour email change code: ${otp}\n\nExpires in 10 minutes.`;
  return sendEmail({ to, subject, html, text });
}

export async function sendEmail({ to, subject, html, text }) {
  const transporter = await getTransporter();
  const from = config.smtp.from || config.smtp.user || '"Internship Platform" <no-reply@imp.dev>';

  const info = await transporter.sendMail({ from, to, subject, html, text });

  if (!config.smtp.host) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n\x1b[33m╔════════════════════════════════════════╗`);
    console.log(`║  [DEV] Email to: ${to}`);
    console.log(`║  Subject: ${subject}`);
    console.log(`║  Preview → \x1b[36m${previewUrl}\x1b[33m`);
    console.log(`╚════════════════════════════════════════╝\x1b[0m\n`);
  } else {
    logger.info('Email sent', { to, messageId: info.messageId });
  }

  return info;
}
