/**
 * IGo Academy Platform — Express API Server Entry Point
 * @module index
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { errorHandler } = require('./middleware/errorHandler');
const { startCronJobs } = require('./jobs/index');
const logger = require('./utils/logger');

// ── Route imports ────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const classModuleRoutes = require('./routes/classModule.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const certificateRoutes = require('./routes/certificate.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate Limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded', data: null },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Too many login attempts', data: null },
});
app.use(globalLimiter);

// ── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ── HTTP Logging ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', version: '1.0.0', org: 'IGo Academy' }, error: null, message: 'Server is running' });
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/modules', classModuleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ── Boot ─────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await testConnection();
    await connectRedis();
    startCronJobs();

    app.listen(PORT, () => {
      logger.info(`[Server] IGo Academy API running on port ${PORT} — ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error('[Server] Bootstrap failed:', err.message);
    process.exit(1);
  }
}

bootstrap();

module.exports = app; // for testing
