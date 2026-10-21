'use strict';
/* Offline, dependency-free provenance and passage ownership verification.
   Verify exactly the two approved §1 Quranic comparison notes without promoting
   any withheld editorial hypothesis to a direct authorial citation. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const q = JSON.parse(read('build/data/quran-source-notes.json'));
const node = { textContent:'' };
vm.runInNewContext(read('edition-r3-20261020.js'), {document:{getElementById:()=>node}});
const book = JSON.parse(node.textContent);
const restored = [
 {id:'QUR-R001-Q049', url:'https://quran.com/55/4', phrase:'معلم البيان', verse:'عَلَّمَهُ ٱلْبَيَانَ'},
 {id:'QUR-R001-Q050', url:'https://quran.com/6/149', phrase:'الحجج البالغة', verse:'فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ'}
];
const withheld = ['QUR-R001-Q051','QUR-R011-Q052','QUR-R047-Q053'];
assert.equal(q.notes.length, 50);
assert.equal(q.counts.notes, 50);
assert.equal(q.counts.anchor_pairs, 54);
assert.equal(q.counts.withheld_allusions, 3);
assert.deepEqual(q.withheld_editorial_allusions.map(x=>x.id),withheld);
assert.equal(book.notes.length,625);
assert.equal(book.stats.notes,625);
assert.equal(book.stats.noteCount,625);
assert.equal(book.sections.length,259);
assert.equal(book.notes.filter(x=>x.source_type==='quran').length,50);
assert.equal(book.notes.filter(x=>x.source_type==='hadith').length,33);
assert.equal(book.notes.filter(x=>!['quran','hadith'].includes(x.source_type)).length,542);
assert.equal(new Set(book.notes.map(x=>x.id)).size,625);
const s=book.sections.find(x=>x.id===1);
assert(s);
assert.deepEqual(s.noteIds.slice(-2), restored.map(x=>x.id));
const ui=read('source-note-ui.js'), pdf=read('build/main_text.py');
for(const expected of restored){
 const qn=q.notes.find(n=>n.id===expected.id);
 const rn=book.notes.find(n=>n.id===expected.id);
 assert(qn && rn,expected.id + ' record missing');
 assert.equal(qn.section_id,1);
 assert.equal(qn.reference_type,'allusion');
 assert.equal(rn.reference_type,'allusion');
 assert.equal(rn.kind,'quran-source');
 assert.equal(qn.references[0].url,expected.url);
 assert.equal(rn.references[0].url,expected.url);
 assert.equal(rn.text,qn.text_en);
 assert.equal(rn.textAr,qn.text_ar);
 assert(qn.text_en.includes('possible verbal echo'));
 assert(qn.text_en.includes('not a quotation'));
 assert(qn.text_ar.includes('تلميحًا') || qn.text_ar.includes('تشابه لفظي'));
 assert(qn.anchors.length===1 && qn.anchors[0].segment_index===0);
 for(const lang of ['ar','en','vocalized']){
  const anchor=qn.anchors[0][lang].text;
  assert(s.segments[0][lang].includes(anchor),expected.id+' lost '+lang+' anchor');
 }
 assert(s.segments[0].ar.includes(expected.phrase));
 assert(ui.includes(expected.id));
 assert(ui.includes(expected.verse));
 assert(pdf.includes(expected.id));
 assert(pdf.includes(expected.verse));
}
for(const id of withheld){
 assert(!s.noteIds.includes(id),id+' appears in §1');
 assert(!q.notes.some(n=>n.id===id),id+' published in map');
 assert(!book.notes.some(n=>n.id===id),id+' published in reader');
}
assert(ui.includes('QUR-R038-Q001'), 'existing real quotation preserved');
assert(pdf.includes('QUR-R038-Q001'), 'existing PDF quotation preserved');
console.log('PASS: 50 Quran sources; §1 possible 55:4 + 6:149 parallels; three hypotheses withheld; all source anchors and 542 existing notes intact.');
