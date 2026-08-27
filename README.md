
## Local development

Prerequisites: Node.js 20+, npm 10+, Git, and an internet connection (database is Supabase cloud, sessions are Upstash Redis cloud — no local Postgres/Redis required).

```bash
# Server
cd server
PUPPETEER_SKIP_DOWNLOAD=true npm install   # certificate PDFs fall back to local Chrome
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
npm run migrate            # apply Knex migrations
npm run migrate:rollback   # roll back
npm run seed                # create admin/trainer/student demo accounts — see server/src/seeds/01_admin_user.js
```

### First login flow

Login as admin (credentials come from the seed script/`.env` — never commit real ones) → create a trainer → create a course → add modules → upload video per module → publish → enroll a student → student watches, takes the quiz, and earns a certificate.

Note: only one active session per account is allowed (logging in elsewhere logs out the first session, by design), and login is rate-limited to 20 attempts per 15 minutes.

## Building & testing

```bash
npm run build          # full production build: installs deps, builds client, prerenders
npm run build:client   # client build only
cd server && npm test  # Jest + Supertest, against a real Postgres/Redis (see CI below)
```

## Deployment

Two deployment paths exist in this repo:

1. **Vercel (root `vercel.json`)** — client built to `client/dist`, API served as a Vercel serverless function via `api/index.js` (which wraps the Express app), plus a daily cron hitting `/api/cron/enrollment-expiry`.
2. **Self-hosted / EC2 (`infra/`)** — `infra/github-actions/deploy.yml` runs tests against ephemeral Postgres + Redis containers on every push/PR to `main`, then on `main` pushes SSHes into a staging EC2 box, pulls, migrates, and restarts the API under `pm2`, then rebuilds the client. `infra/nginx/igo-platform.conf` is the reference nginx config for that box: TLS termination, `/api` and `/socket.io` reverse-proxied to the Node server on `:5000`, the React build served with SPA fallback, and API rate limiting.

Two separate Dockerfiles also exist: the root `Dockerfile` builds only the client and serves it via `nginx:alpine`; `server/Dockerfile` is Debian-based (not Alpine) because Puppeteer's bundled Chromium needs glibc, and runs the API on port 5000.

## Roadmap

Per `SETUP.md`: Phase 2 (live classes via WebRTC/MediaSoup, real-time attendance over Socket.io, enhanced certificate design) and Phase 3 (shipping the mobile app for Android/iOS) are planned next; the `mobile/` app is currently just the Flutter starter scaffold with dependencies wired up (Riverpod, go_router, Supabase, Firebase) but no built features yet.
