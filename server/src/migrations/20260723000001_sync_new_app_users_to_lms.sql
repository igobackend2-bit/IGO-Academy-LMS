-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Extends the existing on_auth_user_created trigger (handle_new_user) so a
-- mobile-app signup (which creates a Supabase Auth user) also gets a matching
-- igo_lms.users row, letting the same email+password log into the web LMS.
--
-- Reuses Supabase Auth's own bcrypt hash (NEW.encrypted_password) directly —
-- it's the same portable bcrypt format the LMS's bcryptjs.compare() already
-- verifies, so no plaintext password needs to cross this boundary.
--
-- This is the App -> Web half of the sync. The Web -> App half (LMS
-- registration/admin-create/password-change creating or updating the
-- matching Supabase Auth user) is handled in the Express server — see
-- server/src/services/mobileAuthSync.service.js.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Mirror into the web LMS's own users table — best-effort only, must
  -- never break mobile app signup if anything here goes wrong.
  IF NEW.encrypted_password IS NOT NULL THEN
    BEGIN
      INSERT INTO igo_lms.users (
        id, full_name, email, phone, password_hash,
        role, is_active, otp_verified, created_at, updated_at
      )
      VALUES (
        NEW.id,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        NEW.phone,
        NEW.encrypted_password,
        'student',
        true,
        true,
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$function$;
