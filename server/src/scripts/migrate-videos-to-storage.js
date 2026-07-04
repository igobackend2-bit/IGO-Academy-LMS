/**
 * Uploads local video files to Supabase Storage bucket 'lesson-videos'
 * Updates igo_lms.class_modules.video_s3_key to use storage paths
 * Run: node src/scripts/migrate-videos-to-storage.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const VIDEO_DIR = path.join(__dirname, '../../uploads/videos');
const BUCKET = 'lesson-videos';

async function run() {
  // 1. Create bucket if missing
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) { console.error('Bucket create error:', error.message); process.exit(1); }
    console.log(`Created bucket: ${BUCKET}`);
  } else {
    console.log(`Bucket '${BUCKET}' already exists`);
  }

  // 2. Add RLS policy for authenticated users to read
  await db.raw(`
    DO $$
    BEGIN
      DROP POLICY IF EXISTS "authenticated read lesson-videos" ON storage.objects;
      CREATE POLICY "authenticated read lesson-videos"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'lesson-videos');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'RLS policy: %', SQLERRM;
    END $$;
  `).catch(() => {});

  // 3. Find all modules with local video keys
  const modules = await db('igo_lms.class_modules')
    .whereNotNull('video_s3_key')
    .select('id', 'title', 'video_s3_key');

  const localModules = modules.filter(m => m.video_s3_key?.startsWith('local:'));
  console.log(`\nFound ${localModules.length} modules with local videos\n`);

  const results = { uploaded: [], skipped: [], missing: [], failed: [] };

  for (const mod of localModules) {
    const filename = mod.video_s3_key.slice(6); // strip 'local:'
    const filePath = path.join(VIDEO_DIR, filename);
    const storagePath = `modules/${mod.id}.mp4`;

    // Check if already in storage
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list('modules', { search: `${mod.id}.mp4` });

    if (existing?.length > 0) {
      console.log(`  SKIP   ${mod.title} (already in storage)`);
      // Still update the key if it's still 'local:'
      await db('igo_lms.class_modules')
        .where({ id: mod.id })
        .update({ video_s3_key: storagePath });
      results.skipped.push(mod.title);
      continue;
    }

    if (!fs.existsSync(filePath)) {
      console.log(`  MISS   ${mod.title} — file not on disk: ${filename}`);
      results.missing.push(mod.title);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (error) throw error;

      // Update DB to use storage path
      await db('igo_lms.class_modules')
        .where({ id: mod.id })
        .update({ video_s3_key: storagePath });

      const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
      console.log(`  UP     ${mod.title} → ${storagePath} (${sizeMB} MB)`);
      results.uploaded.push(mod.title);
    } catch (err) {
      console.error(`  FAIL   ${mod.title}: ${err.message}`);
      results.failed.push({ title: mod.title, reason: err.message });
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`Uploaded : ${results.uploaded.length}`);
  console.log(`Skipped  : ${results.skipped.length}`);
  console.log(`Missing  : ${results.missing.length}`);
  console.log(`Failed   : ${results.failed.length}`);

  if (results.missing.length > 0) {
    console.log('\nMissing files (re-upload from admin):');
    results.missing.forEach(t => console.log(`  - ${t}`));
  }

  // Rebuild the public.lessons view to expose video_url from storage path
  console.log('\nRebuilding public.lessons view with video_url...');
  await db.raw(`
    DROP VIEW IF EXISTS public.lessons CASCADE;
    CREATE VIEW public.lessons
    WITH (security_invoker = false)
    AS
    SELECT
      m.id,
      m.course_id,
      m.title,
      m.description,
      'video'::text                          AS type,
      m.order_index,
      m.duration_secs                        AS duration_seconds,
      -- video_url: storage path (e.g. 'modules/{id}.mp4') or null
      CASE
        WHEN m.video_s3_key IS NULL                   THEN NULL
        WHEN m.video_s3_key LIKE 'local:%'            THEN NULL
        WHEN m.video_s3_key LIKE 'http%'              THEN m.video_s3_key
        ELSE m.video_s3_key                            -- storage path like 'modules/{id}.mp4'
      END                                    AS video_url,
      NULL::text                             AS pdf_url,
      NULL::text                             AS content,
      false                                  AS is_preview,
      m.is_published,
      m.created_at,
      m.updated_at
    FROM igo_lms.class_modules m
    WHERE m.is_published = true;

    GRANT SELECT ON public.lessons TO authenticated, anon;
  `);
  console.log('View rebuilt. video_url now returns storage path.');

  const count = await db.raw(`SELECT COUNT(*) FROM public.lessons WHERE video_url IS NOT NULL`);
  console.log(`Lessons with video_url set: ${count.rows[0].count}`);

  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
