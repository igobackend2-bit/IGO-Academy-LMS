
## Local development

Prerequisites: Node.js 20+, npm 10+, Git, and an internet connection (database is Supabase cloud, sessions are Upstash Redis cloud — no local Postgres/Redis required).

```bash
cd server
PUPPETEER_SKIP_DOWNLOAD=true npm install
cd ../client
npm install
```

Copy/create `.env` in `server/` (see `SETUP.md` for the full variable list — Supabase, Upstash, SMTP, Cashfree, JWT secret, etc.). The DB connects through Supabase's **session pooler**, not the direct host, because the direct host is IPv6-only.

From the repo root, `npm run dev` starts both API and client together (via `concurrently`); or run them separately:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:3000 (Vite bumps the port if busy)
```

Windows shortcuts: double-click `RUN-SERVER.bat` / `RUN-CLIENT.bat`, or `START-PLATFORM.bat` for both.

### Database

```bash
npm run migrate
npm run migrate:rollback
npm run seed
```

### First login flow

Login as admin (credentials come from the seed script/`.env` — never commit real ones) → create a trainer → create a course → add modules → upload video per module → publish → enroll a student → student watches, takes the quiz, and earns a certificate.

Only one active session per account is allowed, and login is rate-limited to 20 attempts per 15 minutes.

## Building & testing

```bash
npm run build
npm run build:client
cd server && npm test
```

## Deployment

1. **Vercel (root `vercel.json`)** — client built to `client/dist`, API served as a Vercel serverless function via `api/index.js`, plus a daily cron hitting `/api/cron/enrollment-expiry`.
2. **Self-hosted / EC2 (`infra/`)** — `infra/github-actions/deploy.yml` tests against Postgres + Redis containers, then SSHes into staging on `main` pushes, migrates, and restarts under `pm2`. `infra/nginx/igo-platform.conf` handles TLS, `/api` and `/socket.io` proxying, SPA fallback, and rate limiting.

Two Dockerfiles exist: root `Dockerfile` builds only the client via `nginx:alpine`; `server/Dockerfile` is Debian-based (Puppeteer needs glibc) and runs the API on port 5000.

## Roadmap

Phase 2: live classes (WebRTC/MediaSoup), real-time attendance (Socket.io), enhanced certificates. Phase 3: mobile app for Android/iOS — `mobile/` is currently just the Flutter scaffold, no built features yet.
