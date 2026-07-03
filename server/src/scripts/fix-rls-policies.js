/**
 * Fix RLS policies for IGO Academy LMS — public schema
 *
 * FINDINGS FROM DIAGNOSTIC:
 *  - public.lessons / assessments / resources are VIEWS with security_invoker=false.
 *    They run as the view owner (postgres), so they bypass underlying RLS entirely.
 *    The views already have GRANT SELECT TO authenticated/anon.
 *    The views filter is_published/is_active at the SQL level.
 *    → No additional RLS changes needed for these views. They work as intended.
 *
 * REAL ISSUES FIXED HERE:
 *  1. public.categories — RLS ON, ZERO policies → default-deny, all users blocked
 *  2. public.quizzes — RLS ON, ZERO policies → blocked
 *  3. public.quiz_questions — RLS ON, ZERO policies → blocked
 *  4. public.lesson_progress ALL policy — missing WITH CHECK (INSERT could set any user_id)
 *  5. public.notifications ALL policy — missing WITH CHECK
 *  6. public.quiz_attempts ALL policy — missing WITH CHECK
 *
 * Run: node src/scripts/fix-rls-policies.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

// ── helpers ─────────────────────────────────────────────────────────────────

async function exec(label, sql) {
  try {
    await db.raw(sql);
    console.log(`  ✓ ${label}`);
  } catch (e) {
    const msg = e.message.split('\n')[0];
    console.error(`  ✗ ${label}: ${msg}`);
    throw e;
  }
}

async function step(title, fn) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 58 - title.length))}`);
  await fn();
}

// ── main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  IGO ACADEMY — RLS POLICY FIX SCRIPT');
  console.log('════════════════════════════════════════════════════════════════');

  // ── VIEWS — note only, no action needed ─────────────────────────────────
  await step('VIEWS (lessons / assessments / resources) — status', async () => {
    console.log('  ℹ  Views use security_invoker=false (run as postgres owner).');
    console.log('  ℹ  Underlying igo_lms tables have no RLS — views bypass it.');
    console.log('  ℹ  GRANT SELECT already exists for authenticated and anon roles.');
    console.log('  ℹ  Views filter is_published/is_active in their SQL definition.');
    console.log('  ✓  No RLS changes needed for views — they are accessible as intended.');
  });

  // ── 1. public.categories — add public-read policy ───────────────────────
  await step('1. public.categories — add public READ policy', async () => {
    await exec(
      'Drop old categories policies if any',
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "categories public read" ON public.categories;
       EXCEPTION WHEN OTHERS THEN NULL; END $$`
    );
    await exec(
      'CREATE categories public READ policy',
      `CREATE POLICY "categories public read"
         ON public.categories
         FOR SELECT
         TO public
         USING (true)`
    );
  });

  // ── 2. public.quizzes — authenticated read ──────────────────────────────
  await step('2. public.quizzes — add authenticated READ policy', async () => {
    await exec(
      'Drop old quizzes SELECT policy if any',
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "quizzes authenticated read" ON public.quizzes;
       EXCEPTION WHEN OTHERS THEN NULL; END $$`
    );
    await exec(
      'CREATE quizzes authenticated READ policy',
      `CREATE POLICY "quizzes authenticated read"
         ON public.quizzes
         FOR SELECT
         TO authenticated
         USING (true)`
    );
  });

  // ── 3. public.quiz_questions — authenticated read ───────────────────────
  await step('3. public.quiz_questions — add authenticated READ policy', async () => {
    await exec(
      'Drop old quiz_questions SELECT policy if any',
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "quiz_questions authenticated read" ON public.quiz_questions;
       EXCEPTION WHEN OTHERS THEN NULL; END $$`
    );
    await exec(
      'CREATE quiz_questions authenticated READ policy',
      `CREATE POLICY "quiz_questions authenticated read"
         ON public.quiz_questions
         FOR SELECT
         TO authenticated
         USING (true)`
    );
  });

  // ── 4. Fix lesson_progress ALL → per-operation with WITH CHECK ───────────
  // The old ALL policy had no WITH CHECK, meaning INSERT could use any user_id.
  // Replace with explicit policies that enforce auth.uid() = user_id on every op.
  await step('4. Fix lesson_progress — replace ALL policy with scoped policies', async () => {
    await exec(
      'Drop old "Progress: own" ALL policy',
      `DROP POLICY IF EXISTS "Progress: own" ON public.lesson_progress`
    );
    await exec(
      'CREATE lesson_progress SELECT policy',
      `CREATE POLICY "Progress: own SELECT"
         ON public.lesson_progress FOR SELECT
         TO public
         USING (auth.uid() = user_id)`
    );
    await exec(
      'CREATE lesson_progress INSERT policy',
      `CREATE POLICY "Progress: own INSERT"
         ON public.lesson_progress FOR INSERT
         TO public
         WITH CHECK (auth.uid() = user_id)`
    );
    await exec(
      'CREATE lesson_progress UPDATE policy',
      `CREATE POLICY "Progress: own UPDATE"
         ON public.lesson_progress FOR UPDATE
         TO public
         USING (auth.uid() = user_id)
         WITH CHECK (auth.uid() = user_id)`
    );
    await exec(
      'CREATE lesson_progress DELETE policy',
      `CREATE POLICY "Progress: own DELETE"
         ON public.lesson_progress FOR DELETE
         TO public
         USING (auth.uid() = user_id)`
    );
  });

  // ── 5. Fix notifications ALL → per-operation with WITH CHECK ─────────────
  await step('5. Fix notifications — replace ALL policy with scoped policies', async () => {
    await exec(
      'Drop old "Notifications: own" ALL policy',
      `DROP POLICY IF EXISTS "Notifications: own" ON public.notifications`
    );
    await exec(
      'CREATE notifications SELECT policy',
      `CREATE POLICY "Notifications: own SELECT"
         ON public.notifications FOR SELECT
         TO public
         USING (auth.uid() = user_id)`
    );
    await exec(
      'CREATE notifications INSERT policy',
      `CREATE POLICY "Notifications: own INSERT"
         ON public.notifications FOR INSERT
         TO public
         WITH CHECK (auth.uid() = user_id)`
    );
    await exec(
      'CREATE notifications UPDATE policy',
      `CREATE POLICY "Notifications: own UPDATE"
         ON public.notifications FOR UPDATE
         TO public
         USING (auth.uid() = user_id)
         WITH CHECK (auth.uid() = user_id)`
    );
    await exec(
      'CREATE notifications DELETE policy',
      `CREATE POLICY "Notifications: own DELETE"
         ON public.notifications FOR DELETE
         TO public
         USING (auth.uid() = user_id)`
    );
  });

  // ── 6. Fix quiz_attempts ALL → per-operation with WITH CHECK ─────────────
  await step('6. Fix quiz_attempts — replace ALL policy with scoped policies', async () => {
    await exec(
      'Drop old "QuizAttempts: own" ALL policy',
      `DROP POLICY IF EXISTS "QuizAttempts: own" ON public.quiz_attempts`
    );
    await exec(
      'CREATE quiz_attempts SELECT policy',
      `CREATE POLICY "QuizAttempts: own SELECT"
         ON public.quiz_attempts FOR SELECT
         TO public
         USING (auth.uid() = user_id)`
    );
    await exec(
      'CREATE quiz_attempts INSERT policy',
      `CREATE POLICY "QuizAttempts: own INSERT"
         ON public.quiz_attempts FOR INSERT
         TO public
         WITH CHECK (auth.uid() = user_id)`
    );
    await exec(
      'CREATE quiz_attempts UPDATE policy',
      `CREATE POLICY "QuizAttempts: own UPDATE"
         ON public.quiz_attempts FOR UPDATE
         TO public
         USING (auth.uid() = user_id)
         WITH CHECK (auth.uid() = user_id)`
    );
    await exec(
      'CREATE quiz_attempts DELETE policy',
      `CREATE POLICY "QuizAttempts: own DELETE"
         ON public.quiz_attempts FOR DELETE
         TO public
         USING (auth.uid() = user_id)`
    );
  });

  // ── 7. Tables intentionally locked (no policy = default-deny) ────────────
  await step('7. Intentionally locked tables (no action)', async () => {
    const locked = [
      'attendance      — served via service role / server-side only',
      'live_classes    — not yet used in Flutter client',
      'class_modules   — exposed via public.lessons VIEW (no direct access needed)',
      'submissions     — not yet used in Flutter client',
      'user_sessions   — server-side only',
      'knex_migrations — internal migration tracking',
      'knex_migrations_lock — internal migration tracking',
    ];
    locked.forEach(t => console.log(`  ℹ  ${t}`));
    console.log('  ✓  No changes made — default-deny is correct for these tables.');
  });

  // ── 8. FINAL STATE REPORT ────────────────────────────────────────────────
  await step('8. FINAL RLS STATE REPORT', async () => {
    const rlsStatus = await db.raw(`
      SELECT
        c.relname AS name,
        CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' ELSE c.relkind::text END AS kind,
        c.relrowsecurity AS rls_on
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind IN ('r','v')
      ORDER BY c.relkind DESC, c.relname
    `);

    const policies = await db.raw(`
      SELECT tablename, policyname, cmd, roles::text, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, cmd, policyname
    `);

    const byTable = {};
    policies.rows.forEach(p => {
      if (!byTable[p.tablename]) byTable[p.tablename] = [];
      byTable[p.tablename].push(p);
    });

    console.log('');
    console.log(`  ${'Name'.padEnd(35)} ${'Kind'.padEnd(6)} ${'RLS'.padEnd(4)} Policies`);
    console.log('  ' + '─'.repeat(80));

    rlsStatus.rows.forEach(r => {
      const pols = byTable[r.name] || [];
      const badge = r.rls_on ? 'ON ' : 'OFF';
      const polNote = pols.length === 0
        ? (r.rls_on ? '⚠  NONE — default-deny' : '— (no RLS, view grants control access)')
        : `${pols.length} polic${pols.length === 1 ? 'y' : 'ies'}`;
      console.log(`  ${r.name.padEnd(35)} ${r.kind.padEnd(6)} ${badge}  ${polNote}`);
      pols.forEach(p => {
        const wc = p.with_check ? ` | WITH CHECK: (${p.with_check})` : '';
        console.log(`    ├─ [${p.cmd.padEnd(6)}] "${p.policyname}"  roles:${p.roles}`);
        console.log(`    │  USING: (${p.qual || 'none'})${wc}`);
      });
    });

    // Summary of issues
    const stillBlocked = rlsStatus.rows.filter(r =>
      r.rls_on && r.kind === 'TABLE' && !byTable[r.name]
    );
    if (stillBlocked.length > 0) {
      console.log('\n  ⚠  Tables still blocked (intentional or needs review):');
      stillBlocked.forEach(r => console.log(`     ${r.name}`));
    }

    // Verify WITH CHECK on user-scoped tables
    const needsCheck = ['lesson_progress', 'notifications', 'quiz_attempts'];
    console.log('\n  WITH CHECK verification (INSERT policies for user-scoped tables):');
    needsCheck.forEach(tbl => {
      const insertPols = (byTable[tbl] || []).filter(p => p.cmd === 'INSERT');
      insertPols.forEach(p => {
        const ok = p.with_check && p.with_check.includes('auth.uid()');
        console.log(`  ${ok ? '✓' : '✗'} ${tbl} INSERT — with_check: (${p.with_check || 'MISSING'})`);
      });
      if (insertPols.length === 0) {
        console.log(`  ✗ ${tbl} — no INSERT policy found!`);
      }
    });
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  RLS fix script complete.');
  console.log('════════════════════════════════════════════════════════════════\n');

  await db.destroy();
}

run().catch(e => {
  console.error('\nFATAL:', e.message);
  process.exit(1);
});
