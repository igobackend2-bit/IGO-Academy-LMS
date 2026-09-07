/**
 * Node-side wrapper around the Python compression scripts
 * (scripts/python/compress_video.py, compress_image.py). Both scripts are
 * plain CLI tools (input path, output path) — this just shells out to them
 * with temp files and cleans up afterward, so callers deal in Buffers/paths
 * only.
 *
 * PYTHON_BIN defaults to `python3` (the standard binary name on Debian,
 * which is what the production container runs) — `python` on Windows,
 * since a bare `python3` alias is unreliable there and this repo is
 * developed on Windows. Override with the PYTHON_BIN env var if a
 * deployment target names its binary differently.
 */
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

const execFileAsync = promisify(execFile);

const PYTHON_BIN = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
const SCRIPTS_DIR = path.join(__dirname, '../scripts/python');
const MAX_BUFFER = 64 * 1024 * 1024; // 64MB of stdout/stderr — the scripts only ever print a line or two

function tmpFile(ext) {
  return path.join(os.tmpdir(), `igo-compress-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
}

/**
 * Re-encodes a video FILE ON DISK to a normal streaming bitrate. Takes and
 * returns paths (not buffers) deliberately — module videos run into the
 * hundreds of MB to low GB, and holding that in the Node heap at all is
 * exactly what the direct-to-storage upload path was built to avoid (see
 * course.controller.js's getUploadUrl doc comment). Caller owns cleanup of
 * both paths.
 * @param {string} inputPath
 * @param {string} outputPath
 */
async function compressVideoFile(inputPath, outputPath) {
  const script = path.join(SCRIPTS_DIR, 'compress_video.py');
  try {
    await execFileAsync(PYTHON_BIN, [script, inputPath, outputPath], {
      maxBuffer: MAX_BUFFER,
      timeout: 30 * 60 * 1000, // large source files can legitimately take several minutes to encode
    });
  } catch (err) {
    logger.error(`[PythonCompress] compress_video.py failed: ${err.stderr || err.message}`);
    throw new Error('Video compression failed');
  }
}

/**
 * Resizes + re-encodes an image BUFFER as WebP. Images are always small
 * (multer already caps thumbnail uploads at 5MB), so buffer-in/buffer-out
 * is fine here — no disk-streaming concern like video has.
 * @param {Buffer} buffer
 * @returns {Promise<{ buffer: Buffer, contentType: string, ext: string }>}
 */
async function compressImageBuffer(buffer, originalExt = '.jpg') {
  const inPath = tmpFile(originalExt);
  const outPath = tmpFile('.webp');
  try {
    fs.writeFileSync(inPath, buffer);
    const script = path.join(SCRIPTS_DIR, 'compress_image.py');
    const { stdout } = await execFileAsync(PYTHON_BIN, [script, inPath, outPath], {
      maxBuffer: MAX_BUFFER,
      timeout: 60 * 1000,
    });
    const format = stdout.trim(); // 'webp' or 'copied' (animated GIF, passed through as-is)
    const outBuffer = fs.readFileSync(outPath);
    return format === 'webp'
      ? { buffer: outBuffer, contentType: 'image/webp', ext: '.webp' }
      : { buffer: outBuffer, contentType: 'image/gif', ext: '.gif' };
  } finally {
    try { fs.unlinkSync(inPath); } catch { /* already gone or never created */ }
    try { fs.unlinkSync(outPath); } catch { /* already gone or never created */ }
  }
}

/**
 * Streams a URL straight to disk via curl — used to pull the just-uploaded
 * raw video back down for compression without ever holding a multi-GB
 * response body in Node's heap (curl writes directly to the file; Node
 * only waits on the child process exiting).
 * @param {string} url
 * @param {string} outputPath
 */
async function downloadToFile(url, outputPath) {
  try {
    await execFileAsync('curl', ['-sL', '--fail', url, '-o', outputPath], {
      timeout: 20 * 60 * 1000, // a multi-GB file over a slow link can take a while
    });
  } catch (err) {
    logger.error(`[PythonCompress] download failed: ${err.stderr || err.message}`);
    throw new Error('Download failed');
  }
}

module.exports = { compressVideoFile, compressImageBuffer, downloadToFile, tmpFile };
