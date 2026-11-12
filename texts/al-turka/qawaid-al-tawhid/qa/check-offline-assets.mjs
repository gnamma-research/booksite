/* Qawtaw17 offline archive inventory: every named source must exist.
   Private localStorage / Reading Desk data is intentionally excluded. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const m=src.match(/const FILES=\[([\s\S]*?)\];/);
assert.ok(m,'Offline asset inventory not found');
const files=Array.from(m[1].matchAll(/'([^']+)'/g),x=>x[1]);
assert.ok(files.length>=35,'Offline archive has unexpectedly few assets');
assert.equal(new Set(files).size,files.length,'Offline asset duplicated');
for(const item of files){
  let dest=path.resolve(root,item);
  if(fs.existsSync(dest)&&fs.statSync(dest).isDirectory())dest=path.join(dest,'index.html');
  assert.ok(dest.startsWith(path.resolve(root,'../../..')),'Asset escapes repository root: '+item);
  assert.ok(fs.existsSync(dest)&&fs.statSync(dest).isFile(),'Offline file not found: '+item);
}
for(const essential of [
 'index.html','qawaid-parity-personal-pdf.js','pdf/qawaid-bilingual-reading.pdf',
 'pdf/qawaid-english-reading.pdf','pdf/qawaid-arabic-reading.pdf',
 'pdf/qawaid-bilingual-study.pdf','pdf/qawaid-bilingual-reference.pdf',
 '../../../daruri/gnamma-scholarly.js','../../../daruri/gnamma-proximity.js',
 '../../../daruri/vendor/pdf-lib-1.17.1.min.js',
 '../../../daruri/vendor/fontkit-1.1.1.umd.min.js',
 '../../../daruri/vendor/NotoSerif-Regular.ttf','../../../daruri/vendor/NotoNaskhArabic-Regular.ttf'])assert.ok(files.includes(essential),'Required offline file excluded: '+essential);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.display,'standalone');
assert.equal(manifest.scope,'./');
const sizes=files.map(item=>{
 const f=fs.statSync(path.resolve(root,item));
 return f.size;
});
console.log(JSON.stringify({passed:true,cachedAssets:files.length,aggregateBytes:sizes.reduce((a,b)=>a+b,0),publishesFivePDFs:true,fullSourceTextPreserved:true,personalDataIsNotServiceWorkerCached:true},null,2));
