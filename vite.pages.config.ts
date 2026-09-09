import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';

// Independent static entry: no Sites sign-in, Worker, server, or credentials.
export default defineConfig({
  root: 'pages',
  base: process.env.PAGES_BASE_PATH || './',
  publicDir: '../public',
  plugins: [react(), {
    name: 'verify-static-only-dependencies',
    generateBundle() {
      for (const module of this.getModuleIds()) {
        if (/node_modules[\\/](?:image-size|vinext|react-server-dom-webpack)[\\/]/.test(module) || /[\\/]\.openai[\\/]/.test(module)) {
          this.error(`Server-only dependency must not enter the Pages artifact: ${module}`);
        }
      }
    },
  }],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { outDir: '../dist-pages', emptyOutDir: true, sourcemap: false },
});
