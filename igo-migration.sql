-- IGo Academy Platform — Complete Database Migration
-- Paste this entire script in Supabase SQL Editor and click RUN

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  phone           VARCHAR(15),
  password_hash   VARCHAR(255) NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','trainer','student')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  otp_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  otp_code        VARCHAR(6),
  otp_expires_at  TIMESTAMP,
  last_login_at   TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. COURSES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                VARCHAR(255) NOT NULL,
  description          TEXT,
  thumbnail_url        VARCHAR(500),
  duration_hours       INTEGER DEFAULT 0,
  trainer_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  completion_criteria  JSONB DEFAULT '{"attendance_pct":80,"min_score":60}',
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. ENROLLMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_expired   BOOLEAN NOT NULL DEFAULT FALSE,
  paid_amount  DECIMAL(10,2) DEFAULT 0,
  enrolled_at  TIMESTAMP DEFAULT NOW(),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- ─────────────────────────────────────────
-- 4. USER SESSIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   VARCHAR(255) NOT NULL,
  device_info  JSONB,
  ip_address   INET,
  expires_at   TIMESTAMP NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id    ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);

-- ─────────────────────────────────────────
-- 5. CLASS MODULES (Recorded Videos)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  video_s3_key    VARCHAR(500),
  duration_secs   INTEGER DEFAULT 0,
  order_index     INTEGER NOT NULL DEFAULT 0,
  completion_pct  INTEGER NOT NULL DEFAULT 80,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. LIVE CLASSES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_classes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  trainer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  scheduled_at     TIMESTAMP NOT NULL,
  duration_mins    INTEGER NOT NULL DEFAULT 60,
  status           TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended')),
  recording_s3     VARCHAR(500),
  max_participants INTEGER DEFAULT 200,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 7. ATTENDANCE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id            UUID NOT NULL,
  class_type          TEXT NOT NULL CHECK (class_type IN ('live','recorded')),
  status              TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present','absent','partial')),
  focus_minutes       INTEGER DEFAULT 0,
  exit_events         INTEGER DEFAULT 0,
  watch_pct           INTEGER DEFAULT 0,
  watched_seconds     INTEGER DEFAULT 0,
  last_position_secs  INTEGER DEFAULT 0,
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at           TIMESTAMP DEFAULT NOW(),
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attendance_student_class ON attendance(student_id, class_id, class_type);

-- ─────────────────────────────────────────
-- 8. ASSESSMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  title             VARCHAR(255) NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('quiz','assignment','project')),
  questions         JSONB,
  max_score         INTEGER DEFAULT 100,
  pass_score        INTEGER DEFAULT 60,
  deadline          TIMESTAMP,
  max_attempts      INTEGER DEFAULT 1,
  timer_mins        INTEGER,
  shuffle_questions BOOLEAN DEFAULT FALSE,
  shuffle_options   BOOLEAN DEFAULT FALSE,
  is_published      BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 9. SUBMISSIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers         JSONB,
  file_urls       JSONB,
  external_links  JSONB,
  score           INTEGER,
  feedback        TEXT,
  graded_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  attempt_number  INTEGER NOT NULL DEFAULT 1,
  status          TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','graded','revision_requested','resubmitted')),
  submitted_at    TIMESTAMP DEFAULT NOW(),
  graded_at       TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_submissions_assessment_student ON submissions(assessment_id, student_id);

-- ─────────────────────────────────────────
-- 10. CERTIFICATES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id  VARCHAR(20) NOT NULL UNIQUE,
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  pdf_s3_key      VARCHAR(500) NOT NULL,
  issued_at       TIMESTAMP DEFAULT NOW(),
  is_valid        BOOLEAN NOT NULL DEFAULT TRUE,
  revoked_reason  TEXT,
  revoked_at      TIMESTAMP,
  revoked_by      UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id     ON certificates(student_id);

-- ─────────────────────────────────────────
-- SEED: Admin User  |  Password: IGo@Admin2026
-- ─────────────────────────────────────────
INSERT INTO users (full_name, email, phone, password_hash, role, is_active, otp_verified)
VALUES (
  'IGo Academy Admin',
  'admin@igoacademy.in',
  '+919876543210',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────
SELECT 'IGo Academy — All 10 tables created successfully!' AS status;
