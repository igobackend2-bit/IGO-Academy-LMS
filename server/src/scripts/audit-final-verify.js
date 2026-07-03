/**
 * Final verification pass — confirms all schema bridges are working correctly
 * after the complete database audit and fix session.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

const CHECK = '✓';
const WARN  = '⚠';
const FAIL  = '✗';

function badge(ok, warn) {
  if (ok) return CHECK;
  if (warn) return WARN;
  return FAIL;
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  IGO ACADEMY — FINAL DATABASE VERIFICATION');
  console.log('══════════════════════════════════════════════════════════\n');

  const results = [];

  // 1. Lessons view
  const lessons = await db.raw(`SELECT COUNT(*) FROM public.lessons`);
  const lc = parseInt(lessons.rows[0].count);
  results.push({ name: 'public.lessons (view)', ok: lc > 0, value: `${lc} rows`, critical: true });

  // 2. Assessments view
  const asmt = await db.raw(`SELECT COUNT(*) FROM public.assessments`);
  const ac = parseInt(asmt.rows[0].count);
  results.push({ name: 'public.assessments (view)', ok: ac > 0, value: `${ac} rows`, critical: true });

  // 3. Resources view
  const res = await db.raw(`SELECT COUNT(*) FROM public.resources`);
  const rc = parseInt(res.rows[0].count);
  results.push({ name: 'public.resources (view)', ok: rc > 0, value: `${rc} rows`, critical: true });

  // 4. Certificates view
  const certs = await db.raw(`SELECT COUNT(*) FROM public.certificates`);
  const cc = parseInt(certs.rows[0].count);
  results.push({ name: 'public.certificates (view)', ok: cc > 0, value: `${cc} rows`, critical: true });

  // 5. Attendance view
  const att = await db.raw(`SELECT COUNT(*) FROM public.attendance`);
  const atc = parseInt(att.rows[0].count);
  results.push({ name: 'public.attendance (view)', ok: atc > 0, value: `${atc} rows`, critical: false });

  // 6. Enrollments sync
  const lmsEnr = await db.raw(`SELECT COUNT(*) FROM igo_lms.enrollments`);
  const pubEnr = await db.raw(`SELECT COUNT(*) FROM public.enrollments`);
  const lmsEnrC = parseInt(lmsEnr.rows[0].count);
  const pubEnrC = parseInt(pubEnr.rows[0].count);
  results.push({ name: 'Enrollment sync', ok: pubEnrC >= lmsEnrC, value: `lms=${lmsEnrC} pub=${pubEnrC}`, critical: true });

  // 7. Users sync
  const lmsUsr = await db.raw(`SELECT COUNT(*) FROM igo_lms.users`);
  const pubUsr = await db.raw(`SELECT COUNT(*) FROM public.users`);
  const lmsUsrC = parseInt(lmsUsr.rows[0].count);
  const pubUsrC = parseInt(pubUsr.rows[0].count);
  results.push({ name: 'User sync', ok: pubUsrC >= lmsUsrC, value: `lms=${lmsUsrC} pub=${pubUsrC}`, critical: true });

  // 8. Categories populated
  const cats = await db.raw(`SELECT COUNT(*) FROM public.categories`);
  const catC = parseInt(cats.rows[0].count);
  results.push({ name: 'Categories populated', ok: catC > 0, value: `${catC} categories`, critical: false });

  // 9. Courses with category_id set
  const nullCats = await db.raw(`SELECT COUNT(*) FROM public.courses WHERE category_id IS NULL`);
  const nc = parseInt(nullCats.rows[0].count);
  results.push({ name: 'Course category_id set', ok: nc === 0, value: `${nc} courses missing category`, critical: false });

  // 10. Quizzes
  const qz = await db.raw(`SELECT COUNT(*) FROM public.quizzes`);
  const qq = await db.raw(`SELECT COUNT(*) FROM public.quiz_questions`);
  const qzC = parseInt(qz.rows[0].count);
  const qqC = parseInt(qq.rows[0].count);
  results.push({ name: 'Quizzes populated', ok: qzC > 0, value: `${qzC} quizzes, ${qqC} questions`, critical: true });

  // 11. Notifications
  const notif = await db.raw(`SELECT COUNT(*) FROM public.notifications`);
  const notifC = parseInt(notif.rows[0].count);
  results.push({ name: 'Notifications seeded', ok: notifC > 0, value: `${notifC} notifications`, critical: false });

  // 12. course.total_lessons is set
  const zeroLessons = await db.raw(`SELECT COUNT(*) FROM public.courses WHERE total_lessons = 0`);
  const zlC = parseInt(zeroLessons.rows[0].count);
  results.push({ name: 'course.total_lessons set', ok: zlC === 0, value: zlC === 0 ? 'all courses have counts' : `${zlC} courses still at 0`, critical: true });

  // 13. No zombie tables (public should not have class_modules, user_sessions, live_classes as base tables)
  const zombies = await db.raw(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name IN ('class_modules','user_sessions','live_classes','submissions')
  `);
  results.push({ name: 'Zombie tables removed', ok: zombies.rows.length === 0, value: zombies.rows.length === 0 ? 'none' : zombies.rows.map(r=>r.table_name).join(', '), critical: false });

  // 14. lesson_progress for enrolled students
  const lp = await db.raw(`SELECT COUNT(*) FROM public.lesson_progress`);
  const lpC = parseInt(lp.rows[0].count);
  results.push({ name: 'lesson_progress table accessible', ok: true, value: `${lpC} rows (populated by app usage)`, critical: false });

  // 15. RLS - categories has SELECT
  const catPolicies = await db.raw(`SELECT COUNT(*) FROM pg_policies WHERE tablename='categories' AND cmd='SELECT'`);
  results.push({ name: 'categories RLS SELECT policy', ok: parseInt(catPolicies.rows[0].count) > 0, value: `${catPolicies.rows[0].count} policy`, critical: true });

  // 16. Dual FK check
  const crossFks = await db.raw(`
    SELECT COUNT(*) FROM pg_constraint c
    JOIN pg_class fc ON fc.oid = c.conrelid
    JOIN pg_namespace fn ON fn.oid = fc.relnamespace
    JOIN pg_class rc ON rc.oid = c.confrelid
    JOIN pg_namespace rn ON rn.oid = rc.relnamespace
    WHERE c.contype = 'f'
      AND fn.nspname = 'igo_lms'
      AND rn.nspname = 'public'
  `);
  const cfC = parseInt(crossFks.rows[0].count);
  results.push({ name: 'Cross-schema FKs (igo_lms→public)', ok: cfC === 0, value: `${cfC} cross-schema FKs`, critical: false });

  // Print results
  let criticalFails = 0;
  results.forEach(r => {
    const icon = r.ok ? CHECK : (r.critical ? FAIL : WARN);
    if (!r.ok && r.critical) criticalFails++;
    console.log(`  ${icon} ${r.name.padEnd(40)} ${r.value}`);
  });

  // Per-course lesson count
  console.log('\n── Course content summary ────────────────────────────────');
  const courseSummary = await db.raw(`
    SELECT c.title, c.total_lessons, c.total_duration_seconds,
           c.enrollment_count,
           (SELECT COUNT(*) FROM public.enrollments e WHERE e.course_id = c.id) AS actual_enrollments
    FROM public.courses c
    ORDER BY c.title
  `);
  courseSummary.rows.forEach(c => {
    console.log(`  ${c.title}`);
    console.log(`    lessons=${c.total_lessons}  duration=${Math.round(c.total_duration_seconds/60)}min  enrollments(table)=${c.actual_enrollments}`);
  });

  // Public schema table/view inventory
  console.log('\n── public schema inventory ───────────────────────────────');
  const pubInventory = await db.raw(`
    SELECT
      CASE WHEN table_type='VIEW' THEN 'VIEW ' ELSE 'TABLE' END AS kind,
      table_name,
      (SELECT COUNT(*) FROM information_schema.columns c2
       WHERE c2.table_schema='public' AND c2.table_name=t.table_name) AS cols
    FROM information_schema.tables t
    WHERE table_schema='public'
      AND table_name NOT LIKE 'knex_%'
    ORDER BY kind, table_name
  `);
  pubInventory.rows.forEach(r => console.log(`  ${r.kind}  ${r.table_name.padEnd(35)} (${r.cols} cols)`));

  console.log(`\n══════════════════════════════════════════════════════════`);
  if (criticalFails === 0) {
    console.log(`  ${CHECK} ALL CRITICAL CHECKS PASSED — database is healthy`);
  } else {
    console.log(`  ${FAIL} ${criticalFails} CRITICAL check(s) failed — review above`);
  }
  console.log('══════════════════════════════════════════════════════════\n');

  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
