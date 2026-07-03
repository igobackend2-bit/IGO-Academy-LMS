require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
async function run() {
  const r = await db.raw(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position`);
  console.log('=== public.users columns ===');
  r.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

  const sample = await db.raw(`SELECT * FROM public.users LIMIT 2`);
  console.log('\n=== sample rows ===');
  sample.rows.forEach(r => console.log(JSON.stringify(r)));

  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
