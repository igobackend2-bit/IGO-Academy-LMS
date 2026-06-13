/**
 * Course controller — CRUD for courses + modules
 * @module controllers/course
 */
const CourseModel = require('../models/course.model');
const { createError } = require('../middleware/errorHandler');
const StorageService = require('../services/storage.service');

/** GET /api/courses */
async function list(req, res, next) {
  try {
    const courses = await CourseModel.list({ is_active: req.query.is_active !== 'false' });
    res.json({ success: true, data: courses, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/courses/:id */
async function getOne(req, res, next) {
  try {
    const course = await CourseModel.findById(req.params.id, {
      publishedOnly: req.user.role === 'student',
    });
    if (!course) throw createError('NOT_FOUND', 'Course not found');
    res.json({ success: true, data: course, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** POST /api/courses */
async function create(req, res, next) {
  try {
    const { title, description, trainer_id, duration_hours, completion_criteria } = req.body;
    const course = await CourseModel.create({ title, description, trainer_id, duration_hours, completion_criteria });
    res.status(201).json({ success: true, data: course, error: null, message: 'Course created' });
  } catch (err) { next(err); }
}

/** PUT /api/courses/:id */
async function update(req, res, next) {
  try {
    const course = await CourseModel.update(req.params.id, req.body);
    if (!course) throw createError('NOT_FOUND', 'Course not found');
    res.json({ success: true, data: course, error: null, message: 'Course updated' });
  } catch (err) { next(err); }
}

/** DELETE /api/courses/:id */
async function deactivate(req, res, next) {
  try {
    await CourseModel.deactivate(req.params.id);
    res.json({ success: true, data: null, error: null, message: 'Course deactivated' });
  } catch (err) { next(err); }
}

/** POST /api/courses/:id/modules — Add/update module */
async function upsertModule(req, res, next) {
  try {
    const mod = await CourseModel.upsertModule({ ...req.body, course_id: req.params.id });
    res.json({ success: true, data: mod, error: null, message: 'Module saved' });
  } catch (err) { next(err); }
}

/** DELETE /api/courses/modules/:moduleId */
async function deleteModule(req, res, next) {
  try {
    await CourseModel.deleteModule(req.params.moduleId);
    res.json({ success: true, data: null, error: null, message: 'Module deleted' });
  } catch (err) { next(err); }
}

/** GET /api/courses/modules/:moduleId/upload-url — Get Supabase signed upload URL */
async function getUploadUrl(req, res, next) {
  try {
    const { filename, contentType } = req.query;
    const key = `courses/${req.params.moduleId}/${Date.now()}-${filename}`;
    const uploadUrl = await StorageService.getUploadUrl(key, StorageService.BUCKET_VIDEOS);
    res.json({ success: true, data: { uploadUrl, key }, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/courses/modules/:moduleId/stream-url — Get signed stream URL */
async function getStreamUrl(req, res, next) {
  try {
    const { db } = require('../config/db');
    const mod = await db('class_modules').where({ id: req.params.moduleId }).first();
    if (!mod) throw createError('NOT_FOUND', 'Module not found');
    if (!mod.video_s3_key) throw createError('NOT_FOUND', 'No video uploaded yet');

    const url = await StorageService.getSignedUrl(mod.video_s3_key);
    res.json({ success: true, data: { url }, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, deactivate, upsertModule, deleteModule, getUploadUrl, getStreamUrl };
