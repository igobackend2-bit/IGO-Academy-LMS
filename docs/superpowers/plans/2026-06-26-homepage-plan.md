# IGO Academy — Public Homepage + Navigation Plan

**Branch:** feature/public-homepage
**Date:** 2026-06-26

## Goal

Build a full public-facing homepage (`/`) and a shared navigation component used across all public pages. The homepage is the first thing any visitor (student, entrepreneur, farmer) sees — it must communicate what IGO Academy is, show courses, and drive sign-ups.

## Global Constraints

- NO new npm packages
- Do NOT touch admin pages, student portal, or the existing LoginPage
- Do NOT modify existing Catalog.jsx logic — only add the shared nav to it
- CSS: use existing variables and classes from `client/src/index.css`
- Images: `/green_field_sunrise.png` exists in `client/public/`
- API: `@/services/api`, Auth: `@/context/AuthContext` (useAuth)
- Backend public endpoint: `GET /api/courses/public` — returns published courses

---

## Task 1 — Shared Public Navigation Component

**File:** `client/src/components/layout/PublicNav.jsx` (new)

```jsx
// Sticky top navbar used on Home + Catalog pages
// Props: { transparent?: boolean }
// transparent=true: dark text on transparent bg (for hero section)
// transparent=false (default): white bg with shadow

// Left: IGO Academy logo text
//   - Clicking → navigate('/')
//   - Style: "IGO Academy" in font-black, color igo-navy

// Center (desktop only, hide on mobile): 
//   - "Home" link → /
//   - "Courses" link → /courses

// Right:
//   - If user logged in as student → "My Dashboard" button → /student/dashboard
//   - If user logged in as admin → "Admin Panel" button → /admin/dashboard
//   - If NOT logged in:
//     - "Sign In" (outline small btn) → /login
//     - "Get Started" (green small btn) → /register

// Sticky: position sticky, top 0, z-index 100
// White bg + shadow when scrolled (use scroll listener or just always white bg)
```

**Also update Catalog.jsx:** Replace its inline nav bar at the top with `<PublicNav />`.

---

## Task 2 — Homepage

**File:** `client/src/pages/public/HomePage.jsx` (new)

### Section 1: Hero
```
Full viewport height (min-h-screen)
Background: url('/green_field_sunrise.png') center/cover, dark green overlay rgba(12,32,20,0.72)
Ken Burns animation: className="lp-video-bg" wrapper (already defined in index.css)

Content (centered, z-index above overlay):
  - Small pill badge: "TNSDC + MSME Recognised Platform"
  - H1: "Grow. Learn. Lead."
    Subtitle: "India's agri-entrepreneurship learning platform — TNSDC + MSME recognised 
    certification for students, farmers & entrepreneurs across Tamil Nadu."
  - Two buttons:
    - "Explore Courses →" (primary green) → /courses  
    - "Sign In" (glass outline: white border, white text, rgba bg) → /login
  - Stats row (below buttons, mt-12):
    4 stats in a row:
    - "6+" Courses
    - "4" Categories  
    - "TNSDC" Recognised
    - "MSME" Certified
    Each stat: large number (white, font-black, 2rem) + label (small, white 70%)
```

### Section 2: Category Cards
```
White bg, padding 5rem 2rem
Heading: "Learn by Domain" (igo-navy, font-black, 2rem, centered)
Sub: "Choose your area of expertise" (gray, centered, mb-3rem)

4 cards in a row (CSS grid, repeat(auto-fill, minmax(220px,1fr)), gap 1.5rem):
Each card:
  - Gradient top section (same dark green gradient): icon (large emoji or text), category name
  - White bottom: short description (1 line), "X Courses" count badge
  - onClick: navigate('/courses') — filter by category handled on catalog page
  
Categories:
  - Horticulture: "🌱", "Plant & crop cultivation techniques"
  - Aquaculture: "🐟", "Fish farming & water management" 
  - Agri-Biz: "📦", "Supply chain & market strategies"
  - Tech: "💧", "Smart irrigation & precision farming"

Card hover: lift translateY(-6px), green border glow
```

### Section 3: Featured Courses  
```
Light gray bg (#F5F7F3), padding 5rem 2rem

Heading: "Featured Courses" (igo-navy, centered)
Sub: "Start learning today — TNSDC & MSME recognised certificates" (gray)

Fetch GET /api/courses/public → show first 3 courses as cards
Use same card style as Catalog.jsx but simpler (no filter UI)
Each card:
  - Dark green gradient header: title, category badge, level badge
  - White body: short_description (2 lines), duration, price (or "Free")
  - "Enroll Now →" button → /courses (takes to catalog)

"View All Courses →" button centered below cards (outline style) → /courses
```

### Section 4: Why IGO Academy (3 columns)
```
White bg, padding 4rem 2rem
Heading: "Why Choose IGO Academy?" (centered, igo-navy)

3 feature cards (grid-cols-3 on desktop, stack on mobile):
  1. Government Recognised
     Icon: 🏛️
     Title: "TNSDC + MSME Recognised"
     Text: "Certification accepted by Tamil Nadu Skill Development Corporation and MSME — adds real weight to your resume."
  
  2. Expert Trainers
     Icon: 👨‍🏫
     Title: "Industry Expert Faculty"  
     Text: "Learn from active agri-practitioners and entrepreneurs who have built successful businesses."
  
  3. Lifetime Access
     Icon: 🎓
     Title: "Certificate on Completion"
     Text: "Pass the assessment with 70%+ and instantly download your QR-verified digital certificate."
```

### Section 5: CTA Banner
```
Background: linear-gradient(135deg, #0C2014 0%, #1a4a2e 100%)
Padding: 4rem 2rem, centered

Heading: "Ready to Start Your Agri Journey?" (white, font-black, 1.75rem)
Sub: "Join hundreds of students and entrepreneurs learning agri-skills online." (white 70%)
Button: "Get Started Free →" → /register (green primary, large, rounded-xl)
```

### Section 6: Footer
```
Dark bg #0C2014, white text, padding 2.5rem 2rem

Two-column layout:
  Left:
    - "IGO Academy" (font-black, 1.1rem, white)
    - "A platform by IGO Group, Chennai" (small, white 60%)
    - "Grow. Learn. Lead." tagline (igo-gold color)
  
  Right:
    - Links: Courses → /courses | Sign In → /login | Register → /register | Verify Certificate → /verify/:id

Bottom bar: "© 2026 IGO Academy. TNSDC + MSME Recognised | Chennai, Tamil Nadu" (white 40%, centered, border-top white 10%)
```

---

## Task 3 — App.jsx Updates

Update `client/src/App.jsx`:
1. Import HomePage: `import HomePage from '@/pages/public/HomePage'`
2. Change root redirect FROM `<Navigate to="/courses">` TO `<Route path="/" element={<HomePage />} />`
   (i.e. replace `<Route path="/" element={<Navigate to="/courses" replace />} />` with `<Route path="/" element={<HomePage />} />`)
3. Keep `/courses` as a separate route pointing to Catalog

---

## Execution Order

All 3 tasks in one implementation (single commit) since they're tightly coupled.
Single subagent handles all 3.
