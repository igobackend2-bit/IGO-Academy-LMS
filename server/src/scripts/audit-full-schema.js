/**
 * Full schema inventory: lists all tables, views, triggers, RLS policies,
 * and cross-schema bridges between igo_lms and public.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  // 1. All tables in igo_lms
  const lmsTables = await db.raw(`
    SELECT table_name,
           (SELECT COUNT(*) FROM information_schema.columns c2
            WHERE c2.table_schema='igo_lms' AND c2.table_name=t.table_name) AS col_count
    FROM information_schema.tables t
    WHERE table_schema='igo_lms' AND table_type='BASE TABLE'
    ORDER BY table_name
  `);

  // 2. All tables in public
  const pubTables = await db.raw(`
    SELECT table_name,
           (SELECT COUNT(*) FROM information_schema.columns c2
            WHERE c2.table_schema='public' AND c2.table_name=t.table_name) AS col_count
    FROM information_schema.tables t
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name
  `);

  // 3. All views in public
  const pubViews = await db.raw(`
    SELECT table_name FROM information_schema.views
    WHERE table_schema='public' ORDER BY table_name
  `);

  // 4. All views in igo_lms
  const lmsViews = await db.raw(`
    SELECT table_name FROM information_schema.views
    WHERE table_schema='igo_lms' ORDER BY table_name
  `);

  // 5. All triggers
  const triggers = await db.raw(`
    SELECT trigger_name, event_object_schema, event_object_table, event_manipulation, action_timing
    FROM information_schema.triggers
    WHERE event_object_schema IN ('public','igo_lms','storage','auth')
    ORDER BY event_object_schema, event_object_table
  `);

  // 6. RLS policies on storage.objects + public tables
  const policies = await db.raw(`
    SELECT schemaname, tablename, policyname, cmd, roles::text
    FROM pg_policies
    WHERE schemaname IN ('public','storage','igo_lms')
    ORDER BY schemaname, tablename
  `);

  // 7. Row counts for each igo_lms table
  const lmsTableNames = lmsTables.rows.map(r => r.table_name);
  const counts = {};
  for (const tbl of lmsTableNames) {
    try {
      const r = await db.raw(`SELECT COUNT(*) FROM igo_lms.${tbl}`);
      counts[tbl] = r.rows[0].count;
    } catch (e) { counts[tbl] = `ERR:${e.message.split('\n')[0]}`; }
  }

  // 8. Row counts for public tables
  const pubTableNames = pubTables.rows.map(r => r.table_name);
  const pubCounts = {};
  for (const tbl of pubTableNames) {
    try {
      const r = await db.raw(`SELECT COUNT(*) FROM public.${tbl}`);
      pubCounts[tbl] = r.rows[0].count;
    } catch (e) { pubCounts[tbl] = `ERR:${e.message.split('\n')[0]}`; }
  }

  // 9. Foreign keys in igo_lms
  const fkeys = await db.raw(`
    SELECT
      tc.table_name AS from_table,
      kcu.column_name AS from_col,
      ccu.table_schema AS to_schema,
      ccu.table_name AS to_table,
      ccu.column_name AS to_col,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = rc.unique_constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema IN ('igo_lms','public')
    ORDER BY tc.table_name
  `);

  // 10. Check which Flutter tables exist in public but NOT as views over igo_lms
  const flutterExpected = [
    'users','courses','enrollments','lessons','assessments','resources',
    'certificates','notifications','lesson_progress','quiz_attempts',
    'quizzes','quiz_questions','categories','attendance'
  ];

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  IGO ACADEMY — FULL SCHEMA AUDIT');
  console.log('════════════════════════════════════════════════════════\n');

  console.log('── igo_lms TABLES ──────────────────────────────────────');
  lmsTables.rows.forEach(r => console.log(`  ${r.table_name.padEnd(35)} cols:${r.col_count}  rows:${counts[r.table_name]}`));

  console.log('\n── public TABLES ───────────────────────────────────────');
  pubTables.rows.forEach(r => console.log(`  ${r.table_name.padEnd(35)} cols:${r.col_count}  rows:${pubCounts[r.table_name]}`));

  console.log('\n── public VIEWS ────────────────────────────────────────');
  pubViews.rows.forEach(r => console.log(`  ${r.table_name}`));

  console.log('\n── igo_lms VIEWS ───────────────────────────────────────');
  if (lmsViews.rows.length === 0) console.log('  (none)');
  else lmsViews.rows.forEach(r => console.log(`  ${r.table_name}`));

  console.log('\n── TRIGGERS ────────────────────────────────────────────');
  if (triggers.rows.length === 0) console.log('  (none)');
  else triggers.rows.forEach(t =>
    console.log(`  ${t.event_object_schema}.${t.event_object_table}: ${t.action_timing} ${t.event_manipulation} → ${t.trigger_name}`)
  );

  console.log('\n── RLS POLICIES ────────────────────────────────────────');
  if (policies.rows.length === 0) console.log('  (none)');
  else policies.rows.forEach(p =>
    console.log(`  ${p.schemaname}.${p.tablename}: [${p.cmd}] "${p.policyname}" → roles:${p.roles}`)
  );

  console.log('\n── FOREIGN KEYS ────────────────────────────────────────');
  fkeys.rows.forEach(f =>
    console.log(`  ${f.from_table}.${f.from_col} → ${f.to_schema}.${f.to_table}.${f.to_col} [${f.delete_rule}]`)
  );

  console.log('\n── FLUTTER EXPECTED vs PUBLIC SCHEMA ───────────────────');
  const allPublic = [...pubTables.rows.map(r=>r.table_name), ...pubViews.rows.map(r=>r.table_name)];
  flutterExpected.forEach(t => {
    const exists = allPublic.includes(t);
    console.log(`  ${exists ? '✓' : '✗ MISSING'} public.${t}`);
  });

  console.log('\n════════════════════════════════════════════════════════\n');
  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
