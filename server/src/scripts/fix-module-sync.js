/**
 * fix-module-sync.js
 *
 * public.class_modules already exists as a properly RLS-protected mirror
 * table (with its own class_modules_sync_counts trigger keeping
 * public.courses.total_lessons/total_duration_seconds in sync) — but
 * nothing ever wrote to it from igo_lms.class_modules. This creates the
 * missing sync-in trigger (trg_sync_lms_module → sync_lms_module_to_app,
 * mirroring the existing trg_sync_lms_enrollment pattern) and backfills
 * the modules that already exist.
 *
 * Run from the server directory:
 *   node src/scripts/fix-module-sync.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('1) Creating sync_lms_module_to_app() function + trigger...');
  await db.raw(`
    CREATE OR REPLACE FUNCTION public.sync_lms_module_to_app()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public', 'igo_lms', 'pg_temp'
    AS $function$
    BEGIN
      IF EXISTS (SELECT 1 FROM public.courses c WHERE c.id = NEW.course_id) THEN
        BEGIN
          INSERT INTO public.class_modules (
            id, course_id, title, description, video_s3_key, duration_secs,
            order_index, completion_pct, is_published, created_at, updated_at
          )
          VALUES (
            NEW.id, NEW.course_id, NEW.title, NEW.description, NEW.video_s3_key, NEW.duration_secs,
            NEW.order_index, NEW.completion_pct, NEW.is_published, NEW.created_at, NEW.updated_at
          )
          ON CONFLICT (id) DO UPDATE SET
            course_id      = EXCLUDED.course_id,
            title          = EXCLUDED.title,
            description    = EXCLUDED.description,
            video_s3_key   = EXCLUDED.video_s3_key,
            duration_secs  = EXCLUDED.duration_secs,
            order_index    = EXCLUDED.order_index,
            completion_pct = EXCLUDED.completion_pct,
            is_published   = EXCLUDED.is_published,
            updated_at     = EXCLUDED.updated_at;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING '[sync_lms_module_to_app] mirror skipped for module %: %', NEW.id, SQLERRM;
        END;
      END IF;
      RETURN NEW;
    END;
    $function$;
  `);

  await db.raw('DROP TRIGGER IF EXISTS trg_sync_lms_module ON igo_lms.class_modules');
  await db.raw(`
    CREATE TRIGGER trg_sync_lms_module
      AFTER INSERT OR UPDATE ON igo_lms.class_modules
      FOR EACH ROW EXECUTE FUNCTION public.sync_lms_module_to_app()
  `);
  const tg = await db.raw("SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trg_sync_lms_module'");
  console.log('   trigger now: ' + JSON.stringify(tg.rows));

  console.log('\n2) Backfilling existing igo_lms.class_modules rows into public.class_modules...');
  const modules = await db.raw('SELECT * FROM igo_lms.class_modules');
  for (const m of modules.rows) {
    await db.raw(`
      INSERT INTO public.class_modules (
        id, course_id, title, description, video_s3_key, duration_secs,
        order_index, completion_pct, is_published, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        course_id = EXCLUDED.course_id, title = EXCLUDED.title, description = EXCLUDED.description,
        video_s3_key = EXCLUDED.video_s3_key, duration_secs = EXCLUDED.duration_secs,
        order_index = EXCLUDED.order_index, completion_pct = EXCLUDED.completion_pct,
        is_published = EXCLUDED.is_published, updated_at = EXCLUDED.updated_at
    `, [m.id, m.course_id, m.title, m.description, m.video_s3_key, m.duration_secs, m.order_index, m.completion_pct, m.is_published, m.created_at, m.updated_at]);
  }
  const cnt = await db.raw('SELECT COUNT(*) FROM public.class_modules');
  console.log('   public.class_modules now has ' + cnt.rows[0].count + ' row(s)');

  console.log('\n3) Verifying public.lessons view now returns rows...');
  const l = await db.raw('SELECT id, title, video_url, is_published FROM public.lessons');
  l.rows.forEach(r => console.log('   ' + JSON.stringify(r)));

  console.log('\n4) course.total_lessons (auto-updated by the pre-existing class_modules_sync_counts trigger)...');
  const c = await db.raw('SELECT id, title, total_lessons, total_duration_seconds FROM public.courses');
  c.rows.forEach(r => console.log('   ' + JSON.stringify(r)));

  await db.destroy();
  console.log('\nDone.');
}

run().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
