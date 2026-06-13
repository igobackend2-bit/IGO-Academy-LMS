/**
 * IGo Academy brand constants — single source of truth for all UI
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
  name: 'IGo Academy',
  tagline: 'Grow. Learn. Lead.',
  website: 'https://igoacademy.in',
  email: 'info@igoacademy.in',
  city: 'Chennai, Tamil Nadu',
  recognition: 'TNSDC + MSME Recognised',
  footerText: '© IGo Academy 2026 | TNSDC + MSME Recognised',
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
