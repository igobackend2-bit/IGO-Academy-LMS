require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
async function run() {
  const rows = await db('igo_lms.class_modules')
    .where('course_id', '9cd02d2f-6e26-4c3f-881e-1eca98bdb2db')
    .select('id','title','video_s3_key','is_published','order_index');
  rows.forEach(r => console.log(JSON.stringify(r)));
  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
