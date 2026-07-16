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
  },
});
