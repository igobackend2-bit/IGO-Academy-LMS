server/          Node/Express API — see server/src/
├── config/       DB (Knex), env, third-party client setup
├── controllers/  Route handlers
├── routes/       auth, user, course, batch, classModule, enrollment,
│                 enrollmentRequest, assessment, attendance, certificate,
│                 resource, payment, admin, appLeads, enquiry, cron
├── models/       course, user, enrollment, assessment
├── middleware/    Auth/rate-limit/validation middleware
├── migrations/    Knex migrations (10 tables)
├── seeds/         Admin/demo user seed scripts
├── services/       Business logic (email, certificates, payments, etc.)
├── jobs/            node-cron jobs
└── scripts/          One-off/db-init scripts

client/          React web app (Vite)
├── src/pages/
│   ├── public/    Marketing/enrollment-facing pages
│   ├── auth/       Login/register/OTP flows
│   ├── admin/       Admin panel
│   ├── trainer/     Trainer dashboard — courses, modules, grading
│   └── student/     Student dashboard — video player, quizzes, certificates
├── src/components/  features/, common/, layout/
├── src/context/, hooks/, services/, constants/
└── vercel.json      SPA rewrite for standalone Vercel deploys of the client only

mobile/          Flutter app (early scaffold — see mobile/README.md)

api/index.js     Vercel serverless entry point (wraps the Express app)
infra/
├── github-actions/deploy.yml   CI: test → staging deploy over SSH (EC2 + pm2)
└── nginx/igo-platform.conf     Reference VPS nginx config: TLS, /api reverse
                                  proxy to the Node server, /socket.io proxy,
                                  SPA fallback for the React build, rate limiting

Dockerfile        Builds client/dist and serves it via nginx (frontend-only image)
server/Dockerfile Debian-based (Puppeteer/Chromium needs glibc) — runs the API
nginx.conf        Used by the root Dockerfile — plain SPA fallback
vercel.json        Root-level Vercel config: client build + serverless api/, cron
docs/superpowers/  Internal planning docs (plans/, specs/)
igo-migration.sql, migrate-and-seed.js   One-off data migration/seed helpers
