# IGO Academy LMS — SaaS Phase 2 Plan

**Date:** 2026-06-26
**Branch:** feature/saas-phase2
**Status:** Executing

## Context

IGO Academy is a public-facing agri-entrepreneurship LMS (like Alison.com) serving college students, entrepreneurs, and rural learners. The admin panel and all student-facing pages/routes already exist. The student portal stubs are production-quality.

Three SaaS capabilities are genuinely missing that prevent public operation:
1. No student self-registration (admin must manually create every account)
2. No public course catalog (visitors cannot browse courses without logging in)
3. No payment integration (paid courses cannot be purchased online)

## Global Constraints

- NO new npm packages without explicit justification (existing: react, tailwindcss, express, knex, dayjs, react-query, react-hot-toast, express-validator, @supabase/supabase-js)
- All DB tables in `igo_lms` schema (Knex `searchPath` already set via `DB_SCHEMA` env)
- NO changes to existing admin panel pages (admin pages are working — do not touch them)
- NO changes to existing student stubs (Dashboard, CourseView, ModulePlayer, QuizView, Certificates, VerifyCertificate are complete — do not modify)
- Auth: JWT in httpOnly cookie `igo_token`, same pattern as existing `login` endpoint
- Database: additive only — no alter/drop of existing columns
- `public` Supabase schema is off-limits — do not read or write to it
- Existing API pattern: `{ success, data, error, message }` envelope for all responses
- Backend server: Node.js + Express on port 5000 (`server/src/`)
- Frontend: React 18 + Vite + Tailwind on port 3000 (`client/src/`)

## Architecture Reference

- Auth: `server/src/routes/auth.routes.js` → `server/src/controllers/auth.controller.js`
- DB access: `const { db } = require('../config/db')` (Knex instance with igo_lms searchPath)
- Password hashing: bcryptjs (already installed — see auth.controller.js)
- Frontend API: `@/services/api` (axios instance, baseURL `/api`, withCredentials: true)
- AuthContext: `@/context/AuthContext` — `useAuth()` gives `{ user, login, logout }`
- CSS: `client/src/index.css` has full design system (`.igo-card`, `.btn-primary`, `.igo-input`, `.badge-green`, `.page-enter`, `.card-enter`, `--wheat-gold`, etc.)
- Login page already has Ken Burns + particle background at `client/src/pages/auth/LoginPage.jsx`

---

## Task 1 — Student Self-Registration

**Files to create/modify:**
- `server/src/routes/auth.routes.js` — add `POST /register` route
- `server/src/controllers/auth.controller.js` — add `register` method
- `client/src/pages/auth/RegisterPage.jsx` — new file: registration form page
- `client/src/App.jsx` — add `/register` public route

**Backend spec:**

`POST /api/auth/register`
- Body: `{ full_name, email, phone, password }`
- Validation (express-validator):
  - `full_name`: notEmpty, trim, isLength min 2
  - `email`: isEmail, normalizeEmail
  - `phone`: notEmpty (optional format check — 10 digits)
  - `password`: isLength min 8
- Logic:
  1. Check if email already exists in `users` table → 409 if yes
  2. bcrypt.hash(password, 12)
  3. INSERT into `users` (full_name, email, phone, password_hash, role='student', is_active=true)
  4. Return same JWT cookie as login (set `igo_token` httpOnly cookie)
  5. Response: `{ success: true, data: { id, full_name, email, role: 'student' }, message: 'Account created' }`

**Frontend spec:**

`/register` page — mirror the login page visual style (same Ken Burns bg, same glassmorphism card):
- Form fields: Full Name, Email, Phone, Password, Confirm Password
- Link to `/login` ("Already have an account? Sign in")
- On success: navigate to `/student/dashboard`
- Show toast on error (duplicate email, validation fail)
- Add `import RegisterPage from '@/pages/auth/RegisterPage'` + `<Route path="/register" element={<RegisterPage />} />` in App.jsx (in the public section, before the student routes)

---

## Task 2 — Public Course Catalog Page

**Files to create/modify:**
- `client/src/pages/public/Catalog.jsx` — new file: public catalog page
- `client/src/App.jsx` — add `/courses` public route
- `server/src/routes/course.routes.js` — verify `GET /courses` works without auth (add public access if needed)

**Backend spec:**

Check if `GET /api/courses` requires auth. If it does (has `verifyToken` middleware), add a separate public route:
- `GET /api/courses/public` — no auth required
- Returns all courses where `is_published = true`
- Fields: `id, title, short_description, category, level, price, rating, duration_hours, trainer_name`
- Sort: newest first (by created_at)

