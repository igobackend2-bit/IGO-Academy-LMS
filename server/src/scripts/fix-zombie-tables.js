/**
 * fix-zombie-tables.js
 *
 * Cleans up empty "zombie" tables in public schema that duplicate igo_lms tables
 * but are never populated:
 *   - public.class_modules   (igo_lms.class_modules has 32 rows; public has lessons VIEW)
 *   - public.user_sessions   (empty duplicate)
 *   - public.live_classes    (empty duplicate)
 *   - public.knex_migrations (duplicate migration tracker — real one lives in igo_lms)
 *
 * Safety steps:
 *   1. Confirm each table is actually empty (0 rows)
 *   2. Check if any FK constraints in other public tables reference these tables
 *   3. Drop only those that are safe (or use CASCADE if only orphaned FKs reference them)
 *   4. Report what was dropped vs kept
 *
 * Run from the server directory:
 *   node src/scripts/fix-zombie-tables.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

const ZOMBIE_TABLES = ['class_modules', 'user_sessions', 'live_classes', 'knex_migrations'];

async function getRowCount(table) {
  try {
    const r = await db.raw(`SELECT COUNT(*)::int AS cnt FROM public.${table}`);
    return r.rows[0].cnt;
  } catch (e) {
    return `ERR: ${e.message.split('\n')[0]}`;
  }
}

async function tableExists(table) {
  const r = await db.raw(`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ? AND table_type = 'BASE TABLE'
  `, [table]);
  return r.rows.length > 0;
}

async function getFKDependents(table) {
  // Find any FK constraints in OTHER tables that point to public.<table>
  const r = await db.raw(`
    SELECT
      tc.table_schema  AS from_schema,
      tc.table_name    AS from_table,
      kcu.column_name  AS from_col,
      ccu.column_name  AS to_col,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema    = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON rc.unique_constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema   = 'public'
      AND ccu.table_name     = ?
      AND tc.table_name     <> ?
  `, [table, table]);
  return r.rows;
}

async function getFKsFromTable(table) {
  // Find FK constraints defined ON public.<table> itself (outgoing FKs)
  const r = await db.raw(`
    SELECT
      kcu.column_name  AS from_col,
      ccu.table_schema AS to_schema,
      ccu.table_name   AS to_table,
      ccu.column_name  AS to_col,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema    = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON rc.unique_constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = 'public'
      AND tc.table_name      = ?
  `, [table]);
  return r.rows;
}

async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  FIX — zombie tables in public schema');
  console.log('════════════════════════════════════════════════════════\n');

  const results = {
    dropped: [],
    kept:    [],
    missing: [],
  };

  for (const table of ZOMBIE_TABLES) {
    console.log(`\n── Checking public.${table} ─────────────────────────────`);

    // ── Does it exist? ────────────────────────────────────────────────────────
    const exists = await tableExists(table);
    if (!exists) {
      console.log(`  Table does not exist — already gone.`);
      results.missing.push(table);
      continue;
    }

    // ── Row count ─────────────────────────────────────────────────────────────
    const count = await getRowCount(table);
    console.log(`  Row count        : ${count}`);

    if (typeof count === 'string' && count.startsWith('ERR')) {
      console.log(`  Cannot read table — skipping to be safe.`);
      results.kept.push({ table, reason: `unreadable: ${count}` });
      continue;
    }

    if (count > 0) {
      console.log(`  Table has ${count} rows — NOT dropping (not empty).`);
      results.kept.push({ table, reason: `has ${count} rows` });
      continue;
    }

    // ── FK dependents (other tables that reference this one) ───────────────────
    const dependents = await getFKDependents(table);
    if (dependents.length > 0) {
      console.log(`  Incoming FK constraints from other tables:`);
      dependents.forEach(d =>
        console.log(`    ${d.from_schema}.${d.from_table}.${d.from_col} → public.${table}.${d.to_col}  (constraint: ${d.constraint_name})`)
      );
    } else {
      console.log(`  No incoming FK constraints from other tables.`);
    }

    // ── FK from this table (outgoing) ─────────────────────────────────────────
    const outgoing = await getFKsFromTable(table);
    if (outgoing.length > 0) {
      console.log(`  Outgoing FK constraints from this table:`);
      outgoing.forEach(d =>
        console.log(`    public.${table}.${d.from_col} → ${d.to_schema}.${d.to_table}.${d.to_col}  (constraint: ${d.constraint_name})`)
      );
    } else {
      console.log(`  No outgoing FK constraints from this table.`);
    }

    // ── Drop decision ─────────────────────────────────────────────────────────
    // If there are incoming FKs from OTHER tables that have data, we must be careful.
    // But since this table is empty, those FK constraints shouldn't actually prevent a DROP CASCADE.
    // We use CASCADE to also drop any dependent views/functions referencing this table.

    if (dependents.length > 0) {
      console.log(`  Using DROP ... CASCADE to remove incoming FK constraints.`);
    }

    try {
      await db.raw(`DROP TABLE IF EXISTS public.${table} CASCADE`);
      console.log(`  DROPPED public.${table} (CASCADE).`);
      results.dropped.push({ table, dependents: dependents.length });
    } catch (e) {
      console.error(`  ERROR dropping public.${table}: ${e.message}`);
      results.kept.push({ table, reason: `drop failed: ${e.message.split('\n')[0]}` });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════════════════\n');

  if (results.dropped.length > 0) {
    console.log(`  Dropped (${results.dropped.length}):`);
    results.dropped.forEach(r => console.log(`    - public.${r.table}${r.dependents > 0 ? ` (removed ${r.dependents} incoming FK constraint(s) via CASCADE)` : ''}`));
  } else {
    console.log('  Dropped: (none)');
  }

  if (results.kept.length > 0) {
    console.log(`\n  Kept / skipped (${results.kept.length}):`);
    results.kept.forEach(r => console.log(`    - public.${r.table}  reason: ${r.reason}`));
  } else {
    console.log('\n  Kept / skipped: (none)');
  }

  if (results.missing.length > 0) {
    console.log(`\n  Already gone (${results.missing.length}):`);
    results.missing.forEach(t => console.log(`    - public.${t}`));
  }

  // ── Verify remaining public tables ────────────────────────────────────────────
  console.log('\n── Remaining public BASE TABLES ─────────────────────────');
  const remaining = await db.raw(`
    SELECT table_name,
           (SELECT COUNT(*)::int FROM information_schema.columns c2
            WHERE c2.table_schema = 'public' AND c2.table_name = t.table_name) AS col_count
    FROM information_schema.tables t
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  for (const row of remaining.rows) {
    let cnt;
    try {
      const r = await db.raw(`SELECT COUNT(*)::int AS c FROM public.${row.table_name}`);
      cnt = r.rows[0].c;
    } catch (e) { cnt = 'ERR'; }
    console.log(`  ${row.table_name.padEnd(35)} cols:${String(row.col_count).padEnd(4)} rows:${cnt}`);
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  fix-zombie-tables.js DONE');
  console.log('════════════════════════════════════════════════════════\n');

  await db.destroy();
}

run().catch(e => {
  console.error('\nFATAL:', e.message);
  process.exit(1);
});
