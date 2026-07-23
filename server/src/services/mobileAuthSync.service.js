/**
 * Mobile-app auth sync (Web -> App direction).
 *
 * The web LMS (igo_lms.users, custom bcrypt+JWT auth) and the mobile app
 * (Supabase Auth's auth.users, mirrored into public.users) are two separate
 * user stores that happen to share this Supabase project. The App -> Web
 * half of the sync is a DB trigger (see migrations/20260723000001_*.sql,
 * which mirrors new Supabase Auth signups into igo_lms.users). This module
 * is the other half: whenever a web LMS account is created or its password
 * changes, mirror that into Supabase Auth so the same email+password also
 * logs into the mobile app.
 *
 * Fire-and-forget by design, same as syncCourseToPublic in
 * course.controller.js — a mobile-sync hiccup must never block or fail the
 * web LMS action that triggered it.
 * @module services/mobileAuthSync
 */
const { supabase } = require('../config/supabase');
const { db } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Create or update the matching Supabase Auth user for a web LMS account,
 * using the same plaintext password (available here, before it's hashed
 * for igo_lms.users) so Supabase Auth can hash it however it needs to.
 * @param {{ id: string, email: string, password: string, full_name?: string, phone?: string }} opts
 */
async function syncUserToMobileAuth({ id, email, password, full_name, phone }) {
  try {
    const existing = await db.raw('SELECT id FROM auth.users WHERE email = ?', [email]);

    if (existing.rows.length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(existing.rows[0].id, {
        password,
        ...(full_name && { user_metadata: { full_name } }),
      });
      if (error) throw error;
      logger.info(`[MobileAuthSync] Updated Supabase Auth password for ${email}`);
    } else {
      const { error } = await supabase.auth.admin.createUser({
        id, // reuse the igo_lms.users id so both systems share one identity
        email,
        password,
        phone: phone || undefined,
        email_confirm: true,
        user_metadata: full_name ? { full_name } : undefined,
      });
      if (error) throw error;
      logger.info(`[MobileAuthSync] Created Supabase Auth user for ${email}`);
    }
  } catch (err) {
    // Best-effort — the web LMS action itself must still succeed.
    logger.error(`[MobileAuthSync] Failed to sync ${email}:`, err.message);
  }
}

module.exports = { syncUserToMobileAuth };
