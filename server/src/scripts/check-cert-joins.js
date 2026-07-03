require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
async function run() {
  const u = await db.raw(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='igo_lms' AND table_name='users' ORDER BY ordinal_position LIMIT 10`);
  console.log('igo_lms.users cols:', u.rows.map(r => r.column_name).join(', '));
  const c = await db.raw(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='igo_lms' AND table_name='courses' ORDER BY ordinal_position LIMIT 10`);
  console.log('igo_lms.courses cols:', c.rows.map(r => r.column_name).join(', '));
  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
