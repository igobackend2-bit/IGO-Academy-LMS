const axios = require('axios');
const { db } = require('../config/db');
const logger = require('../utils/logger');
const { sendAdminAlertEmail } = require('../services/email.service');

/** Fire-and-forget admin alert — must never fail or delay the caller's request. */
async function notifyAdmins({ kind, summary, link }) {
  try {
    const admins = await db('users').where({ role: 'admin', is_active: true }).pluck('email');
    if (admins.length === 0) return;
    await sendAdminAlertEmail({ to: admins, kind, summary, link });
  } catch (err) {
    logger.warn(`[notifyAdmins] failed to send "${kind}" alert: ${err.message}`);
  }
}

/**
 * Verify a reCAPTCHA v3 token with Google, if RECAPTCHA_SECRET_KEY is
 * configured. Returns true when verification is disabled (no secret set
 * yet) or passes; false only on a confirmed failure/low score, so the form
 * never silently breaks before the Academy sets up a site key.
 */
async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // not configured yet -- don't block real users
  if (!token) return false;
  try {
    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: { secret, response: token },
    });
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch (e) {
    logger.error('[Enquiry] reCAPTCHA verification request failed:', e.message);
    return true; // Google being unreachable shouldn't block a real enquiry
  }
}

/**
 * Public: submit an enquiry from the website (enquiry form, WhatsApp CTA
 * fallback, course-page "Enquire" button). Rate-limited by the global
 * limiter in index.js -- no auth required.
 */
exports.create = async (req, res, next) => {
  try {
    const {
      name, phone, email, location, course_interested,
      candidate_type, preferred_mode, message, landing_page, recaptcha_token, source,
    } = req.body;

    const humanVerified = await verifyRecaptcha(recaptcha_token);
    if (!humanVerified) {
      return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'Verification failed — please try again.' });
    }

    const [row] = await db('enquiries').insert({
      name, phone,
      email: email || null,
      location: location || null,
      course_interested: course_interested || null,
      candidate_type: candidate_type || null,
      preferred_mode: preferred_mode || null,
      message: message || null,
      landing_page: landing_page || null,
      // Lead attribution — which page/form this came from (e.g. 'careers_page',
      // 'workshops_page'). Defaults to 'website' for callers that don't pass one.
      source: source || 'website',
    }).returning('*');

    res.status(201).json({ success: true, data: row, error: null, message: 'Enquiry received — our team will reach out shortly.' });

    notifyAdmins({
      kind: 'enquiry',
      summary: `${row.name} (${row.phone})${row.course_interested ? ` — interested in ${row.course_interested}` : ''}`,
      link: `${process.env.CLIENT_URL || 'https://igoacademy.in'}/admin/leads`,
    });
  } catch (e) { next(e); }
};

/** Admin: list enquiries, newest first, optional status filter. */
exports.list = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = db('enquiries').orderBy('created_at', 'desc');
    if (status) query = query.where({ status });
    const rows = await query;
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/** Admin: update an enquiry's status / admin note. */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, admin_note } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (admin_note !== undefined) update.admin_note = admin_note;
    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'Nothing to update' });
    }
    const [row] = await db('enquiries').where({ id: req.params.id }).update(update).returning('*');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Enquiry not found' });
    res.json({ success: true, data: row, error: null, message: 'Updated' });
  } catch (e) { next(e); }
};
