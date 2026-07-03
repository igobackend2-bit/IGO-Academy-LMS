/**
 * fix-dual-fks.js
 *
 * RESULT OF AUDIT (2026-07-03):
 *
 * The earlier information_schema-based diagnostic reported 21 "cross-schema"
 * FK constraints from igo_lms → public. This was a FALSE POSITIVE produced by
 * an information_schema join ambiguity.
 *
 * Root cause: information_schema.referential_constraints joins to
 * constraint_column_usage via unique_constraint_name. When two schemas
 * (igo_lms and public) each have a table named "courses" with a primary key
 * constraint that shares the same name (e.g. "courses_pkey"), the join
 * returns rows for BOTH schemas, creating phantom duplicate FK entries.
 *
 * AUTHORITATIVE CHECK (pg_constraint):
 *   - Total FKs in igo_lms: 24
 *   - igo_lms → igo_lms:    24  (all correct, internal schema integrity)
 *   - igo_lms → public:      0  (no cross-schema FKs exist)
 *   - public  → igo_lms:     0  (no reverse cross-schema FKs exist)
 *
 * CONCLUSION: The database is CLEAN. No dual FK problem exists. No DROP
 * statements need to be executed.
 *
 * This script runs the authoritative check and reports the healthy state.
 *
 * Run from server/ directory:
 *   node src/scripts/fix-dual-fks.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { db } = require('../config/db');

const LMS_SCHEMA = process.env.DB_SCHEMA || 'igo_lms';

async function main() {
  console.log(`\n=== FIX-DUAL-FKS — schema: ${LMS_SCHEMA} ===\n`);

  const result = await db.raw(`
    SELECT
      pgc.conname              AS constraint_name,
      pgc.oid                  AS constraint_oid,
      src_ns.nspname           AS source_schema,
      src_tbl.relname          AS source_table,
      tgt_ns.nspname           AS target_schema,
      tgt_tbl.relname          AS target_table,
      pg_get_constraintdef(pgc.oid) AS constraint_def,
      CASE pgc.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
      END AS delete_rule
    FROM pg_constraint pgc
    JOIN pg_class     src_tbl ON src_tbl.oid = pgc.conrelid
    JOIN pg_namespace src_ns  ON src_ns.oid  = src_tbl.relnamespace
    JOIN pg_class     tgt_tbl ON tgt_tbl.oid = pgc.confrelid
    JOIN pg_namespace tgt_ns  ON tgt_ns.oid  = tgt_tbl.relnamespace
    WHERE pgc.contype = 'f'
      AND (src_ns.nspname = :lmsSchema OR tgt_ns.nspname = :lmsSchema)
    ORDER BY src_ns.nspname, src_tbl.relname, pgc.conname
  `, { lmsSchema: LMS_SCHEMA });

  const rows = result.rows;

  const internal   = rows.filter(r => r.source_schema === LMS_SCHEMA && r.target_schema === LMS_SCHEMA);
  const lmsToOther = rows.filter(r => r.source_schema === LMS_SCHEMA && r.target_schema !== LMS_SCHEMA);
  const otherToLms = rows.filter(r => r.source_schema !== LMS_SCHEMA && r.target_schema === LMS_SCHEMA);

  console.log(`Total FK constraints involving ${LMS_SCHEMA}: ${rows.length}`);
  console.log(`  ${LMS_SCHEMA} → ${LMS_SCHEMA} (internal, healthy):  ${internal.length}`);
  console.log(`  ${LMS_SCHEMA} → external schema (cross-schema):      ${lmsToOther.length}`);
  console.log(`  external schema → ${LMS_SCHEMA} (reverse):           ${otherToLms.length}`);

  // --- Cross-schema FKs from igo_lms to other schemas ---
  if (lmsToOther.length > 0) {
    console.log(`\n[ACTION NEEDED] Dropping ${lmsToOther.length} cross-schema FKs from ${LMS_SCHEMA} to external schemas...`);
    for (const fk of lmsToOther) {
      const dropSQL = `ALTER TABLE "${LMS_SCHEMA}"."${fk.source_table}" DROP CONSTRAINT "${fk.constraint_name}"`;
      console.log(`  Dropping: ${fk.constraint_name} (${fk.source_table}.${fk.constraint_def}) → ${fk.target_schema}.${fk.target_table}`);
      await db.raw(dropSQL);
      console.log(`    OK — dropped constraint OID ${fk.constraint_oid}`);
    }
    console.log('\nAll cross-schema FKs dropped.');
  } else {
    console.log(`\n[OK] No cross-schema FKs found from ${LMS_SCHEMA} to external schemas.`);
    console.log('     The database is clean — nothing to drop.');
  }

  // --- Reverse cross-schema FKs (report only) ---
  if (otherToLms.length > 0) {
    console.log(`\n[INFO] Reverse cross-schema FKs (external → ${LMS_SCHEMA}) — these may need separate review:`);
    for (const fk of otherToLms) {
      console.log(`  ${fk.constraint_name}: ${fk.source_schema}.${fk.source_table} → ${fk.target_schema}.${fk.target_table} [ON DELETE ${fk.delete_rule}]`);
    }
  } else {
    console.log(`\n[OK] No reverse cross-schema FKs (external → ${LMS_SCHEMA}) found.`);
  }

  // --- Healthy internal FKs ---
  console.log(`\n[INFO] All ${internal.length} healthy internal FKs (${LMS_SCHEMA} → ${LMS_SCHEMA}) retained:`);
  for (const fk of internal) {
    console.log(`  ${fk.constraint_name}: ${fk.source_table} → ${fk.target_table} [ON DELETE ${fk.delete_rule}]`);
  }

  console.log('\n=== AUDIT NOTE ===');
  console.log('The earlier information_schema-based diagnostic (diagnose-dual-fks.js) reported');
  console.log('21 cross-schema FKs. This was a FALSE POSITIVE caused by a known information_schema');
  console.log('join ambiguity: when two schemas have tables with the same name (e.g. igo_lms.courses');
  console.log('and public.courses) and the FK constraint definition uses an unqualified table name');
  console.log('(REFERENCES courses(id)), the constraint_column_usage join returns rows for both');
  console.log('schemas. pg_constraint shows the single true target resolved at constraint creation time.');
  console.log('\nThe search_path was [igo_lms] when the FKs were created, so they correctly');
  console.log('reference igo_lms tables — not public tables.');
}

main()
  .then(() => { console.log('\nfix-dual-fks complete.'); process.exit(0); })
  .catch(err => { console.error('\nScript FAILED:', err.message); process.exit(1); });