If `GET /api/courses` already works without auth → no backend change needed, just use that endpoint.

**Frontend spec:**

`/courses` public page:
- Accessible without login
- Top bar: IGO Academy logo + "Sign In" + "Get Started" buttons (nav)
- Hero section: "Learn Agri-Entrepreneurship Online" with brief description
- Filter bar: Category (All / Horticulture / Aquaculture / Agri-Biz / Tech) + Level (All / Beginner / Intermediate / Advanced)
- Course grid: cards showing:
  - Category badge (color-coded)
  - Level badge
  - Course title
  - Short description (2 lines)
  - Duration (Xh) + Module count
  - Price (₹X,XXX or "Free")
  - "Enroll Now" button → if logged in as student: redirect to `/student/dashboard`; if not logged in: redirect to `/register`
- Empty state: friendly "No courses found" with reset filters button
- Footer: IGO Academy © 2026 | TNSDC + MSME Recognised
- Use `.page-enter` on outer div, `.card-enter` on each card with nth-child delay
- Use existing CSS variables: `--wheat-gold`, `--leaf-fresh`, `--sky-dawn`, etc.

Add route to `App.jsx` public section: `<Route path="/courses" element={<Catalog />} />`
Also update the root redirect: `<Route path="/" element={<Navigate to="/courses" replace />}` (instead of `/login` — public catalog is the entry point for a SaaS platform)

---

## Task 3 — Razorpay Payment Integration

**Files to create/modify:**
- `server/src/routes/payment.routes.js` — new file
- `server/src/index.js` — register payment routes
- `client/src/components/features/PaymentModal.jsx` — new file: checkout modal
- `client/src/pages/public/Catalog.jsx` — import PaymentModal, wire "Enroll Now" for paid courses

**Environment variables needed (add to .env.example):**
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

**Package:** `razorpay` npm package — this IS an allowed exception (payment processing cannot be done without the official SDK)

**Backend spec:**

`POST /api/payments/create-order` (requires auth: student role)
- Body: `{ course_id }`
- Logic:
  1. Fetch course, check `price > 0`
  2. Check student not already enrolled
  3. Create Razorpay order: `razorpay.orders.create({ amount: price*100, currency: 'INR', receipt: courseId })`
  4. Return: `{ orderId, amount, currency, keyId: RAZORPAY_KEY_ID, courseName, studentName, studentEmail }`

`POST /api/payments/webhook` (public — no auth, but verify Razorpay signature)
- Body: Razorpay webhook payload
- Headers: `x-razorpay-signature`
- Logic:
  1. Verify HMAC SHA256 signature using `RAZORPAY_KEY_SECRET`
  2. On `payment.captured` event: extract `course_id` from order notes
  3. INSERT into `enrollments` (student_id, course_id, start_date=today, end_date=+1year, payment_status='paid')
  4. Return 200 OK

**Frontend spec:**

`PaymentModal.jsx` component:
- Props: `{ course, isOpen, onClose, onSuccess }`
- Shows: course name, price, student name/email (from useAuth)
- "Pay ₹X,XXX" button → loads Razorpay checkout script dynamically
- On payment success: POST to `/api/payments/verify` to confirm, then call `onSuccess()`
- On `onSuccess`: show toast "Enrolled! Go to dashboard" + navigate to `/student/dashboard`
- Graceful degradation: if Razorpay script fails to load, show "Contact us to enroll: info@igoacademy.in"

Wire into Catalog.jsx:
- "Enroll Now" for paid courses → open PaymentModal
- "Enroll Now" for free courses → POST `/api/enrollments` directly (student self-enroll endpoint)
- Free enrollment endpoint: `POST /api/enrollments/self` (create this if it doesn't exist)

---

## Task 4 — Free Course Self-Enrollment API

**Files to create/modify:**
- `server/src/routes/enrollment.routes.js` — add `POST /self` endpoint

**Spec:**

`POST /api/enrollments/self` (requires auth: student role)
- Body: `{ course_id }`
- Logic:
  1. Fetch course — verify `price = 0` (or price is null/undefined)
  2. Check student not already enrolled
  3. INSERT into `enrollments` (student_id=req.user.id, course_id, start_date=today, end_date=today+365days, payment_status='free')
  4. Return: `{ success: true, data: enrollment, message: 'Enrolled successfully' }`
- Error cases: already enrolled (409), course not free (403), course not found (404)

---

## Execution Order

Tasks 1 and 4 are independent — dispatch in sequence.
Task 2 depends on Task 4's endpoint (for free enrollment in catalog).
Task 3 depends on Task 2 (wires PaymentModal into Catalog).

Execute: Task 1 → Task 4 → Task 2 → Task 3
