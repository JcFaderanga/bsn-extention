import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for a Chrome extension side panel
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        sidepanel: '/index.html',
        contentScript: '/src/contentScript.js',
        background: '/src/background/background.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});
