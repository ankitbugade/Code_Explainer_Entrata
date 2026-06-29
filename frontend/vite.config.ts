// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to the backend during development
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
