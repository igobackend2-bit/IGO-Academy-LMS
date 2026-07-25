/**
 * User model — all DB operations for the users table
 * @module models/user
 */
const { db } = require('../config/db');

const TABLE = 'users';

/** Fields safe to return in API responses (no password_hash) */
const SAFE_FIELDS = [
  'id', 'full_name', 'email', 'phone', 'role',
  'is_active', 'otp_verified', 'last_login_at', 'created_at', 'updated_at',
];

/**
 * Find user by email (includes password_hash — internal use only)
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function findByEmail(email) {
  return db(TABLE).where({ email: email.toLowerCase().trim() }).first();
}

/**
 * Find user by ID (safe fields only)
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  return db(TABLE).where({ id }).select(SAFE_FIELDS).first();
}

/**
 * Create a new user
 * @param {{ full_name, email, phone, password_hash, role }} data
 * @returns {Promise<Object>} created user (safe fields)
 */
async function create(data) {
  const [user] = await db(TABLE)
    .insert({ ...data, email: data.email.toLowerCase().trim() })
    .returning(SAFE_FIELDS);
  return user;
}

/**
 * Update user fields
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object>} updated user (safe fields)
 */
async function update(id, updates) {
  const [user] = await db(TABLE)
    .where({ id })
    .update({ ...updates, updated_at: db.fn.now() })
    .returning(SAFE_FIELDS);
  return user;
}

/**
 * List users with optional filters and pagination
 * @param {{ role?: string, is_active?: boolean, page?: number, limit?: number, search?: string }} opts
 * @returns {Promise<{ data: Object[], total: number }>}
 */
async function list({ role, is_active, page = 1, limit = 20, search } = {}) {
  const query = db(TABLE).select(SAFE_FIELDS);

  if (role)                query.where({ role });
  if (is_active != null)   query.where({ is_active });
  if (search) {
    query.where((q) =>
      q.whereILike('full_name', `%${search}%`)
       .orWhereILike('email', `%${search}%`)
    );
  }

  const countQuery = query.clone().clearSelect().count('* as count').first();
  const [{ count }, rows] = await Promise.all([
    countQuery,
    query.clone().orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit),
  ]);

  return { data: rows, total: parseInt(count, 10) };
}

/**
 * Permanently delete a user (cascades to their enrollments, attendance,
 * certificates, etc. per FK constraints — irreversible)
 * @param {string} id
 * @returns {Promise<number>} rows deleted (0 or 1)
 */
async function remove(id) {
  return db(TABLE).where({ id }).del();
}

/**
 * Set OTP for a user (forgot-password flow)
 * @param {string} email
 * @param {string} otp
 * @param {Date} expiresAt
 */
async function setOtp(email, otp, expiresAt) {
  await db(TABLE)
    .where({ email: email.toLowerCase().trim() })
    .update({ otp_code: otp, otp_expires_at: expiresAt, updated_at: db.fn.now() });
}

/**
 * Clear OTP after successful verification
 * @param {string} id
 */
async function clearOtp(id) {
  await db(TABLE)
    .where({ id })
    .update({ otp_code: null, otp_expires_at: null, otp_verified: true, updated_at: db.fn.now() });
}

/**
 * Bulk insert students from CSV data
 * @param {Array<{ full_name, email, phone, password_hash }>} rows
 * @returns {Promise<number>} count inserted
 */
async function bulkCreate(rows) {
  const result = await db(TABLE)
    .insert(rows.map((r) => ({ ...r, role: 'student', email: r.email.toLowerCase().trim() })))
    .onConflict('email').ignore()
    .returning('id');
  return result.length;
}

module.exports = { findByEmail, findById, create, update, remove, list, setOtp, clearOtp, bulkCreate, SAFE_FIELDS };
