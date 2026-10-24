/* Fail-closed contract checks for stable Darūrī paragraph links and Copy assets. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const html=read('index.html'),copy=read('copy-links.js'),css=read('copy-links.css'),sw=read('sw.js'),bundle=read('download-bundle.js');
assert(html.includes('window.GnammaCopyContext={book:BOOK,state,sections,notes:rdNoteCatalog,rd}'),'Copy context must use authoritative Reader data and Reading Desk');
assert(html.includes('copy-links.css?v=20261024-copylinks1')&&html.includes('copy-links.js?v=20261024-copylinks1'),'Current Reader must load both Copy assets');
for(const filename of ['copy-links.js','copy-links.css']){
 assert(sw.includes(filename+'?v=20261024-copylinks1'),'Offline cache omits '+filename);
 assert(bundle.includes("'daruri/"+filename+"'"),'Complete download omits '+filename);
}
assert(html.includes('download-bundle.js?v=20261024-copylinks1')&&sw.includes('download-bundle.js?v=20261024-copylinks1'),'Offline package loader must be versioned');
assert(copy.includes('C.rd?.records?.()'),'Personal annotations must come from Reading Desk only when requested');
assert(copy.includes('config.personal'),'Personal notes opt-in missing');
assert(copy.includes('selectionSnapshot()'),'Selected words must require a real browser selection');
assert(copy.includes('if(config.scope===\'selected\')'),'Exact selections must not be re-expanded to entire paragraphs');
assert(copy.includes('window.GnammaCopyLinks={'),'Stable URL helper unavailable for regression tests');
assert(html.includes("location.hash.includes('&paragraph=')"),'Continuous reader must preserve paragraph deep-links');
const m=copy.match(/const COUNTS=\('([0-9,]+)'\)\.split/);
assert(m,'Missing immutable baseline paragraph-count registry');
const counts=m[1].split(',').map(Number);
assert.equal(counts.length,258);
assert.equal(counts.reduce((a,b)=>a+b,0),414);
const editionScript=read('edition-r3-20261020.js');
const d=editionScript.match(/\.textContent=("[\s\S]+?");\s*$/);
assert(d,'Edition data not extractable');
const data=JSON.parse(JSON.parse(d[1]));
assert.equal(data.sections.length,259);
for(let s=1;s<=258;s++)assert.equal(data.sections[s-1].segments.length,counts[s-1],`Paragraph count changed in §${s}; assign explicit stable IDs and aliases before release`);
assert.equal(data.sections[258].id,'colophon');
assert.equal(data.sections[258].segments.length,2);
const checker=cp.spawnSync(process.execPath,['--check',path.join(base,'copy-links.js')],{encoding:'utf8'});
assert.equal(checker.status,0,checker.stderr);
console.log('PASS Darūrī Copy: 416 stable source paragraphs; clipboard/UI assets, offline ZIP/cache, link routing and selected text contract.');