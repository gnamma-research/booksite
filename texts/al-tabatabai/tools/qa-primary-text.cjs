/* No source data or PDFs may be rewritten to change the reader's editorial layer. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('texts/index.html'),dock=read('assets/gnamma-bottom.js');
const reader=read('texts/al-tabatabai/assets/hikma-reader.js');
const study=read('texts/al-tabatabai/assets/hikma-study-tools.js');
const qaw=read('texts/al-turka/qawaid-al-tawhid/qawaid-study.js');
const qcss=read('texts/al-turka/qawaid-al-tawhid/qawaid-study.css');
function section(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i);assert.ok(i>=0&&j>i,'missing classification anchors');return s.slice(i,j);}
const philosophy=section(catalog,'aria-label="Falsafa · Philosophy"','aria-label="Manṭiq · Logic"');
const logic=section(catalog,'aria-label="Manṭiq · Logic"','aria-label="Kalām"');
assert.match(philosophy,/bidayat-al-hikma\/|bidayat-al-hikma/);
assert.match(philosophy,/nihayat-al-hikma/);
assert.doesNotMatch(philosophy,/muzaffar-al-mantiq/);
assert.match(logic,/muzaffar-al-mantiq/);
const bottomPhilosophy=section(dock,'heading:"Falsafa · Philosophy"','heading:"Manṭiq · Logic"');
assert.doesNotMatch(bottomPhilosophy,/muzaffar-al-mantiq/);
assert.match(section(dock,'heading:"Manṭiq · Logic"','heading:"Kalām"'),/muzaffar-al-mantiq/);
assert.match(reader,/headings: .*'original'/);
assert.match(reader,/!isGuide\(unit\).*state\.savedOnly/);
assert.match(reader,/const entries = \[\]/);
assert.doesNotMatch(reader,/if \(source\.url\) entries\.push/);
assert.match(study,/function buildEditorial\(/);
assert.match(study,/function buildRelated\(/);
assert.doesNotMatch(study,/node\.append\(context\)/);
assert.match(qaw,/function editorialNotesPanel\(/);
assert.match(qcss,/#reading \.source-notes\{display:none!important\}/);
for(const slug of ['bidayat-al-hikma','nihayat-al-hikma','muzaffar-al-mantiq']){
 const html=read('texts/al-tabatabai/'+slug+'/index.html');
 assert.ok(html.includes('Texts <span aria-hidden="true">/</span>'));
 assert.match(html,/\.\.\/\.\.\//);
}
console.log('PASS: primary text reader classification, note separation, discussion routes and source preservation');
