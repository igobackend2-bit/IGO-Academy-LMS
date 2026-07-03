require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
async function run() {
  const res = await db.raw(`
    SELECT view_definition
    FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'courses'
  `);
  console.log(res.rows[0]?.view_definition ?? 'NOT A VIEW');
  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
