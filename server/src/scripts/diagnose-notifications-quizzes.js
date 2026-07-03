/**
 * Diagnostic: notifications, quizzes, quiz_questions, live_classes, lesson_progress, enrollments
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  IGO ACADEMY — NOTIFICATIONS / QUIZZES / LIVE CLASSES AUDIT');
  console.log('════════════════════════════════════════════════════════\n');

  // 1. Row counts for problem tables
  const tables = [
    ['public', 'notifications'],
    ['public', 'quizzes'],
    ['public', 'quiz_questions'],
    ['public', 'quiz_attempts'],
    ['public', 'lesson_progress'],
    ['public', 'live_classes'],
    ['igo_lms', 'live_classes'],
    ['public', 'enrollments'],
    ['igo_lms', 'enrollments'],
    ['public', 'assessment_submissions'],
    ['igo_lms', 'assessments'],
  ];

  console.log('── ROW COUNTS ──────────────────────────────────────────');
  for (const [schema, table] of tables) {
    try {
      const r = await db.raw(`SELECT COUNT(*) as cnt FROM ${schema}.${table}`);
      console.log(`  ${schema}.${table}: ${r.rows[0].cnt} rows`);
    } catch (e) {
      console.log(`  ${schema}.${table}: ERROR — ${e.message.split('\n')[0]}`);
    }
  }

  // 2. Enrollment cross-reference
  console.log('\n── public.enrollments DETAILS ──────────────────────────');
  try {
    const pubEnroll = await db.raw(
      'SELECT e.id, e.user_id, e.course_id, e.status, c.title FROM public.enrollments e JOIN public.courses c ON c.id = e.course_id ORDER BY e.id'
    );
    pubEnroll.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  console.log('\n── igo_lms.enrollments SAMPLE (10 newest) ──────────────');
  try {
    const lmsEnroll = await db.raw(
      'SELECT id, student_id, course_id, is_expired, created_at FROM igo_lms.enrollments ORDER BY created_at DESC LIMIT 10'
    );
    lmsEnroll.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  // 3. Check trigger functions related to enrollment sync
  console.log('\n── TRIGGER FUNCTIONS (enrollment/notification related) ──');
  try {
    const trigFns = await db.raw(`
      SELECT p.proname, left(p.prosrc, 300) as src_preview
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.proname ILIKE '%sync%' OR p.proname ILIKE '%notif%' OR p.proname ILIKE '%enroll%'
      ORDER BY p.proname
    `);
    if (trigFns.rows.length === 0) console.log('  NONE FOUND');
    else trigFns.rows.forEach(r => {
      console.log(`\n  FUNCTION: ${r.proname}`);
      console.log('  ' + (r.src_preview || '').replace(/\n/g, '\n  '));
    });
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  // 4. Check triggers on igo_lms.enrollments specifically
  console.log('\n── TRIGGERS ON igo_lms.enrollments ────────────────────');
  try {
    const trgs = await db.raw(`
      SELECT trigger_name, event_manipulation, action_timing, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'igo_lms' AND event_object_table = 'enrollments'
    `);
    if (trgs.rows.length === 0) console.log('  (none)');
    else trgs.rows.forEach(r => console.log(`  ${r.action_timing} ${r.event_manipulation}: ${r.trigger_name}`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  // 5. Column structures for the problem tables
  console.log('\n── public.notifications COLUMNS ────────────────────────');
  try {
    const cols = await db.raw(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'notifications'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) default=${r.column_default || 'none'}`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  console.log('\n── public.quizzes COLUMNS ──────────────────────────────');
  try {
    const cols = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'quizzes'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  console.log('\n── public.quiz_questions COLUMNS ───────────────────────');
  try {
    const cols = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'quiz_questions'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  console.log('\n── public.live_classes COLUMNS ─────────────────────────');
  try {
    const cols = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'live_classes'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  console.log('\n── igo_lms.live_classes COLUMNS ─────────────────────────');
  try {
    const cols = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'igo_lms' AND table_name = 'live_classes'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  // 6. Check igo_lms.assessments vs public.assessments (view)
  console.log('\n── public.assessments VIEW DEFINITION ──────────────────');
  try {
    const viewDef = await db.raw(`
      SELECT view_definition
      FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'assessments'
    `);
    if (viewDef.rows.length === 0) console.log('  NOT A VIEW');
    else console.log('  ' + viewDef.rows[0].view_definition);
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  // 7. Check if there's an existing quiz population path (does LMS server write to public.quizzes?)
  console.log('\n── igo_lms.assessments sample (type=quiz) ───────────────');
  try {
    const quizAssessments = await db.raw(`
      SELECT id, title, type, course_id, jsonb_array_length(questions::jsonb) as q_count
      FROM igo_lms.assessments WHERE type = 'quiz' LIMIT 10
    `);
    if (quizAssessments.rows.length === 0) console.log('  (no quiz-type assessments)');
    else quizAssessments.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  // 8. public.lesson_progress columns
  console.log('\n── public.lesson_progress COLUMNS ──────────────────────');
  try {
    const cols = await db.raw(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'lesson_progress'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) default=${r.column_default || 'none'}`));
  } catch (e) {
    console.log('  ERROR:', e.message.split('\n')[0]);
  }

  console.log('\n════════════════════════════════════════════════════════\n');
  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
