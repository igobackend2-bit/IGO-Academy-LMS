/**
 * Email service — transactional emails via Nodemailer (SMTP)
 * Falls back to console.log in development if SMTP not configured
 * @module services/email
 */
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Dev mode — log emails to console
    transporter = { sendMail: async (opts) => { logger.info('[Email Dev]', opts); return { messageId: 'dev' }; } };
  }
  return transporter;
}

/**
 * Send OTP email for password reset
 * @param {{ to: string, name: string, otp: string }} opts
 */
async function sendOtpEmail({ to, name, otp }) {
  await getTransporter().sendMail({
    from: `"${process.env.SES_FROM_NAME || 'IGo Academy'}" <${process.env.SES_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: 'IGo Academy — Your OTP for Password Reset',
    html: `
      <div style="font-family:Manrope,Inter,Arial,sans-serif;max-width:480px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #DDE8DF">
        <div style="background:#0C2014;padding:24px;text-align:center">
          <h2 style="color:#B5DB7A;margin:0;font-size:22px">IGo Academy</h2>
          <p style="color:#fff;margin:4px 0 0;font-size:13px">Grow. Learn. Lead.</p>
        </div>
        <div style="padding:32px">
          <p style="color:#333;font-size:16px">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;font-size:14px">Your OTP for password reset is:</p>
          <div style="background:#EDF6E4;border:2px solid #3F8A24;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
            <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#3F8A24">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#888;font-size:12px;margin-top:32px">— IGo Academy Team, Chennai</p>
        </div>
      </div>
    `,
  });
}

/**
 * Send welcome email to new student
 * @param {{ to: string, name: string, courseName: string, endDate: string }} opts
 */
async function sendWelcomeEmail({ to, name, courseName, endDate }) {
  await getTransporter().sendMail({
    from: `"IGo Academy" <${process.env.SES_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `Welcome to IGo Academy — ${courseName}`,
    html: `
      <div style="font-family:Manrope,Inter,Arial,sans-serif;max-width:480px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #DDE8DF">
        <div style="background:#0C2014;padding:24px;text-align:center">
          <h2 style="color:#B5DB7A;margin:0">IGo Academy</h2>
          <p style="color:#fff;margin:4px 0 0;font-size:13px">Grow. Learn. Lead.</p>
        </div>
        <div style="padding:32px">
          <p style="color:#333;font-size:16px">Welcome, <strong>${name}</strong>! 🌱</p>
          <p style="color:#555;">You've been enrolled in <strong>${courseName}</strong>.</p>
          <p style="color:#555;">Your access is valid until <strong>${endDate}</strong>.</p>
          <p style="color:#888;font-size:12px;margin-top:32px">TNSDC + MSME Recognised | igoacademy.in</p>
        </div>
      </div>
    `,
  });
}

/**
 * Send certificate ready notification
 * @param {{ to: string, name: string, courseName: string, certificateId: string }} opts
 */
async function sendCertificateEmail({ to, name, courseName, certificateId }) {
  await getTransporter().sendMail({
    from: `"IGo Academy" <${process.env.SES_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `Your IGo Academy Certificate is Ready! 🎓`,
    html: `
      <div style="font-family:Manrope,Inter,Arial,sans-serif;max-width:480px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #DDE8DF">
        <div style="background:#0C2014;padding:24px;text-align:center">
          <h2 style="color:#B5DB7A;margin:0">IGo Academy</h2>
        </div>
        <div style="padding:32px">
          <p style="font-size:16px">Congratulations, <strong>${name}</strong>! 🎉</p>
          <p>You've successfully completed <strong>${courseName}</strong>.</p>
          <p>Certificate ID: <strong style="color:#3F8A24">${certificateId}</strong></p>
          <a href="${process.env.CERT_VERIFICATION_BASE_URL}/${certificateId}" style="display:inline-block;margin-top:16px;background:#3F8A24;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Certificate</a>
          <p style="color:#888;font-size:12px;margin-top:32px">IGo Academy | Chennai</p>
        </div>
      </div>
    `,
  });
}

/**
 * Notify admins of a new pending item needing review (enrollment request or app lead).
 * Fire-and-forget by design — callers must not let this block or fail the request
 * that triggered it; see the try/catch around each call site.
 * @param {{ to: string[], kind: string, summary: string, link: string }} opts
 */
async function sendAdminAlertEmail({ to, kind, summary, link }) {
  await getTransporter().sendMail({
    from: `"${process.env.SES_FROM_NAME || 'IGo Academy'}" <${process.env.SES_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `IGo Academy — New ${kind} awaiting review`,
    html: `
      <div style="font-family:Manrope,Inter,Arial,sans-serif;max-width:480px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #DDE8DF">
        <div style="background:#0C2014;padding:24px;text-align:center">
          <h2 style="color:#B5DB7A;margin:0;font-size:22px">IGo Academy</h2>
          <p style="color:#fff;margin:4px 0 0;font-size:13px">Admin Alert</p>
        </div>
        <div style="padding:32px">
          <p style="color:#333;font-size:16px">New <strong>${kind}</strong> needs review:</p>
          <p style="color:#555;font-size:14px;background:#EDF6E4;border-radius:8px;padding:16px">${summary}</p>
          <a href="${link}" style="display:inline-block;margin-top:8px;background:#3F8A24;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Review now</a>
          <p style="color:#888;font-size:12px;margin-top:32px">— IGo Academy Platform</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail, sendWelcomeEmail, sendCertificateEmail, sendAdminAlertEmail };
