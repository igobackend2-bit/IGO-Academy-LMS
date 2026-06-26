# Task 3 Report — Razorpay Payment Integration

**Status:** DONE
**Date:** 2026-06-26
**Branch:** feature/saas-phase2

## Summary

Razorpay payment integration for paid course enrollment implemented end-to-end.

## Files Created / Modified

### New Files
- `server/src/routes/payment.routes.js` — two endpoints: `POST /create-order` and `POST /verify`
- `client/src/components/features/PaymentModal.jsx` — checkout modal with dynamic Razorpay SDK loading

### Modified Files
- `server/src/index.js` — registered `paymentRoutes` at `/api/payments`
- `client/src/pages/public/Catalog.jsx` — imported PaymentModal, added `payingCourse` state, updated `handleEnroll` to open modal for paid courses, rendered `<PaymentModal>` at bottom
- `.env.example` — added `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` placeholder vars

## Backend Flow

1. Student clicks "Enroll Now" on a paid course → PaymentModal opens
2. Student clicks "Pay ₹X" → frontend POSTs to `/api/payments/create-order`
3. Backend validates: course exists, price > 0, student not already enrolled
4. Backend creates Razorpay order (amount in paise) and returns orderId + keyId
5. Frontend opens Razorpay checkout popup (SDK loaded lazily)
6. On payment success, Razorpay calls `handler` callback with signature fields
7. Frontend POSTs to `/api/payments/verify` with signature + course_id
8. Backend verifies HMAC SHA256 signature, then INSERTs enrollment row (payment_status='paid', 1-year access)
9. Toast success + navigate to /student/dashboard

## Security Notes

- HMAC SHA256 verification on every payment — no trust placed in frontend-only signals
- Guard against double-enrollment (idempotent verify: returns existing enrollment if already enrolled)
- All routes require `verifyToken` + `requireRole('student')` — no unauthenticated access
- Key secret never exposed to frontend (only key_id is returned to client)

## Dependency

- `razorpay` npm package installed in `server/` (only new package added — per spec)
- Frontend uses CDN script (`checkout.razorpay.com`) loaded dynamically at payment time

---

## Code Review Fix Report — 2026-06-26

**Commit:** `92a6cb7`
**Branch:** `feature/saas-phase2`

### Fixes Applied

- **CRITICAL-1 (server-side course_id):** Removed `course_id` from `req.body` destructuring in `/verify`. After HMAC passes, calls `razorpay.orders.fetch(razorpay_order_id)` and reads `order.notes.course_id`. A student can no longer swap course_id in the verify body to enroll in a different course.

- **CRITICAL-2 (timing-safe HMAC):** Replaced `expectedSig !== razorpay_signature` with `!crypto.timingSafeEqual(Buffer.from(expectedSig, 'hex'), Buffer.from(razorpay_signature, 'hex'))` to prevent timing side-channel attacks on signature comparison.

- **IMPORTANT-1 (migration):** Created `server/src/migrations/20260626000001_add_payment_status_to_enrollments.js` — adds `payment_status VARCHAR(20) NOT NULL DEFAULT 'free'` column to `enrollments` table so the insert in `/verify` no longer references a missing column.

- **IMPORTANT-2 (full_name DB lookup):** In `/create-order`, added `db('users').where({ id: req.user.id }).select('full_name', 'email').first()` after the course fetch. Razorpay prefill now uses `student?.full_name` instead of the undefined `req.user.full_name` (JWT payload only carries `{ id, role, email }`).

- **IMPORTANT-3 (error message mismatch):** In `Catalog.jsx` `enrollMutation.onError`, changed `msg === 'Already enrolled'` to `e.response?.data?.error === 'CONFLICT' || msg.includes('Already enrolled')` so the already-enrolled redirect fires correctly when the backend returns the actual message `'Already enrolled in this course'`.

- **MINOR-2 (wrong error code):** In `/create-order`, changed `throw createError('UNAUTHORIZED', 'Already enrolled in this course')` to `throw createError('CONFLICT', ...)` — semantically correct HTTP 409 vs 401, and now consistent with the IMPORTANT-3 frontend check.
