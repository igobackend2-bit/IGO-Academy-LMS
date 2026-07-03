/**
 * Migrates LMS-only users (those in igo_lms.users with no auth.users entry)
 * into Supabase Auth via the Admin API.
 *
 * After this runs, the existing enrollment trigger will auto-sync their
 * enrollments into public.enrollments on any new enrollment INSERT.
 * Run fix-enrollment-sync.js after this to back-fill existing enrollments.
 *
 * Run: node src/scripts/migrate-lms-users-to-supabase-auth.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const { db } = require('../config/db');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  // Get all LMS users
  const lmsUsers = await db('igo_lms.users').select(
    'id', 'email', 'full_name', 'role', 'phone', 'is_active'
  );

  // Get existing auth user emails
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authEmails = new Set((authList?.users || []).map(u => u.email?.toLowerCase()));

  // Find LMS-only users
  const lmsOnly = lmsUsers.filter(u => !authEmails.has(u.email?.toLowerCase()));

  console.log(`\nLMS users: ${lmsUsers.length}`);
  console.log(`Auth users: ${authEmails.size}`);
  console.log(`LMS-only (need Auth): ${lmsOnly.length}\n`);

  if (lmsOnly.length === 0) {
    console.log('All LMS users already have Supabase Auth entries. Nothing to do.');
    await db.destroy();
    return;
  }

  const results = { created: [], skipped: [], failed: [] };

  for (const user of lmsOnly) {
    try {
      // Generate a secure temporary password — user must reset on first login
      const tempPassword = crypto.randomBytes(12).toString('base64url') + 'Aa1!';

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,          // skip confirmation email for existing LMS users
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          migrated_from_lms: true,
        },
      });

      if (error) {
        console.error(`  FAILED  ${user.email}: ${error.message}`);
        results.failed.push({ email: user.email, reason: error.message });
        continue;
      }

      const authUserId = data.user.id;

      // Insert into public.users using the NEW auth UUID
      await db('public.users').insert({
        id:         authUserId,
        email:      user.email,
        name:       user.full_name,
        phone:      user.phone,
        created_at: new Date(),
        updated_at: new Date(),
      }).onConflict('id').ignore();

      // Also sync their igo_lms.users id to match auth id (if different)
      if (authUserId !== user.id) {
        console.log(`  NOTE: Auth UUID differs for ${user.email}: lms=${user.id} auth=${authUserId}`);
        // We do NOT update igo_lms.users.id (it's a PK with cascades) — just note the mismatch
      }

      console.log(`  CREATED ${user.email} (${user.role}) → auth id: ${authUserId}`);
      results.created.push({ email: user.email, role: user.role, authId: authUserId, lmsId: user.id, tempPassword });

    } catch (err) {
      console.error(`  ERROR   ${user.email}: ${err.message}`);
      results.failed.push({ email: user.email, reason: err.message });
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log(`CREATED : ${results.created.length}`);
  console.log(`SKIPPED : ${results.skipped.length}`);
  console.log(`FAILED  : ${results.failed.length}`);

  if (results.created.length > 0) {
    console.log('\n── Temporary passwords (share securely with each user) ──');
    results.created.forEach(u =>
      console.log(`  ${u.email.padEnd(40)} ${u.tempPassword}`)
    );
    console.log('\nUsers must reset their password on first login.');
    console.log('Run fix-enrollment-sync.js next to back-fill their enrollments.\n');
  }

  if (results.failed.length > 0) {
    console.log('\n── Failed ──');
    results.failed.forEach(f => console.log(`  ${f.email}: ${f.reason}`));
  }

  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
