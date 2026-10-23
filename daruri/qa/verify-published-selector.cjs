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
assert.ok(edition.includes("const NAV=['reading','reference']"),'Retain old preference migration');
assert.equal((edition.match(/class="gn-es-download-type" role="tab"/g)||[]).length,4,'Exactly four file purposes');
assert.equal((edition.match(/data-es-book-edition="/g)||[]).length,3,'Exactly three book editions');
for(const required of ['Book PDF','Study Guide','Offline reader','Research files',
  'data-es-download-type="book"','data-es-download-type="guide"',
  'data-es-download-type="offline"','data-es-download-type="source"',
  'data-es-book-edition="reading"','data-es-book-edition="study"',
  'data-es-book-edition="reference"','id="pe-form"',
  'id="pe-personal"','id="pe-bookmarks"','id="pe-highlights"','id="pe-order"',
  'id="gn-es-prepare"','data-es-action="download"','data-daruri-bundle="html"',
  'id="pe-dates"','id="pe-annotations"','id="pe-picker"',
  'id="pe-generate"','id="pe-result"','data-es-action="open"',
  'data-es-stage1-create','dynamic-editions.html?','autostart',
  'loadPersonalTools(mounted)','gnamma-personal-export-ready',
  'No approved edition matches this exact combination','word']){
  if(required==='word')continue;
  assert.ok(edition.includes(required),'Missing integrated control '+required);
}
assert.ok(!edition.includes('personal-export.html?'),'No external personal-copy wizard required');
assert.ok(!edition.includes('data-es-study-guide'),'Study guide is not a selected book edition');
assert.ok(edition.includes("availability.hidden=result.status==='ready'"),
  'Do not show an unnecessary ready banner');
assert.ok(edition.includes("download.href=open.getAttribute('href')"),
  'Clean source and Reference PDFs retain direct native View/Download');
assert.ok(edition.includes("prepare.hidden=true"),'No mandatory Prepare PDF stage');
assert.ok(!edition.includes('data-es-nav="study"'),'No redundant nested Study navigation');
assert.ok(edition.includes("Download Study Guide (PDF)"),'Standalone companion download must be explicit');
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
assert.ok(style.includes('.gn-es .gn-es-download-type'),'Purpose selector must be styled');
assert.ok(style.includes('@container (min-width:725px)'),'Desktop chooses a compact two-column rail');
assert.ok(style.includes('.gn-es .gn-es-picker'),'Inline note picker styled');
assert.ok(style.includes('top:-4px'),'Vowelled Arabic overbar is raised above, not through, the AR letters');
assert.ok(style.includes('flex-direction:row;'),'AR remains on the same centred baseline as EN');
assert.ok(style.includes('.gn-es-ar-form{display:none;}'),'Status caption must not push AR upwards');
assert.ok(read('editions-icons.css').includes('top:-4px'),'Fallback Editions overbar uses the same clearance');
assert.ok(read('reading-mode-controls.css').includes('top:-4px'),'Reader overbar uses the same clearance');
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
// Stage1 removal policy: every approved full apparatus entry is a recipe,
// not a downloaded whole-document PDF. Signed packet/map provenance stays.
const signed=JSON.parse(read('dynamic-pdf/packets/manifest.json'));
assert.equal(signed.packets.length,15);
assert.equal(signed.profiles.length,120);
const profiles=new Map(signed.profiles.map(x=>[x.profile,x]));
const packetByFile=new Map(signed.packets.map(x=>[x.file,x]));
assert.equal(profiles.size,120);
assert.equal(packetByFile.size,15);
for(const packet of signed.packets){
  assert.equal(fn(path.join(root,'dynamic-pdf/packets',packet.file)),packet.sha256,
    'The shared apparatus packet must retain its approved SHA');
  assert.equal(fn(path.join(root,'dynamic-pdf/packets',packet.map)),packet.map_sha256,
    'The packet map must be identical to its signed source');
}
const seen=new Set();
for(const row of extra.files){
  assert.ok(!seen.has(row.file));seen.add(row.file);
  assert.ok(baselines.has(row.source_base));
  assert.equal(row.base_sha256,baselines.get(row.source_base).sha256);
  assert.equal(row.verified_sections,258);
  assert.equal(row.map_coverage,1);
  assert.equal(fs.existsSync(path.join(root,'editions',row.file)),false,
    'Retired completed apparatus PDF must not remain on the public site');
  assert.equal(fn(path.join(root,'editions',row.map_file)),row.map_sha256,
    'Historical position provenance must be retained');
  const binding=profiles.get(row.file);
  assert(binding,'Missing signed local assembly profile '+row.file);
  const packet=packetByFile.get(binding.packet);
  assert(packet);
  assert.equal(binding.profile_sha256,row.sha256);
  assert.equal(binding.base,row.source_base);
  assert.equal(binding.packet_sha256,packet.sha256);
  assert.equal(fn(path.join(root,'dynamic-pdf/packets',binding.map)),binding.map_sha256);
}
console.log('PASS Stage1: 12 SHA-bound sources, 15 reusable packets, 120 signed recipes, ZERO redundant PDF files and intact personal-export privacy.');
