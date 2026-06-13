/**
 * Supabase client — server-side with service role key
 * Used for storage, admin operations, and direct DB access
 * @module config/supabase
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('[Supabase] SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
}

/**
 * Server-side Supabase client (service role — full access, bypasses RLS)
 * NEVER expose this to the frontend
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabase };
