require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  const cols = await db.raw(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'enrollments'
    ORDER BY ordinal_position
  `);
  console.log('=== public.enrollments columns ===');
  cols.rows.forEach(c =>
    console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default || 'none'}`)
  );

  const func = await db.raw(`
    SELECT p.proname, p.prosrc
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'sync_lms_enrollment_to_app'
    LIMIT 1
  `);
  if (func.rows.length > 0) {
    console.log('\n=== Trigger function: sync_lms_enrollment_to_app ===');
    console.log(func.rows[0].prosrc);
  } else {
    console.log('\nTrigger function sync_lms_enrollment_to_app NOT found in pg_proc');
  }

  const sample = await db.raw('SELECT * FROM public.enrollments LIMIT 3');
  console.log('\n=== Sample public.enrollments rows ===');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));

  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
