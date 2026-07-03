/**
 * Diagnose full RLS policy definitions for the IGO Academy LMS.
 * Shows qual (USING) and with_check (WITH CHECK) expressions for each policy,
 * plus RLS-enabled status for every public table/view.
 *
 * Run: node src/scripts/diagnose-rls-policies.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  // 1. All public tables and their RLS enabled status
  const rlsStatus = await db.raw(`
    SELECT
      c.relname AS table_name,
      c.relkind,
      CASE c.relkind
        WHEN 'r' THEN 'TABLE'
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATVIEW'
        ELSE c.relkind::text
      END AS kind,
      c.relrowsecurity AS rls_enabled,
      c.relforcerowsecurity AS rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'v')
    ORDER BY c.relkind DESC, c.relname
  `);

  // 2. Full policy definitions with USING and WITH CHECK expressions
  const policies = await db.raw(`
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles::text,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage', 'igo_lms')
    ORDER BY schemaname, tablename, cmd, policyname
  `);

  // 3. Check view definitions to understand security context
  const viewDefs = await db.raw(`
    SELECT
      v.table_name,
      v.view_definition,
      CASE WHEN c.reloptions IS NOT NULL THEN c.reloptions::text ELSE '(default)' END AS options
    FROM information_schema.views v
    JOIN pg_class c ON c.relname = v.table_name
    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = v.table_schema
    WHERE v.table_schema = 'public'
    ORDER BY v.table_name
  `);

  // 4. Check underlying tables for the views (to know if their RLS matters)
  const viewUnderlying = await db.raw(`
    SELECT DISTINCT
      v.table_name AS view_name,
      d.refobjid::regclass AS underlying_table
    FROM information_schema.views v
    JOIN pg_class vc ON vc.relname = v.table_name
    JOIN pg_namespace vn ON vn.oid = vc.relnamespace AND vn.nspname = v.table_schema
    JOIN pg_depend d ON d.objid = vc.oid AND d.deptype = 'i'
    JOIN pg_class tc ON tc.oid = d.refobjid AND tc.relkind = 'r'
    WHERE v.table_schema = 'public'
    ORDER BY v.table_name
  `);

  // 5. Check if categories table exists and its RLS status
  const categoriesCheck = await db.raw(`
    SELECT EXISTS(
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'categories'
    ) AS table_exists,
    EXISTS(
      SELECT 1 FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'categories'
    ) AS view_exists
  `);

  // ── Output ──────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  IGO ACADEMY — FULL RLS POLICY DIAGNOSTIC');
  console.log('════════════════════════════════════════════════════════════════\n');

  console.log('── public TABLES & VIEWS — RLS STATUS ─────────────────────────');
  rlsStatus.rows.forEach(r => {
    const rlsBadge = r.rls_enabled ? '[RLS ON]' : '[RLS OFF]';
    const forceBadge = r.rls_forced ? ' [FORCE]' : '';
    console.log(`  ${r.kind.padEnd(6)} ${r.table_name.padEnd(35)} ${rlsBadge}${forceBadge}`);
  });

  console.log('\n── FULL POLICY DEFINITIONS ─────────────────────────────────────');
  if (policies.rows.length === 0) {
    console.log('  (no policies found)');
  } else {
    let lastSchema = null, lastTable = null;
    policies.rows.forEach(p => {
      if (p.schemaname !== lastSchema || p.tablename !== lastTable) {
        console.log(`\n  ${p.schemaname}.${p.tablename}`);
        lastSchema = p.schemaname;
        lastTable = p.tablename;
      }
      console.log(`    ├─ [${p.cmd}] "${p.policyname}"`);
      console.log(`    │  permissive: ${p.permissive}  roles: ${p.roles}`);
      console.log(`    │  USING:      ${p.qual || '(none)'}`);
      console.log(`    │  WITH CHECK: ${p.with_check || '(none)'}`);
    });
  }

  console.log('\n── VIEW DEFINITIONS (public) ───────────────────────────────────');
  viewDefs.rows.forEach(v => {
    console.log(`\n  VIEW: public.${v.table_name}`);
    console.log(`  Options: ${v.options}`);
    // Truncate long definitions
    const def = (v.view_definition || '').replace(/\s+/g, ' ').trim();
    console.log(`  Definition: ${def.length > 300 ? def.substring(0, 300) + '...' : def}`);
  });

  console.log('\n── VIEW → UNDERLYING TABLE DEPENDENCIES ────────────────────────');
  if (viewUnderlying.rows.length === 0) {
    console.log('  (no dependencies found via pg_depend)');
  } else {
    viewUnderlying.rows.forEach(r =>
      console.log(`  ${r.view_name.padEnd(30)} → ${r.underlying_table}`)
    );
  }

  console.log('\n── categories TABLE/VIEW CHECK ─────────────────────────────────');
  const cat = categoriesCheck.rows[0];
  console.log(`  As TABLE: ${cat.table_exists ? 'EXISTS' : 'NOT FOUND'}`);
  console.log(`  As VIEW:  ${cat.view_exists ? 'EXISTS' : 'NOT FOUND'}`);

  console.log('\n════════════════════════════════════════════════════════════════\n');

  await db.destroy();
}

run().catch(e => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
