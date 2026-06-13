/**
 * Auth controller — login, logout, OTP reset, session management
 * @module controllers/auth
 */
const bcrypt = require('bcryptjs');
const { signToken, hashToken, generateOtp } = require('../utils/jwt.util');
const { redisClient } = require('../config/redis');
const { db } = require('../config/db');
const UserModel = require('../models/user.model');
const { sendOtpEmail } = require('../services/email.service');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const SESSION_SECS = (parseInt(process.env.SESSION_INACTIVITY_MINUTES, 10) || 30) * 60;
const OTP_MINS     = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;

/**
 * POST /api/auth/login
 * Validates credentials, enforces single session, returns JWT in httpOnly cookie
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) throw createError('INVALID_CREDENTIALS', 'Invalid email or password');
    if (!user.is_active) throw createError('UNAUTHORIZED', 'Your account has been deactivated. Contact IGo Academy.');

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw createError('INVALID_CREDENTIALS', 'Invalid email or password');

    // For students — check if any active enrollment exists
    if (user.role === 'student') {
      const today = new Date().toISOString().split('T')[0];
      const activeEnrollment = await db('enrollments')
        .where({ student_id: user.id, is_expired: false })
        .where('end_date', '>=', today)
        .first();

      if (!activeEnrollment) {
        throw createError('COURSE_EXPIRED', 'Your course access has ended. Contact IGo Academy.');
      }
    }

    // Single-session: kill any existing Redis session
    const sessionKey = `session:${user.id}`;
    await redisClient.del(sessionKey);

    // Sign new token
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    const tokenHash = hashToken(token);

    // Store in Redis with inactivity timeout
    await redisClient.setex(sessionKey, SESSION_SECS, tokenHash);

    // Update last_login
    await UserModel.update(user.id, { last_login_at: new Date() });

    // Set httpOnly cookie
    res.cookie('igo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const safeUser = await UserModel.findById(user.id);
    logger.info(`[Auth] Login: ${user.email} (${user.role})`);

    res.json({ success: true, data: { user: safeUser }, error: null, message: 'Login successful' });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/logout
 * Kills Redis session and clears cookie
 */
async function logout(req, res, next) {
  try {
    if (req.user) {
      await redisClient.del(`session:${req.user.id}`);
    }
    res.clearCookie('igo_token');
    res.json({ success: true, data: null, error: null, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

/**
 * GET /api/auth/me
 * Returns current authenticated user (validates token)
 */
async function getMe(req, res, next) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) throw createError('NOT_FOUND', 'User not found');
    res.json({ success: true, data: user, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/forgot-password
 * Sends OTP to registered email
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, data: null, error: null, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_MINS * 60 * 1000);

    await UserModel.setOtp(email, otp, expiresAt);

    try {
      await sendOtpEmail({ to: user.email, name: user.full_name, otp });
    } catch (emailErr) {
      logger.error('[Auth] OTP email failed:', emailErr.message);
    }

    logger.info(`[Auth] OTP sent to ${email}`);
    res.json({ success: true, data: null, error: null, message: 'If that email exists, an OTP has been sent.' });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/verify-otp
 * Verifies OTP and sets new password
 */
async function verifyOtp(req, res, next) {
  try {
    const { email, otp, new_password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user || !user.otp_code) throw createError('INVALID_INPUT', 'Invalid OTP request');

    if (user.otp_code !== otp) throw createError('INVALID_INPUT', 'Invalid OTP');
    if (new Date() > new Date(user.otp_expires_at)) throw createError('INVALID_INPUT', 'OTP has expired. Request a new one.');

    const password_hash = await bcrypt.hash(new_password, 12);
    await UserModel.update(user.id, { password_hash });
    await UserModel.clearOtp(user.id);

    // Kill any existing sessions
    await redisClient.del(`session:${user.id}`);
    res.clearCookie('igo_token');

    logger.info(`[Auth] Password reset for ${email}`);
    res.json({ success: true, data: null, error: null, message: 'Password updated. Please log in.' });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/change-password (authenticated)
 */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    const user = await UserModel.findByEmail(req.user.email);

    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) throw createError('INVALID_CREDENTIALS', 'Current password is incorrect');

    const password_hash = await bcrypt.hash(new_password, 12);
    await UserModel.update(req.user.id, { password_hash });

    res.json({ success: true, data: null, error: null, message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

module.exports = { login, logout, getMe, forgotPassword, verifyOtp, changePassword };
