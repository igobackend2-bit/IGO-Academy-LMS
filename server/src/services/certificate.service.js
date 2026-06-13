/**
 * Certificate service — auto-generates PDF certificates when all criteria are met
 * @module services/certificate
 */
const { db } = require('../config/db');
const StorageService = require('./storage.service');
const { sendCertificateEmail } = require('./email.service');
const logger = require('../utils/logger');
const { nanoid } = require('nanoid');

/**
 * Check if student meets all certificate criteria for a course
 * Criteria: attendance >= threshold, all assessments submitted, avg score >= min_score
 * @param {string} studentId
 * @param {string} courseId
 */
async function checkAndIssueCertificate(studentId, courseId) {
  // Already issued?
  const existing = await db('certificates').where({ student_id: studentId, course_id: courseId }).first();
  if (existing) return;

  const course = await db('courses').where({ id: courseId }).first();
  if (!course) return;

  const criteria = course.completion_criteria || { attendance_pct: 80, min_score: 60 };

  // 1. Attendance check
  const totalModules = await db('class_modules').where({ course_id: courseId, is_published: true }).count('* as c').first();
  const completedModules = await db('attendance')
    .where({ student_id: studentId, class_type: 'recorded', completed: true })
    .whereIn('class_id', db('class_modules').where({ course_id: courseId }).select('id'))
    .count('* as c').first();

  const attPct = totalModules.c > 0
    ? Math.round((parseInt(completedModules.c) / parseInt(totalModules.c)) * 100)
    : 0;

  if (attPct < criteria.attendance_pct) return;

  // 2. All published assessments submitted
  const allAssessments = await db('assessments')
    .where({ course_id: courseId, is_published: true }).select('id', 'type');
  const submittedIds = await db('submissions')
    .where({ student_id: studentId }).whereIn('status', ['graded', 'submitted'])
    .whereIn('assessment_id', allAssessments.map((a) => a.id))
    .distinct('assessment_id').pluck('assessment_id');

  if (submittedIds.length < allAssessments.length) return;

  // 3. Average score
  const scores = await db('submissions')
    .where({ student_id: studentId })
    .whereIn('assessment_id', allAssessments.map((a) => a.id))
    .whereNotNull('score')
    .avg('score as avg').first();

  const avgScore = parseFloat(scores.avg || 0);
  if (avgScore < criteria.min_score) return;

  // All criteria met — issue certificate
  await issueCertificate(studentId, courseId, course);
}

/**
 * Generate and store certificate
 */
async function issueCertificate(studentId, courseId, course) {
  try {
    const student = await db('users').where({ id: studentId }).first();
    const year = new Date().getFullYear();
    const certId = `IGO-${year}-${nanoid(6).toUpperCase()}`;

    // Generate PDF
    const pdfBuffer = await generateCertificatePdf({
      studentName: student.full_name,
      courseName: course.title,
      completionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      duration: `${course.duration_hours || 0} Hours`,
      certificateId: certId,
    });

    // Upload to Supabase Storage
    const pdfPath = `${year}/${certId}.pdf`;
    await StorageService.uploadBuffer(pdfPath, pdfBuffer, 'application/pdf', StorageService.BUCKET_CERTS);

    // Save to DB
    await db('certificates').insert({
      certificate_id: certId,
      student_id: studentId,
      course_id: courseId,
      pdf_s3_key: pdfPath,
    });

    // Send email notification
    try {
      await sendCertificateEmail({ to: student.email, name: student.full_name, courseName: course.title, certificateId: certId });
    } catch (e) { logger.error('[Cert] Email failed:', e.message); }

    logger.info(`[Cert] Issued ${certId} to ${student.email} for ${course.title}`);
  } catch (err) {
    logger.error('[Cert] Issue failed:', err.message);
  }
}

/**
 * Generate certificate PDF using Puppeteer
 */
