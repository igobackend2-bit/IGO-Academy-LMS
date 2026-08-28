/**
 * Auth routes
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 * POST /api/auth/forgot-password
 * POST /api/auth/verify-otp
 * POST /api/auth/change-password
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');
const { validateRequest } = require('../middleware/validateRequest');

// Doc §13: "strong password policy". Applied only where a NEW password is
// being set (register, OTP reset, change-password) -- login just checks
// against whatever's already stored, so it keeps the looser min-length-only
// rule to avoid breaking existing accounts created before this policy.
const strongPassword = (field) => body(field)
  .isLength({ min: 8 }).withMessage(`${field === 'password' ? 'Password' : 'New password'} must be at least 8 characters`)
  .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
  .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
  .matches(/[0-9]/).withMessage('Password must include a number');

// `email` field name kept for API back-compat on login/forgot-password —
// it now holds either an email or a phone number (auth.controller.js
// branches on shape), so it's just non-empty here rather than isEmail().
const loginRules = [
  body('email').trim().notEmpty().withMessage('Email or mobile number required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
];
const sendRegisterOtpRules = [
  body('phone').trim().isLength({ min: 10, max: 13 }).withMessage('Enter a valid mobile number'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required'),
];
const registerRules = [
  body('full_name').trim().notEmpty().isLength({ min: 2 }).withMessage('Full name required (min 2 characters)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone number required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit OTP sent to your phone'),
  strongPassword('password'),
  body('agreed_to_terms').custom((v) => v === true)
    .withMessage('You must agree to the Terms & Conditions and Privacy Policy to create an account'),
];
// Password-reset OTP step: either `email` (local email OTP) or `phone`
// (Supabase phone OTP) must be present — auth.controller.js branches on
// which one was sent.
const otpRules = [
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  strongPassword('new_password'),
];

router.post('/login',              loginRules, validateRequest, authCtrl.login);
router.post('/register/send-otp',  sendRegisterOtpRules, validateRequest, authCtrl.sendRegisterOtp);
router.post('/register',           registerRules, validateRequest, authCtrl.register);
router.post('/logout',             verifyToken, authCtrl.logout);
router.get('/me',                  verifyToken, authCtrl.getMe);
router.post('/forgot-password',    body('email').trim().notEmpty().withMessage('Email or mobile number required'), validateRequest, authCtrl.forgotPassword);
router.post('/verify-otp',         otpRules, validateRequest, authCtrl.verifyOtp);
router.post('/change-password', verifyToken,
  body('current_password').notEmpty(),
  strongPassword('new_password'),
  validateRequest, authCtrl.changePassword
);

module.exports = router;
