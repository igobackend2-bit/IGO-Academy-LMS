/**
 * Auth controller — login, logout, OTP reset, session management
 * @module controllers/auth
 */
const bcrypt = require('bcryptjs');
const { signToken, hashToken, generateOtp } = require('../utils/jwt.util');
const { bareDigits, toApiFormat } = require('../utils/phone.util');
const { redisClient } = require('../config/redis');
const { db } = require('../config/db');
const UserModel = require('../models/user.model');
const { sendOtpEmail } = require('../services/email.service');
const { sendOtpSms } = require('../services/sms.service');
const { syncUserToMobileAuth } = require('../services/mobileAuthSync.service');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/** '9876543210' vs 'someone@x.com' — decides which lookup/OTP path to use. */
function isEmailShaped(identifier) {
  return typeof identifier === 'string' && identifier.includes('@');
}

const SESSION_SECS = (parseInt(process.env.SESSION_INACTIVITY_MINUTES, 10) || 30) * 60;
const OTP_MINS     = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;

/**
 * POST /api/auth/login
 * Validates credentials, enforces single session, returns JWT in httpOnly cookie
 */
async function login(req, res, next) {
  try {
    // Field is still called `email` for API back-compat, but it now accepts
    // either an email or a phone number — students registering via the new
    // phone-OTP flow log in with their phone, existing accounts keep using
    // email unchanged.
    const { email: identifier, password } = req.body;

    const user = isEmailShaped(identifier)
      ? await UserModel.findByEmail(identifier)
      : await UserModel.findByPhone(identifier);
    if (!user) throw createError('INVALID_CREDENTIALS', 'Invalid email/phone or password');

    // Deactivated accounts can still log in (see dashboard/profile) — course
    // content access is what's actually blocked, enforced per-request in
    // checkCourseExpiry so it takes effect immediately without needing to
    // kill the session here.
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw createError('INVALID_CREDENTIALS', 'Invalid email/phone or password');

    // For students — only block if they HAVE enrollments but all have expired
    // New students (zero enrollments) are allowed through to browse the catalog
    if (user.role === 'student') {
      const today = new Date().toISOString().split('T')[0];
      const anyEnrollment = await db('enrollments').where({ student_id: user.id }).first();
      if (anyEnrollment) {
        const activeEnrollment = await db('enrollments')
          .where({ student_id: user.id, is_expired: false })
          .where('end_date', '>=', today)
          .first();
        if (!activeEnrollment) {
          throw createError('COURSE_EXPIRED', 'Your course access has ended. Contact IGo Academy to renew.');
        }
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
 * Sends OTP to the registered email or phone (whichever was submitted).
 */
async function forgotPassword(req, res, next) {
  try {
    // Same back-compat field name as login — `email` may actually hold a
    // phone number now.
    const { email: identifier } = req.body;
    const viaEmail = isEmailShaped(identifier);
    const genericMessage = viaEmail
      ? 'If that email exists, an OTP has been sent.'
      : 'If that phone number is registered, an OTP has been sent.';

    const user = viaEmail
      ? await UserModel.findByEmail(identifier)
      : await UserModel.findByPhone(identifier);

    // Always return the same generic success either way — avoids leaking
    // which accounts exist, and (for phone) avoids texting a stranger's
    // number for an account that doesn't exist.
    if (!user) {
      return res.json({ success: true, data: null, error: null, message: genericMessage });
    }

    // Same local-OTP mechanism either way (users.otp_code/otp_expires_at) —
    // only the delivery channel differs.
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_MINS * 60 * 1000);
    await UserModel.setOtp(user.email, otp, expiresAt);

    if (viaEmail) {
      try {
        await sendOtpEmail({ to: user.email, name: user.full_name, otp });
      } catch (emailErr) {
        logger.error('[Auth] OTP email failed:', emailErr.message);
      }
      logger.info(`[Auth] Email OTP sent to ${user.email}`);
    } else {
      const mobile = toApiFormat(user.phone);
      if (!mobile) throw createError('INVALID_INPUT', 'This account has no valid phone number on file');
      try {
        await sendOtpSms({ mobile, otp });
      } catch (smsErr) {
        logger.error('[Auth] OTP SMS failed:', smsErr.message);
        throw createError('PHONE_OTP_FAILED', 'Could not send OTP — please try again');
      }
      logger.info(`[Auth] Phone OTP sent to ${mobile}`);
    }

    res.json({ success: true, data: null, error: null, message: genericMessage });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/verify-otp
 * Verifies the local OTP (same mechanism for both channels — only how it
 * was delivered differs) and sets a new password.
 */
async function verifyOtp(req, res, next) {
  try {
    const { email: emailIdentifier, phone: phoneIdentifier, otp, new_password } = req.body;
    const viaPhone = !!phoneIdentifier;

    const user = viaPhone
      ? await UserModel.findByPhone(phoneIdentifier)
      : await UserModel.findByEmail(emailIdentifier);
    if (!user || !user.otp_code) throw createError('INVALID_INPUT', 'Invalid OTP request');
    if (user.otp_code !== otp) throw createError('INVALID_INPUT', 'Invalid OTP');
    if (new Date() > new Date(user.otp_expires_at)) throw createError('INVALID_INPUT', 'OTP has expired. Request a new one.');

    const password_hash = await bcrypt.hash(new_password, 12);
    await UserModel.update(user.id, { password_hash });
    await UserModel.clearOtp(user.id);
    syncUserToMobileAuth({ id: user.id, email: user.email, password: new_password, full_name: user.full_name, phone: user.phone });

    // Kill any existing sessions
    await redisClient.del(`session:${user.id}`);
    res.clearCookie('igo_token');

    logger.info(`[Auth] Password reset for ${user.email}`);
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
    syncUserToMobileAuth({ id: req.user.id, email: user.email, password: new_password, full_name: user.full_name, phone: user.phone });

    res.json({ success: true, data: null, error: null, message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

// Pending registration OTPs live in Redis, not the users table — there's
// no user row yet to attach otp_code/otp_expires_at to. Same TTL as the
// email-OTP flow.
const registerOtpKey = (phone) => `register_otp:${bareDigits(phone)}`;

/**
 * POST /api/auth/register/send-otp
 * First step of registration: generate an OTP, stash it in Redis keyed by
 * phone, deliver it via APITxT — before any account is created. Fails
 * fast on a duplicate email/phone so the student isn't sent an SMS only
 * to hit a CONFLICT at the final step.
 */
async function sendRegisterOtp(req, res, next) {
  try {
    const { email, phone } = req.body;

    const mobile = toApiFormat(phone);
    if (!mobile) throw createError('INVALID_INPUT', 'Enter a valid 10-digit mobile number');

    if (email) {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) throw createError('CONFLICT', 'An account with that email already exists');
    }
    const existingPhone = await UserModel.findByPhone(phone);
    if (existingPhone) throw createError('CONFLICT', 'An account with that phone number already exists');

    const otp = generateOtp();
    try {
      await sendOtpSms({ mobile, otp });
    } catch (smsErr) {
      logger.error('[Auth] Register OTP SMS failed:', smsErr.message);
      throw createError('PHONE_OTP_FAILED', 'Could not send OTP — please try again');
    }
    await redisClient.setex(registerOtpKey(phone), OTP_MINS * 60, otp);

    logger.info(`[Auth] Register OTP sent to ${mobile}`);
    res.json({ success: true, data: null, error: null, message: 'OTP sent to your phone' });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/register
 * Student self-registration — verifies the phone OTP first (from
 * sendRegisterOtp above, stored in Redis), then creates the account and
 * returns a JWT cookie.
 */
async function register(req, res, next) {
  try {
    const { full_name, email, phone, password, otp } = req.body;

    if (!otp) throw createError('INVALID_INPUT', 'Phone OTP is required');
    const otpKey = registerOtpKey(phone);
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== otp) throw createError('INVALID_INPUT', 'Invalid or expired OTP');
    await redisClient.del(otpKey); // one-time use, whether this succeeds or the checks below fail

    // Re-check both — the OTP step already checked, but a few minutes may
    // have passed between send and verify.
    const existing = await UserModel.findByEmail(email);
    if (existing) throw createError('CONFLICT', 'An account with that email already exists');
    const existingPhone = await UserModel.findByPhone(phone);
    if (existingPhone) throw createError('CONFLICT', 'An account with that phone number already exists');

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert new student — terms_accepted_at is the evidentiary record of
    // consent (registerRules already rejected the request if agreed_to_terms
    // wasn't literally true, so reaching here means it was accepted now).
    const newUser = await UserModel.create({
      full_name: full_name.trim(),
      email,
      phone: toApiFormat(phone) || phone,
      password_hash,
      role: 'student',
      is_active: true,
      otp_verified: true,
      terms_accepted_at: new Date(),
    });
    syncUserToMobileAuth({ id: newUser.id, email, password, full_name: full_name.trim(), phone: newUser.phone });

    // Issue session in Redis
    const sessionKey = `session:${newUser.id}`;
    const token = signToken({ id: newUser.id, role: 'student', email: newUser.email });
    const tokenHash = hashToken(token);
    await redisClient.setex(sessionKey, SESSION_SECS, tokenHash);

    // Set httpOnly cookie (same as login)
    res.cookie('igo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`[Auth] Register: ${newUser.email}`);

    res.status(201).json({
      success: true,
      data: { id: newUser.id, full_name: newUser.full_name, email: newUser.email, role: 'student' },
      error: null,
      message: 'Account created',
    });
  } catch (err) { next(err); }
}

module.exports = { login, logout, getMe, forgotPassword, verifyOtp, changePassword, register, sendRegisterOtp };
