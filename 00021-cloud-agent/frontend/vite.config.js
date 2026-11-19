import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: ['36l2d8v4-5173.inc1.devtunnels.ms'],
    proxy: {
      '/api': { target: 'http://localhost', changeOrigin: false },
    },
  },
});
