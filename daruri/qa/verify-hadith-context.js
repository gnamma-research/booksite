#!/usr/bin/env node
/* Daruri source-grounded Hadith reader QA: authoritative 33-note map, 47 distinct source records, offline/browser contracts. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const src=(p)=>fs.readFileSync(path.join(base,p),'utf8');
const spec=JSON.parse(src('build/data/hadith-source-notes.json'));
const core=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js'];
const englishFiles=["hadith-context-english-bukhari-a.js","hadith-context-english-bukhari-b.js","hadith-context-english-bukhari-long.js","hadith-context-english-abudawud-a.js","hadith-context-english-abudawud-b.js","hadith-context-english-tirmidhi-a.js","hadith-context-english-tirmidhi-b.js","hadith-context-english-tirmidhi-c.js","hadith-context-english-muslim.js","hadith-context-english-other.js"];
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of core){new vm.Script(src(file),{filename:file}).runInContext(sandbox);}
for(const file of englishFiles){new vm.Script(src(file),{filename:file}).runInContext(sandbox);}
new vm.Script(src('hadith-context-ui.js'),{filename:'hadith-context-ui.js'});
const data=sandbox.window.GnammaHadithContextData,raw=sandbox.window.GnammaHadithReports,full=sandbox.window.GnammaHadithEnglishFull;
assert.equal(data.schema_version,1);
assert.equal(Object.keys(data.notes).length,33,'33 original scholarly hadith note IDs');
assert.equal(Object.keys(data.sources).length,47,'47 unique primary Hadith report IDs');
assert.equal(Object.keys(raw).length,47,'47 local complete Arabic reports, including the combined Bukhari reference and Muslim 1297');
assert.equal(Object.keys(full).length,47,'Every Arabic collection record needs a complete independent English translation');
assert.deepEqual(Object.keys(full).sort(),Object.keys(data.sources).sort(),'English and Arabic report IDs must correspond exactly');
for(const [id,item] of Object.entries(raw)){
 const translation=full[id];
 assert.equal(typeof translation,'string','Full English missing: '+id);
 assert(translation.length>=Math.max(130,Math.round(item.arabic.length*.42)),'English shorter than full transmitted source: '+id);
 assert(!/English context summary \(editorial précis|no complete translation|opening the linked edition/i.test(translation),'Truncated summary substituted for full translation: '+id);
}
for(const [id,terms] of Object.entries({
 'bukhari:2731':['Suhayl','Abū Jandal','Abū Baṣīr','Umm Salama','Budayl','Al-Qaṣwāʾ'],
 'tirmidhi:1102':['al-Zuhrī','Abū Burda','Shuʿba','al-Thawrī','al-Shāfiʿī'],
 'tirmidhi:1180':['Fāṭima','ʿUmar','al-Shāfiʿī'],
 'tirmidhi:691':['Simāk','mursal'],
 'bukhari:1454':['forty','one hundred and twenty']
})){
 for(const term of terms){
  assert(full[id].includes(term),'English transmission omitted expected source anchor '+id+' / '+term);
 }
}
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
for(const name of core.concat(englishFiles,['hadith-context-ui.js','hadith-context-ui.css','HADITH_CONTEXT_SOURCES.md'])){
 assert(src('download-bundle.js').includes(name),'Missing from download package: '+name);
 if(name.endsWith('.js')||name.endsWith('.css'))assert(src('sw.js').includes(name),'Missing from offline cache: '+name);
}
console.log('PASS: 33 notes, 55 citations, 47/47 complete Arabic sources + newly written English transmissions, metadata and offline manifests.');
async function domCheck(){
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM('<!doctype html><html><head></head><body><div class="gn-note-entry" data-note-id="HAD-R031"><p>Compact source note.</p></div><div class="gn-note-entry" data-note-id="HAD-R216"><p>Compact source note.</p></div><div class="gn-note-entry" data-note-id="HAD-R189"><p>Compact source note.</p></div><div class="gn-note-entry" data-note-id="QUR-R064-Q005"><h3>Source QUR-R064-Q005</h3><p>Authoritative source note.</p></div><div class="gn-note-entry" data-note-id="QUR-R121-Q011"><h3>Source QUR-R121-Q011</h3><p>Authoritative source note.</p></div><div class="gn-note-entry" data-note-id="QUR-R124-Q013"><h3>Source QUR-R124-Q013</h3><p>Authoritative source note.</p></div><div class="gn-note-entry" data-note-id="QUR-R124-Q014"><h3>Source QUR-R124-Q014</h3><p>Authoritative source note.</p></div></body></html>',{url:'file:///example/daruri/index.html',runScripts:'outside-only'});
 const {window}=dom,doc=window.document;
 const orig=doc.head.append.bind(doc.head);
 doc.head.append=function(...nodes){const value=orig(...nodes);for(const node of nodes)if(node.tagName==='SCRIPT'&&node.src.includes('hadith-context-')){const file=new URL(node.src).pathname.split('/').at(-1);try{window.eval(src(file));queueMicrotask(()=>node.onload?.());}catch(e){queueMicrotask(()=>node.onerror?.(e));}}return value;};
 window.eval(src('hadith-context-ui.js'));
 doc.dispatchEvent(new window.Event('DOMContentLoaded'));
 const tick=()=>new Promise(r=>setTimeout(r,0));
 await tick();
 assert.equal(doc.querySelectorAll('.gn-hadith-context').length,7,'Three independent Hadith notes and four context-scoped Qurʾān disclosures');
 assert.equal(doc.querySelectorAll('.gn-hadith-english').length,0,'Complete translations must not appear before expansion');
 const compact=doc.querySelector('[data-note-id="HAD-R216"]');
 assert(compact.querySelector('.gn-hadith-short-summary')?.textContent,'Unexpanded source shows concise context');
 assert(compact.querySelector('.gn-hadith-original-apparatus')?.textContent.includes('Compact source note'),
  'Canonical source note survives unchanged in retained apparatus');
 assert(compact.querySelector('.gn-hadith-original-apparatus').hidden,'Legacy verbosity is not visible by default');
 assert(doc.querySelector('[data-note-id="QUR-R064-Q005"] .gn-scholar-ayah-title')?.textContent.includes('﴿'),'Qurʾān heading shows actual Arabic verse excerpt');
 const open=async id=>{const note=doc.querySelector('[data-note-id="'+id+'"]');const details=note.querySelector('.gn-hadith-context');details.open=true;details.dispatchEvent(new window.Event('toggle'));for(let i=0;i<9;i++)await tick();return note;};
 const note31=await open('HAD-R031');const list31=[...note31.querySelectorAll('[data-hadith-report]')];
 assert.deepEqual(list31.map(x=>x.dataset.hadithReport),['muslim:360a','abudawud:492'],'Muslim must precede Abu Dawud, with two distinct reports');
 assert(list31.every(card=>card.querySelector('.gn-hadith-report-heading')?.textContent.match(/Muslim|Dawud|Dāwūd/i)),
  'Each report heading must still identify its collection');
 assert(list31.every(card=>![...card.querySelectorAll('.gn-hadith-meta strong')].some(label=>label.textContent.trim()==='Collection:')),
  'Expanded Hadith details must not repeat the collection already named in the heading');
 assert(note31.textContent.includes('Jābir')||note31.textContent.includes('Jabir'),'Verified narrator rendered');
 assert(note31.textContent.includes('الإِبِلِ'),'Full source Arabic in offline card');
 const note216=await open('HAD-R216');
 assert(note216.textContent.includes('Full English translation'),'Fully translated report shown rather than abbreviated English');
 assert(note216.textContent.includes('ʿAbd Allāh ibn Yūsuf'),'Translated isnād names are visible');
 assert.equal(note216.querySelectorAll('.gn-hadith-english').length,1,'Exactly one complete translation per cited report');
 assert(note216.textContent.includes('Manumission'),'Book/chapter shown');
 const note189=await open('HAD-R189');
 assert(note189.textContent.includes('No primary collection'),'Unverified wording cannot be fabricated');
 assert.equal(note189.querySelectorAll('[data-hadith-report]').length,0);
 assert.equal(doc.querySelectorAll('.gn-quran-context').length,0,'Hadith does not replace Qurʾān context UI');
 const related=doc.querySelector('[data-note-id="QUR-R064-Q005"] .gn-hadith-related');
 assert(related,'Hadith appears inside its specific related Qurʾān note');
 related.open=true;related.dispatchEvent(new window.Event('toggle'));
 for(let i=0;i<9;i++)await tick();
 const relatedCards=[...related.querySelectorAll('[data-hadith-report]')];
 assert.deepEqual(relatedCards.map(x=>x.dataset.hadithReport),['abudawud:788'],
  'Nested Qurʾān note must disclose only the reviewed related source, not an entire section');
 assert(!doc.querySelector('.gn-hadith-metadata')?.textContent.includes('Attributed grading'),
  'Modern database grades are never displayed in the reader');
 console.log('PASS: compact Hadith notes and four scoped Qurʾān relationships; lazy complete Arabic/English transmissions, no modern grading, source order and source record preservation.');
}
domCheck().catch(e=>{console.error(e);process.exitCode=1;});
