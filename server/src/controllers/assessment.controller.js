/**
 * Assessment controller — quizzes, assignments, projects, grading
 * @module controllers/assessment
 */
const AssessmentModel = require('../models/assessment.model');
const StorageService  = require('../services/storage.service');
const { createError } = require('../middleware/errorHandler');
const { db } = require('../config/db');
const multer = require('multer');
const logger = require('../utils/logger');

/** GET /api/assessments?course_id= OR ?module_id= */
async function list(req, res, next) {
  try {
    const { course_id, module_id } = req.query;
    if (!course_id && !module_id) throw createError('INVALID_INPUT', 'course_id or module_id required');

    const data = module_id
      ? await AssessmentModel.listByModule(module_id)
      : await AssessmentModel.listByCourse(course_id);

    // For students, hide correct answers
    const safe = req.user.role === 'student'
      ? data.map((a) => ({
          ...a,
          questions: a.type === 'quiz'
            ? (a.questions || []).map(({ correct_answer, ...q }) => q)
            : a.questions,
        }))
      : data;

    res.json({ success: true, data: safe, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/assessments/:id */
async function getOne(req, res, next) {
  try {
    const a = await AssessmentModel.findById(req.params.id);
    if (!a) throw createError('NOT_FOUND', 'Assessment not found');
    res.json({ success: true, data: a, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** POST /api/assessments */
async function create(req, res, next) {
  try {
    const data = await AssessmentModel.create(req.body);
    res.status(201).json({ success: true, data, error: null, message: 'Assessment created' });
  } catch (err) { next(err); }
}

/** PUT /api/assessments/:id */
async function update(req, res, next) {
  try {
    const data = await AssessmentModel.update(req.params.id, req.body);
    res.json({ success: true, data, error: null, message: 'Assessment updated' });
  } catch (err) { next(err); }
}

/** DELETE /api/assessments/:id */
async function remove(req, res, next) {
  try {
    await AssessmentModel.remove(req.params.id);
    res.json({ success: true, data: null, error: null, message: 'Deleted' });
  } catch (err) { next(err); }
}

/** POST /api/assessments/:id/submit */
async function submit(req, res, next) {
  try {
    const assessment = await AssessmentModel.findById(req.params.id);
    if (!assessment) throw createError('NOT_FOUND', 'Assessment not found');
    if (assessment.deadline && new Date() > new Date(assessment.deadline)) {
      throw createError('INVALID_INPUT', 'Submission deadline has passed');
    }

    // Quizzes unlock once the student has watched enough of the course —
    // same threshold used for certificate eligibility. Enforced here (not
    // just in the UI) so it can't be bypassed by calling this endpoint directly.
    if (assessment.type === 'quiz') {
      const course = await db('courses').where({ id: assessment.course_id }).first('completion_criteria');
      const threshold = course?.completion_criteria?.attendance_pct ?? 80;

      const [{ c: totalModules }] = await db('class_modules')
        .where({ course_id: assessment.course_id, is_published: true }).count('* as c');
      const [{ c: completedModules }] = await db('attendance')
        .where({ student_id: req.user.id, class_type: 'recorded', completed: true })
        .whereIn('class_id', db('class_modules').where({ course_id: assessment.course_id }).select('id'))
        .count('* as c');
      const progress = parseInt(totalModules) > 0
        ? Math.round((parseInt(completedModules) / parseInt(totalModules)) * 100)
        : 0;

      if (progress < threshold) {
        throw createError('INVALID_INPUT', `Watch ${threshold}% of the course to unlock this quiz (you're at ${progress}%)`);
      }
    }

    // Check attempt limit
    const existing = await AssessmentModel.getSubmission(req.params.id, req.user.id);
    const attempts = existing ? existing.attempt_number : 0;
    if (attempts >= (assessment.max_attempts || 1)) {
      throw createError('INVALID_INPUT', 'Maximum attempts reached for this assessment');
    }

    let score = null;
    let status = 'submitted';

    // Auto-grade quizzes
    if (assessment.type === 'quiz' && req.body.answers) {
      const questions = assessment.questions || [];
      let correct = 0;
      for (const q of questions) {
        const ans = req.body.answers.find((a) => a.question_id === q.id);
        if (ans && String(ans.selected_answer) === String(q.correct_answer)) correct++;
      }
      score  = Math.round((correct / questions.length) * (assessment.max_score || 100));
      status = 'graded';
    }

    const submission = await AssessmentModel.createSubmission({
      assessment_id:  req.params.id,
      student_id:     req.user.id,
      answers:        JSON.stringify(req.body.answers || []),
      file_urls:      JSON.stringify(req.body.file_urls || []),
      external_links: JSON.stringify(req.body.external_links || []),
      score,
      status,
      attempt_number: attempts + 1,
    });

    // Check certificate eligibility after every submission
    if (score !== null) {
      setImmediate(() => checkCertificateEligibility(req.user.id, assessment.course_id));
    }

    res.status(201).json({ success: true, data: submission, error: null, message: 'Submitted successfully' });
  } catch (err) { next(err); }
}

/** GET /api/assessments/:id/submissions */
async function getSubmissions(req, res, next) {
  try {
    const data = await AssessmentModel.getSubmissions(req.params.id);
    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/assessments/:id/my-submission */
async function mySubmission(req, res, next) {
  try {
    const data = await AssessmentModel.getSubmission(req.params.id, req.user.id);
    res.json({ success: true, data: data || null, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** PUT /api/assessments/submissions/:submissionId/grade */
async function grade(req, res, next) {
  try {
    const { score, feedback, status } = req.body;
    const updated = await AssessmentModel.updateSubmission(req.params.submissionId, {
      score, feedback, status: status || 'graded', graded_by: req.user.id,
    });

    // Check cert eligibility
    setImmediate(() => checkCertificateEligibility(updated.student_id, req.body.course_id));

    res.json({ success: true, data: updated, error: null, message: 'Graded' });
  } catch (err) { next(err); }
}

/** POST /api/assessments/upload-url — get signed URL for file submission */
async function getUploadUrl(req, res, next) {
  try {
    const { filename, contentType } = req.query;
    const path = `submissions/${req.user.id}/${Date.now()}-${filename}`;
    const url  = await StorageService.getUploadUrl(path, StorageService.BUCKET_UPLOADS);
    res.json({ success: true, data: { url, path }, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/**
 * Background: check if student qualifies for certificate after grading
 */
async function checkCertificateEligibility(studentId, courseId) {
  if (!studentId || !courseId) return;
  try {
    const CertService = require('../services/certificate.service');
    await CertService.checkAndIssueCertificate(studentId, courseId);
  } catch (err) {
    logger.error('[Assessment] Certificate check failed:', err.message);
  }
}

module.exports = { list, getOne, create, update, remove, submit, getSubmissions, mySubmission, grade, getUploadUrl };
