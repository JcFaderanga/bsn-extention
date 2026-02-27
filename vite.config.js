import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for a Chrome extension side panel
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: '/index.html'
    }
  }
});