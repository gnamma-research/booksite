import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
export default defineConfig({
 root,base:'/',publicDir:false,
 server:{
  host:'127.0.0.1',port:8991,strictPort:true,
  fs:{allow:[root]},
  headers:{
   'Cross-Origin-Opener-Policy':'same-origin',
   'Cross-Origin-Embedder-Policy':'require-corp'
  }
 },
 build:{outDir:path.join(here,'dist'),emptyOutDir:true,
  rollupOptions:{input:path.join(here,'typst_browser.html')}}
});