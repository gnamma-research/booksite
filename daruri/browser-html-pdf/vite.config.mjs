import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The only browser assets are local repo files and locally installed libraries.
// The canonical reader data and Noto fonts stay on the same origin.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
export default defineConfig({
  root,
  base: '/',
  publicDir: false,
  server: {
    host: '127.0.0.1',
    port: 8977,
    strictPort: true,
    fs: { allow: [root] },
  },
  build: {
    outDir: path.join(here, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(here, 'index.html'),
    },
  },
});
