/**
 * fix-user-sync.js
 *
 * Syncs missing igo_lms.users rows into public.users.
 * Only inserts rows where a matching auth.users record exists (FK constraint).
 * Logs LMS-only users (no Supabase auth) without touching the DB.
 *
 * Actual column mappings (verified against live schema):
 *   igo_lms.users:  id, full_name, email, phone, role, is_active, ...
 *   public.users:   id, name, email, phone, avatar_url, bio, fcm_token, ...
 *
 * Run from server directory:
 *   node src/scripts/fix-user-sync.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const { db } = require('../config/db');

async function main() {
  console.log('=== IGO Academy — User Sync Report ===\n');

  // 1. Read all igo_lms.users
  const lmsResult = await db.raw(
    'SELECT id, full_name, email, phone FROM igo_lms.users'
  );
  const lmsRows = lmsResult.rows;
  console.log(`igo_lms.users:  ${lmsRows.length} rows`);

  // 2. Read all public.users
  const pubResult = await db.raw('SELECT id, email FROM public.users');
  const pubRows = pubResult.rows;
  console.log(`public.users:   ${pubRows.length} rows\n`);

  // Build lookup sets
  const pubIds    = new Set(pubRows.map(r => r.id));
  const pubEmails = new Set(
    pubRows.filter(r => r.email).map(r => r.email.toLowerCase())
  );

  // 3. Find LMS users missing from public.users (by id AND by email)
  const missing = lmsRows.filter(
    u => !pubIds.has(u.id) && !pubEmails.has((u.email || '').toLowerCase())
  );

  console.log(`Missing from public.users: ${missing.length} user(s)\n`);

  if (missing.length === 0) {
    console.log('Nothing to sync. All LMS users are already in public.users.');
    await db.destroy();
    return;
  }

  const synced  = [];
  const lmsOnly = [];
  const skipped = [];

  for (const user of missing) {
    // 4. Check auth.users by id OR email
    const authCheck = await db.raw(
      'SELECT id FROM auth.users WHERE id = ? OR email = ? LIMIT 1',
      [user.id, user.email]
    );

    if (authCheck.rows.length > 0) {
      const authId = authCheck.rows[0].id;

      // Insert into public.users — only columns that actually exist
      const insertResult = await db.raw(`
        INSERT INTO public.users (id, name, email, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        authId,
        user.full_name || null,
        user.email     || null,
        user.phone     || null,
      ]);

      const wasInserted = insertResult.rowCount > 0;
      if (wasInserted) {
        synced.push({ email: user.email, lmsId: user.id, authId });
      } else {
        // ON CONFLICT DO NOTHING — row already existed by id
        skipped.push({ email: user.email, lmsId: user.id, authId, reason: 'id conflict (already in public.users)' });
      }
    } else {
      lmsOnly.push({ email: user.email, id: user.id });
    }
  }

  // 5. Detailed report
  console.log('--- SYNCED (inserted into public.users) ---');
  if (synced.length === 0) {
    console.log('  (none)');
  } else {
    synced.forEach(u => {
      const idNote = u.lmsId !== u.authId ? ` [auth id: ${u.authId}]` : '';
      console.log(`  SYNCED    ${u.email}  (lms id: ${u.lmsId})${idNote}`);
    });
  }

  if (skipped.length > 0) {
    console.log('\n--- SKIPPED (auth row found but ON CONFLICT hit) ---');
    skipped.forEach(u => {
      console.log(`  SKIPPED   ${u.email}  — ${u.reason}`);
    });
  }

  console.log('\n--- LMS-ONLY (no Supabase auth row — NOT inserted, would break FK) ---');
  if (lmsOnly.length === 0) {
    console.log('  (none)');
  } else {
    lmsOnly.forEach(u => {
      console.log(`  LMS-ONLY  ${u.email}  (id: ${u.id})`);
    });
  }

  console.log('\n=== Summary ===');
  console.log(`  Total missing:  ${missing.length}`);
  console.log(`  Synced:         ${synced.length}`);
  console.log(`  Skipped:        ${skipped.length}`);
  console.log(`  LMS-only:       ${lmsOnly.length}`);

  await db.destroy();
}

main().catch(err => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
