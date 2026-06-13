/**
 * verifyToken middleware — validates JWT and checks Redis session
 * Rejects if: token missing, invalid, expired, or session killed by admin
 * @module middleware/verifyToken
 */
const { verifyToken: verify, hashToken } = require('../utils/jwt.util');
const { redisClient } = require('../config/redis');
const { createError } = require('./errorHandler');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function verifyTokenMiddleware(req, res, next) {
  try {
    // Read token from httpOnly cookie OR Authorization header
    const token =
      req.cookies?.igo_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) throw createError('SESSION_EXPIRED', 'No session token provided');

    // Verify JWT signature + expiry
    const decoded = verify(token);

    // Check Redis — ensure this session hasn't been killed
    const sessionKey = `session:${decoded.id}`;
    const storedHash = await redisClient.get(sessionKey);
    const tokenHash  = hashToken(token);

    if (!storedHash || storedHash !== tokenHash) {
      throw createError('SESSION_EXPIRED', 'Session expired or logged in from another device');
    }

    // Attach decoded user to request
    req.user = decoded;

    // Refresh session inactivity timer
    const inactivitySecs = (parseInt(process.env.SESSION_INACTIVITY_MINUTES, 10) || 30) * 60;
    await redisClient.expire(sessionKey, inactivitySecs);

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError('SESSION_EXPIRED', 'Session has expired — please log in again'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(createError('UNAUTHORIZED', 'Invalid token'));
    }
    next(err);
  }
}

module.exports = verifyTokenMiddleware;
