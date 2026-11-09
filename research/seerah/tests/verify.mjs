import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const root=join(import.meta.dirname,'..');
const read=(p)=>readFileSync(join(root,p),'utf8');
const data=JSON.parse(read('data/chapters.json')), d=JSON.parse(read('data/dossiers.json'));
const reader=read('read.html'),atlas=read('atlas.html'),source=read('editorial/source-edition-1.4.md'),landing=read('index.html'),notes=read('dossiers.html');
assert.equal(data.chapters.length,46,'Expected 46 complete chapter records');
assert.equal(d.dossiers.length,9,'Expected all nine complete critical dossiers');
for(let i=1;i<=46;i++){const ch=data.chapters[i-1];assert.equal(ch.id,i);assert.ok(ch.matn.length>400,'Missing matn '+i);assert.ok(ch.sharh.length>500,'Missing sharh '+i);const id='ch-'+String(i).padStart(2,'0');assert.ok(reader.includes('id="'+id+'"'),'Missing reader chapter '+id);}
for(let i=1;i<=9;i++)assert.ok(notes.includes('id="dossier-'+i+'"'));
for(const id of ['timeline','arabia','community','authority','law','spiritual','monsoon'])assert.ok(atlas.includes('id="figure-'+id+'"'));
assert.equal((reader.match(/class="chapter"/g)||[]).length,46);
assert.equal((reader.match(/class="matn"/g)||[]).length,46);
assert.equal((reader.match(/class="sharh"/g)||[]).length,46);
assert.ok(reader.includes('data-mode="matn"')&&reader.includes('data-mode="both"'));
assert.ok(reader.includes('data-bookmark='));
assert.ok(reader.includes('assets/figures.js')&&reader.includes('assets/site.js'));
assert.ok(source.includes('Dossier 9')&&source.includes('46 matns and 46 shurūḥ'));
assert.ok(landing.includes('read.html')&&landing.includes('atlas.html'));
assert.ok(!/<img[^>]+src=""|href=""/.test(reader),'Empty asset/link attributes');
// Editorial style regression: the prose should describe history, not its own rhetorical work.
const forbidden=[
 /those differences prepare the reader/i,
 /the reader (?:should|must|needs to)/i,
 /the (?:chapter|matn|commentary|narrative) (?:should|must|now|thus)/i,
 /the point is (?:to understand|to see)/i,
 /we (?:must|should|need to) (?:see|understand|imagine|preserve|follow)/i
];
for(const chapter of data.chapters){
 for(const layer of ['matn','sharh']){
  for(const expression of forbidden){
   assert.ok(!expression.test(chapter[layer]),'Self-referential prose in chapter '+chapter.id+' '+layer+': '+expression);
  }
 }
}
assert.ok(reader.includes('Research edition 1.4.1 · under review'),'Reader version mismatch');
assert.ok(read('editorial/current-edition-1.4.1.md').includes('## 46.'),'Revised manuscript missing final chapter');

console.log('PASS: 46 chapters, 9 dossiers, 7 figures, two reading modes and linked static documents');
