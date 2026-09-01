const axios = require('axios');
const { parse } = require('fast-csv');
const { Readable } = require('stream');
const { db } = require('../config/db');
const logger = require('../utils/logger');
const { sendAdminAlertEmail } = require('../services/email.service');
const { createError } = require('../middleware/errorHandler');

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

/** Admin: manually add a single lead (e.g. from a phone call, a walk-in, a
 * WhatsApp enquiry) — same table as the public form, skips reCAPTCHA since
 * an authenticated admin is entering it directly. */
exports.adminCreate = async (req, res, next) => {
  try {
    const { name, phone, email, location, course_interested, candidate_type, preferred_mode, message } = req.body;
    if (!name || !phone) throw createError('INVALID_INPUT', 'Name and phone are required');

    const [row] = await db('enquiries').insert({
      name, phone,
      email: email || null,
      location: location || null,
      course_interested: course_interested || null,
      candidate_type: candidate_type || null,
      preferred_mode: preferred_mode || null,
      message: message || null,
      source: 'admin_upload',
    }).returning('*');

    res.status(201).json({ success: true, data: row, error: null, message: 'Lead added' });
  } catch (e) { next(e); }
};

/** Admin: bulk-add leads from a CSV — same pattern as user.controller.js's
 * bulkImport (fast-csv over the in-memory multer buffer). Expects columns
 * name/phone at minimum; email, location, course_interested are optional. */
exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) throw createError('INVALID_INPUT', 'CSV file required');

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString());
    await new Promise((resolve, reject) => {
      stream
        .pipe(parse({ headers: true, trim: true }))
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const processed = rows
      .map((r) => ({
        name:               r.name || r['Name'] || r['Full Name'],
        phone:              r.phone || r['Phone'] || r['Mobile'],
        email:              r.email || r['Email'] || null,
        location:           r.location || r['Location'] || null,
        course_interested:  r.course_interested || r['Course'] || r['Course Interested'] || null,
        candidate_type:     r.candidate_type || r['Candidate Type'] || null,
        preferred_mode:     r.preferred_mode || r['Preferred Mode'] || null,
        message:            r.message || r['Message'] || r['Notes'] || null,
        source: 'admin_upload',
      }))
      // Rows missing the two required fields are silently unusable — skip
      // rather than 500 the whole batch over a blank trailing spreadsheet row.
      .filter((r) => r.name && r.phone);

    if (!processed.length) throw createError('INVALID_INPUT', 'No valid rows found — each row needs at least a name and phone number');

    const inserted = await db('enquiries').insert(processed).returning('id');
    logger.info(`[Enquiry] Bulk import: ${inserted.length} leads created by admin ${req.user.id}`);
    res.json({ success: true, data: { imported: inserted.length, skipped: rows.length - processed.length }, error: null, message: `${inserted.length} lead(s) imported` });
  } catch (e) { next(e); }
};

/** Admin: list enquiries, newest first, optional status/assigned_to filter. */
exports.list = async (req, res, next) => {
  try {
    const { status, assigned_to } = req.query;
    let query = db('enquiries as e')
      .leftJoin('users as u', 'e.assigned_to', 'u.id')
      .select('e.*', 'u.full_name as assigned_to_name')
      .orderBy('e.created_at', 'desc');
    if (status) query = query.where('e.status', status);
    if (assigned_to === 'unassigned') query = query.whereNull('e.assigned_to');
    else if (assigned_to) query = query.where('e.assigned_to', assigned_to);
    const rows = await query;
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/** Executive: only the leads assigned to them. */
exports.myLeads = async (req, res, next) => {
  try {
    const rows = await db('enquiries').where({ assigned_to: req.user.id }).orderBy('created_at', 'desc');
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/** Admin: assign (or unassign, with assigned_to: null) one lead to an executive. */
exports.assign = async (req, res, next) => {
  try {
    const { assigned_to } = req.body;
    if (assigned_to) {
      const exec = await db('users').where({ id: assigned_to, role: 'executive' }).first();
      if (!exec) throw createError('INVALID_INPUT', 'assigned_to must be an active executive user');
    }
    const [row] = await db('enquiries').where({ id: req.params.id }).update({ assigned_to: assigned_to || null }).returning('*');
    if (!row) throw createError('NOT_FOUND', 'Lead not found');
    res.json({ success: true, data: row, error: null, message: assigned_to ? 'Lead assigned' : 'Lead unassigned' });
  } catch (e) { next(e); }
};

/** Admin: assign a batch of leads (e.g. a just-uploaded CSV) to one executive at once. */
exports.bulkAssign = async (req, res, next) => {
  try {
    const { ids, assigned_to } = req.body;
    if (!Array.isArray(ids) || !ids.length) throw createError('INVALID_INPUT', 'ids must be a non-empty array');
    if (!assigned_to) throw createError('INVALID_INPUT', 'assigned_to is required');

    const exec = await db('users').where({ id: assigned_to, role: 'executive' }).first();
    if (!exec) throw createError('INVALID_INPUT', 'assigned_to must be an active executive user');

    const count = await db('enquiries').whereIn('id', ids).update({ assigned_to });
    res.json({ success: true, data: { assigned: count }, error: null, message: `${count} lead(s) assigned to ${exec.full_name}` });
  } catch (e) { next(e); }
};

/**
 * Update an enquiry's status / course interest / note. Reused by both
 * admin (any lead) and executive (only a lead assigned to them — enforced
 * here, not just by the route, since PATCH /:id is shared by both roles).
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, admin_note, course_interested } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (admin_note !== undefined) update.admin_note = admin_note;
    if (course_interested !== undefined) update.course_interested = course_interested;
    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'Nothing to update' });
    }

    if (req.user.role === 'executive') {
      const lead = await db('enquiries').where({ id: req.params.id }).first();
      if (!lead) throw createError('NOT_FOUND', 'Lead not found');
      if (lead.assigned_to !== req.user.id) {
        throw createError('UNAUTHORIZED', 'This lead is not assigned to you');
      }
      // Any executive touch counts as a contact attempt for "last called" tracking.
      update.last_contacted_at = db.fn.now();
    }

    const [row] = await db('enquiries').where({ id: req.params.id }).update(update).returning('*');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Enquiry not found' });
    res.json({ success: true, data: row, error: null, message: 'Updated' });
  } catch (e) { next(e); }
};
