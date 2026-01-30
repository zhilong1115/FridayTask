import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4748,
    allowedHosts: ['.trycloudflare.com', 'friday-task.com'],
    proxy: {
      '/api': 'http://localhost:4747',
    },
  },
  build: {
    outDir: 'dist',
  },
});
