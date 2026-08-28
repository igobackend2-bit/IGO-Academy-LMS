/**
 * External Certificate controller — real certificates issued by outside,
 * government-recognised bodies (TN Skill Corporation, etc.) for IGO Academy
 * trainees, added manually by an admin with the actual issued PDF attached
 * as proof. Separate from certificate.service.js, which only handles
 * certificates the platform auto-generates itself. Added 26 Aug 2026.
 *
 * Multer + Supabase Storage upload pattern mirrors resource.controller.js
 * (memory storage, PDF only, straight to Supabase — no local disk).
 */
const multer = require('multer');
const { db } = require('../config/db');
const { supabase } = require('../config/supabase');
const StorageService = require('../services/storage.service');

// Same bucket certificate.service.js already uses for platform certs —
// external certs go under their own path prefix inside it.
const STORAGE_BUCKET = StorageService.BUCKET_CERTS;
const PATH_PREFIX = 'external';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files are allowed'));
  },
});
exports.uploadMiddleware = upload.single('pdf');

/** Shape matched to what VerifyCertificate.jsx and CertService.verifyCertificate
 *  already return, so the public verify page needs no structural change —
 *  plus issuing_body and pdf_url, which it renders only when present. */
function toVerifyShape(row) {
  return {
    certificate_id: row.certificate_no,
    student_name: row.student_name,
    course_name: row.course_name,
    issued_at: row.issued_at,
    is_valid: row.is_valid,
    revoked_reason: row.revoked_reason,
    issuing_body: row.issuing_body,
    pdf_url: row.pdf_path ? `/api/external-certificates/${row.id}/pdf` : null,
  };
}

/** Used by certificate.routes.js as the fallback when a certId isn't found
 *  in the platform's own `certificates` table. Looked up by either the
 *  certificate number or the enrolment number printed on the certificate. */
exports.findByAnyId = async function findByAnyId(certId) {
  const row = await db('external_certificates')
    .where('certificate_no', certId)
    .orWhere('enrollment_no', certId)
    .first();
  return row ? toVerifyShape(row) : null;
};

/* ── Admin: list all external certificates ── */
exports.list = async (req, res, next) => {
  try {
    const rows = await db('external_certificates').orderBy('created_at', 'desc');
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/* ── Admin: create (with optional PDF in the same request) ── */
exports.create = async (req, res, next) => {
  try {
    const {
      certificate_no, enrollment_no, student_name, course_name,
      sector, training_centre, duration, issuing_body, issued_at,
    } = req.body;

    if (!certificate_no || !student_name || !course_name)
      return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'certificate_no, student_name and course_name are required' });

    const existing = await db('external_certificates').where({ certificate_no }).first();
    if (existing)
      return res.status(409).json({ success: false, data: null, error: 'DUPLICATE', message: 'A certificate with this certificate number already exists' });

    let pdf_path = null;
    if (req.file) {
      pdf_path = `${PATH_PREFIX}/${certificate_no}.pdf`;
      const { error: storageErr } = await supabase.storage.from(STORAGE_BUCKET).upload(pdf_path, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
      if (storageErr) throw new Error(`Storage upload error: ${storageErr.message}`);
    }

    const [row] = await db('external_certificates').insert({
      certificate_no,
      enrollment_no: enrollment_no || null,
      student_name,
      course_name,
      sector: sector || null,
      training_centre: training_centre || null,
      duration: duration || null,
      issuing_body: issuing_body || 'TN Skill Corporation',
      issued_at: issued_at || null,
      pdf_path,
      added_by: req.user.id,
    }).returning('*');

    res.status(201).json({ success: true, data: row, error: null, message: 'External certificate added' });
  } catch (e) { next(e); }
};

/* ── Admin: revoke ── */
exports.revoke = async (req, res, next) => {
  try {
    const [row] = await db('external_certificates').where({ id: req.params.id })
      .update({ is_valid: false, revoked_reason: req.body.reason || 'Admin revoked', updated_at: db.fn.now() })
      .returning('*');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Not found' });
    res.json({ success: true, data: row, error: null, message: 'Certificate revoked' });
  } catch (e) { next(e); }
};

/* ── Public: serve the actual issued PDF as proof (redirect to a signed URL) ──
   Public, not gated behind verifyToken — the whole point is that a customer
   or employer can open it directly from the verify page to see the real,
   government-issued document. ── */
exports.servePdf = async (req, res, next) => {
  try {
    const row = await db('external_certificates').where({ id: req.params.id }).first('pdf_path', 'certificate_no');
    if (!row || !row.pdf_path) return res.status(404).send('Not found');
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(row.pdf_path, 300);
    if (error || !data?.signedUrl) return res.status(404).send('File missing');
    res.redirect(data.signedUrl);
  } catch (e) { next(e); }
};
