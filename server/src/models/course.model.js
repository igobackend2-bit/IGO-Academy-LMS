/**
 * Course model — DB operations for courses + class_modules
 * @module models/course
 */
const { db } = require('../config/db');

/**
 * List active courses for public catalog (no auth)
 * Returns fields needed for the Catalog page with module counts.
 */
async function listPublic() {
  const courses = await db('courses as c')
    .leftJoin('users as u', 'c.trainer_id', 'u.id')
    .select(
      'c.id', 'c.title', 'c.short_description', 'c.description',
      'c.category', 'c.level', 'c.price', 'c.rating',
      'c.duration_hours', 'c.thumbnail_url', 'c.is_active',
      'u.full_name as trainer_name',
    )
    .where('c.is_active', true)
    .orderBy('c.created_at', 'desc');

  // Attach module count separately to avoid subquery issues
  const counts = await db('class_modules')
    .select('course_id')
    .count('* as modules_count')
    .groupBy('course_id');
  const countMap = {};
  for (const r of counts) countMap[r.course_id] = Number(r.modules_count);

  return courses.map(c => ({ ...c, modules_count: countMap[c.id] || 0 }));
}

/**
 * List all courses with trainer name
 * @param {{ is_active?: boolean }} opts
 */
async function list({ is_active } = {}) {
  const query = db('courses as c')
    .leftJoin('users as u', 'c.trainer_id', 'u.id')
    .select('c.*', 'u.full_name as trainer_name');
  if (is_active != null) query.where('c.is_active', is_active);
  const courses = await query.orderBy('c.created_at', 'desc');

  const counts = await db('class_modules')
    .select('course_id')
    .count('* as modules_count')
    .groupBy('course_id');
  const countMap = {};
  for (const r of counts) countMap[r.course_id] = Number(r.modules_count);

  return courses.map(c => ({ ...c, modules_count: countMap[c.id] || 0 }));
}

/**
 * Get single course with modules
 * @param {string} id
 * @param {{ publishedOnly?: boolean }} opts - students see published modules only
 */
async function findById(id, { publishedOnly = true } = {}) {
  const course = await db('courses as c')
    .leftJoin('users as u', 'c.trainer_id', 'u.id')
    .select('c.*', 'u.full_name as trainer_name')
    .where('c.id', id).first();

  if (!course) return null;

  const moduleQuery = db('class_modules').where({ course_id: id }).orderBy('order_index');
  if (publishedOnly) moduleQuery.where({ is_published: true });
  const modules = await moduleQuery;

  return { ...course, modules };
}

/**
 * Create a course
 * @param {Object} data
 */
async function create(data) {
  const [course] = await db('courses').insert(data).returning('*');
  return course;
}

/**
 * Update a course
 * @param {string} id
 * @param {Object} updates
 */
async function update(id, updates) {
  const [course] = await db('courses')
    .where({ id }).update({ ...updates, updated_at: db.fn.now() }).returning('*');
  return course;
}

/**
 * Delete (soft-delete) a course
 * @param {string} id
 */
async function deactivate(id) {
  return db('courses').where({ id }).update({ is_active: false });
}

/**
 * Permanently delete a course (cascades to its modules, enrollments,
 * assessments, certificates, live classes, resources — irreversible)
 * @param {string} id
 * @returns {Promise<number>} rows deleted (0 or 1)
 */
async function remove(id) {
  return db('courses').where({ id }).del();
}

/**
 * Create/update a class module
 */
async function upsertModule(data) {
  if (data.id) {
    const [mod] = await db('class_modules').where({ id: data.id })
      .update({ ...data, updated_at: db.fn.now() }).returning('*');
    return mod;
  }
  const [mod] = await db('class_modules').insert(data).returning('*');
  return mod;
}

/**
 * Delete a class module
 */
async function deleteModule(id) {
  return db('class_modules').where({ id }).delete();
}

/**
 * Get a single ACTIVE course for the public course-detail page — no auth.
 * Curriculum module titles are included as a preview, but never the
 * video_s3_key (that's only ever resolved to a signed URL for enrolled,
 * authenticated students via getStreamUrl).
 */
async function findByIdPublic(id) {
  const course = await db('courses as c')
    .leftJoin('users as u', 'c.trainer_id', 'u.id')
    .select(
      'c.id', 'c.title', 'c.short_description', 'c.description',
      'c.category', 'c.level', 'c.price', 'c.rating', 'c.duration_hours',
      'c.thumbnail_url', 'c.prerequisites', 'c.completion_criteria', 'c.is_active',
      'u.full_name as trainer_name',
    )
    .where('c.id', id).andWhere('c.is_active', true).first();

  if (!course) return null;

  const modules = await db('class_modules')
    .select('id', 'title', 'description', 'duration_secs', 'order_index')
    .where({ course_id: id, is_published: true })
    .orderBy('order_index');

  return { ...course, modules };
}

module.exports = { listPublic, list, findById, findByIdPublic, create, update, deactivate, remove, upsertModule, deleteModule };
