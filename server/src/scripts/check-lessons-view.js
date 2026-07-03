require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  // Check all courses with their lesson counts
  console.log('\n=== Courses with lesson counts ===');
  const counts = await db.raw(`
    SELECT c.id, c.title, COUNT(l.id) AS lesson_count
    FROM public.courses c
    LEFT JOIN public.lessons l ON l.course_id = c.id
    GROUP BY c.id, c.title
    ORDER BY c.title
  `);
  counts.rows.forEach(r => console.log(`  [${r.lesson_count}] ${r.title} (${r.id})`));

  // Show sample lessons with video_s3_key
  console.log('\n=== Sample lessons (video keys) ===');
  const lessons = await db.raw(`
    SELECT m.id, m.course_id, m.title, m.video_s3_key, m.duration_secs
    FROM igo_lms.class_modules m
    WHERE m.is_published = true
    LIMIT 10
  `);
  lessons.rows.forEach(r =>
    console.log(`  ${r.title} | key: ${r.video_s3_key} | dur: ${r.duration_secs}s`)
  );

  await db.destroy();
}

run().catch(e => { console.error(e.message); process.exit(1); });
