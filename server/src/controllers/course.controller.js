/**
 * Course controller — CRUD for courses + modules
 * @module controllers/course
 */
const path   = require('path');
const fs     = require('fs');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const CourseModel = require('../models/course.model');
const { createError } = require('../middleware/errorHandler');
const StorageService = require('../services/storage.service');
const { db, supabase } = require('../config/db');

ffmpeg.setFfmpegPath(ffmpegPath);

/** Compress a video to H.264/AAC 720p max — returns path to compressed file */
function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-crf 28',          // quality: 18=best, 28=good, 51=worst — 28 is 50-80% smaller
        '-preset fast',     // encoding speed vs compression tradeoff
        '-movflags +faststart', // allow streaming before fully downloaded
        '-vf scale=\'min(1280,iw)\':\'min(720,ih)\':force_original_aspect_ratio=decrease', // max 720p
        '-pix_fmt yuv420p', // broadest device compatibility
      ])
      .audioBitrate('128k')
      .on('start', (cmd) => console.log(`[FFmpeg] Compressing: ${path.basename(inputPath)}`))
      .on('end', () => { console.log(`[FFmpeg] Done → ${path.basename(outputPath)}`); resolve(); })
      .on('error', (err) => { console.error(`[FFmpeg] Error: ${err.message}`); reject(err); })
      .save(outputPath);
  });
}

/** Sync an igo_lms course record to public.courses for the Flutter app */
async function syncCourseToPublic(course) {
  try {
    const price = Number(course.price) || 0;
    const payload = {
      id:              course.id,
      title:           course.title,
      description:     course.description || null,
      thumbnail_url:   course.thumbnail_url || null,
      price,
      is_free:         price === 0,
      instructor_name: course.trainer_name || null,
      level:           course.level || null,
      status:          course.is_active !== false ? 'published' : 'draft',
      updated_at:      new Date().toISOString(),
    };
    await supabase.from('courses').upsert(payload, { onConflict: 'id' });
  } catch (e) {
    // Non-fatal — LMS still works even if sync fails
    console.warn('[CourseSync] Failed to sync to public.courses:', e.message);
  }
}

/* ── Local video storage setup ── */
const VIDEO_DIR = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEO_DIR),
  filename: (req, _file, cb) => cb(null, `${req.params.moduleId}.mp4`),
});
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB
  fileFilter: (_req, file, cb) => {
    const ok = /video\/(mp4|quicktime|x-m4v|webm)/i.test(file.mimetype)
            || /\.(mp4|mov|m4v|webm)$/i.test(file.originalname);
    ok ? cb(null, true) : cb(new Error('Only MP4 / MOV / WEBM video files are allowed'));
  },
});
exports.uploadVideoMiddleware = videoUpload.single('video');

/* ── Course thumbnail upload (Supabase Storage, public bucket) ── */
const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
  },
});
exports.uploadThumbnailMiddleware = thumbnailUpload.single('thumbnail');

