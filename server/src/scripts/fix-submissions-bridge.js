/**
 * fix-submissions-bridge.js
 *
 * Fixes the 3-table chaos for assessment submissions and the attendance zombie.
 *
 * WHAT WE FOUND (from diagnose-submissions.js):
 *
 *   igo_lms.submissions       — 6 rows, 15 cols — LMS server (knex) writes here
 *   public.submissions        — 0 rows, 15 cols — ZOMBIE (identical clone, never used) → DROP
 *   public.assessment_submissions — 5 rows, 7 cols — Flutter writes & reads here directly
 *                                   via Supabase client with RLS (auth.uid() = user_id)
 *
 *   igo_lms.attendance        — 1 row,  14 cols — LMS server writes here
 *   public.attendance         — 0 rows, 14 cols — ZOMBIE (identical clone, never used) → DROP + VIEW
 *
 * STRATEGY:
 *
 *   1. public.assessment_submissions — KEEP AS-IS.
 *      Flutter writes directly to this table using the Supabase JS/Dart client with
 *      its own schema (user_id, score as numeric %, passed bool). This is a SEPARATE
 *      flow from igo_lms.submissions which the LMS server populates via server-side
 *      grading. They serve different purposes and must coexist.
 *
 *   2. public.submissions — DROP (empty zombie, never referenced by any code).
 *
 *   3. public.attendance — DROP the empty table, then CREATE VIEW over igo_lms.attendance
 *      with security_invoker = false so Supabase RLS on the view uses the definer's
 *      permissions. Grant SELECT to authenticated role so Flutter can query it.
 *
 * Run from server/: node src/scripts/fix-submissions-bridge.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n=== fix-submissions-bridge.js ===\n');

  // ── Step 1: Verify public.submissions is truly empty before dropping ──────────
  const subCount = await db.raw(`SELECT COUNT(*) FROM public.submissions`);
  const submissionRows = parseInt(subCount.rows[0].count, 10);
  if (submissionRows > 0) {
    console.error(`ABORT: public.submissions has ${submissionRows} rows — not safe to drop.`);
    console.error('Investigate and remove this check if you are sure it is safe.');
    process.exit(1);
  }
  console.log(`✓ public.submissions is empty (${submissionRows} rows) — safe to drop.`);

  // ── Step 2: Verify public.attendance is truly empty before dropping ───────────
  const attCount = await db.raw(`SELECT COUNT(*) FROM public.attendance`);
  const attendanceRows = parseInt(attCount.rows[0].count, 10);
  if (attendanceRows > 0) {
    console.error(`ABORT: public.attendance has ${attendanceRows} rows — not safe to drop.`);
    process.exit(1);
  }
  console.log(`✓ public.attendance is empty (${attendanceRows} rows) — safe to drop.`);

  // ── Step 3: Drop public.submissions ──────────────────────────────────────────
  console.log('\nDropping public.submissions...');
  await db.raw(`DROP TABLE IF EXISTS public.submissions CASCADE`);
  console.log('✓ public.submissions dropped.');

  // ── Step 4: Drop public.attendance and recreate as VIEW ───────────────────────
  console.log('\nDropping public.attendance (table)...');
  await db.raw(`DROP TABLE IF EXISTS public.attendance CASCADE`);
  console.log('✓ public.attendance (table) dropped.');

  console.log('\nCreating VIEW public.attendance over igo_lms.attendance...');
  // security_invoker = false means the view runs as the view definer (service role),
  // bypassing per-row RLS on the underlying igo_lms.attendance table.
  // Supabase RLS on the VIEW itself can then be applied separately if needed.
  await db.raw(`
    CREATE OR REPLACE VIEW public.attendance
    WITH (security_invoker = false)
    AS
    SELECT
      id,
      student_id,
      class_id,
      class_type,
      status,
      focus_minutes,
      exit_events,
      watch_pct,
      watched_seconds,
      last_position_secs,
      completed,
      marked_at,
      created_at,
      updated_at
    FROM igo_lms.attendance
  `);
  console.log('✓ VIEW public.attendance created.');

  console.log('\nGranting SELECT on public.attendance to authenticated...');
  await db.raw(`GRANT SELECT ON public.attendance TO authenticated`);
  console.log('✓ SELECT granted to authenticated.');

  // ── Step 5: Verify final state ────────────────────────────────────────────────
  console.log('\n=== VERIFICATION ===\n');

  const typeCheck = await db.raw(`
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE (table_schema = 'public' AND table_name IN ('submissions','assessment_submissions','attendance'))
       OR (table_schema = 'igo_lms' AND table_name IN ('submissions','attendance'))
    ORDER BY table_schema, table_name
  `);
  console.log('Tables / Views present:');
  typeCheck.rows.forEach(r =>
    console.log(`  ${r.table_schema}.${r.table_name.padEnd(30)} ${r.table_type}`)
  );

  const viewRows = await db.raw(`SELECT COUNT(*) FROM public.attendance`);
  console.log(`\npublic.attendance (view) row count: ${viewRows.rows[0].count}`);
  console.log('Expected: 1 (mirrors igo_lms.attendance)');

  const subRemain = await db.raw(`
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'submissions'
  `);
  console.log(`\npublic.submissions exists: ${parseInt(subRemain.rows[0].count, 10) > 0 ? 'YES (problem!)' : 'NO (good)'}`);

  const subLmsCount = await db.raw(`SELECT COUNT(*) FROM igo_lms.submissions`);
  const subFlutterCount = await db.raw(`SELECT COUNT(*) FROM public.assessment_submissions`);
  console.log(`\nigo_lms.submissions rows:             ${subLmsCount.rows[0].count}  (LMS server writes here)`);
  console.log(`public.assessment_submissions rows:    ${subFlutterCount.rows[0].count}  (Flutter writes/reads here)`);
  console.log('\n✓ Done. Both submission tables intact, zombies removed, attendance view created.');
}

run().then(() => process.exit(0)).catch(e => {
  console.error('\nFATAL:', e.message);
  console.error(e);
  process.exit(1);
});
