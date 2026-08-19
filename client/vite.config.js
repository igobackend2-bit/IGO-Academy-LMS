import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Read the SAME .env the server reads, so the proxy target always matches
// whatever port the server actually bound to (PORT) instead of a hardcoded
// guess that silently drifts out of sync — that mismatch is exactly what
// caused every /api/* call to fail with ECONNREFUSED. No dotenv dependency
// needed for a single KEY=value line lookup.
function readEnvPort() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    const line = fs.readFileSync(envPath, 'utf-8').split('\n').find(l => l.startsWith('PORT='));
    return line ? line.split('=')[1].trim() : null;
  } catch { return null; }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${readEnvPort() || 5000}`,
        changeOrigin: true,
      },
    },
    // Exclude the entire public/ directory from the file watcher.
    // On Windows, files in public/ (images, videos, brand assets, etc.) can
    // be locked by the OS (EBUSY) at any time, crashing Vite's watcher.
    // Vite never needs HMR for public/ assets — they are served as-is.
    // usePolling: native Windows file events silently stop firing on this
    // machine (edits in src/ never trigger HMR, server keeps serving stale
    // modules until restarted). Polling is slightly heavier but reliable.
    watch: {
      ignored: ['**/public/**'],
      usePolling: true,
      interval: 400,
    },
  },
});
