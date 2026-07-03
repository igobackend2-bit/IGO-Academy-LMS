require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  const cols = await db.raw(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'igo_lms' AND table_name = 'enrollments'
    ORDER BY ordinal_position
  `);
  console.log('=== igo_lms.enrollments columns ===');
  cols.rows.forEach(c =>
    console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default || 'none'}`)
  );

  const sample = await db.raw('SELECT * FROM igo_lms.enrollments LIMIT 3');
  console.log('\n=== Sample igo_lms.enrollments rows ===');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));

  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
