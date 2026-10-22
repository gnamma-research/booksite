/* Release contracts: two-tier Daruri Editions and exact local PDF maps. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const edition=read('editions-selector.js');
const exporter=read('personal-export.js');
const style=read('editions-selector.css');
const page=read('index.html');
const sw=read('sw.js');
const base=JSON.parse(read('editions/manifest.json'));
const extra=JSON.parse(read('editions/apparatus/manifest.json'));
const maps=JSON.parse(read('editions/maps/manifest.json'));
const canon=JSON.parse(read('pdf-editions-manifest.json'));
assert.equal(base.status,'verified');
assert.equal(base.files.length,12);
assert.equal(extra.status,'verified');
assert.equal(extra.files.length,120);
assert.equal(maps.status,'verified');
assert.equal(maps.files.length,12);
assert.ok(canon.files['daruri.pdf']);
new vm.Script(edition,{filename:'editions-selector.js'});
new vm.Script(exporter,{filename:'personal-export.js'});
assert.ok(page.includes('editions-selector.js?v='),'Reader loads shared Editions selector');
assert.ok(sw.includes('editions-selector.js?v='),'PWA caches Editions selector');
assert.ok(edition.includes("const NAV=['reading','reference']"),'Exactly two top-level tabs');
for(const required of ['Reading &amp; Study','Reference','data-es-preset="reading"',
  'data-es-preset="study"','data-es-preset="custom"','id="pe-form"',
  'id="pe-personal"','id="pe-bookmarks"','id="pe-highlights"','id="pe-order"',
  'id="pe-dates"','id="pe-annotations"','id="pe-picker"',
  'id="pe-generate"','id="pe-result"','data-es-action="open"',
  'loadPersonalTools(mounted)','gnamma-personal-export-ready',
  'No published PDF matches this exact combination','word']){
  if(required==='word')continue;
  assert.ok(edition.includes(required),'Missing integrated control '+required);
}
assert.ok(!edition.includes('personal-export.html?'),'No external personal-copy wizard required');
assert.ok(!edition.includes('data-es-nav="study"'),'Study belongs inside Reading & Study');
assert.ok(!edition.includes('data-es-toggle="vowels"'),'The extra vowel-mark toggle must not reappear');
assert.ok(edition.includes('Off → Plain → Vowelled'),'Arabic vowel states are controlled by AR alone');
assert.ok(edition.includes("icon('note')")&&edition.includes("icon('highlight')"),'Personal icons are distinct');
assert.ok(edition.includes('file===row.source_base'),'Apparatus sources bound to approved bases');
assert.ok(edition.includes('row.map_coverage===1'),'Verified maps only');
assert.ok(edition.includes('mapReady'),'Personal export must not substitute a different PDF');
assert.ok(exporter.includes('GnammaPersonalExportInline'),'One shared browser-local export engine');
assert.ok(exporter.includes("fetch(new URL('editions/maps/manifest.json',URL_ROOT)"),'All 12 base maps available to exporter');
assert.ok(exporter.includes("candidate.base_sha256!==verifiedMap.base_sha256"),'Apparatus word links bound to exact base SHA');
assert.ok(exporter.includes("wordMap=verifiedMap")&&exporter.includes("wordMap=candidate"),'Certified partial word maps usable');
assert.ok(!exporter.includes('fetch("https://'),'Private user data is never sent to external service');
assert.ok(style.includes('.gn-es .gn-es-preset-options'),'Preset controls styled');
assert.ok(style.includes('.gn-es .gn-es-picker'),'Inline note picker styled');
assert.ok(style.includes('.gn-es .gn-es-action{width:100%'),'Symmetrical Open PDF button preserved');
const baselines=new Map(base.files.map(x=>[x.file,x]));
const fn=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
for(const row of maps.files){
  const b=baselines.get(row.file);
  assert.ok(b,'Unknown base PDF');
  assert.equal(row.sha256,b.sha256);
  assert.equal(row.base_sha256,b.sha256);
  assert.equal(row.verified_sections,258);
  const pdf=path.join(root,'editions',row.file);
  assert.equal(fn(pdf),b.sha256);
  const mapfile=path.join(root,'editions',row.map_file);
  const data=JSON.parse(fs.readFileSync(mapfile));
  assert.equal(fn(mapfile),row.map_sha256);
  assert.equal(data.source_sha256,b.sha256);
  assert.equal(data.base_sha256,b.sha256);
  assert.equal(Object.keys(data.section_pages).length,258);
  assert.equal(Object.keys(data.anchors).length,258);
  assert.equal(data.section_count,258);
  for(const [key,words] of Object.entries(data.segments||{})){
    assert.match(key,/^\d{1,3}:\d+:(en|ar|vocalized)$/);
    assert.ok(words.length>1);
    for(const w of words){
      assert.equal(w.length,6);
      assert.ok(w[1]>=1&&w[1]<=b.pages);
      assert.ok(w[2]>=0&&w[3]>=0&&w[4]>w[2]&&w[5]>w[3]);
    }
  }
}
const seen=new Set();
for(const row of extra.files){
  assert.ok(!seen.has(row.file));seen.add(row.file);
  assert.ok(baselines.has(row.source_base));
  assert.equal(row.base_sha256,baselines.get(row.source_base).sha256);
  assert.equal(row.verified_sections,258);
  assert.equal(row.map_coverage,1);
  assert.equal(fn(path.join(root,'editions',row.file)),row.sha256);
  assert.equal(fn(path.join(root,'editions',row.map_file)),row.map_sha256);
}
console.log('PASS: two tabs, 3 presets, shared private exporter, 12 verified base maps, 120 exact apparatus PDFs and safe word-level fallbacks.');
