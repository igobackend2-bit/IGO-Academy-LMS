require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');
(async () => {
  const noPolicies = await db.raw(`
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = true
      AND c.relname NOT IN (
        SELECT tablename FROM pg_policies WHERE schemaname = 'public'
      )
    ORDER BY c.relname
  `);
  console.log('Tables with RLS ON but NO policies (default-deny for all roles):');
  noPolicies.rows.forEach(r => console.log(' ', r.table_name));

  const catPols = await db.raw(`SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename='categories'`);
  console.log('\ncategories policies count:', catPols.rows.length);
  catPols.rows.forEach(p => console.log(' ', JSON.stringify(p)));
  await db.destroy();
})().catch(e => { console.error(e.message); process.exit(1); });
