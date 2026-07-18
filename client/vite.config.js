import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
      // Must match PORT in the root .env. Default is 5001, not 5000, because
      // macOS Control Center (AirPlay Receiver) permanently holds port 5000.
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 5001}`,
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
