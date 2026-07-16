/**
 * IGo Academy Platform — Express API Server Entry Point
 * @module index
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const path = require('path');
const fs = require('fs');
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
const enrollmentRequestRoutes = require('./routes/enrollmentRequest.routes');
const resourceRoutes = require('./routes/resource.routes');
const batchRoutes    = require('./routes/batch.routes');
const appLeadsRoutes = require('./routes/appLeads.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ──────────────────────────────────────
// This process serves the built SPA as well as the API, so the CSP has to
// admit the origins the frontend actually loads from: Google Fonts, the
// Razorpay checkout widget, and Supabase Storage (video/PDF signed URLs).
// helmet's `default-src 'self'` default would block all three.
const SUPABASE_ORIGIN = process.env.SUPABASE_URL || '';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", 'https://checkout.razorpay.com'],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc:     ["'self'", 'data:', 'blob:', SUPABASE_ORIGIN].filter(Boolean),
      mediaSrc:   ["'self'", 'blob:', SUPABASE_ORIGIN].filter(Boolean),
      connectSrc: ["'self'", 'https://checkout.razorpay.com', SUPABASE_ORIGIN].filter(Boolean),
      frameSrc:   ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
      objectSrc:  ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  // Razorpay's checkout opens a cross-origin window that needs window.opener.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Static SPA assets ────────────────────────────────────────
// Mounted ahead of the rate limiter: one page load pulls down many hashed
// assets, and those must not burn through a visitor's API request budget.
const CLIENT_DIST = path.join(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(path.join(CLIENT_DIST, 'index.html'));
if (hasClientBuild) {
  app.use(express.static(CLIENT_DIST, {
    index: false,
    setHeaders: (res, filePath) => {
      // Asset filenames are content-hashed by Vite, so they can be cached hard.
      // index.html is not, and must be revalidated or clients pin to a stale build.
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));
}

// ── Rate Limiting ────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 500,
  skip: () => isDev,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded', data: null },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 20,
  skip: () => isDev,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Too many login attempts. Please wait a few minutes.', data: null },
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
app.use('/api/enrollment-requests', enrollmentRequestRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/batches',   batchRoutes);
app.use('/api/app-leads', appLeadsRoutes);

// ── SPA Fallback ─────────────────────────────────────────────
// React Router owns every non-API path, so deep links like /login must return
// index.html rather than 404. API paths fall through to the JSON 404 below.
if (hasClientBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    // Must revalidate: this shell references the hashed bundles, so a cached
    // copy would pin visitors to an old deploy.
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

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
