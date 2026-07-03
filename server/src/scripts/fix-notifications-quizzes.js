/**
 * fix-notifications-quizzes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes the following confirmed data-visibility issues in IGO Academy LMS.
 *
 * FINDINGS SUMMARY (from audit run 2026-07-03):
 *
 *  1. public.quizzes / public.quiz_questions — 0 rows.
 *     6 quiz assessments exist in igo_lms.assessments (type='quiz') with real
 *     questions stored in JSONB.  Flutter reads public.quizzes + quiz_questions.
 *     The LMS server (AssessmentModel) only writes to igo_lms.assessments.
 *     No bridge/trigger exists.  FIX: copy all igo_lms quiz assessments into
 *     public.quizzes and their JSONB questions into public.quiz_questions.
 *
 *  2. public.notifications — 0 rows.
 *     No igo_lms.notifications table exists; notifications are meant to be
 *     written directly to public.notifications by the LMS server (no trigger
 *     path).  The Flutter app reads public.notifications with RLS "own" policy.
 *     FIX: seed one welcome notification per public.users row that has none yet.
 *
 *  3. public.live_classes — NOT a real relation at row-access level (COUNT(*)
 *     fails with "does not exist" despite appearing in information_schema).
 *     igo_lms.live_classes is the authoritative table (0 rows, correct schema).
 *     The LMS admin controller references live_classes without schema prefix,
 *     so it resolves to igo_lms via search_path.  No action needed.
 *
 *  4. public.lesson_progress — 0 rows but correct structure.  Flutter writes
 *     here directly (CourseRemoteDataSourceImpl.markLessonComplete).  LMS server
 *     uses igo_lms.attendance instead.  Dual-tracking is intentional.
 *     No server change needed.
 *
 *  5. Enrollment sync gap — 19 rows in igo_lms.enrollments vs 5 in public.
 *     The trigger trg_sync_lms_enrollment fires on INSERT but matches users by
 *     email.  public.users has only 6 rows (Supabase Auth users), while
 *     igo_lms.users has 15 rows (LMS-native users).  12 LMS users have no
 *     Auth account → trigger skips them silently.  16 enrollments un-synced.
 *     FIX: back-fill public.enrollments for any igo_lms enrollment whose
 *     student's email matches an existing public.users row.
 *     (LMS-only users without an Auth account cannot have public enrollments
 *     without Auth provisioning; those are flagged for manual attention.)
 *
 * Run:
 *   node src/scripts/fix-notifications-quizzes.js --dry-run   # inspect only
 *   node src/scripts/fix-notifications-quizzes.js             # apply fixes
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

const DRY_RUN = process.argv.includes('--dry-run');

function log(msg) { console.log(`[${DRY_RUN ? 'DRY' : 'FIX'}] ${msg}`); }
function section(title) {
  console.log(`\n${'─'.repeat(62)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(62));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Populate public.quizzes + public.quiz_questions from igo_lms.assessments
// ─────────────────────────────────────────────────────────────────────────────
async function fixQuizzes() {
  section('1. Bridging igo_lms.assessments → public.quizzes + quiz_questions');

  const assessments = await db.raw(`
    SELECT id, title, course_id, pass_score, timer_mins, created_at, questions
    FROM igo_lms.assessments
    WHERE type = 'quiz'
    ORDER BY created_at
  `);

  log(`Found ${assessments.rows.length} quiz-type assessments in igo_lms.assessments`);

  let quizInserted = 0;
  let questionsInserted = 0;

  for (const a of assessments.rows) {
    const existing = await db.raw(`SELECT id FROM public.quizzes WHERE id = ?`, [a.id]);
    if (existing.rows.length > 0) {
      log(`  SKIP quiz "${a.title}" — already in public.quizzes`);
      continue;
    }

    let questions = [];
    if (a.questions) {
      try {
        questions = typeof a.questions === 'string' ? JSON.parse(a.questions) : a.questions;
      } catch (e) {
        log(`  WARN: cannot parse questions JSON for "${a.title}": ${e.message}`);
      }
    }

    log(`  INSERT quiz "${a.title}" (${questions.length} questions)`);

    if (!DRY_RUN) {
      await db.raw(`
        INSERT INTO public.quizzes
          (id, course_id, lesson_id, title, description, total_questions,
           passing_score, time_limit_minutes, is_required, created_at)
        VALUES (?, ?, NULL, ?, NULL, ?, ?, ?, TRUE, ?)
        ON CONFLICT (id) DO NOTHING
      `, [
        a.id, a.course_id, a.title, questions.length,
        a.pass_score || 60, a.timer_mins || 30, a.created_at,
      ]);
      quizInserted++;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const options = Array.isArray(q.options)
          ? q.options.map(o => (typeof o === 'string' ? o : (o.text || String(o))))
          : [];

        // Determine correct_option_index from correct_answer
        let correctIdx = 0;
        if (q.correct_answer !== undefined && q.correct_answer !== null) {
          const ca = String(q.correct_answer).trim();
          const numIdx = parseInt(ca, 10);
          if (!isNaN(numIdx) && numIdx >= 0 && numIdx < options.length) {
            correctIdx = numIdx;
          } else {
            const textIdx = options.findIndex(
              o => String(o).toLowerCase().trim() === ca.toLowerCase()
            );
            if (textIdx >= 0) correctIdx = textIdx;
          }
        }

        // options stored as postgres ARRAY text[] — use literal array syntax
        const optionsArray = `{${options.map(o => `"${String(o).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;

        // q.id may be a short string like "q1" — not a valid UUID, so always generate fresh
        await db.raw(`
          INSERT INTO public.quiz_questions
            (id, quiz_id, question, options, correct_option_index,
             explanation, order_index, points)
          VALUES (
            extensions.uuid_generate_v4(),
            ?, ?, ?::text[], ?, ?, ?, ?
          )
        `, [
          a.id,
          q.question || q.text || '',
          optionsArray,
          correctIdx,
          q.explanation || null,
          i,
          q.points || 1,
        ]);
        questionsInserted++;
      }
    }
  }

  log(`Quizzes inserted: ${quizInserted}, questions inserted: ${questionsInserted}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Seed welcome notifications for public.users with no notifications
// ─────────────────────────────────────────────────────────────────────────────
async function fixNotifications() {
  section('2. Seeding welcome notifications for users with no notifications');

  // public.users.name (not full_name)
  const users = await db.raw(`
    SELECT pu.id, pu.name
    FROM public.users pu
    LEFT JOIN public.notifications n ON n.user_id = pu.id
    WHERE n.id IS NULL
  `);

  log(`Found ${users.rows.length} public.users rows with zero notifications`);

  let inserted = 0;
  for (const u of users.rows) {
    log(`  INSERT welcome notification → user ${u.id} (${u.name || 'unknown'})`);
    if (!DRY_RUN) {
      await db.raw(`
        INSERT INTO public.notifications (user_id, title, body, type, target_id, is_read, created_at)
        VALUES (?, ?, ?, 'announcement', NULL, FALSE, NOW())
      `, [
        u.id,
        'Welcome to IGO Academy',
        'Your learning journey starts here. Explore your enrolled courses and start learning!',
      ]);
      inserted++;
    }
  }

  log(`Notifications inserted: ${inserted}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Back-fill public.enrollments for un-synced LMS enrollments
//    (only for students whose email matches a public.users / Auth account)
// ─────────────────────────────────────────────────────────────────────────────
async function fixEnrollmentSync() {
  section('3. Back-filling public.enrollments for un-synced LMS enrollments');

  // Find LMS enrollments where the student has a matching public.users by email
  // but the enrollment doesn't exist in public.enrollments yet
  const missing = await db.raw(`
    SELECT
      e.id           AS lms_enrollment_id,
      pu.id          AS public_user_id,
      e.course_id,
      e.created_at
    FROM igo_lms.enrollments e
    JOIN igo_lms.users lu ON lu.id = e.student_id
    JOIN public.users pu ON LOWER(pu.email) = LOWER(lu.email)
    LEFT JOIN public.enrollments pe
      ON pe.user_id = pu.id AND pe.course_id = e.course_id
    WHERE pe.id IS NULL
    ORDER BY e.created_at DESC
  `);

  log(`Found ${missing.rows.length} un-synced enrollments with a matched public user`);

  // Also report unresolvable ones (LMS students with no Auth account)
  const unresolvable = await db.raw(`
    SELECT COUNT(*) as cnt
    FROM igo_lms.enrollments e
    JOIN igo_lms.users lu ON lu.id = e.student_id
    LEFT JOIN public.users pu ON LOWER(pu.email) = LOWER(lu.email)
    LEFT JOIN public.enrollments pe
      ON pe.user_id = pu.id AND pe.course_id = e.course_id
    WHERE pu.id IS NULL
  `);
  log(`  (${unresolvable.rows[0].cnt} enrollments cannot be synced — student has no Auth/public account)`);

  let inserted = 0;
  for (const e of missing.rows) {
    log(`  INSERT public.enrollments user=${e.public_user_id} course=${e.course_id}`);
    if (!DRY_RUN) {
      try {
        await db.raw(`
          INSERT INTO public.enrollments
            (user_id, course_id, status, progress_percent, completed_lessons, enrolled_at)
          VALUES (?, ?, 'active', 0, 0, ?)
          ON CONFLICT (user_id, course_id) DO NOTHING
        `, [e.public_user_id, e.course_id, e.created_at]);
        inserted++;
      } catch (err) {
        log(`    WARN: ${err.message.split('\n')[0]}`);
      }
    }
  }

  log(`public.enrollments rows inserted: ${inserted}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Verify results
// ─────────────────────────────────────────────────────────────────────────────
async function verify() {
  section('4. Post-fix verification');

  const checks = [
    ['public.quizzes',         `SELECT COUNT(*) as cnt FROM public.quizzes`],
    ['public.quiz_questions',  `SELECT COUNT(*) as cnt FROM public.quiz_questions`],
    ['public.notifications',   `SELECT COUNT(*) as cnt FROM public.notifications`],
    ['public.enrollments',     `SELECT COUNT(*) as cnt FROM public.enrollments`],
    ['public.users',           `SELECT COUNT(*) as cnt FROM public.users`],
    ['public.lesson_progress', `SELECT COUNT(*) as cnt FROM public.lesson_progress`],
    ['igo_lms.enrollments',    `SELECT COUNT(*) as cnt FROM igo_lms.enrollments`],
  ];

  for (const [label, sql] of checks) {
    try {
      const r = await db.raw(sql);
      log(`  ${label}: ${r.rows[0].cnt} rows`);
    } catch (e) {
      log(`  ${label}: ERROR — ${e.message.split('\n')[0]}`);
    }
  }

  // Remaining sync gap
  const gap = await db.raw(`
    SELECT COUNT(*) as cnt
    FROM igo_lms.enrollments e
    JOIN igo_lms.users lu ON lu.id = e.student_id
    JOIN public.users pu ON LOWER(pu.email) = LOWER(lu.email)
    LEFT JOIN public.enrollments pe ON pe.user_id = pu.id AND pe.course_id = e.course_id
    WHERE pe.id IS NULL
  `);
  log(`  enrollment sync gap remaining (matchable): ${gap.rows[0].cnt}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`  IGO ACADEMY — NOTIFICATIONS / QUIZZES FIX${DRY_RUN ? ' [DRY RUN]' : ''}`);
  console.log('════════════════════════════════════════════════════════════');
  if (DRY_RUN) console.log('\n  *** DRY RUN — no data will be written ***\n');

  try {
    await fixQuizzes();
    await fixNotifications();
    await fixEnrollmentSync();
    await verify();
  } catch (err) {
    console.error('\nFATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await db.destroy();
  }

  console.log('\n════════════════════════════════════════════════════════════\n');
}

main();
