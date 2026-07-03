require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const { db } = require('../config/db');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  // 1. Check what files are in the bucket
  console.log('\n=== Files in resource-pdfs bucket ===');
  const { data: files, error: listErr } = await supabase.storage.from('resource-pdfs').list();
  if (listErr) console.error('List error:', listErr.message);
  else console.log(files?.map(f => f.name) ?? 'empty');

  // 2. Check what pdf_path values are in the DB
  console.log('\n=== Resources with pdf_path in DB ===');
  const rows = await db('resources').whereNotNull('pdf_path').select('id', 'title', 'pdf_path');
  rows.forEach(r => console.log(`  ${r.title}: "${r.pdf_path}"`));

  // 3. Check if RLS policy exists
  console.log('\n=== Storage RLS policies ===');
  const policies = await db.raw(`
    SELECT policyname, cmd, roles::text
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  `);
  if (policies.rows.length === 0) console.log('  NO POLICIES FOUND on storage.objects');
  else policies.rows.forEach(p => console.log(`  ${p.policyname} | ${p.cmd} | ${p.roles}`));

  await db.destroy();
}

run().catch(e => { console.error(e.message); process.exit(1); });
