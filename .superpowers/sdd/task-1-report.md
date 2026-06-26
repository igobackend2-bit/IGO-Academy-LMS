# Task 1 Report — Student Self-Registration

**Status:** DONE
**Commit:** 2a00e26
**Branch:** feature/saas-phase2
**Date:** 2026-06-26

## What was implemented

### Backend

**`server/src/controllers/auth.controller.js`** — added `register` function:
- Accepts `{ full_name, email, phone, password }`
- Checks email uniqueness via `UserModel.findByEmail` → throws `CONFLICT` (409) if exists
- Hashes password with `bcrypt.hash(password, 12)` (same salt rounds as login)
- Inserts via `UserModel.create` with `role='student'`, `is_active=true`
- Creates Redis session key (`session:<id>`) with same inactivity TTL as login
- Sets `igo_token` httpOnly cookie (7 days, same config as login)
- Returns `{ success: true, data: { id, full_name, email, role: 'student' }, error: null, message: 'Account created' }` with HTTP 201

**`server/src/routes/auth.routes.js`** — added:
- `registerRules` validator array: `full_name` notEmpty+min2, `email` isEmail+normalizeEmail, `phone` notEmpty, `password` min8
- `POST /register` route wired to `authCtrl.register` with `validateRequest` middleware

### Frontend

**`client/src/pages/auth/RegisterPage.jsx`** — new file:
- Identical Ken Burns agricultural background (LandscapePanel component, same particle canvas, god rays, mist, foreground wheat stalks)
- Same glassmorphism card (`lp-form-card`) and `.lp-card-container` layout as LoginPage
- Form fields: Full Name, Email, Phone Number, Password (with eye toggle), Confirm Password (with eye toggle)
- Client-side validation: all fields required, passwords must match, min 8 chars
- On success: `toast.success(...)` + `navigate('/student/dashboard')`
- On CONFLICT error: inline error "An account with that email already exists. Try signing in."
- On other errors: inline error + `toast.error(message)`
- "Already have an account? Sign in" link → `/login`
- Uses `api.post('/auth/register', ...)` from `@/services/api`
- Card container has `overflow-y: auto` to handle the taller 5-field form on small screens

**`client/src/App.jsx`** — added:
- `import RegisterPage from '@/pages/auth/RegisterPage'`
- `<Route path="/register" element={<RegisterPage />} />` in public section (after `/login`)

**`client/src/services/api.js`** — added `/register` to `PUBLIC_PATHS` to prevent spurious 401→redirect loops when the register API call itself returns an error.

## Browser verification

Navigated to `/register` in the running preview server (port 3000). Page renders with:
- Ken Burns background visible (green field sunrise)
- Glassmorphism card with all 5 fields (Full Name, Email, Phone, Password, Confirm Password)
- Eye toggle visible on Confirm Password field
- "Create Account" primary green button
- "Already have an account? Sign in" link
- TNSDC · MSME RECOGNISED footer

## Concerns / notes

- **Login enrollment gate**: The existing `login` function blocks students who have no active enrollment. Newly registered students will have zero enrollments, so they will be able to register and receive a cookie — but if they log out and try to log back in, they will hit "Your course access has ended." This is a product decision (not a bug introduced here). The register flow bypasses that check intentionally, matching the spec. Consider whether newly registered students should receive a free trial enrollment on signup, or whether the login gate should be relaxed for students pending enrollment.
- No new npm packages were installed. All dependencies (bcryptjs, express-validator) were already present.
- Admin pages were not touched.
- Student page stubs were not touched.
