/**
 * reencode-module-video.js
 *
 * Root cause of "video stutters every second" on the student player: the
 * source file for a given module is grossly oversized for its duration
 * (e.g. 1.4GB for a 9m19s video — ~21 Mbps average bitrate, verified via
 * range-request headers on the real signed URL). Storage/CDN range-request
 * support is fine (Accept-Ranges: bytes, 206 Partial Content both work) —
 * the problem is purely that most connections can't sustain that bitrate,
 * so the player's buffer runs dry roughly as fast as it fills.
 *
 * Downloads the current file from Supabase Storage, re-encodes it to a
 * normal web-streaming bitrate (H.264, ~2.5 Mbps video + 128kbps AAC audio,
 * capped at 1080p, +faststart so the moov atom is at the front for
 * progressive playback), then uploads it back to the EXACT SAME storage
 * path (upsert) — so video_s3_key in igo_lms.class_modules /
 * public.class_modules never changes, no DB or app-code change needed at
 * all. The player just starts getting a file it can actually keep up with.
 *
 * Usage: node src/scripts/reencode-module-video.js <storage-path>
 * e.g.:  node src/scripts/reencode-module-video.js modules/cb32a723-8e1d-4b73-a9a2-7791f27f9abf.mp4
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { supabase } = require('../config/supabase');

const BUCKET = 'lesson-videos';
const SCRATCH = 'C:/Users/IGOGRO~1/AppData/Local/Temp/claude/video-fix';

async function run() {
  const storagePath = process.argv[2];
  if (!storagePath) { console.error('Usage: node reencode-module-video.js <storage-path>'); process.exit(1); }

  const base = path.basename(storagePath, '.mp4');
  const inFile = path.join(SCRATCH, `${base}-original.mp4`);
  const outFile = path.join(SCRATCH, `${base}-reencoded.mp4`);

  console.log(`1) Signing + downloading ${storagePath} ...`);
  const { data: signed, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
  if (signErr) throw new Error(`Sign failed: ${signErr.message}`);

  execSync(`curl -sL "${signed.signedUrl}" -o "${inFile}"`, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 1024 });
  const originalSize = fs.statSync(inFile).size;
  console.log(`   Downloaded: ${(originalSize / 1024 / 1024).toFixed(1)} MB`);

  console.log('\n2) Re-encoding (H.264, ~2.5 Mbps, capped 1080p, faststart)...');
  // -vf scale caps resolution without upscaling anything smaller; CRF+maxrate
  // gives consistent quality while hard-capping the bitrate so it never
  // regresses back to something a normal connection can't sustain.
  execSync(
    `ffmpeg -y -i "${inFile}" ` +
    `-vf "scale='min(1920,iw)':-2" ` +
    `-c:v libx264 -preset medium -crf 23 -maxrate 2500k -bufsize 5000k ` +
    `-c:a aac -b:a 128k -movflags +faststart "${outFile}"`,
    { stdio: 'inherit', maxBuffer: 1024 * 1024 * 1024 }
  );
  const newSize = fs.statSync(outFile).size;
  console.log(`   Re-encoded: ${(newSize / 1024 / 1024).toFixed(1)} MB (was ${(originalSize / 1024 / 1024).toFixed(1)} MB, ${Math.round((1 - newSize / originalSize) * 100)}% smaller)`);

  console.log(`\n3) Uploading back to ${storagePath} (overwrite)...`);
  const buffer = fs.readFileSync(outFile);
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, { contentType: 'video/mp4', upsert: true });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
  console.log('   Uploaded.');

  console.log('\n4) Cleaning up local temp files...');
  fs.unlinkSync(inFile);
  fs.unlinkSync(outFile);

  console.log('\nDone. Same storage path, same video_s3_key — no DB change needed.');
}

run().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
