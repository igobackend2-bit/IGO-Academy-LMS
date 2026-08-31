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

const { testConnection, db } = require('./config/db');
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
const externalCertificateRoutes = require('./routes/externalCertificate.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const enrollmentRequestRoutes = require('./routes/enrollmentRequest.routes');
const resourceRoutes = require('./routes/resource.routes');
const batchRoutes    = require('./routes/batch.routes');
const appLeadsRoutes = require('./routes/appLeads.routes');
const cronRoutes     = require('./routes/cron.routes');
const enquiryRoutes  = require('./routes/enquiry.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Canonical host redirect ──────────────────────────────────
// www and bare domain both resolved with a 200 and no redirect — a
// duplicate-content SEO issue. Canonicalize on the bare domain.
app.use((req, res, next) => {
  if (req.hostname === 'www.igoacademy.in') {
    return res.redirect(301, `https://igoacademy.in${req.originalUrl}`);
  }
  next();
});

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
      scriptSrc:  ["'self'", 'https://checkout.razorpay.com', 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc:     ["'self'", 'data:', 'blob:', SUPABASE_ORIGIN, 'https://*.razorpay.com'].filter(Boolean),
      mediaSrc:   ["'self'", 'blob:', SUPABASE_ORIGIN].filter(Boolean),
      connectSrc: ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com', SUPABASE_ORIGIN].filter(Boolean),
      frameSrc:   ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com', 'https://www.google.com/recaptcha/'],
      objectSrc:  ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  // Razorpay's checkout runs in a same-page overlay but can pop a separate
  // window for some flows (e.g. bank redirects) — this stays harmless to
  // leave on either way.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
// CLIENT_URL is a single canonical URL, but the frontend is reachable at
// both the bare domain and its www subdomain (both resolve with a 200, no
// redirect happening at the DNS/nginx layer that fronts it) -- so both
// must be accepted here or the browser's own CORS check silently blocks
// login/API calls made from whichever variant CLIENT_URL doesn't match.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = new Set([CLIENT_URL]);
try {
  const { protocol, host } = new URL(CLIENT_URL);
  ALLOWED_ORIGINS.add(
    host.startsWith('www.')
      ? `${protocol}//${host.slice(4)}`
      : `${protocol}//www.${host}`
  );
} catch { /* CLIENT_URL not a valid absolute URL — skip the www/bare variant */ }

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = same-origin / curl / server-to-server -- allow.
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
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
    // scripts/prerender.js writes real directories like dist/courses/ — the
    // default trailing-slash redirect for directory-like paths would 301
    // /courses to /courses/ before the SPA route (React Router has no
    // trailing slash) ever gets a chance to render.
    redirect: false,
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
// verify: stash the exact raw bytes on req.rawBody before JSON-parsing —
// the Razorpay webhook signature is computed over the raw payload, and
// re-stringifying a parsed req.body isn't guaranteed to byte-match it
// (key order, spacing) so signature verification needs the original bytes.
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
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
app.use('/api/external-certificates', externalCertificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollment-requests', enrollmentRequestRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/batches',   batchRoutes);
app.use('/api/app-leads', appLeadsRoutes);
app.use('/api/cron',      cronRoutes);
app.use('/api/enquiries', enquiryRoutes);

// ── sitemap.xml ──────────────────────────────────────────────
// Static public routes are fixed; there's no individual course-detail URL
// yet (Catalog.jsx lists courses inline), so course rows only affect the
// `lastmod` on /courses via the newest active course's updated_at.
app.get('/sitemap.xml', async (req, res) => {
  const base = process.env.CLIENT_URL || 'https://igoacademy.in';
  const staticPaths = [
    { path: '/',         priority: '1.0', changefreq: 'weekly' },
    { path: '/courses',  priority: '0.9', changefreq: 'weekly' },
    { path: '/about',    priority: '0.5', changefreq: 'monthly' },
    { path: '/login',    priority: '0.3', changefreq: 'yearly' },
    { path: '/register', priority: '0.3', changefreq: 'yearly' },
    { path: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
  ];

  let coursesLastmod = null;
  try {
    const latest = await db('courses').where({ is_active: true }).max('updated_at as m').first();
    coursesLastmod = latest?.m ? new Date(latest.m).toISOString().split('T')[0] : null;
  } catch (err) {
    logger.error('[Sitemap] Failed to read latest course update:', err.message);
  }

  const urls = staticPaths.map(({ path: p, priority, changefreq }) => {
    const lastmod = p === '/courses' && coursesLastmod ? coursesLastmod : new Date().toISOString().split('T')[0];
    return `  <url>\n    <loc>${base}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

// ── SPA Fallback ─────────────────────────────────────────────
// React Router owns every non-API path, so deep links like /login must return
// index.html rather than 404. API paths fall through to the JSON 404 below.
//
// scripts/prerender.js (run as part of `npm run build`) snapshots public
// marketing routes into client/dist/<route>/index.html with real rendered
// content and per-route meta/schema baked in — crawlers get that instead of
// the generic root shell. express.static above has `index: false` (its
// default directory-index behavior would otherwise shadow /api/* routes
// whose path happens to collide with a dist subfolder), so that snapshot
// has to be served explicitly here, before falling back to the root shell.
if (hasClientBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    // Must revalidate: this shell references the hashed bundles, so a cached
    // copy would pin visitors to an old deploy.
    res.setHeader('Cache-Control', 'no-cache');
    const snapshotPath = path.join(CLIENT_DIST, req.path, 'index.html');
    if (req.path !== '/' && fs.existsSync(snapshotPath)) {
      return res.sendFile(snapshotPath);
    }
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
// On Vercel, the process never "listens" — each invocation just calls the
// exported app as a request handler — and nothing stays alive between
// invocations to fire node-cron's in-memory schedule (see routes/cron.routes.js
// + the Vercel Cron entry in vercel.json for that job's serverless equivalent).
const isServerless = Boolean(process.env.VERCEL);

async function bootstrap() {
  try {
    await testConnection();
    await connectRedis();

    if (isServerless) return;

    startCronJobs();
    app.listen(PORT, () => {
      logger.info(`[Server] IGo Academy API running on port ${PORT} — ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error('[Server] Bootstrap failed:', err.message);
    if (!isServerless) process.exit(1);
  }
}

bootstrap();

module.exports = app; // for testing
