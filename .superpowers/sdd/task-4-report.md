# Task 4 Report — Free Course Self-Enrollment API

**Status:** DONE
**Commit:** 02c132f
**Branch:** feature/saas-phase2
**Date:** 2026-06-26

## What was implemented

Added `POST /api/enrollments/self` endpoint for student self-enrollment in free courses.

### Files modified

1. `server/src/controllers/enrollment.controller.js`
   - Added `selfEnroll` async function
   - Exported it alongside existing functions

2. `server/src/routes/enrollment.routes.js`
   - Added `router.post('/self', requireRole('student'), enrollCtrl.selfEnroll)` before the admin `POST /` route

## Endpoint behaviour

`POST /api/enrollments/self`
- Auth: `verifyToken` (global on router) + `requireRole('student')`
- Body: `{ course_id }`
- Returns: `{ success, data, error, message }` envelope

### Logic
1. Validates `course_id` present — 400 if missing
2. Fetches course from `courses` table — 404 if not found
3. Checks `price = 0 or null` — 403 "Course requires payment" if `price > 0`
4. Checks student not already enrolled — 409 "Already enrolled in this course" if exists
5. INSERTs into `enrollments`:
   - `student_id`: `req.user.id`
   - `course_id`: from body
   - `start_date`: today (YYYY-MM-DD)
   - `end_date`: today + 365 days (YYYY-MM-DD)
   - `payment_status`: `'free'`
   - `is_expired`: `false`
6. Returns 201 with `{ success: true, data: enrollment, error: null, message: 'Enrolled successfully' }`

## Notes

- Route is registered before `POST /` (admin create) to avoid Express routing conflicts
- Date formatting uses native `Date` — no new packages required
- DB pattern follows existing controller style: `const { db } = require('../config/db')` (Knex with igo_lms searchPath)
- All error responses follow the `{ success, data, error, message }` envelope
