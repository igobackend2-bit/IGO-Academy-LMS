/**
 * User controller — CRUD for admin user management
 * @module controllers/user
 */
const bcrypt = require('bcryptjs');
const { parse } = require('fast-csv');
const { Readable } = require('stream');
const UserModel = require('../models/user.model');
const { redisClient } = require('../config/redis');
const { sendAccountCreatedEmail } = require('../services/email.service');
const { syncUserToMobileAuth } = require('../services/mobileAuthSync.service');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/** GET /api/users */
async function list(req, res, next) {
  try {
    const { role, is_active, page = 1, limit = 20, search } = req.query;
    const result = await UserModel.list({
      role,
      is_active: is_active != null ? is_active === 'true' : undefined,
      page: parseInt(page), limit: parseInt(limit), search,
    });
    res.json({ success: true, data: result, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/users/:id */
async function getOne(req, res, next) {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw createError('NOT_FOUND', 'User not found');
    res.json({ success: true, data: user, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** POST /api/users — Admin creates user */
async function create(req, res, next) {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const existing = await UserModel.findByEmail(email);
    if (existing) throw createError('INVALID_INPUT', 'Email already registered');

    const password_hash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ full_name, email, phone, password_hash, role: role || 'student' });
    syncUserToMobileAuth({ id: user.id, email, password, full_name, phone });

    try {
      await sendAccountCreatedEmail({ to: user.email, name: user.full_name, role: user.role });
    } catch (emailErr) {
      logger.error('[Users] Account-created email failed:', emailErr.message);
    }

    logger.info(`[Users] Created: ${email} (${role})`);
    res.status(201).json({ success: true, data: user, error: null, message: 'User created' });
  } catch (err) { next(err); }
}

/** PUT /api/users/:id */
async function update(req, res, next) {
  try {
    const { full_name, phone, is_active, role } = req.body;
    const user = await UserModel.update(req.params.id, { full_name, phone, is_active, role });
    if (!user) throw createError('NOT_FOUND', 'User not found');
    res.json({ success: true, data: user, error: null, message: 'User updated' });
  } catch (err) { next(err); }
}

/** DELETE /api/users/:id — Deactivate user */
async function deactivate(req, res, next) {
  try {
    await UserModel.update(req.params.id, { is_active: false });
    await redisClient.del(`session:${req.params.id}`);
    res.json({ success: true, data: null, error: null, message: 'User deactivated' });
  } catch (err) { next(err); }
}

/** DELETE /api/users/:id/permanent — Irreversible hard delete */
async function remove(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      throw createError('INVALID_INPUT', 'You cannot delete your own account');
    }
    const deleted = await UserModel.remove(req.params.id);
    if (!deleted) throw createError('NOT_FOUND', 'User not found');
    await redisClient.del(`session:${req.params.id}`);
    logger.info(`[Users] Permanently deleted: ${req.params.id} (by ${req.user.email})`);
    res.json({ success: true, data: null, error: null, message: 'User permanently deleted' });
  } catch (err) { next(err); }
}

/** POST /api/users/:id/force-logout */
async function forceLogout(req, res, next) {
  try {
    await redisClient.del(`session:${req.params.id}`);
    res.json({ success: true, data: null, error: null, message: 'User session terminated' });
  } catch (err) { next(err); }
}

/** POST /api/users/:id/reset-password */
async function resetPassword(req, res, next) {
  try {
    const { new_password } = req.body;
    const user = await UserModel.findById(req.params.id);
    if (!user) throw createError('NOT_FOUND', 'User not found');

    const password_hash = await bcrypt.hash(new_password, 12);
    await UserModel.update(req.params.id, { password_hash });
    await redisClient.del(`session:${req.params.id}`);
    syncUserToMobileAuth({ id: user.id, email: user.email, password: new_password, full_name: user.full_name, phone: user.phone });

    res.json({ success: true, data: null, error: null, message: 'Password reset successfully' });
  } catch (err) { next(err); }
}

/** POST /api/users/bulk-import — CSV upload */
async function bulkImport(req, res, next) {
  try {
    if (!req.file) throw createError('INVALID_INPUT', 'CSV file required');

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(parse({ headers: true, trim: true }))
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const processed = await Promise.all(
      rows.map(async (r) => ({
        full_name:     r.full_name || r['Full Name'],
        email:         r.email || r['Email'],
        phone:         r.phone || r['Phone'] || null,
        password_hash: await bcrypt.hash(r.password || 'IGo@2026', 12),
      }))
    );

    const count = await UserModel.bulkCreate(processed);
    logger.info(`[Users] Bulk import: ${count} students created`);
    res.json({ success: true, data: { imported: count }, error: null, message: `${count} students imported` });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, deactivate, remove, forceLogout, resetPassword, bulkImport };
