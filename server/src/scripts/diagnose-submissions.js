/**
 * Diagnostic: compare igo_lms.submissions vs public.assessment_submissions vs public.submissions
 * Run from server/: node src/scripts/diagnose-submissions.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n=== TABLE SCHEMAS ===\n');

  const schemas = [
    { schema: 'igo_lms', table: 'submissions' },
    { schema: 'public',  table: 'submissions' },
    { schema: 'public',  table: 'assessment_submissions' },
    { schema: 'igo_lms', table: 'attendance' },
    { schema: 'public',  table: 'attendance' },
  ];

  for (const { schema, table } of schemas) {
    const cols = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = ? AND table_name = ?
      ORDER BY ordinal_position
    `, [schema, table]);

    if (cols.rows.length === 0) {
      console.log(`${schema}.${table} — NOT FOUND or no columns`);
    } else {
      console.log(`${schema}.${table} (${cols.rows.length} columns):`);
      cols.rows.forEach(r => console.log(`  ${r.column_name.padEnd(25)} ${r.data_type.padEnd(20)} nullable=${r.is_nullable}`));
    }
    console.log();
  }

  // Check if public.assessment_submissions and public.attendance are VIEWs or BASE TABLEs
  console.log('=== TABLE vs VIEW CHECK ===\n');
  const typeCheck = await db.raw(`
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE (table_schema = 'public' AND table_name IN ('submissions','assessment_submissions','attendance'))
       OR (table_schema = 'igo_lms' AND table_name IN ('submissions','attendance'))
    ORDER BY table_schema, table_name
  `);
  typeCheck.rows.forEach(r => console.log(`  ${r.table_schema}.${r.table_name.padEnd(30)} ${r.table_type}`));
  console.log();

  console.log('=== ROW COUNTS ===\n');
  for (const { schema, table } of schemas) {
    try {
      const res = await db.raw(`SELECT COUNT(*) FROM "${schema}"."${table}"`);
      console.log(`  ${schema}.${table}: ${res.rows[0].count} rows`);
    } catch (e) {
      console.log(`  ${schema}.${table}: ERROR — ${e.message}`);
    }
  }
  console.log();

  console.log('=== SAMPLE DATA: igo_lms.submissions ===\n');
  try {
    const rows = await db.raw(`SELECT id, assessment_id, student_id, score, status, attempt_number, submitted_at FROM igo_lms.submissions ORDER BY submitted_at DESC LIMIT 10`);
    console.table(rows.rows);
  } catch (e) { console.error(e.message); }

  console.log('\n=== SAMPLE DATA: public.assessment_submissions ===\n');
  try {
    const rows = await db.raw(`SELECT * FROM public.assessment_submissions ORDER BY submitted_at DESC LIMIT 10`);
    console.table(rows.rows);
  } catch (e) { console.error(e.message); }

  console.log('\n=== RLS POLICIES on public.assessment_submissions ===\n');
  try {
    const rows = await db.raw(`
      SELECT policyname, cmd, roles, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'assessment_submissions'
    `);
    if (rows.rows.length === 0) console.log('  (no RLS policies)');
    rows.rows.forEach(r => {
      console.log(`  Policy: ${r.policyname}`);
      console.log(`    cmd: ${r.cmd}  roles: ${JSON.stringify(r.roles)}`);
      console.log(`    USING: ${r.qual}`);
      console.log(`    WITH CHECK: ${r.with_check}`);
    });
  } catch (e) { console.error(e.message); }

  console.log('\n=== RLS POLICIES on igo_lms.submissions ===\n');
  try {
    const rows = await db.raw(`
      SELECT policyname, cmd, roles
      FROM pg_policies
      WHERE schemaname = 'igo_lms' AND tablename = 'submissions'
    `);
    if (rows.rows.length === 0) console.log('  (no RLS policies)');
    rows.rows.forEach(r => console.log(`  ${r.policyname} | ${r.cmd} | ${JSON.stringify(r.roles)}`));
  } catch (e) { console.error(e.message); }

  console.log('\n=== SAMPLE DATA: igo_lms.attendance ===\n');
  try {
    const rows = await db.raw(`SELECT * FROM igo_lms.attendance LIMIT 5`);
    console.table(rows.rows);
  } catch (e) { console.error(e.message); }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
