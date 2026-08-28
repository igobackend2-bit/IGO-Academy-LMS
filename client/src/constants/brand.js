/**
 * IGO Academy brand constants — single source of truth for all UI
 * Brand identity per the 18 Aug 2026 Website Change Requirement Document
 * (Section 15 — Branding and Visual Direction).
 * @module constants/brand
 */
export const IGO_COLORS = {
  green: '#4FA02E',
  greenLight: '#EDF6E4',
  gold: '#8DC63F',       // leaf/mint accent (legacy name)
  goldLight: '#F3F9E9',
  navy: '#16402B',       // forest ink (legacy name)
  navyLight: '#EEF6E7',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#4FA02E',
  warning: '#D97706',
};

export const IGO_META = {
  name: 'IGO Academy',
  fullName: 'IGO Academy — An Unit of IGO GROUP',
  tagline: 'Together We Grow, Together We Achieve',
  website: 'https://igoacademy.in',
  email: 'info@igoacademy.in',
  city: 'Chennai, Tamil Nadu',
  address: 'No 17, Kovalan Street, 2nd Main Road, Uthandi, Kanathur, Chennai - 600119',
  recognition: 'TNSDC + MSME Recognised',
  footerText: '© IGO Academy 2026 | An Unit of IGO GROUP | TNSDC + MSME Recognised',
};

/**
 * Lead-generation contact channels (Section 7 — Lead Generation and WhatsApp).
 * Confirmed real by the IGO Academy team on 25 Aug 2026 — Call/WhatsApp CTAs
 * across MobileStickyCta, the nav, and the Contact page are now active.
 * `phone2` (added 26 Aug 2026) is a second real contact number — shown
 * alongside `phone` on the footer and Contact page; the mobile sticky
 * Call button still uses the single primary `phone` number.
 * `email2` (added 26 Aug 2026) is a second real contact email — shown
 * alongside the primary contact email on the footer and Contact page.
 * Format `whatsapp` as digits only, country code first (no '+', spaces or
 * dashes), since it is used directly in a wa.me link.
 */
export const IGO_CONTACT = {
  phone: '+91 89258 93318',
  phone2: '+91 89258 29915',
  whatsapp: '919876543210',
  email2: 'head@igoacademy.in',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  STUDENT: 'student',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  PARTIAL: 'partial',
};

export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  PROJECT: 'project',
};

/** Default completion thresholds — admin can override per course */
export const DEFAULTS = {
  ATTENDANCE_PCT: 80,
  MIN_SCORE: 60,
  VIDEO_COMPLETION_PCT: 80,
  SESSION_INACTIVITY_MINS: 30,
  FOCUS_PING_INTERVAL_MS: 30000,   // 30 seconds
  FOCUS_WARNING_COUNTDOWN_S: 15,   // 15-second countdown before marking absent
  VIDEO_PROGRESS_SYNC_MS: 10000,   // Save progress every 10 seconds
  SIGNED_URL_EXPIRY_S: 7200,       // CloudFront signed URL expiry: 2 hours
};
