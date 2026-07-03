/**
 * Fix certificate visibility: replace empty public.certificates TABLE
 * with a VIEW over igo_lms.certificates (joined with users + courses).
 *
 * Column mapping:
 *   igo_lms.certificates.id              → id
 *   igo_lms.certificates.student_id      → user_id
 *   igo_lms.certificates.course_id       → course_id
 *   igo_lms.courses.title                → course_title
 *   igo_lms.users.full_name              → user_name
 *   igo_lms.certificates.pdf_s3_key      → certificate_url  (storage path)
 *   igo_lms.certificates.certificate_id  → certificate_number
 *   igo_lms.certificates.issued_at       → issued_at
 *   igo_lms.certificates.is_valid        → is_valid
 *
 * Run: node src/scripts/fix-certificates-bridge.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  FIX: public.certificates → VIEW over igo_lms');
  console.log('════════════════════════════════════════════════════════\n');

  // Step 1: Drop the empty public.certificates table (and any dependent objects)
  console.log('[1] Dropping public.certificates TABLE (empty, blocking view creation)...');
  await db.raw(`DROP TABLE IF EXISTS public.certificates CASCADE`);
  console.log('    Done.');

  // Step 2: Also drop any stale view with that name (safety net)
  console.log('[2] Dropping stale public.certificates VIEW if any...');
  await db.raw(`DROP VIEW IF EXISTS public.certificates CASCADE`);
  console.log('    Done.');

  // Step 3: Create the view with security_invoker = false so PostgREST
  //         can access igo_lms schema via the view owner's privileges.
  //         We join courses and users to populate the denormalised columns
  //         the Flutter app expects (course_title, user_name).
  console.log('[3] Creating public.certificates VIEW...');
  await db.raw(`
    CREATE VIEW public.certificates
    WITH (security_invoker = false)
    AS
    SELECT
      c.id,
      c.student_id                                      AS user_id,
      c.course_id,
      COALESCE(co.title, '')::text                      AS course_title,
      COALESCE(u.full_name, '')::text                   AS user_name,
      c.pdf_s3_key::text                                AS certificate_url,
      c.certificate_id::text                            AS certificate_number,
      c.issued_at,
      c.is_valid,
      c.revoked_reason,
      c.revoked_at
    FROM igo_lms.certificates c
    LEFT JOIN igo_lms.courses co ON co.id = c.course_id
    LEFT JOIN igo_lms.users   u  ON u.id  = c.student_id
    WHERE c.is_valid = true
  `);
  console.log('    View created.');

  // Step 4: Grant SELECT to Supabase roles
  console.log('[4] Granting SELECT to authenticated and anon roles...');
  await db.raw(`GRANT SELECT ON public.certificates TO authenticated, anon`);
  console.log('    Grants applied.');

  // Step 5: Enable RLS on the view is NOT possible in PostgreSQL (views don't
  //         support RLS). Instead we rely on security_invoker=false (view runs
  //         as owner) PLUS the WHERE clause below can be enforced via a Supabase
  //         RLS policy using pg_policies on the underlying table, OR via a
  //         security barrier view with CURRENT_USER filtering.
  //
  //         For PostgREST: Supabase RLS policies can be applied to views by
  //         using security_invoker=true + RLS on the view itself, but that
  //         requires PG 15+. The safer cross-version approach is to use
  //         a SECURITY DEFINER function or rely on the app-level filter.
  //
  //         We'll add an RLS policy on igo_lms.certificates so that when
  //         security_invoker=true is used the filter propagates.
  //         However, since the Flutter app calls public.certificates via
  //         Supabase PostgREST which sends auth.uid(), we add a SECURITY
  //         INVOKER view + RLS on the underlying table.

  // Re-create as security_invoker = true so auth.uid() is the calling user
  console.log('[5] Re-creating view with security_invoker=true for RLS propagation...');
  await db.raw(`DROP VIEW IF EXISTS public.certificates CASCADE`);
  await db.raw(`
    CREATE VIEW public.certificates
    WITH (security_invoker = true)
    AS
    SELECT
      c.id,
      c.student_id                                      AS user_id,
      c.course_id,
      COALESCE(co.title, '')::text                      AS course_title,
      COALESCE(u.full_name, '')::text                   AS user_name,
      c.pdf_s3_key::text                                AS certificate_url,
      c.certificate_id::text                            AS certificate_number,
      c.issued_at,
      c.is_valid,
      c.revoked_reason,
      c.revoked_at
    FROM igo_lms.certificates c
    LEFT JOIN igo_lms.courses co ON co.id = c.course_id
    LEFT JOIN igo_lms.users   u  ON u.id  = c.student_id
    WHERE c.is_valid = true
  `);
  await db.raw(`GRANT SELECT ON public.certificates TO authenticated, anon`);
  console.log('    Done.');

  // Step 6: Enable RLS on igo_lms.certificates and add an own-row policy
  console.log('[6] Enabling RLS on igo_lms.certificates...');
  await db.raw(`ALTER TABLE igo_lms.certificates ENABLE ROW LEVEL SECURITY`);

  // Drop existing policies to avoid duplicates
  await db.raw(`
    DO $$
    BEGIN
      DROP POLICY IF EXISTS "Certificates: own records" ON igo_lms.certificates;
    EXCEPTION WHEN others THEN NULL;
    END $$
  `);

  await db.raw(`
    CREATE POLICY "Certificates: own records"
    ON igo_lms.certificates
    FOR SELECT
    TO authenticated, anon
    USING (student_id = auth.uid())
  `);
  console.log('    RLS enabled + own-row SELECT policy created on igo_lms.certificates.');

  // Step 7: Verify — run as superuser (service role bypasses RLS) to see all 3
  console.log('\n[7] Verification (service role — sees all rows)...');
  const rows = await db.raw(`SELECT id, user_id, course_id, course_title, user_name, certificate_number, issued_at FROM public.certificates`);
  console.log(`    Rows visible: ${rows.rows.length} (expected: 3)`);
  if (rows.rows.length > 0) {
    rows.rows.forEach((r, i) =>
      console.log(`    [${i+1}] cert#${r.certificate_number}  user:${r.user_id}  course:"${r.course_title}"  issued:${r.issued_at}`)
    );
  }

  if (rows.rows.length !== 3) {
    console.error(`\n  WARNING: expected 3 rows, got ${rows.rows.length}`);
  } else {
    console.log('\n  SUCCESS: all 3 certificates visible through public.certificates view.');
  }

  // Step 8: Summary
  console.log('\n── COLUMN MAPPING APPLIED ──────────────────────────────');
  console.log('  igo_lms.certificates.id              → public.certificates.id');
  console.log('  igo_lms.certificates.student_id      → public.certificates.user_id');
  console.log('  igo_lms.certificates.course_id       → public.certificates.course_id');
  console.log('  igo_lms.courses.title                → public.certificates.course_title');
  console.log('  igo_lms.users.full_name              → public.certificates.user_name');
  console.log('  igo_lms.certificates.pdf_s3_key      → public.certificates.certificate_url');
  console.log('  igo_lms.certificates.certificate_id  → public.certificates.certificate_number');
  console.log('  igo_lms.certificates.issued_at       → public.certificates.issued_at');
  console.log('  igo_lms.certificates.is_valid        → public.certificates.is_valid  (filter: WHERE is_valid=true)');
  console.log('\n── RLS ─────────────────────────────────────────────────');
  console.log('  View:  security_invoker=true  (auth.uid() propagates to underlying tables)');
  console.log('  Table: igo_lms.certificates RLS ENABLED');
  console.log('  Policy: "Certificates: own records" → SELECT WHERE student_id = auth.uid()');
  console.log('\n════════════════════════════════════════════════════════\n');

  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
