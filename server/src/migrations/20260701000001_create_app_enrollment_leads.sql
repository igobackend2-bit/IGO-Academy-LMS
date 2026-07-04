-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Creates the app_enrollment_leads table in public schema for Flutter app leads

CREATE TABLE IF NOT EXISTS public.app_enrollment_leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           TEXT NOT NULL,
  phone               TEXT NOT NULL,
  alt_phone           TEXT,
  email               TEXT NOT NULL,
  program_of_interest TEXT NOT NULL,
  additional_details  TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected')),
  admin_note          TEXT,
  app_user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  lms_user_id         UUID,
  reviewed_at         TIMESTAMPTZ,
  reviewed_by_name    TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_leads_status ON public.app_enrollment_leads(status);
CREATE INDEX IF NOT EXISTS idx_app_leads_email  ON public.app_enrollment_leads(email);

-- RLS: service role can read/write (LMS server uses service key)
ALTER TABLE public.app_enrollment_leads ENABLE ROW LEVEL SECURITY;

-- Flutter app can insert (anon/user can submit their own lead)
CREATE POLICY "anyone can submit a lead"
  ON public.app_enrollment_leads FOR INSERT
  WITH CHECK (true);

-- Only service role reads/updates (LMS admin via service key)
CREATE POLICY "service role full access"
  ON public.app_enrollment_leads FOR ALL
  USING (true)
  WITH CHECK (true);
