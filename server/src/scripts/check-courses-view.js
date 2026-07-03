require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
async function run() {
  // Check what columns public.courses has
  const cols = await db.raw(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses'
    ORDER BY ordinal_position
  `);
  console.log('\n=== public.courses columns ===');
  cols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  // Check actual data for Horticulture
  const row = await db.raw(`
    SELECT id, title, total_lessons, enrollment_count, total_duration_seconds
    FROM public.courses
    WHERE title ILIKE '%horticulture%'
  `);
  console.log('\n=== Horticulture course data ===');
  console.log(row.rows[0]);

  // Check igo_lms.courses table columns
  const lmsCols = await db.raw(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'igo_lms' AND table_name = 'courses'
    ORDER BY ordinal_position
  `);
  console.log('\n=== igo_lms.courses columns ===');
  lmsCols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
