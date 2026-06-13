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

  if (statusCode === 500) {
    logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: errorCode,
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = { errorHandler, createError, ERROR_CODES };
