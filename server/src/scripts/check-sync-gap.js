require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  // Full sync_lms_enrollment_to_app function
  const fn = await db.raw(
    "SELECT p.proname, p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE p.proname = 'sync_lms_enrollment_to_app'"
  );
  if (fn.rows.length > 0) {
    console.log('=== sync_lms_enrollment_to_app ===');
    console.log(fn.rows[0].prosrc);
  } else {
    console.log('=== sync_lms_enrollment_to_app: NOT FOUND ===');
  }

  // Check enrollment sync gap: which igo_lms users have no corresponding public user
  const gap = await db.raw(`
    SELECT lu.id as lms_id, lu.email, lu.full_name
    FROM igo_lms.users lu
    LEFT JOIN public.users pu ON LOWER(pu.email) = LOWER(lu.email)
    WHERE pu.id IS NULL
  `);
  console.log('\n=== LMS users NOT matched in public.users ===');
  if (gap.rows.length === 0) console.log('  ALL MATCHED');
  else gap.rows.forEach(r => console.log('  ' + JSON.stringify(r)));

  // Check igo_lms enrollments that have no matching public enrollment
  const enrollGap = await db.raw(`
    SELECT e.id, e.student_id, e.course_id
    FROM igo_lms.enrollments e
    LEFT JOIN public.enrollments pe ON
      pe.course_id = e.course_id
      AND pe.user_id IN (
        SELECT pu.id FROM public.users pu
        JOIN igo_lms.users lu ON LOWER(pu.email) = LOWER(lu.email)
        WHERE lu.id = e.student_id
      )
    WHERE pe.id IS NULL
    ORDER BY e.created_at DESC
  `);
  console.log('\n=== LMS enrollments NOT synced to public ===');
  console.log('  Count:', enrollGap.rows.length);
  enrollGap.rows.slice(0, 10).forEach(r => console.log('  ' + JSON.stringify(r)));

  await db.destroy();
}
run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
