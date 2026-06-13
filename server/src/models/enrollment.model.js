/**
 * Enrollment model — DB operations for enrollments table
 * @module models/enrollment
 */
const { db } = require('../config/db');

/**
 * Create an enrollment (admin only)
 */
async function create(data) {
  const [row] = await db('enrollments').insert(data).returning('*');
  return row;
}

/**
 * Get all enrollments for a student with course info
 */
async function findByStudent(studentId) {
  return db('enrollments as e')
    .join('courses as c', 'e.course_id', 'c.id')
    .leftJoin('users as t', 'c.trainer_id', 't.id')
    .select(
      'e.*',
      'c.title as course_title',
      'c.thumbnail_url',
      'c.duration_hours',
      'c.completion_criteria',
      't.full_name as trainer_name'
    )
    .where('e.student_id', studentId)
    .orderBy('e.enrolled_at', 'desc');
}

/**
 * Get all enrollments for a course (admin view)
 */
async function findByCourse(courseId) {
  return db('enrollments as e')
    .join('users as u', 'e.student_id', 'u.id')
    .select('e.*', 'u.full_name', 'u.email', 'u.phone')
    .where('e.course_id', courseId)
    .orderBy('e.enrolled_at', 'desc');
}

/**
 * List all enrollments with student + course info (admin panel)
 */
async function listAll({ page = 1, limit = 20, search } = {}) {
  const query = db('enrollments as e')
    .join('users as u', 'e.student_id', 'u.id')
    .join('courses as c', 'e.course_id', 'c.id')
    .select('e.*', 'u.full_name', 'u.email', 'c.title as course_title');

  if (search) query.whereILike('u.full_name', `%${search}%`);

  const [{ count }] = await query.clone().clearSelect().clearOrder().count('* as count');
  const data = await query.orderBy('e.enrolled_at', 'desc').limit(limit).offset((page - 1) * limit);

  return { data, total: parseInt(count, 10) };
}

/**
 * Update an enrollment (e.g., extend end_date)
 */
async function update(id, updates) {
  const [row] = await db('enrollments')
    .where({ id }).update({ ...updates, updated_at: db.fn.now() }).returning('*');
  return row;
}

/**
 * Delete an enrollment (admin only)
 */
async function remove(id) {
  return db('enrollments').where({ id }).delete();
}

module.exports = { create, findByStudent, findByCourse, listAll, update, remove };
