#!/usr/bin/env node
'use strict';
/* Scholar-review regression: canonical bilingual data, no-script fallback and
   offline package agree; no unsupported manuscript changes are introduced. */
const fs=require('node:fs'), path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const js=read('edition-r3-20261020.js');
const match=js.match(/document\.getElementById\("editionData"\)\.textContent\s*=\s*("(?:\\.|[^"\\])*")\s*;/);
assert(match,'Canonical edition JS carries the complete bilingual source');
const book=JSON.parse(JSON.parse(match[1]));
const get=n=>{const sec=book.sections.find(s=>s.id===n);assert(sec,'Section '+n+' present');return sec};
const note=id=>{const r=book.notes.find(n=>n.id===id);assert(r,'Note '+id+' present');return r};
const s17=get(17), s23=get(23), s26=get(26);
assert(s17.segments[1].ar.includes('لا يتصور دون الضرر أو النفع'),'1994 §17 Arabic not silently conjectured');
assert(s17.segments[1].en.includes('cannot be conceived apart from harm or benefit'),'§17 printed reading translated literally');
assert(s17.noteIds.includes('EXT-20261105-17'));
assert(note('EXT-20261105-17').text.includes('NOT manuscript evidence'),'§17 alternatives explicitly unconfirmed');
assert(note('EXT-20261105-17').text.includes('أو النفع'));
assert(s23.segments[1].ar.includes('كمسح الرأس والطمأنينة في الركوع'),'§23 source examples retained');
assert(s23.segments[1].en.includes('For obligations of this unmeasured kind'));
assert(!s23.segments[1].en.includes('In the latter case'),'§23 ambiguous antecedent eliminated');
assert(s23.noteIds.includes('EXT-20261105-23'));
assert(note('EXT-20261105-23').text.includes('both'),'§23 gloss names both examples');
assert(s26.segments[0].ar.includes('وأبين من هذا أن يرجع إلى ما كان قبل من إباحة'),'§26 source not emended');
assert(s26.segments[0].en.includes('Clearer still is a return to the permissibility'));
assert(!s26.segments[0].en.includes('[is the error of supposing]'),'§26 interpolation removed');
assert(note('N011').text.includes('reversed the sense'),'§26 older note has been corrected');
assert(!note('N011').text.includes('taken to refer to the error just discussed'));
assert.equal(book.stats.notes,book.notes.length,'Edition note statistic matches data');
assert.equal(book.stats.noteCount,book.notes.length);
assert.equal(book.notes.length,627);
const ids=book.notes.map(n=>n.id);
assert.equal(new Set(ids).size,ids.length,'No duplicate note IDs');
for(const s of [s17,s23,s26])
 for(const id of s.noteIds)assert(ids.includes(id),'Section '+s.id+' references a valid note '+id);

const html=read('index.html');
assert(html.includes('For obligations of this unmeasured kind'),'No-script §23 translation synchronized');
assert(html.includes('Clearer still is a return to the permissibility'),'No-script §26 synchronized');
assert(html.includes('fb-note-EXT-20261105-17'),'No-script §17 textual crux shown');
assert(html.includes('fb-note-EXT-20261105-23'),'No-script §23 note shown');
assert(html.includes('fb-note-N011')&&html.includes('reversed the sense'),'No-script §26 note corrected');
assert(!html.includes('More evident still [is the error of supposing]'),'No hidden stale §26 fallback');
for(const file of ['index.html','sw.js','download-bundle.js']){
 const source=read(file);
 assert(source.includes('edition-r3-20261020.js?v=20261105-scholarly-review1'),file+' loads new canonical data');
}
assert(read('sw.js').includes('daruri-reader-20261105-scholarly-review1'),'New offline cache revision');
console.log('PASS: Scholar review §§17/23/26 — correct logic and antecedents, unaltered Arabic witness, textual crux flagged, notes linked, fallback and offline assets synchronized.');
