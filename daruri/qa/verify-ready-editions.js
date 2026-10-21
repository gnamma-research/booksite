/* Static release checks for direct A4 PDF download choices. No external packages. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'editions','manifest.json'),'utf8'));
assert.equal(manifest.status,'verified');
assert.deepEqual(manifest.tier_order,['reading','study','reference']);
assert.equal(manifest.files.length,12);
assert.equal(manifest.files.filter(x=>x.tier==='reading').length,10);
assert.equal(manifest.files.filter(x=>x.tier==='study').length,2);
for(const language of ['bilingual','bilingual-unvowelled','english','arabic','arabic-vowelled']){
  for(const titles of [false,true]){
    assert.equal(manifest.files.filter(f=>f.tier==='reading'&&
      f.language===language&&f.editorial_titles===titles).length,1,
      'One verified Reading PDF for '+language+' / titles='+titles);
  }
}
const safe=/^(reading|study)\/daruri-(reading|study)-(bilingual|bilingual-unvowelled|english|arabic|arabic-vowelled)-titles-(on|off)\.pdf$/;
const names=new Set();
for(const file of manifest.files){
  assert.ok(safe.test(file.file),'Unsafe or malformed file: '+file.file);
  assert.ok(!names.has(file.file),'Repeated filename '+file.file);
  names.add(file.file);
  const bytes=fs.readFileSync(path.join(root,'editions',file.file));
  assert.ok(bytes.slice(0,5).equals(Buffer.from('%PDF-')),'PDF header missing');
  assert.ok(bytes.slice(-200).includes(Buffer.from('%%EOF')),'PDF trailer missing');
  assert.equal(bytes.length,file.bytes,'Byte count '+file.file);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,'SHA-256 '+file.file);
  assert.ok(file.pages>=30 && file.bookmarks>=52,'Readable navigation metadata '+file.file);
}
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const script=fs.readFileSync(path.join(root,'editions.js'),'utf8');
for(const ext of ['css','js']){
  const filename='editions.'+ext+'?v=20261021-editiontabs-vowels-release1';
  assert.ok(page.includes(filename),'HTML route lacks '+filename);
  assert.ok(sw.includes(filename),'Offline shell lacks '+filename);
}
assert.ok(script.includes('editions/manifest.json') && script.includes('showReadyPDFs'));
assert.ok(script.includes('showReadyPDFs();'));
assert.ok(page.includes('data-route="editions"'));
console.log('PASS: 12 verified PDF files, all Reading EN/AR/vowel combinations, checksums, edition links and offline shell.');
