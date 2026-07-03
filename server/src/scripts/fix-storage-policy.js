/**
 * Creates RLS policy so authenticated Flutter users can read resource PDFs
 * from Supabase Storage bucket 'resource-pdfs'
 * Run: node src/scripts/fix-storage-policy.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('../config/db');

async function run() {
  console.log('Creating storage RLS policy...');

  // Drop existing policy if any, then recreate
  await db.raw(`
    DO $$
    BEGIN
      DROP POLICY IF EXISTS "authenticated read resource-pdfs" ON storage.objects;
      CREATE POLICY "authenticated read resource-pdfs"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'resource-pdfs');
      RAISE NOTICE 'Policy created OK';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error: %', SQLERRM;
    END $$;
  `);

  console.log('Done — authenticated users can now read from resource-pdfs bucket.');
  await db.destroy();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
