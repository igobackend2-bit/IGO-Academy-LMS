/**
 * add-featured-rank-column.js
 *
 * One-off: adds public.courses.featured_rank (integer, nullable) — the
 * Supabase-side counterpart to igo_lms.courses.featured_rank added by
 * migration 20260831000001_add_featured_to_courses.js. public.courses
 * already has `is_featured boolean` (pre-existing default), so only the
 * rank column is new here.
 *
 * Idempotent — safe to run more than once.
 *
 * Run from the server directory:
 *   node src/scripts/add-featured-rank-column.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  ADD — public.courses.featured_rank');
  console.log('════════════════════════════════════════════════════════\n');

  const before = await db.raw(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'featured_rank'
  `);

  if (before.rows.length > 0) {
    console.log('  featured_rank already exists on public.courses — nothing to do.');
    await db.destroy();
    return;
  }

  await db.raw(`ALTER TABLE public.courses ADD COLUMN featured_rank integer`);
  console.log('  Added public.courses.featured_rank (integer, nullable).');

  const after = await db.raw(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name IN ('is_featured','featured_rank')
    ORDER BY column_name
  `);
  console.log('\n── Verified ─────────────────────────────────────────────');
  after.rows.forEach(r => console.log(`  ${r.column_name.padEnd(20)} ${r.data_type}`));

  await db.destroy();
}

run().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
