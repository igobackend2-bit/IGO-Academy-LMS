# Task 2 Report — Public Course Catalog

**Status:** DONE  
**Commit:** ee5b133  
**Branch:** feature/saas-phase2  
**Date:** 2026-06-26

## Summary

1. Added `GET /api/courses/public` as a pre-auth route in `course.routes.js` (placed before `router.use(verifyToken)`) so it is accessible without a JWT cookie. The new `listPublic()` model method returns only `is_active = true` courses with `id, title, short_description, category, level, price, rating, duration_hours, trainer_name, modules_count` (modules_count computed via LEFT JOIN on `class_modules`).

2. Created `client/src/pages/public/Catalog.jsx` — a full-page public catalog with sticky navbar (logo + Sign In + Get Started), hero gradient section with stat pills, sticky category/level filter bar, CSS-grid course cards with hover lift, and a footer. Data is fetched via `useQuery` from `/api/courses/public`. Filtering is client-side. Enrollment CTA routes unauthenticated visitors to `/register`; logged-in students on free courses call `POST /enrollments/self` via `useMutation`.

3. Updated `client/src/App.jsx`: added `<Route path="/courses" element={<Catalog />} />` and changed root redirect from `/login` to `/courses`, making the public catalog the SaaS entry point.

## Files Changed

- `server/src/routes/course.routes.js` — added public `/public` route before verifyToken guard
- `server/src/controllers/course.controller.js` — added `listPublic` handler
- `server/src/models/course.model.js` — added `listPublic()` with module count subquery
- `client/src/pages/public/Catalog.jsx` — new file (public catalog page)
- `client/src/App.jsx` — added `/courses` route + updated root redirect
