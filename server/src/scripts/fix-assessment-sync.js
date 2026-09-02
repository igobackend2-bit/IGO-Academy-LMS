/**
 * fix-assessment-sync.js
 *
 * Same gap as fix-module-sync.js, one table over: public.assessments
 * already exists as a properly RLS-protected mirror table (RLS restricts
 * SELECT to authenticated + is_published = true, matching class_modules),
 * with the exact `questions` JSONB shape the Flutter app's AssessmentModel
 * expects — but nothing ever wrote to it from igo_lms.assessments.
 *
 * Creates sync_lms_assessment_to_app() + trg_sync_lms_assessment, an
 * AFTER INSERT OR UPDATE trigger on igo_lms.assessments that upserts into
 * public.assessments — same pattern as trg_sync_lms_module /
 * trg_sync_lms_enrollment. Also backfills assessments created before the
 * trigger existed.
 *
 * Run from the server directory:
 *   node src/scripts/fix-assessment-sync.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('1) Creating sync_lms_assessment_to_app() function + trigger...');
  await db.raw(`
    CREATE OR REPLACE FUNCTION public.sync_lms_assessment_to_app()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public', 'igo_lms', 'pg_temp'
    AS $function$
    BEGIN
      IF EXISTS (SELECT 1 FROM public.courses c WHERE c.id = NEW.course_id) THEN
        BEGIN
          INSERT INTO public.assessments (
            id, course_id, title, description, questions, max_score, pass_score,
            max_attempts, timer_mins, is_published, created_at, updated_at
          )
          VALUES (
            NEW.id, NEW.course_id, NEW.title, NULL, COALESCE(NEW.questions, '[]'::jsonb),
            NEW.max_score, NEW.pass_score, NEW.max_attempts, NEW.timer_mins,
            NEW.is_published, NEW.created_at, NEW.updated_at
          )
          ON CONFLICT (id) DO UPDATE SET
            course_id     = EXCLUDED.course_id,
            title         = EXCLUDED.title,
            questions     = EXCLUDED.questions,
            max_score     = EXCLUDED.max_score,
            pass_score    = EXCLUDED.pass_score,
            max_attempts  = EXCLUDED.max_attempts,
            timer_mins    = EXCLUDED.timer_mins,
            is_published  = EXCLUDED.is_published,
            updated_at    = EXCLUDED.updated_at;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING '[sync_lms_assessment_to_app] mirror skipped for assessment %: %', NEW.id, SQLERRM;
        END;
      END IF;
      RETURN NEW;
    END;
    $function$;
  `);

  await db.raw('DROP TRIGGER IF EXISTS trg_sync_lms_assessment ON igo_lms.assessments');
  await db.raw(`
    CREATE TRIGGER trg_sync_lms_assessment
      AFTER INSERT OR UPDATE ON igo_lms.assessments
      FOR EACH ROW EXECUTE FUNCTION public.sync_lms_assessment_to_app()
  `);
  const tg = await db.raw("SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trg_sync_lms_assessment'");
  console.log('   trigger now: ' + JSON.stringify(tg.rows));

  console.log('\n2) Backfilling existing igo_lms.assessments rows into public.assessments...');
  const rows = await db.raw('SELECT * FROM igo_lms.assessments');
  for (const a of rows.rows) {
    await db.raw(`
      INSERT INTO public.assessments (
        id, course_id, title, description, questions, max_score, pass_score,
        max_attempts, timer_mins, is_published, created_at, updated_at
      )
      VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        course_id = EXCLUDED.course_id, title = EXCLUDED.title, questions = EXCLUDED.questions,
        max_score = EXCLUDED.max_score, pass_score = EXCLUDED.pass_score,
        max_attempts = EXCLUDED.max_attempts, timer_mins = EXCLUDED.timer_mins,
        is_published = EXCLUDED.is_published, updated_at = EXCLUDED.updated_at
    `, [a.id, a.course_id, a.title, JSON.stringify(a.questions || []), a.max_score, a.pass_score, a.max_attempts, a.timer_mins, a.is_published, a.created_at, a.updated_at]);
  }
  const cnt = await db.raw('SELECT COUNT(*) FROM public.assessments');
  console.log('   public.assessments now has ' + cnt.rows[0].count + ' row(s)');

  console.log('\n3) Verifying...');
  const check = await db.raw('SELECT id, title, is_published, jsonb_array_length(questions) AS q_count FROM public.assessments');
  check.rows.forEach(r => console.log('   ' + JSON.stringify(r)));

  await db.destroy();
  console.log('\nDone.');
}

run().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
