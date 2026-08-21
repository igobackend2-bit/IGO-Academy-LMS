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

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
];
const registerRules = [
  body('full_name').trim().notEmpty().isLength({ min: 2 }).withMessage('Full name required (min 2 characters)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone number required'),
  strongPassword('password'),
];
const otpRules = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  strongPassword('new_password'),
];

router.post('/login',           loginRules, validateRequest, authCtrl.login);
router.post('/register',        registerRules, validateRequest, authCtrl.register);
router.post('/logout',          verifyToken, authCtrl.logout);
router.get('/me',               verifyToken, authCtrl.getMe);
router.post('/forgot-password', body('email').isEmail(), validateRequest, authCtrl.forgotPassword);
router.post('/verify-otp',      otpRules, validateRequest, authCtrl.verifyOtp);
router.post('/change-password', verifyToken,
  body('current_password').notEmpty(),
  strongPassword('new_password'),
  validateRequest, authCtrl.changePassword
);

module.exports = router;
