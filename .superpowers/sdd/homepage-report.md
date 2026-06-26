# Homepage Implementation Report

**Branch:** feature/public-homepage
**Commit:** 6afca58
**Date:** 2026-06-26

## Status: DONE

## What was built

### Files created
- `client/src/components/layout/PublicNav.jsx` — sticky 64px nav bar shared across public pages; auth-aware (shows My Dashboard / Admin Panel for logged-in users, Sign In + Get Started for guests); center links hidden on mobile via inline `@media` style
- `client/src/pages/public/HomePage.jsx` — full landing page: hero with Ken Burns background + dark overlay, badge pill, H1, subtitle, CTA buttons, 4-stat row; category cards grid; featured courses (fetched from `/courses/public`, shimmer skeletons while loading); Why IGO 3-card section; CTA banner; footer with two-col layout and bottom bar

### Files modified
- `client/src/App.jsx` — root route changed from `<Navigate to="/courses">` to `<HomePage />`; HomePage import added
- `client/src/pages/public/Catalog.jsx` — inline `NavBar` component replaced with `<PublicNav />`; FilterBar `top` offset corrected from 57px to 64px to match new nav height
- `client/src/services/api.js` — added `'/'` and `'/courses'` to `PUBLIC_PATHS` so 401 responses on public API calls (e.g. `/courses/public`) do not trigger a redirect to `/login`

## Key fix discovered during verification

The 401-redirect interceptor in `api.js` was sending any unauthenticated visitor on `/` to `/login` because `/` was not in `PUBLIC_PATHS`. This was not a bug in the new code — it was a pre-existing gap in the interceptor. Fixed by adding `'/'` and `'/courses'` to the allowlist.

## Verification results

- `http://localhost:3000/` renders HomePage with hero, category cards, skeleton loaders for courses, Why section, CTA banner, footer — all correct
- `http://localhost:3000/courses` renders Catalog with shared PublicNav replacing the old inline nav
- Clicking "IGO Academy" in nav from `/courses` navigates back to `/`
- Center nav links hidden correctly on narrow viewport
- No console errors
