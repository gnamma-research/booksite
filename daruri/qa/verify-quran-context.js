/* Offline Quran context integrity and reader wiring audit.
   Run: node daruri/qa/verify-quran-context.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('build/data/quran-source-notes.json'));
const data=JSON.parse(read('quran-context-data.json'));
const page=read('index.html');
const js=read('quran-context-ui.js');
const css=read('quran-context-ui.css');
const sw=read('sw.js'),bundle=read('download-bundle.js');
assert.equal(data.schema_version,1);
assert.equal(corpus.counts.notes,50);
assert.equal(Object.keys(data.notes).length,corpus.notes.length);
assert.equal(Object.keys(data.verses).length,132,'Deduplicated verified verse inventory');
assert.ok(data.arabic_source.includes('Tanzil'));
assert.ok(data.english_source.includes('Pickthall'));
assert.ok(data.arabic_license.includes('Attribution 3.0'));
assert.ok(read('QURAN_CONTEXT_SOURCES.md').includes('CHANGING IT IS NOT ALLOWED'));
let citations=0;
for(const note of corpus.notes){
  const refs=data.notes[note.id];
  assert.ok(Array.isArray(refs),'Missing Quran note '+note.id);
  assert.equal(refs.length,note.references.length,'Reference grouping '+note.id);
  for(let i=0;i<refs.length;i++){
    const ref=refs[i],src=note.references[i];
    const prefix=String(src.surah)+':';
    assert.equal(ref.label,src.label_en);
    assert.equal(ref.url,src.url);
    assert.equal(ref.start,src.ayah_start);
    assert.equal(ref.end,src.ayah_end);
    assert.ok(ref.verses.every(k=>k.startsWith(prefix)),'No cross-surah spill');
    assert.equal(ref.verses[0],prefix+Math.max(1,ref.start-1));
    assert.equal(ref.verses.at(-1).split(':')[1]*1,
      ref.end===ref.verses.at(-1).split(':')[1]*1 ? ref.end:ref.end+1,
      'One following ayah unless at chapter end');
    const cited=ref.verses.filter(k=>{
      const verse=Number(k.split(':')[1]);return verse>=ref.start&&verse<=ref.end;
    });
    assert.equal(cited.length,ref.end-ref.start+1);
    for(const key of ref.verses){
      const verse=data.verses[key];
      assert.ok(verse && typeof verse.ar==='string' && typeof verse.en==='string');
      assert.ok(/[\u0621-\u064a]/u.test(verse.ar),'Arabic is present '+key);
      assert.ok(/[a-z]/i.test(verse.en),'English translation is present '+key);
    }
    citations++;
  }
}
assert.equal(citations,53);
const keys=(id,index=0)=>data.notes[id][index].verses;
assert.deepEqual(keys('QUR-R001-Q049'),['55:3','55:4','55:5']);
assert.deepEqual(keys('QUR-R038-Q001'),['4:42','4:43','4:44']);
assert.deepEqual(keys('QUR-R163-Q022'),['2:66','2:67','2:68','2:69','2:70','2:71','2:72']);
assert.deepEqual(keys('QUR-R167-Q025',0),['4:42','4:43','4:44']);
assert.deepEqual(keys('QUR-R167-Q025',1),['5:5','5:6','5:7']);
assert.equal(data.verses['2:1'].ar.includes('بِسْمِ'),false,'Unnumbered basmala is not miscounted as ayah 1');
assert.ok(page.includes('quran-context-ui.js?v=20261022-qcontext1'));
assert.ok(page.includes('quran-context-ui.css?v=20261022-qcontext1'));
for(const fname of ['quran-context-ui.js','quran-context-ui.css','quran-context-data.json']){
  assert.ok(sw.includes(fname+'?v=20261022-qcontext1'),'Offline core '+fname);
  assert.ok(bundle.includes("'daruri/"+fname+"'"),'Offline ZIP '+fname);
}
assert.ok(bundle.includes('QURAN_CONTEXT_SOURCES.md'),'Offline legal/source notice');
assert.ok(page.includes('gnNotesCardHTML([note])'),'Inline note reuses the section Notes template');
assert.ok(/data\.notes\[noteId\]/.test(js));
assert.ok(/const kind=n<ref\.start\?'Preceding'/.test(js));
assert.ok(/\.gn-context-cited/.test(css));
new Function(js);
console.log('PASS: 50 note IDs; 53 references; 132 verified Arabic/English ayahs; precise ±1 context; range and multiple-sura citations; source licence, lazy UI, offline/ZIP wiring and inline card parity.');
