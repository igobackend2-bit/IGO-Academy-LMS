# IGO Content Foundation — Design Spec

**Date:** 2026-06-25
**Status:** Approved — building
**Scope:** Sub-project A of the IGO Academy LMS

---

## Goal

Populate the admin panel with a real, IGO-branded catalog of 6 agri programs so every admin screen shows live data from day one.

---

## 1. Database — Additive Migration

New migration `20260625000001_add_igo_catalog_fields_to_courses.js` adds nullable columns to the `igo_lms.courses` table. No existing columns changed or removed.

| Column | Type | Purpose |
|---|---|---|
| `category` | varchar(50) | Horticulture / Aquaculture / Agri-Biz / Tech |
| `level` | varchar(20) | beginner / intermediate / advanced |
| `prerequisites` | text | Free-text prereq summary |
| `price` | decimal(10,2) | Course fee in ₹ (0 = free) |
| `rating` | decimal(3,2) | 0.00–5.00, seeded manually |
| `short_description` | varchar(500) | One-line tagline for course cards |

---

## 2. Backend

- `course.controller.js` create/update destructures the 6 new fields and passes them to the model
- `course.model.js` already selects `c.*` so new columns flow through with zero changes

---

## 3. Admin UI

**Courses list (`Courses.jsx`):**
- Course cards show `category` + `level` badges and `short_description` tagline
- Create-course modal adds fields for all 6 new columns (category dropdown, level dropdown, price, short_description; prerequisites and rating optional)

**Course detail (`CourseEdit.jsx`):**
- Adds "Course Info" edit section at top (renders current metadata, Save button → PUT /api/courses/:id)
- Module management panel unchanged below it

---

## 4. Seed Data (`02_demo_data.js`, idempotent)

| Entity | Count |
|---|---|
| Trainers | 1 (Rajesh Kumar) |
| Students | 5 |
| Courses | 6 — full IGO catalog |
| Enrollments | 8 (mix of active + expiring) |

Six courses seeded with all fields:
1. Polyhouse & Hydroponics Farming — Horticulture, Intermediate, ₹12,500
2. Organic Farming Mastery — Horticulture, Beginner, ₹8,500
3. Integrated Pest Management — Horticulture, Advanced, ₹9,800
4. Agri Supply Chain Management — Agri-Biz, Intermediate, ₹11,000
5. Commercial Aquaculture — Aquaculture, Beginner, ₹10,500
6. Smart Irrigation & Water Management — Tech, Advanced, ₹13,500

---

## 5. Out of Scope

- Topic sub-level, assessment engine changes — Sub-project B
- Learning paths, groups, gamification — Sub-projects C–H
- Student/trainer app integration — deferred
