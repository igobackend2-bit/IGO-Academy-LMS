/**
 * Creates public.lessons view over igo_lms.class_modules
 * so the Flutter app can query lessons via Supabase PostgREST
 * Run: node src/scripts/create-lessons-view.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('Creating public.lessons view...');

  // Drop whatever exists (table or view) — must be done separately
  await db.raw(`DROP TABLE IF EXISTS public.lessons CASCADE`);
  await db.raw(`DROP VIEW IF EXISTS public.lessons CASCADE`);

  await db.raw(`
    -- Create view mapping igo_lms.class_modules → public.lessons
    CREATE VIEW public.lessons
    WITH (security_invoker = false)
    AS
    SELECT
      m.id,
      m.course_id,
      m.title,
      m.description,
      'video'::text                        AS type,
      m.order_index,
      m.duration_secs                      AS duration_seconds,
      -- video_url: null (video streaming handled separately)
      NULL::text                           AS video_url,
      NULL::text                           AS pdf_url,
      NULL::text                           AS content,
      false                                AS is_preview,
      m.is_published,
      m.created_at,
      m.updated_at
    FROM igo_lms.class_modules m
    WHERE m.is_published = true;

    -- Grant access to Supabase roles
    GRANT SELECT ON public.lessons TO authenticated, anon;
  `);

  // Verify
  const rows = await db.raw('SELECT COUNT(*) FROM public.lessons');
  console.log(`View created. Rows visible: ${rows.rows[0].count}`);

  // Also check course_count column in public.courses view
  console.log('\nChecking public.courses...');
  const courses = await db.raw(`
    SELECT id, title, status FROM public.courses LIMIT 5
  `).catch(() => ({ rows: [] }));
  courses.rows.forEach(c => console.log(`  ${c.title} (${c.status})`));

  await db.destroy();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
