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
