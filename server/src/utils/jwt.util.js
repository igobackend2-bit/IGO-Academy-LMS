/**
 * JWT utilities — sign, verify, hash tokens for IGo Platform
 * @module utils/jwt
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT payload
 * @param {{ id: string, role: string, email: string }} payload
 * @returns {string} signed token
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {{ id: string, role: string, email: string, iat: number, exp: number }}
 * @throws if invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Hash a token string for safe DB storage (sha256)
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a secure random OTP (6 digits)
 * @returns {string}
 */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { signToken, verifyToken, hashToken, generateOtp };