/** GET /api/courses/public — no auth required, returns active courses for public catalog */
async function listPublic(req, res, next) {
  try {
    const courses = await CourseModel.listPublic();
    res.json({ success: true, data: courses, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

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
    const {
      title, description, trainer_id, duration_hours, completion_criteria,
      category, level, prerequisites, price, rating, short_description, thumbnail_url,
    } = req.body;
    const course = await CourseModel.create({
      title, description, trainer_id, duration_hours, completion_criteria,
      category, level, prerequisites, price, rating, short_description, thumbnail_url,
    });
    syncCourseToPublic(course);
    res.status(201).json({ success: true, data: course, error: null, message: 'Course created' });
  } catch (err) { next(err); }
}

/** PUT /api/courses/:id */
async function update(req, res, next) {
  try {
    const course = await CourseModel.update(req.params.id, req.body);
    if (!course) throw createError('NOT_FOUND', 'Course not found');
    syncCourseToPublic(course);
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

/** DELETE /api/courses/:id/permanent — Irreversible hard delete */
async function remove(req, res, next) {
  try {
    const deleted = await CourseModel.remove(req.params.id);
    if (!deleted) throw createError('NOT_FOUND', 'Course not found');
    res.json({ success: true, data: null, error: null, message: 'Course permanently deleted' });
  } catch (err) { next(err); }
}

/** POST /api/courses/thumbnail-upload — Upload a course thumbnail, returns its public URL */
async function uploadThumbnail(req, res, next) {
  try {
    if (!req.file) throw createError('INVALID_INPUT', 'No image file provided');
    const ext = path.extname(req.file.originalname) || '.jpg';
    const key = `courses/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    await StorageService.uploadBuffer(key, req.file.buffer, req.file.mimetype, StorageService.BUCKET_COURSE_IMAGES);
    const url = StorageService.getPublicUrl(key, StorageService.BUCKET_COURSE_IMAGES);
    res.json({ success: true, data: { url }, error: null, message: 'Thumbnail uploaded' });
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

/** GET /api/courses/modules/:moduleId/upload-url — Get Supabase signed upload URL (legacy S3 flow) */
async function getUploadUrl(req, res, next) {
  try {
    const { filename, contentType } = req.query;
    const key = `courses/${req.params.moduleId}/${Date.now()}-${filename}`;
    const uploadUrl = await StorageService.getUploadUrl(key, StorageService.BUCKET_VIDEOS);
    res.json({ success: true, data: { uploadUrl, key }, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** POST /api/courses/modules/:moduleId/upload-video — Upload video; pushes to Supabase Storage in background */
async function uploadVideoLocal(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, data: null, error: 'NO_FILE', message: 'No video file provided' });
    const duration_secs = parseInt(req.body.duration_secs) || 0;
    const moduleId = req.params.moduleId;

    // Save with local key first — respond to admin immediately so browser doesn't timeout
    const localKey = `local:${req.file.filename}`;
    const [row] = await db('class_modules')
      .where({ id: moduleId })
      .update({ video_s3_key: localKey, duration_secs, updated_at: db.fn.now() })
      .returning('id', 'video_s3_key', 'duration_secs');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Module not found' });

    res.json({ success: true, data: row, error: null, message: 'Video uploaded — syncing to cloud...' });

    // Background: compress → upload to Supabase Storage (does not block the response)
    setImmediate(async () => {
      const storagePath = `modules/${moduleId}.mp4`;
      const compressedPath = req.file.path.replace('.mp4', '_compressed.mp4');
      try {
        // Step 1: compress
        await compressVideo(req.file.path, compressedPath);

        // Step 2: upload compressed file
        const buffer = fs.readFileSync(compressedPath);
        await StorageService.uploadBuffer(storagePath, buffer, 'video/mp4', 'lesson-videos');

        // Step 3: update DB to storage path
        await db('class_modules').where({ id: moduleId }).update({ video_s3_key: storagePath });
        console.log(`[VideoUpload] Cloud sync complete (compressed): ${storagePath}`);

        // Step 4: clean up compressed temp file
        fs.unlinkSync(compressedPath);
      } catch (e) {
        console.warn(`[VideoUpload] Cloud sync failed (local fallback stays): ${e.message}`);
        if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
      }
    });
  } catch (err) { next(err); }
}

/** GET /api/courses/modules/:moduleId/video — Stream local video with range support */
async function serveLocalVideo(req, res, next) {
  try {
    const mod = await db('class_modules').where({ id: req.params.moduleId }).first('video_s3_key', 'title');
    if (!mod || !mod.video_s3_key) return res.status(404).send('No video');
    if (!mod.video_s3_key.startsWith('local:')) return res.status(400).send('Not a local video');

    const filename = mod.video_s3_key.slice(6);
    const filePath = path.join(VIDEO_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('Video file not found on server');

    const stat     = fs.statSync(filePath);
    const fileSize = stat.size;
    const range    = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end   = endStr ? parseInt(endStr, 10) : Math.min(start + 10 * 1024 * 1024, fileSize - 1);
      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': end - start + 1,
        'Content-Type':   'video/mp4',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type':   'video/mp4',
        'Accept-Ranges':  'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) { next(err); }
}

/** GET /api/courses/modules/:moduleId/stream-url — Get stream URL (local or signed S3) */
async function getStreamUrl(req, res, next) {
  try {
    const mod = await db('class_modules').where({ id: req.params.moduleId }).first();
    if (!mod) throw createError('NOT_FOUND', 'Module not found');
    if (!mod.video_s3_key) throw createError('NOT_FOUND', 'No video uploaded yet');

    let url;
    if (mod.video_s3_key.startsWith('local:')) {
      url = `/api/courses/modules/${mod.id}/video`;
    } else if (mod.video_s3_key.startsWith('http')) {
      url = mod.video_s3_key;
    } else {
      url = await StorageService.getSignedUrl(mod.video_s3_key);
    }
    res.json({ success: true, data: { url }, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

module.exports = {
  listPublic, list, getOne, create, update, deactivate, remove, upsertModule, deleteModule,
  getUploadUrl, getStreamUrl,
  uploadVideoMiddleware: exports.uploadVideoMiddleware,
  uploadVideoLocal, serveLocalVideo,
  uploadThumbnailMiddleware: exports.uploadThumbnailMiddleware,
  uploadThumbnail,
};
