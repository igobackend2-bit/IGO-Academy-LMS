const { db } = require('../config/db');

/* ── List batches for a course (admin) ── */
exports.list = async (req, res, next) => {
  try {
    const { course_id } = req.query;
    if (!course_id) return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'course_id is required' });
    const rows = await db('batches').where({ course_id }).orderBy('created_at', 'desc');
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/* ── Find-or-create a batch by name for a course ── */
exports.findOrCreate = async (req, res, next) => {
  try {
    const { course_id, name, start_date, end_date } = req.body;
    if (!course_id || !name) return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'course_id and name are required' });
    const existing = await db('batches').where({ course_id, name }).first();
    if (existing) return res.json({ success: true, data: existing, error: null, message: 'Found' });
    const [row] = await db('batches').insert({ course_id, name, start_date: start_date || null, end_date: end_date || null }).returning('*');
    res.status(201).json({ success: true, data: row, error: null, message: 'Batch created' });
  } catch (e) { next(e); }
};

/* ── Admin: update a batch's date/fee/mode/registration status/seats ── */
exports.update = async (req, res, next) => {
  try {
    const allowed = ['name', 'start_date', 'end_date', 'fee', 'mode', 'registration_status', 'seats_available', 'is_active'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'Nothing to update' });
    }
    const [row] = await db('batches').where({ id: req.params.id }).update(update).returning('*');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Batch not found' });
    res.json({ success: true, data: row, error: null, message: 'Batch updated' });
  } catch (e) { next(e); }
};

/* ── Admin: delete a batch ── */
exports.remove = async (req, res, next) => {
  try {
    const count = await db('batches').where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Batch not found' });
    res.json({ success: true, data: null, error: null, message: 'Batch deleted' });
  } catch (e) { next(e); }
};

/* ── Admin: list ALL batches across every course (for the Batches page) ── */
exports.listAll = async (req, res, next) => {
  try {
    const rows = await db('batches as b')
      .join('courses as c', 'b.course_id', 'c.id')
      .select('b.*', 'c.title as course_title')
      .orderBy('b.start_date', 'asc');
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/**
 * Public: upcoming, open-registration batches for the homepage's
 * "Upcoming Programs" section. No auth required.
 */
exports.publicUpcoming = async (req, res, next) => {
  try {
    const rows = await db('batches as b')
      .join('courses as c', 'b.course_id', 'c.id')
      .select(
        'b.id', 'b.name', 'b.start_date', 'b.end_date', 'b.fee', 'b.mode',
        'b.registration_status', 'b.seats_available',
        'c.id as course_id', 'c.title as course_title', 'c.price as course_price', 'c.duration_hours',
      )
      .where('b.is_active', true)
      .andWhere('c.is_active', true)
      .andWhere('b.registration_status', '!=', 'Closed')
      .andWhere(function () { this.whereNull('b.start_date').orWhere('b.start_date', '>=', db.fn.now()); })
      .orderBy('b.start_date', 'asc')
      .limit(6);
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};
