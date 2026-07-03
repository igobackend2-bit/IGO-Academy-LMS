/**
 * One-time migration: upload existing resource PDFs from disk → Supabase Storage
 * Run once: node src/scripts/migrate-pdfs-to-storage.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const path = require('path');
const fs   = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { db } = require('../config/db');

const BUCKET      = 'resource-pdfs';
const UPLOAD_DIR  = path.join(__dirname, '../../uploads/resources');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log('=== PDF → Supabase Storage Migration ===\n');

  // 1. Ensure bucket exists (create if missing)
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) {
      console.error('Failed to create bucket:', error.message);
      process.exit(1);
    }
    console.log(`Created bucket: ${BUCKET}`);
  } else {
    console.log(`Bucket already exists: ${BUCKET}`);
  }

  // 2. Fetch all resources with a pdf_path
  const rows = await db('resources').whereNotNull('pdf_path').select('id', 'pdf_path', 'title');
  console.log(`Found ${rows.length} resource(s) with PDF\n`);

  let uploaded = 0;
  let skipped  = 0;
  let missing  = 0;
  let failed   = 0;

  for (const row of rows) {
    const localFile = path.join(UPLOAD_DIR, row.pdf_path);
    const storagePath = row.pdf_path; // e.g. "{uuid}.pdf"

    if (!fs.existsSync(localFile)) {
      console.log(`  MISSING  ${row.title} → local file not found: ${row.pdf_path}`);
      missing++;
      continue;
    }

    // Check if already in storage
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list('', { search: storagePath });

    const alreadyUploaded = existing?.some(f => f.name === storagePath);
    if (alreadyUploaded) {
      console.log(`  SKIP     ${row.title} (already in storage)`);
      skipped++;
      continue;
    }

    // Upload
    try {
      const buffer = fs.readFileSync(localFile);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true });

      if (error) throw error;
      console.log(`  UPLOADED ${row.title} → ${storagePath}`);
      uploaded++;
    } catch (e) {
      console.error(`  FAILED   ${row.title}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped (already there): ${skipped}`);
  console.log(`  Missing on disk: ${missing}`);
  console.log(`  Failed: ${failed}`);

  await db.destroy();
}

run().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
