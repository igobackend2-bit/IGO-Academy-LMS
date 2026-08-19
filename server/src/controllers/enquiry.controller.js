const { db } = require('../config/db');

/**
 * Public: submit an enquiry from the website (enquiry form, WhatsApp CTA
 * fallback, course-page "Enquire" button). Rate-limited by the global
 * limiter in index.js -- no auth required.
 */
exports.create = async (req, res, next) => {
  try {
    const {
      name, phone, email, location, course_interested,
      candidate_type, preferred_mode, message, landing_page,
    } = req.body;

    const [row] = await db('enquiries').insert({
      name, phone,
      email: email || null,
      location: location || null,
      course_interested: course_interested || null,
      candidate_type: candidate_type || null,
      preferred_mode: preferred_mode || null,
      message: message || null,
      landing_page: landing_page || null,
      source: 'website',
    }).returning('*');

    res.status(201).json({ success: true, data: row, error: null, message: 'Enquiry received — our team will reach out shortly.' });
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
