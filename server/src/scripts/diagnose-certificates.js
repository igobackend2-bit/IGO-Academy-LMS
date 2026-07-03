/**
 * Diagnose certificate tables: compare igo_lms.certificates vs public.certificates
 * Run: node src/scripts/diagnose-certificates.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  CERTIFICATE VISIBILITY DIAGNOSTIC');
  console.log('════════════════════════════════════════════════════════\n');

  // 1. igo_lms.certificates schema
  const lmsCols = await db.raw(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='igo_lms' AND table_name='certificates'
    ORDER BY ordinal_position
  `);

  console.log('── igo_lms.certificates COLUMNS ────────────────────────');
  if (lmsCols.rows.length === 0) {
    console.log('  *** TABLE DOES NOT EXIST ***');
  } else {
    lmsCols.rows.forEach(c =>
      console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(25)} nullable:${c.is_nullable}`)
    );
  }

  // 2. public.certificates schema + type
  const pubType = await db.raw(`
    SELECT table_type FROM information_schema.tables
    WHERE table_schema='public' AND table_name='certificates'
  `);

  const pubCols = await db.raw(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='certificates'
    ORDER BY ordinal_position
  `);

  console.log('\n── public.certificates TYPE & COLUMNS ──────────────────');
  if (pubType.rows.length === 0) {
    console.log('  *** DOES NOT EXIST (neither table nor view) ***');
  } else {
    console.log(`  Object type: ${pubType.rows[0].table_type}`);
    pubCols.rows.forEach(c =>
      console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(25)} nullable:${c.is_nullable}`)
    );
  }

  // 3. RLS policies on public.certificates
  const policies = await db.raw(`
    SELECT policyname, cmd, roles::text, qual, with_check
    FROM pg_policies
    WHERE schemaname='public' AND tablename='certificates'
  `);

  console.log('\n── public.certificates RLS POLICIES ────────────────────');
  if (policies.rows.length === 0) {
    console.log('  (none)');
  } else {
    policies.rows.forEach(p =>
      console.log(`  [${p.cmd}] "${p.policyname}"  roles:${p.roles}\n    USING: ${p.qual}\n    WITH CHECK: ${p.with_check}`)
    );
  }

  // 4. igo_lms.certificates RLS policies
  const lmsPolicies = await db.raw(`
    SELECT policyname, cmd, roles::text, qual, with_check
    FROM pg_policies
    WHERE schemaname='igo_lms' AND tablename='certificates'
  `);

  console.log('\n── igo_lms.certificates RLS POLICIES ───────────────────');
  if (lmsPolicies.rows.length === 0) {
    console.log('  (none)');
  } else {
    lmsPolicies.rows.forEach(p =>
      console.log(`  [${p.cmd}] "${p.policyname}"  roles:${p.roles}\n    USING: ${p.qual}`)
    );
  }

  // 5. Actual data in igo_lms.certificates
  console.log('\n── igo_lms.certificates DATA (up to 10 rows) ───────────');
  try {
    const data = await db.raw(`SELECT * FROM igo_lms.certificates LIMIT 10`);
    console.log(`  Row count: ${data.rows.length}`);
    if (data.rows.length > 0) {
      console.log('  Columns present:', Object.keys(data.rows[0]).join(', '));
      data.rows.forEach((r, i) => console.log(`  [${i+1}]`, JSON.stringify(r)));
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // 6. Row count in public.certificates
  console.log('\n── public.certificates ROW COUNT ───────────────────────');
  try {
    const cnt = await db.raw(`SELECT COUNT(*) FROM public.certificates`);
    console.log(`  Rows: ${cnt.rows[0].count}`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // 7. Grants on public.certificates
  const grants = await db.raw(`
    SELECT grantee, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='certificates'
    ORDER BY grantee, privilege_type
  `);

  console.log('\n── public.certificates GRANTS ──────────────────────────');
  if (grants.rows.length === 0) {
    console.log('  (none)');
  } else {
    grants.rows.forEach(g => console.log(`  ${g.grantee}: ${g.privilege_type}`));
  }

  console.log('\n════════════════════════════════════════════════════════\n');
  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
