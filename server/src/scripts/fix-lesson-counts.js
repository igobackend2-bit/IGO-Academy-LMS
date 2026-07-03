/**
 * 1. Updates public.courses.total_lessons + total_duration_seconds
 *    from actual igo_lms.class_modules counts.
 * 2. Creates a trigger to keep the count in sync on module changes.
 * Run: node src/scripts/fix-lesson-counts.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  // Step 1: One-time backfill
  console.log('Backfilling total_lessons and total_duration_seconds...');
  const result = await db.raw(`
    UPDATE public.courses c
    SET
      total_lessons          = sub.cnt,
      total_duration_seconds = sub.dur_secs
    FROM (
      SELECT
        course_id,
        COUNT(*)::int           AS cnt,
        COALESCE(SUM(duration_secs),0)::int AS dur_secs
      FROM igo_lms.class_modules
      WHERE is_published = true
      GROUP BY course_id
    ) sub
    WHERE c.id = sub.course_id
    RETURNING c.id, c.title, c.total_lessons, c.total_duration_seconds
  `);
  result.rows.forEach(r =>
    console.log(`  Updated: ${r.title} → ${r.total_lessons} lessons, ${r.total_duration_seconds}s`)
  );

  // Step 2: Create trigger function
  console.log('\nCreating sync trigger on igo_lms.class_modules...');
  await db.raw(`
    CREATE OR REPLACE FUNCTION igo_lms.sync_course_lesson_count()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    DECLARE
      target_course_id UUID;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        target_course_id := OLD.course_id;
      ELSE
        target_course_id := NEW.course_id;
      END IF;

      UPDATE public.courses
      SET
        total_lessons = (
          SELECT COUNT(*) FROM igo_lms.class_modules
          WHERE course_id = target_course_id AND is_published = true
        ),
        total_duration_seconds = (
          SELECT COALESCE(SUM(duration_secs),0) FROM igo_lms.class_modules
          WHERE course_id = target_course_id AND is_published = true
        ),
        updated_at = NOW()
      WHERE id = target_course_id;

      RETURN NULL;
    END;
    $$;

    DROP TRIGGER IF EXISTS trg_sync_lesson_count ON igo_lms.class_modules;
    CREATE TRIGGER trg_sync_lesson_count
      AFTER INSERT OR UPDATE OR DELETE ON igo_lms.class_modules
      FOR EACH ROW EXECUTE FUNCTION igo_lms.sync_course_lesson_count();
  `);

  console.log('Trigger created: trg_sync_lesson_count on igo_lms.class_modules');

  // Verify
  const after = await db.raw(`SELECT title, total_lessons, total_duration_seconds FROM public.courses ORDER BY title`);
  console.log('\n=== Final counts ===');
  after.rows.forEach(r => console.log(`  ${r.title}: ${r.total_lessons} lessons, ${Math.round(r.total_duration_seconds/60)}min`));

  await db.destroy();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
