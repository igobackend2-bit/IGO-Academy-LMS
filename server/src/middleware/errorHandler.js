/**
 * Global error handler middleware for IGo Academy API
 * Catches all unhandled errors and returns standardised response
 * @module middleware/errorHandler
 */
const logger = require('../utils/logger');

// ── Standard error codes used across the platform ────────────
const ERROR_CODES = {
  INVALID_CREDENTIALS: 401,
  COURSE_EXPIRED: 403,
  NOT_ENROLLED: 403,
  SESSION_EXPIRED: 401,
  UNAUTHORIZED: 403,
  INVALID_INPUT: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
};

/**
 * Creates a standardised API error
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} message - Human-readable message
 * @returns {Error}
 */
function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  err.statusCode = ERROR_CODES[code] || 500;
  return err;
}

/**
 * Express global error handling middleware
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'SERVER_ERROR';
  // err.code being one of ours (set by createError above) means this is a
  // deliberately-written, safe-to-show message. Anything else reaching here
  // 500'd from somewhere we didn't wrap -- a raw driver/network error like
  // "read ECONNRESET" -- and must never reach the client as-is: it's
  // meaningless to a user and can leak internals. Log the real one, show a
  // generic one.
  const isOurError = errorCode in ERROR_CODES;

  if (!isOurError || statusCode === 500) {
    logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: isOurError ? errorCode : 'SERVER_ERROR',
    message: isOurError ? (err.message || 'An unexpected error occurred') : 'Something went wrong — please try again.',
  });
}

module.exports = { errorHandler, createError, ERROR_CODES };
