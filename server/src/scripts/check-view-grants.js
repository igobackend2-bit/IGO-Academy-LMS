require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
(async () => {
  // Verify relkind for attendance and certificates
  const check = await db.raw(`
    SELECT c.relname, c.relkind,
      CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' ELSE c.relkind::text END AS kind,
      c.relrowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('attendance', 'certificates', 'lessons', 'assessments', 'resources', 'live_classes')
    ORDER BY c.relname
  `);
  console.log('relkind check:');
  check.rows.forEach(r => console.log(`  ${r.relname}: relkind=${r.relkind} (${r.kind}), rls_on=${r.relrowsecurity}`));
  await db.destroy();
})().catch(e => { console.error(e.message); process.exit(1); });
