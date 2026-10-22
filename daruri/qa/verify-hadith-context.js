#!/usr/bin/env node
/* Daruri source-grounded Hadith reader QA: authoritative 33-note map, 47 distinct source records, offline/browser contracts. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const src=(p)=>fs.readFileSync(path.join(base,p),'utf8');
const spec=JSON.parse(src('build/data/hadith-source-notes.json'));
const core=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js'];
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of core){new vm.Script(src(file),{filename:file}).runInContext(sandbox);}
new vm.Script(src('hadith-context-ui.js'),{filename:'hadith-context-ui.js'});
const data=sandbox.window.GnammaHadithContextData,raw=sandbox.window.GnammaHadithReports;
assert.equal(data.schema_version,1);
assert.equal(Object.keys(data.notes).length,33,'33 original scholarly hadith note IDs');
assert.equal(Object.keys(data.sources).length,47,'47 unique primary Hadith report IDs');
assert.equal(Object.keys(raw).length,47,'47 local complete Arabic reports, including the combined Bukhari reference and Muslim 1297');
let occurrences=0;
for(const note of Object.values(spec.notes_by_section)){
 const a=data.notes[note.id];assert(a, 'Missing '+note.id);
 assert.equal(a.section,note.section_id);
 assert.equal(a.unresolved,!!note.contains_unresolved_attribution_notice);
 const expected=(note.source_references||[]).filter(r=>/^https:\/\/sunnah\.com\/[a-z]+:\d+[a-z]?$/.test(r.url)).map(r=>r.url.split('/').at(-1)).sort();
 assert.deepEqual([...a.refs].sort(),expected,'Missing or added primary Hadith citation '+note.id);
 occurrences+=a.refs.length;
 const priorities=a.refs.map(id=>data.sources[id].priority);
 assert.deepEqual([...priorities],[...priorities].sort((x,y)=>x-y),'Bukhari/Muslim sources must sort before other collections');
 for(const id of a.refs)assert.equal(data.sources[id].url,'https://sunnah.com/'+id);
}
assert.equal(occurrences,55,'No source citation disappears when priority order changes');
assert.deepEqual([...data.notes['HAD-R189'].refs],[],'Unidentified report may not gain a guessed source');
for(const [id,item] of Object.entries(raw)){
 assert.equal(item.id,id,'No publication with mismatched numbering');
 assert(item.arabic&&item.arabic.length>50,'Missing Arabic isnad/report '+id);
 assert(!/English translation/.test(item.arabic),'Arabic source was accidentally set to English '+id);
 assert(item.source&&/^https:\/\//.test(item.source),'Missing source-provenance URL '+id);
 assert(item.book&&item.book.length>3,'Missing source book '+id);
 assert(item.chapter_en&&item.chapter_ar,'Missing collection chapter heading '+id);
 assert(item.narrator&&item.narrator.length>3,'Missing principal narrator '+id);
 assert(item.englishOriginal||item.englishBrief,'Missing English source synopsis '+id);
 if(item.englishOriginal)assert(item.englishOriginal.length>30,'English rendering too short '+id);
 if(item.englishBrief)assert(item.englishBrief.length>40,'English précis too short '+id);
}
assert(raw['muslim:360a'].arabic.includes('الإِبِلِ'),'Muslim 360a must be camel-resting-place report, not global 360');
assert(raw['muslim:977a'].arabic.includes('الْقُبُورِ'),'Muslim 977a must concern the later permission to visit graves');
assert(raw['muslim:1297'].arabic.includes('مَنَاسِكَكُمْ'),'Muslim 1297 must concern pilgrimage rites');
assert(raw['abudawud:4928'].arabic.includes('قَتْلِ الْمُصَلِّينَ'),'Abu Dawud 4928 must have fuller opening');
assert(raw['bukhari:2522'].englishOriginal && raw['bukhari:2522'].chapter_ar,'Verified Bukhari chapter and original English rendering');
assert(raw['bukhari:2731'].arabic.length>10000,'Full Hudaybiyya report must not be truncated');
for(const key of ['source-reference-data.js','sw.js','download-bundle.js','build/build_source_reference_data.py']){
 assert(src(key).includes('hadith-context-ui.js'),'Missing reader / generator / offline source reference '+key);
}
for(const name of core.concat(['hadith-context-ui.js','hadith-context-ui.css','HADITH_CONTEXT_SOURCES.md'])){
 assert(src('download-bundle.js').includes(name),'Missing from download package: '+name);
 if(name.endsWith('.js')||name.endsWith('.css'))assert(src('sw.js').includes(name),'Missing from offline cache: '+name);
}
console.log('PASS: 33 Hadith notes, 55 cited placements, 47/47 full Arabic, English contexts, narrator+chapter metadata and source-priority/offline invariants.');
async function domCheck(){
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM('<!doctype html><html><head></head><body><div class="gn-note-entry" data-note-id="HAD-R031"><p>Note.</p></div><div class="gn-note-entry" data-note-id="HAD-R216"><p>Note.</p></div><div class="gn-note-entry" data-note-id="HAD-R189"><p>Note.</p></div></body></html>',{url:'file:///example/daruri/index.html',runScripts:'outside-only'});
 const {window}=dom,doc=window.document;
 const orig=doc.head.append.bind(doc.head);
 doc.head.append=function(...nodes){const value=orig(...nodes);for(const node of nodes)if(node.tagName==='SCRIPT'&&node.src.includes('hadith-context-')){const file=new URL(node.src).pathname.split('/').at(-1);try{window.eval(src(file));queueMicrotask(()=>node.onload?.());}catch(e){queueMicrotask(()=>node.onerror?.(e));}}return value;};
 window.eval(src('hadith-context-ui.js'));
 doc.dispatchEvent(new window.Event('DOMContentLoaded'));
 const tick=()=>new Promise(r=>setTimeout(r,0));
 await tick();
 assert.equal(doc.querySelectorAll('.gn-hadith-context').length,3,'One expansion per scholarly note, without requiring a Quran note');
 const open=async id=>{const note=doc.querySelector('[data-note-id="'+id+'"]');const details=note.querySelector('.gn-hadith-context');details.open=true;details.dispatchEvent(new window.Event('toggle'));for(let i=0;i<9;i++)await tick();return note;};
 const note31=await open('HAD-R031');const list31=[...note31.querySelectorAll('[data-hadith-report]')];
 assert.deepEqual(list31.map(x=>x.dataset.hadithReport),['muslim:360a','abudawud:492'],'Muslim must precede Abu Dawud, with two distinct reports');
 assert(note31.textContent.includes('Jābir')||note31.textContent.includes('Jabir'),'Verified narrator rendered');
 assert(note31.textContent.includes('الإِبِلِ'),'Full source Arabic in offline card');
 const note216=await open('HAD-R216');
 assert(note216.textContent.includes('English rendering'),'Editorial English rendering shown, not imported modern translation');
 assert(note216.textContent.includes('Manumission'),'Book/chapter shown');
 const note189=await open('HAD-R189');
 assert(note189.textContent.includes('No primary collection'),'Unverified wording cannot be fabricated');
 assert.equal(note189.querySelectorAll('[data-hadith-report]').length,0);
 assert.equal(doc.querySelectorAll('.gn-quran-context').length,0,'Hadith does not require or alter Quran UI');
 console.log('PASS: offline-file synthetic reader DOM; distinct Muslim/Abu Dawud, Bukhari translation, unresolved case and mobile-safe nested details.');
}
domCheck().catch(e=>{console.error(e);process.exitCode=1;});
