/* Editions icon-first UI regression gate. Run from repository root:
   node daruri/qa/verify-editions-icons.cjs
   DOM geometry/device checks are separate; this verifies the wrapper is
   syntactically valid and does not replace the tested edition logic. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html');
const css=read('editions-icons.css');
const src=read('editions-icons.js');
const editionSrc=read('editions.js');
const sw=read('sw.js');
const zip=read('download-bundle.js');
const names=['editions-icons.css?v=20261021-icons2','editions-icons.js?v=20261021-icons2'];
for(const name of names){
  assert.ok(html.includes(name), 'Reader HTML includes '+name);
  assert.ok(sw.includes(name), 'Offline cache includes '+name);
}
assert.ok(html.indexOf('editions.js?v=') < html.indexOf('editions-icons.js?v='), 'Edition renderer loads before enhancement');
assert.ok(html.indexOf('editions.css?v=') < html.indexOf('editions-icons.css?v='), 'Base styles load before enhancement');
for(const name of ['editions-icons.js','editions-icons.css'])
  assert.ok(zip.includes('daruri/'+name), 'Offline ZIP contains '+name);
assert.ok(css.includes('gn-ed-native-select') && css.includes('gn-ed-icon-options'));
for(const marker of ['role','radiogroup','aria-checked','ArrowRight','ArrowLeft','MutationObserver',
  'upgradeToggle','data-ep-iconified','prior.apply'])
  assert.ok(src.includes(marker), 'Required interaction feature '+marker);
new vm.Script(src,{filename:'editions-icons.js'});
new vm.Script(sw,{filename:'sw.js'});
const bound={};
let invoked=0, listened=0;
const rootNode={
  dataset:{},
  addEventListener(type,fn){assert.equal(typeof fn,'function');listened++;bound[type]=fn;},
  querySelectorAll(){return[];}
};
const win={GnammaEditions:{render:function(){invoked++;return 'underlying edition renderer';}}};
const dom={
  createElement(){return {className:'',innerHTML:'',setAttribute(){}};}
};
vm.runInNewContext(src,{window:win,document:dom,MutationObserver:undefined}, {timeout:2000});
assert.equal(win.GnammaEditions.__iconEnhanced,true);
assert.equal(win.GnammaEditions.render(rootNode,{}),'underlying edition renderer');
assert.equal(invoked,1,'Preserve original render exactly once');
assert.equal(listened,5,'Delegated click, keyboard, change, hover and focus listeners only');
win.GnammaEditions.render(rootNode,{});
assert.equal(invoked,2,'Subsequent route visits continue to render normally');
assert.equal(listened,5,'No listener accumulation after return to Editions');
assert.ok(editionSrc.includes('gn-ed-reading-custom'), 'Custom print settings are collapsed until requested');
assert.ok(editionSrc.includes('legacy.hidden = true'), 'Verified Study PDF supersedes older fixed link');
assert.ok(!editionSrc.includes('Study notes + hadith sources'), 'No ḥadīth selector in non-scholarly Study');
assert.ok(!editionSrc.includes('gn-ed-intro'), 'Removed edition explanatory paragraphs');
assert.ok(editionSrc.includes('data-ep-info-value'), 'Shared Visuals-style selection display');
assert.ok(editionSrc.includes('aria-label="Custom Reading printout"'), 'Icon-only disclosure has accessible name');
assert.ok(!src.includes("className='gn-ed-icon-label'"), 'Option tiles contain no visible text captions');
assert.ok(src.includes("setAttribute('aria-label',option.textContent.trim())"), 'Accessible full option names');
const coursePicker={
  dataset:{epControl:'lesson'},options:Array.from({length:28},(_,i)=>({value:String(i)})),
  closest(){return {insertBefore(){}}}
};
rootNode.querySelectorAll=q=>q.includes('select:not(')?[coursePicker]:[];
win.GnammaEditions.render(rootNode,{});
assert.equal(coursePicker.dataset.epIconified,'native', 'Long lesson list remains a native picker instead of dozens of icons');

const manifest=JSON.parse(read('editions/manifest.json'));
assert.equal(manifest.status,'verified');
assert.deepEqual(manifest.tier_order,['reading','study','reference']);
assert.equal(manifest.files.filter(f=>f.tier==='reading').length,8);
assert.equal(manifest.files.filter(f=>f.tier==='study').length,2);
console.log('PASS: icon-only choices, selection display, screen-reader labels, native long lists, collapsed printing, scholarly notes, cache/ZIP contracts.');
