#!/usr/bin/env node
'use strict';
// Independent ownership and scope QA for inline H markers and nested Q notes.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const sandbox={window:{}};vm.createContext(sandbox);
for(const f of ['hadith-anchor-data.js','hadith-traditional-notes.js','quran-note-headings.js'])vm.runInContext(read(f),sandbox,{filename:f});
let elem={textContent:''};vm.runInNewContext(read('edition-r3-20261020.js'),{document:{getElementById:()=>elem}});
const book=JSON.parse(elem.textContent);
const map=sandbox.window.GnammaHadithAnchorMap, qtitles=sandbox.window.GnammaQuranNoteHeadings;
const unvowel=s=>String(s||'').replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'');
assert.equal(Object.keys(map.notes).length,33);
let total=0;const bySection=new Map(book.sections.map(s=>[String(s.id),s]));
for(const [id,entry] of Object.entries(map.notes)){
 const section=bySection.get(String(entry.section));
 assert(section&&section.noteIds.includes(id),'Hadith source note owned by correct section '+id);
 for(const a of entry.anchors){
  const segment=section.segments[a.seg];assert(segment,'Known Arabic segment '+id);
  const raw=unvowel(segment.ar),q=unvowel(a.ar);
  assert(q&&raw.includes(q),'Arabic phrase is an exact fragment '+id);
  assert.equal(raw.indexOf(q),raw.lastIndexOf(q),'No ambiguous repeated phrase '+id);
  total++;
 }
}
assert.equal(total,46);
assert.equal(Object.keys(qtitles).length,50);
for(const [id,v] of Object.entries(qtitles)){
 assert(v.preview&&v.preview.length>4&&v.verse&&v.verse.startsWith(v.preview.slice(0,6)),'Verified Quran Arabic heading '+id);
}
const related=map.quranRelated;
assert.equal(Object.keys(related).length,4);
for(const [q,links] of Object.entries(related)){
 assert(book.notes.some(n=>n.id===q&&n.source_type==='quran'),'Known Quran parent '+q);
 for(const link of links){
  assert(map.notes[link.hadithNote],'Known linked Hadith '+link.hadithNote);
  assert(link.reports.length>0,'Scoped collection references '+q);
  assert(link.reports.every(id=>/^[a-z]+:\d+[a-z]?$/.test(id)),'Canonical collection IDs');
 }
}
assert.deepEqual([...related['QUR-R064-Q005'][0].reports],['abudawud:788']);
const code=read('index.html');
assert(/function addHadithSourceMarkers\(/.test(code),'Hadith marker code exists');
assert(/addHadithSourceMarkers\(addQuranSourceMarkers/.test(code),'Hadith marker is composed with existing Quran anchors');
assert(/source_type==='quran'\|\|note.source_type==='hadith'/.test(code),'Single notes modal handles Q and H');
for(const js of ['hadith-anchor-data.js','quran-note-headings.js','hadith-traditional-notes.js','hadith-note-polish.js','hadith-note-polish.css']){
 assert(code.includes(js),'Reader loads '+js);
 assert(read('sw.js').includes(js),'Offline service-worker caches '+js);
 assert(read('download-bundle.js').includes(js),'Downloaded HTML package retains '+js);
}
const hadithUI=read('hadith-context-ui.js');
assert(!hadithUI.includes('report.grades'),'No unsourced modern grader appears');
assert(hadithUI.includes('fullyVowelledTransmission'),'Completes honorific vowels without modifying source data');
const legacy=read('hadith-note-polish.js');
assert(legacy.includes('original.hidden=true'),'Canonical apparatus hidden, not deleted');
assert(legacy.includes('gn-scholarly-stable-id'),'Technical note ID retained');
console.log('PASS: 33 unique Hadith notes, 46 inline Arabic markers, 50 Quran headings and four scoped cross-references, new modal + offline contracts.');