async function generateCertificatePdf({ studentName, courseName, completionDate, duration, certificateId }, { asPng = false } = {}) {
  const puppeteer = require('puppeteer');
  const QRCode = require('qrcode');

  const verifyUrl = `${process.env.CERT_VERIFICATION_BASE_URL}/${certificateId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  // Official IGo Academy logo — used in header and as full-page watermark
  const fs = require('fs');
  const path = require('path');
  const logoBase64 = fs.readFileSync(path.join(__dirname, '../assets/igo-logo.jpg')).toString('base64');
  const logoDataUrl = `data:image/jpeg;base64,${logoBase64}`;

  const html = `<!DOCTYPE html><html><head>
  <meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:1122px; height:794px; font-family:'Manrope','Inter',sans-serif; background:#16402B;
           display:flex; align-items:center; justify-content:center; }
    .cert { width:1080px; height:752px; background:#fff; border:6px solid #4FA02E;
            outline:2px solid #16402B; outline-offset:-14px;
            border-radius:16px; padding:42px 48px; display:flex; flex-direction:column;
            align-items:center; position:relative; overflow:hidden; }
    /* Full-page logo watermark */
    .watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; }
    .watermark img { width:88%; opacity:0.05; }
    .content { position:relative; z-index:1; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; }
    .logo-img { height:120px; margin-bottom:2px; }
    .tagline { font-size:12px; color:#3F8A24; font-weight:700; letter-spacing:5px; text-transform:uppercase; }
    .divider { width:78%; height:3px; background:linear-gradient(90deg,#B5DB7A,#4FA02E,#16402B); margin:16px 0; border-radius:2px; }
    .title { font-size:13px; letter-spacing:6px; color:#666; text-transform:uppercase; font-weight:600; }
    .student-name { font-family:'Sora',sans-serif; font-size:42px; font-weight:800; color:#3F8A24; margin:6px 0 14px; }
    .course-label { font-size:13px; color:#888; }
    .course-name { font-family:'Sora',sans-serif; font-size:21px; font-weight:700; color:#16402B; margin:4px 0 22px; text-align:center; }
    .meta { display:flex; gap:48px; margin:6px 0 26px; }
    .meta-item { text-align:center; }
    .meta-label { font-size:11px; color:#999; text-transform:uppercase; letter-spacing:1px; }
    .meta-value { font-size:15px; font-weight:700; color:#222; }
    .footer { width:100%; display:flex; justify-content:space-between; align-items:flex-end; margin-top:auto; }
    .footer-left { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .footer-center { text-align:center; }
    .cert-id { font-size:11px; color:#666; letter-spacing:2px; font-weight:700; }
    .footer-right { text-align:right; }
    .signature-line { width:160px; height:2px; background:#16402B; margin-bottom:6px; }
    .sig-name { font-size:13px; font-weight:700; color:#16402B; }
    .sig-title { font-size:11px; color:#888; }
    .recognition { font-size:10px; color:#999; margin-top:8px; }
    a, a:link, a:visited { color:#999 !important; text-decoration:none !important; }
  </style></head><body><div class="cert">
    <div class="watermark"><img src="${logoDataUrl}"/></div>
    <div class="content">
    <img class="logo-img" src="${logoDataUrl}"/>
    <div class="tagline">Grow · Learn · Lead</div>
    <div class="divider"></div>
    <div class="title">This is to certify that</div>
    <div class="student-name">${studentName}</div>
    <div class="course-label">has successfully completed the course</div>
    <div class="course-name">${courseName}</div>
    <div class="meta">
      <div class="meta-item"><div class="meta-label">Completion Date</div><div class="meta-value">${completionDate}</div></div>
      <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">${duration}</div></div>
    </div>
    <div class="footer">
      <div class="footer-left">
        <img src="${qrDataUrl}" width="90" height="90"/>
        <div class="cert-id">${certificateId}</div>
      </div>
      <div class="footer-center">
        <div class="recognition">TNSDC + MSME Recognised &middot; <span style="color:#999">igoacademy<wbr>.in</span> &middot; Chennai, Tamil Nadu</div>
        <div style="font-size:10px;color:#ccc;margin-top:4px">© IGo Academy ${new Date().getFullYear()}</div>
      </div>
      <div class="footer-right">
        <div class="signature-line"></div>
        <div class="sig-name">IGo Academy Director</div>
        <div class="sig-title">Director, IGo Academy</div>
      </div>
    </div>
    </div>
  </div></body></html>`;

  // Use bundled Chromium if downloaded, otherwise fall back to system Chrome
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  } catch {
    browser = await puppeteer.launch({ channel: 'chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  let output;
  if (asPng) {
    await page.setViewport({ width: 1122, height: 794 });
    output = await page.screenshot({ type: 'png' });
  } else {
    output = await page.pdf({ width: '1122px', height: '794px', printBackground: true });
  }
  await browser.close();
  return output;
}

/**
 * Verify a certificate by ID (public endpoint)
 */
async function verifyCertificate(certificateId) {
  const cert = await db('certificates as c')
    .join('users as u', 'c.student_id', 'u.id')
    .join('courses as co', 'c.course_id', 'co.id')
    .select('c.certificate_id', 'c.issued_at', 'c.is_valid', 'c.revoked_reason',
            'u.full_name as student_name', 'co.title as course_name')
    .where('c.certificate_id', certificateId).first();
  return cert || null;
}

module.exports = { checkAndIssueCertificate, issueCertificate, verifyCertificate, generateCertificatePdf };
