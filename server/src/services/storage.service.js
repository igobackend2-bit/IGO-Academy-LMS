/**
 * Storage service — Supabase Storage for videos, certificates, uploads
 * Replaces AWS S3/CloudFront — same interface, Supabase backend
 * @module services/storage
 */
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const BUCKET_VIDEOS  = process.env.SUPABASE_STORAGE_BUCKET_VIDEOS  || 'igo-videos';
const BUCKET_CERTS   = process.env.SUPABASE_STORAGE_BUCKET_CERTS   || 'igo-certificates';
const BUCKET_UPLOADS = process.env.SUPABASE_STORAGE_BUCKET_UPLOADS || 'igo-uploads';
const BUCKET_COURSE_IMAGES = 'course-images';
const SIGNED_EXPIRY  = parseInt(process.env.SIGNED_URL_EXPIRY_SECONDS, 10) || 7200;

/**
 * Get the public URL for a file in a public bucket (no expiry)
 * @param {string} path
 * @param {string} bucket
 * @returns {string} public URL
 */
function getPublicUrl(path, bucket = BUCKET_COURSE_IMAGES) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed URL to upload a file (direct from browser to Supabase Storage)
 * @param {string} path - Storage path/key
 * @param {string} bucket
 * @returns {Promise<string>} signed upload URL
 */
async function getUploadUrl(path, bucket = BUCKET_VIDEOS) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error) throw new Error(`Storage upload URL error: ${error.message}`);
  return data.signedUrl;
}

/**
 * Get a signed URL to stream/download a private file
 * @param {string} path - Storage key
 * @param {string} bucket
 * @param {number} [expiresIn] - seconds
 * @returns {Promise<string>} signed download URL
 */
async function getSignedUrl(path, bucket = BUCKET_VIDEOS, expiresIn = SIGNED_EXPIRY) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw new Error(`Storage signed URL error: ${error.message}`);
  return data.signedUrl;
}

/**
 * Upload a buffer to Supabase Storage (server-side, e.g. certificates)
 * @param {string} path
 * @param {Buffer} buffer
 * @param {string} contentType
 * @param {string} bucket
 * @returns {Promise<string>} storage path
 */
async function uploadBuffer(path, buffer, contentType = 'application/octet-stream', bucket = BUCKET_CERTS) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload error: ${error.message}`);
  return data.path;
}

/**
 * Delete a file from storage
 * @param {string} path
 * @param {string} bucket
 */
async function deleteFile(path, bucket = BUCKET_VIDEOS) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) logger.error(`[Storage] Delete failed: ${error.message}`);
}

module.exports = {
  getUploadUrl,
  getSignedUrl,
  getPublicUrl,
  uploadBuffer,
  deleteFile,
  BUCKET_VIDEOS,
  BUCKET_CERTS,
  BUCKET_UPLOADS,
  BUCKET_COURSE_IMAGES,
};
