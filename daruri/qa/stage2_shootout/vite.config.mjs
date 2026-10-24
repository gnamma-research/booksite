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
  // Production GitHub Pages serves assets without configurable COOP/COEP.
  // A realistic acceptance test must NOT simulate headers Pages cannot set.
  headers: process.env.STAGE2_GHP_NO_COOP==='1' ? {} : {
   'Cross-Origin-Opener-Policy':'same-origin',
   'Cross-Origin-Embedder-Policy':'require-corp'
  }
 },
 build:{outDir:path.join(here,'dist'),emptyOutDir:true,
  rollupOptions:{input:path.join(here,'typst_browser.html')}}
});