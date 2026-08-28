/**
 * Supabase client — anon key, used only for phone OTP send/verify
 * (auth.signInWithOtp / auth.verifyOtp). Deliberately separate from the
 * service-role client in ./supabase.js: these are end-user auth operations,
 * not admin operations, and this mirrors how the mobile app's own Supabase
 * client is scoped (mobile/lib/core/services/supabase_service.dart).
 *
 * This reuses the SAME phone-OTP delivery the mobile app already sends
 * real SMS through today — no new SMS provider or credentials needed.
 * @module config/supabaseAuth
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[SupabaseAuth] SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAuth };
