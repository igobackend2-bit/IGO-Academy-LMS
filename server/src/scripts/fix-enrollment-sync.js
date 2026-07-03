/**
 * fix-enrollment-sync.js
 *
 * Syncs missing rows from igo_lms.enrollments → public.enrollments.
 *
 * The trigger (trg_sync_lms_enrollment → sync_lms_enrollment_to_app) maps
 * each LMS student to the Flutter app user by email-joining igo_lms.users
 * with public.users. This script replicates that same logic for the rows
 * that existed before the trigger was created.
 *
 * Actual column mappings:
 *   igo_lms.enrollments                →  public.enrollments
 *   ─────────────────────────────────────────────────────────
 *   student_id (via email join)        →  user_id
 *   course_id                          →  course_id
 *   (hardcoded 'active')               →  status
 *   (hardcoded 0)                      →  progress_percent
 *   (hardcoded 0)                      →  completed_lessons
 *   enrolled_at                        →  enrolled_at
 *   (NULL)                             →  completed_at
 *   (NULL)                             →  last_accessed_at
 *
 * Run from the server directory:
 *   node src/scripts/fix-enrollment-sync.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  // ── 1. Before counts ────────────────────────────────────────────────────────
  const [lmsBefore, pubBefore] = await Promise.all([
    db.raw('SELECT COUNT(*)::int AS cnt FROM igo_lms.enrollments'),
    db.raw('SELECT COUNT(*)::int AS cnt FROM public.enrollments'),
  ]);
  const lmsTotal   = lmsBefore.rows[0].cnt;
  const pubBefore_ = pubBefore.rows[0].cnt;

  console.log('\n=== Enrollment counts BEFORE sync ===');
  console.log(`  igo_lms.enrollments : ${lmsTotal}`);
  console.log(`  public.enrollments  : ${pubBefore_}`);
  console.log(`  Gap                 : ${lmsTotal - pubBefore_}`);

  // ── 2. Show trigger definition (informational) ───────────────────────────────
  console.log('\n=== Trigger definition ===');
  const triggerResult = await db.raw(`
    SELECT tgname, pg_get_triggerdef(oid) AS def
    FROM pg_trigger
    WHERE tgname = 'trg_sync_lms_enrollment'
  `);
  if (triggerResult.rows.length === 0) {
    console.log('  WARNING: trigger trg_sync_lms_enrollment NOT FOUND');
  } else {
    console.log('  ' + triggerResult.rows[0].def);
  }

  // ── 3. Check trigger function body for column mapping correctness ─────────────
  console.log('\n=== Trigger function: sync_lms_enrollment_to_app ===');
  const funcResult = await db.raw(`
    SELECT p.proname, p.prosrc
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'sync_lms_enrollment_to_app'
    LIMIT 1
  `);
  if (funcResult.rows.length > 0) {
    console.log(funcResult.rows[0].prosrc);
  } else {
    console.log('  Function not found in pg_proc');
  }

  // ── 4. Find missing (user_id, course_id) pairs via same email-join ───────────
  const missingResult = await db.raw(`
    SELECT
      le.id              AS lms_enrollment_id,
      le.student_id,
      le.course_id,
      le.enrolled_at,
      le.created_at,
      lu.email           AS lms_email,
      pu.id              AS app_user_id
    FROM igo_lms.enrollments le
    JOIN igo_lms.users lu ON lu.id = le.student_id
    JOIN public.users  pu ON LOWER(pu.email) = LOWER(lu.email)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.enrollments pe
      WHERE pe.user_id   = pu.id
        AND pe.course_id = le.course_id
    )
    ORDER BY le.created_at
  `);

  const missing = missingResult.rows;
  console.log(`\n=== Missing enrollment pairs to insert: ${missing.length} ===`);

  if (missing.length === 0) {
    console.log('  public.enrollments is already fully in sync with igo_lms.enrollments!');
  } else {
    missing.forEach(r =>
      console.log(`  lms_id=${r.lms_enrollment_id}  email=${r.lms_email}  course=${r.course_id}  app_user=${r.app_user_id}`)
    );

    // ── 5. Insert missing rows (mirror the trigger's INSERT exactly) ─────────────
    const toInsert = missing.map(r => ({
      user_id:           r.app_user_id,
      course_id:         r.course_id,
      status:            'active',
      progress_percent:  0,
      completed_lessons: 0,
      enrolled_at:       r.enrolled_at || r.created_at || new Date(),
      completed_at:      null,
      last_accessed_at:  null,
    }));

    const BATCH = 50;
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH);
      const colNames = Object.keys(batch[0]);
      // Knex db.raw uses ? as positional placeholders (not $N)
      const placeholders = batch
        .map(() => '(' + colNames.map(() => '?').join(', ') + ')')
        .join(',\n      ');
      const values = batch.flatMap(r => colNames.map(c => r[c]));

      await db.raw(
        `INSERT INTO public.enrollments (${colNames.join(', ')})
         VALUES ${placeholders}
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        values
      );
      inserted += batch.length;
      console.log(`  Inserted batch: ${inserted}/${toInsert.length}`);
    }
  }

  // ── 6. After counts ──────────────────────────────────────────────────────────
  const pubAfter = await db.raw('SELECT COUNT(*)::int AS cnt FROM public.enrollments');
  const pubAfter_  = pubAfter.rows[0].cnt;
  const actuallyAdded = pubAfter_ - pubBefore_;

  console.log('\n=== Enrollment counts AFTER sync ===');
  console.log(`  igo_lms.enrollments : ${lmsTotal}`);
  console.log(`  public.enrollments  : ${pubAfter_}`);
  console.log(`  Rows added          : ${actuallyAdded}`);

  // ── 7. Check for LMS enrollments with no matching public.users email ──────────
  const unmatchedResult = await db.raw(`
    SELECT le.id, le.student_id, lu.email
    FROM igo_lms.enrollments le
    JOIN igo_lms.users lu ON lu.id = le.student_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.users pu WHERE LOWER(pu.email) = LOWER(lu.email)
    )
  `);
  if (unmatchedResult.rows.length > 0) {
    console.log(`\n=== WARNING: ${unmatchedResult.rows.length} LMS enrollment(s) have NO matching public.users email ===`);
    unmatchedResult.rows.forEach(r =>
      console.log(`  lms_enrollment=${r.id}  student_id=${r.student_id}  email=${r.email}`)
    );
    console.log('  These students exist in the LMS but NOT in the Flutter app — they cannot be synced until public.users has their record.');
  } else {
    console.log('\n  All LMS students matched to a public.users record — no orphaned enrollments.');
  }

  await db.destroy();
  console.log('\nDone.');
}

run().catch(e => {
  console.error('\nFATAL:', e.message);
  process.exit(1);
});
