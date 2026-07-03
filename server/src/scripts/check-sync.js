require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
async function run() {
  // Are courses in both schemas?
  const pub = await db.raw(`SELECT id, title, status, total_lessons FROM public.courses ORDER BY title`);
  const lms = await db.raw(`SELECT id, title, is_active FROM igo_lms.courses ORDER BY title`);
  console.log('\n=== public.courses ===');
  pub.rows.forEach(r => console.log(`  [${r.total_lessons} lessons] ${r.title} (${r.status}) id=${r.id}`));
  console.log('\n=== igo_lms.courses ===');
  lms.rows.forEach(r => console.log(`  ${r.title} (active=${r.is_active}) id=${r.id}`));

  // Check triggers on public.courses or igo_lms.courses
  const triggers = await db.raw(`
    SELECT trigger_name, event_object_schema, event_object_table, event_manipulation
    FROM information_schema.triggers
    WHERE event_object_schema IN ('public','igo_lms')
    ORDER BY event_object_table
  `);
  console.log('\n=== Triggers ===');
  if (triggers.rows.length === 0) console.log('  No triggers found');
  else triggers.rows.forEach(t => console.log(`  ${t.event_object_schema}.${t.event_object_table}: ${t.event_manipulation} → ${t.trigger_name}`));

  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
