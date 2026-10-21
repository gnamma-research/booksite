/* Release contracts for the static published-PDF Editions selector. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const index=read('index.html');
const js=read('editions-selector.js');
const css=read('editions-selector.css');
const sw=read('sw.js');
const pack=read('download-bundle.js');
const m=JSON.parse(read('editions/manifest.json'));
const r=JSON.parse(read('pdf-editions-manifest.json'));
const version='20261021-public-selector1';
new vm.Script(js,{filename:'editions-selector.js'});
const assets=['editions-selector.js','editions-selector.css'];
for(const asset of assets){
  assert.ok(index.includes(asset+'?v='+version),'HTML loads '+asset);
  assert.ok(sw.includes(asset+'?v='+version),'Offline cache includes '+asset);
  assert.ok(pack.includes("'daruri/"+asset+"'"),'Offline bundle includes '+asset);
}
assert.ok(index.indexOf('editions-icons.js?v=')<index.indexOf('editions-selector.js?v='),
 'Selector wraps the complete legacy renderer and icon enhancement');
assert.equal(m.status,'verified');
assert.equal(m.files.length,12,'12 complete published Reading/Study PDFs');
assert.equal(m.files.filter(x=>x.tier==='reading').length,10);
assert.equal(m.files.filter(x=>x.tier==='study').length,2);
assert.equal(m.files.filter(x=>x.language==='bilingual-unvowelled').length,2);
assert.ok(r.files['daruri.pdf'],'Stable canonical scholarly reference PDF');
for(const name of ['Reading','Study','Reference'])assert.ok(js.includes("'"+name+"'"));
for(const term of ['gn-es-spec-lead','gn-es-spec-layout','gn-es-spec-notes','gn-es-spec-apparatus','gn-es-availability',
  'data-es-action="open"',
  'data-es-category','data-es-section','gn-es-personal-link','aria-disabled',
  'No verified PDF exists for this exact combination','personal-export.html',
  'English left / Arabic right','Print opens the published PDF']){
  assert.ok(js.includes(term),'Missing publication contract: '+term);
}
assert.ok(js.includes('resolve()'),'Action selection must resolve to the catalog');
assert.ok(!js.includes('pdf-lib'),'No on-click PDF generation for public actions');
assert.ok(!js.includes('window.print()'),'Public Print opens the published PDF');
assert.ok(!js.includes('fetch('+'"/api/'),'No server-side public PDF generation API');
assert.ok(!js.includes("data-es-tier=\"personal\""),'Personal notes are not a fourth edition');
assert.equal((js.match(/data-es-action="open"/g)||[]).length,2,
  'Only a single published-PDF action is rendered and updated');
assert.ok(!js.includes('data-es-action="read"')&&!js.includes('data-es-action="download"')&&
  !js.includes('data-es-action="print"'), 'Redundant actions removed');
assert.ok(!js.includes('gn-es-notes-shortcut'), 'Redundant Notes shortcut removed');
assert.ok(js.includes("['content','layout','notes','apparatus']"), 'Four category workspace');
assert.ok(js.includes("glossary:'historical'")&&js.includes("index:'basic'")&&
  js.includes("concordance:'on'"), 'Reference tools and Study index reflect actual publications');
assert.ok(css.includes('repeat(4,minmax(0,1fr))'), 'Four equally sized category buttons');
assert.ok(css.includes('.gn-es-spec{')&&css.includes('position:sticky'),
 'Specification must remain visible while the settings workspace is used');
assert.ok(css.includes('.gn-es [hidden]'),'Hidden categories do not stack');
assert.ok(js.includes('s.notes!==')&&js.includes('No published PDF'),
 'Unsupported combinations must fail closed');
console.log('PASS: single Open PDF, no duplicate Notes shortcut, sticky apparatus state, four settings categories, exact SHA-indexed PDFs and private export boundaries.');
