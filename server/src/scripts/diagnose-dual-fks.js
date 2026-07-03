/**
 * diagnose-dual-fks.js
 *
 * Audits ALL foreign key constraints in the igo_lms schema and reports:
 *   1. FKs in igo_lms that reference the PUBLIC schema (cross-schema)
 *   2. Columns in igo_lms tables that have BOTH igo_lms AND public FK targets (true duplicates)
 *   3. FKs in PUBLIC schema that reference igo_lms (reverse cross-schema)
 *
 * Run from server/ directory:
 *   node src/scripts/diagnose-dual-fks.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { db } = require('../config/db');

const LMS_SCHEMA = process.env.DB_SCHEMA || 'igo_lms';

async function main() {
  console.log(`\n=== DUAL FK DIAGNOSTIC — schema: ${LMS_SCHEMA} ===\n`);

  // -------------------------------------------------------------------
  // 1. All FKs declared in igo_lms schema (both internal and cross-schema)
  // -------------------------------------------------------------------
  const allLmsFks = await db.raw(`
    SELECT
      tc.constraint_name,
      tc.table_schema    AS source_schema,
      tc.table_name      AS source_table,
      kcu.column_name    AS source_column,
      ccu.table_schema   AS target_schema,
      ccu.table_name     AS target_table,
      ccu.column_name    AS target_column,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints   tc
    JOIN information_schema.key_column_usage    kcu
      ON  kcu.constraint_name = tc.constraint_name
      AND kcu.table_schema    = tc.table_schema
    JOIN information_schema.referential_constraints rc
      ON  rc.constraint_name         = tc.constraint_name
      AND rc.constraint_schema       = tc.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON  ccu.constraint_name = rc.unique_constraint_name
      AND ccu.table_schema    = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = :lmsSchema
    ORDER BY tc.table_name, kcu.column_name, ccu.table_schema
  `, { lmsSchema: LMS_SCHEMA });

  const allFks = allLmsFks.rows;

  console.log(`Total FK constraints in ${LMS_SCHEMA}: ${allFks.length}`);

  // -------------------------------------------------------------------
  // 2. FKs in igo_lms → public (cross-schema, candidates to DROP)
  // -------------------------------------------------------------------
  const crossToPublic = allFks.filter(r => r.target_schema === 'public');

  console.log(`\n--- [A] ${LMS_SCHEMA} → public cross-schema FKs (${crossToPublic.length}) ---`);
  if (crossToPublic.length === 0) {
    console.log('  None found.');
  } else {
    for (const r of crossToPublic) {
      console.log(
        `  DROP: ${r.constraint_name}\n` +
        `        ${r.source_schema}.${r.source_table}.${r.source_column}` +
        ` → public.${r.target_table}.${r.target_column}` +
        `  [ON DELETE ${r.delete_rule}]`
      );
    }
  }

  // -------------------------------------------------------------------
  // 3. Identify true duplicate columns (same table+column → BOTH schemas)
  // -------------------------------------------------------------------
  console.log(`\n--- [B] Columns with DUAL FKs (→ both ${LMS_SCHEMA} and public) ---`);

  // Group by source_table + source_column
  const byTableCol = {};
  for (const r of allFks) {
    const key = `${r.source_table}.${r.source_column}`;
    if (!byTableCol[key]) byTableCol[key] = [];
    byTableCol[key].push(r);
  }

  let dualCount = 0;
  for (const [key, fks] of Object.entries(byTableCol)) {
    const schemas = fks.map(f => f.target_schema);
    if (schemas.includes('public') && schemas.includes(LMS_SCHEMA)) {
      dualCount++;
      console.log(`  DUAL: ${LMS_SCHEMA}.${key}`);
      for (const f of fks) {
        const action = f.target_schema === 'public' ? '  [REMOVE]' : '  [KEEP]  ';
        console.log(
          `    ${action} ${f.constraint_name}` +
          ` → ${f.target_schema}.${f.target_table}.${f.target_column}` +
          ` [ON DELETE ${f.delete_rule}]`
        );
      }
    }
  }
  if (dualCount === 0) console.log('  None found.');

  // -------------------------------------------------------------------
  // 4. FKs in public schema → igo_lms (reverse cross-schema)
  // -------------------------------------------------------------------
  const reverseCheck = await db.raw(`
    SELECT
      tc.constraint_name,
      tc.table_schema    AS source_schema,
      tc.table_name      AS source_table,
      kcu.column_name    AS source_column,
      ccu.table_schema   AS target_schema,
      ccu.table_name     AS target_table,
      ccu.column_name    AS target_column,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints   tc
    JOIN information_schema.key_column_usage    kcu
      ON  kcu.constraint_name = tc.constraint_name
      AND kcu.table_schema    = tc.table_schema
    JOIN information_schema.referential_constraints rc
      ON  rc.constraint_name   = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON  ccu.constraint_name = rc.unique_constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = 'public'
      AND ccu.table_schema   = :lmsSchema
    ORDER BY tc.table_name, kcu.column_name
  `, { lmsSchema: LMS_SCHEMA });

  const reversePublic = reverseCheck.rows;
  console.log(`\n--- [C] public → ${LMS_SCHEMA} reverse cross-schema FKs (${reversePublic.length}) ---`);
  if (reversePublic.length === 0) {
    console.log('  None found.');
  } else {
    for (const r of reversePublic) {
      console.log(
        `  ${r.constraint_name}\n` +
        `    public.${r.source_table}.${r.source_column}` +
        ` → ${r.target_schema}.${r.target_table}.${r.target_column}` +
        `  [ON DELETE ${r.delete_rule}]`
      );
    }
  }

  // -------------------------------------------------------------------
  // 5. Summary
  // -------------------------------------------------------------------
  console.log('\n=== SUMMARY ===');
  console.log(`  Total FKs in ${LMS_SCHEMA}:             ${allFks.length}`);
  console.log(`  ${LMS_SCHEMA} → public (cross-schema):  ${crossToPublic.length}  ← candidates to DROP`);
  console.log(`  Columns with dual FKs:               ${dualCount}`);
  console.log(`  public → ${LMS_SCHEMA} (reverse):       ${reversePublic.length}  ← report only`);

  // Print JSON blob for fix script consumption
  console.log('\n=== CONSTRAINT NAMES TO DROP (JSON) ===');
  console.log(JSON.stringify(crossToPublic.map(r => ({
    constraintName: r.constraint_name,
    sourceTable:    r.source_table,
    sourceColumn:   r.source_column,
    targetSchema:   r.target_schema,
    targetTable:    r.target_table,
    deleteRule:     r.delete_rule,
  })), null, 2));
}

main()
  .then(() => { console.log('\nDiagnostic complete.'); process.exit(0); })
  .catch(err => { console.error('\nDiagnostic FAILED:', err.message); process.exit(1); });
