/**
 * Assessment model — quizzes, assignments, projects
 * @module models/assessment
 */
const { db } = require('../config/db');

async function listByCourse(courseId) {
  return db('assessments').where({ course_id: courseId }).orderBy('created_at');
}

async function listByModule(moduleId) {
  return db('assessments').where({ module_id: moduleId }).orderBy('created_at');
}

async function findById(id) {
  return db('assessments').where({ id }).first();
}

/** JSONB columns must be stringified — pg serializes raw JS arrays as Postgres arrays */
function serialize(data) {
  const out = { ...data };
  if (out.questions !== undefined && typeof out.questions !== 'string') {
    out.questions = JSON.stringify(out.questions);
  }
  return out;
}

async function create(data) {
  const [row] = await db('assessments').insert(serialize(data)).returning('*');
  return row;
}

async function update(id, data) {
  const [row] = await db('assessments').where({ id })
    .update({ ...serialize(data), updated_at: db.fn.now() }).returning('*');
  return row;
}

async function remove(id) {
  return db('assessments').where({ id }).delete();
}

/** Get a student's submission for an assessment */
async function getSubmission(assessmentId, studentId) {
  return db('submissions').where({ assessment_id: assessmentId, student_id: studentId })
    .orderBy('attempt_number', 'desc').first();
}

/** Get all submissions for an assessment (trainer/admin) */
async function getSubmissions(assessmentId) {
  return db('submissions as s')
    .join('users as u', 's.student_id', 'u.id')
    .select('s.*', 'u.full_name', 'u.email')
    .where('s.assessment_id', assessmentId)
    .orderBy('s.submitted_at', 'desc');
}

/** Create a submission */
async function createSubmission(data) {
  const [row] = await db('submissions').insert(data).returning('*');
  return row;
}

/** Update submission (grade it) */
async function updateSubmission(id, data) {
  const [row] = await db('submissions').where({ id })
    .update({ ...data, graded_at: db.fn.now() }).returning('*');
  return row;
}

module.exports = {
  listByCourse, listByModule, findById, create, update, remove,
  getSubmission, getSubmissions, createSubmission, updateSubmission,
};
