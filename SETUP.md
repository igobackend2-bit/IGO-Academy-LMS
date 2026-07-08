# IGo Academy Platform — Setup Guide

> ✅ **Already set up on this machine (June 2026):** dependencies installed, database
> migrated + seeded, storage buckets created, Redis (Upstash cloud) connected.
> To start the platform, jump straight to **Step 6** (or double-click `RUN-SERVER.bat`
> and `RUN-CLIENT.bat`).

## Prerequisites
- Node.js 20+, npm 10+
- Internet connection (database = Supabase cloud, sessions = Upstash Redis cloud — **no local Redis needed**)
- Git

---

## 1. Install dependencies

Open terminal in `igo-platform/` and run:

```bash
# Install server dependencies (skip puppeteer browser download)
cd server
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Install client dependencies
cd ../client
npm install
```

> Certificate PDFs use Puppeteer. With the Chromium download skipped, it falls back
> to your installed Google Chrome automatically.

---

## 2. Configure environment

The `.env` file is already pre-filled with your Supabase + Upstash credentials.

> **Note:** the database connects through the Supabase **session pooler**
> (`aws-1-ap-south-1.pooler.supabase.com`, user `postgres.kbdbbwsesdmfvkcurjmg`)
> because the direct `db.*.supabase.co` host is IPv6-only and unreachable from most
> home networks. Don't change `DB_HOST`/`DB_USER` back to the direct host.

Only thing to update before going live:
- `SMTP_PASS` → your Gmail App Password (enable 2FA → App Passwords → generate one)

---

## 3. Create Supabase Storage buckets — ✅ DONE

These 3 **private** buckets already exist in the Supabase project:
- `igo-videos`
- `igo-certificates`
- `igo-uploads`

---

## 4. Run database migrations — ✅ DONE

All 10 tables already exist in Supabase. For a fresh database:

```bash
cd server
npm run migrate
```

---

## 5. Seed the admin user — ✅ DONE

```bash
cd server
npm run seed
```

**Admin/trainer/student demo accounts** are created by the seed script.
Credentials are set via the seed script / your local `.env` — see
`server/src/seeds/01_admin_user.js`. Do not commit real credentials here.

> ⚠️ Change these passwords before going live.

---

## 6. Start development servers

Open two terminals (or double-click `RUN-SERVER.bat` + `RUN-CLIENT.bat`):

**Terminal 1 — API Server:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — React Client:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
# (If port 3000 is busy — e.g. Docker uses it — Vite picks 3001/3002. Watch the terminal output.)
```

---

## 7. First login flow

1. Go to `http://localhost:3000` (or the port Vite printed)
2. Login as admin using the credentials set in your seed script/`.env` (see `server/src/seeds/01_admin_user.js`)
3. Create a trainer user → Create a course → Add modules → **Upload Video** per module → Publish → Enroll a student
4. Student logs in → watches video → takes quiz → earns certificate (auto-generated PDF with QR verification)

> 🔐 Only one active session per account — logging in from a second place logs out
> the first (anti credential-sharing, by design). Login attempts are rate-limited to
> 20 per 15 minutes.

---

## Architecture — What's Built

| Layer | Tech | Status |
|---|---|---|
| Database | Supabase PostgreSQL | ✅ Ready |
| Auth | JWT + Redis sessions | ✅ Built |
| Admin Panel | React + Tailwind | ✅ Built |
| Video Storage | Supabase Storage | ✅ Built |
| Video Player | Custom React (IGo branded) | ✅ Built |
| Student Dashboard | React | ✅ Built |
| Attendance Tracking | Auto (tab-switch detection) | ✅ Built |
| Quiz/Assessment | MCQ auto-grading | ✅ Built |
| Assignment Grading | Trainer review panel | ✅ Built |
| Certificate PDF | Puppeteer + QR code | ✅ Built |
| Email (OTP/Welcome/Cert) | Nodemailer SMTP | ✅ Built |
| Cron (expiry checker) | node-cron daily | ✅ Built |

## Phase 2 (Next: Months 4–6)
- Live classes (WebRTC + MediaSoup)
- Live attendance automation (Socket.io)
- Enhanced certificate design

## Phase 3 (Months 7–9)
- React Native mobile app (Android + iOS)

---

*IGo Academy | Chennai, Tamil Nadu | TNSDC + MSME Recognised*
*© 2026 — Grow. Learn. Lead.*
