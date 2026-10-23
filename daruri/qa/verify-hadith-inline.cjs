'use strict';
/* H note reader QA: 33 source notes / 51 editorially aligned quotes / both languages.
 * Requires jsdom (installed in daruri-hadith-context-qa.yml). */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..');
const src=name=>fs.readFileSync(path.join(base,name),'utf8');
const book=require('./load-book.js')(src('index.html'));
const meta={};
const ctx=require('node:vm').createContext({window:meta});
new (require('node:vm').Script)(src('hadith-context-data.js')).runInContext(ctx);
const hadith=meta.GnammaHadithContextData.notes;
const sections=new Map(book.sections.map(section=>[String(section.id),section]));
assert.equal(Object.keys(hadith).length,33);
assert(src('source-reference-data.js').includes('hadith-inline-anchors.js'));
assert(src('download-bundle.js').includes('hadith-inline-anchors.js'));
assert(src('sw.js').includes('hadith-inline-anchors.js'));
async function test(){
  const dom=new JSDOM('<html><head></head><body><div id="mainContent"></div></body></html>',
    {url:'https://example.test/daruri/#section=31',runScripts:'outside-only'});
  const win=dom.window,doc=win.document;
  win.requestAnimationFrame=fn=>setTimeout(fn,0);
  win.HTMLElement.prototype.scrollIntoView=function(){this.dataset.qaScrolled='true'};
  const main=doc.getElementById('mainContent');
  const reader=doc.createElement('div');reader.className='reader';
  for(const record of Object.values(hadith)){
    const id=String(record.section),sec=sections.get(id);
    assert(sec,'Missing reader section: '+id);
    const group=doc.createElement('section');
    group.className='gn-continuous-section';group.dataset.readingSection=id;
    sec.segments.forEach((piece,i)=>{
      const row=doc.createElement('div');row.className='passage-grid';row.dataset.segment=String(i);
      const ar=doc.createElement('div');ar.className='passage-ar';ar.lang='ar';ar.dir='rtl';ar.textContent=piece.ar;
      const en=doc.createElement('div');en.className='passage-en';en.lang='en';en.textContent=piece.en;
      row.append(ar,en);group.append(row);
    });
    reader.append(group);
  }
  main.append(reader);
  win.eval(src('hadith-inline-anchors.js'));
  const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
  for(let i=0;i<10;i++)await tick();
  assert.equal(win.GnammaHadithInlineQA.notes,33);
  assert.equal(win.GnammaHadithInlineQA.anchors,51);
  const markers=[...doc.querySelectorAll('.gn-hadith-inline-marker')];
  assert.equal(markers.length,102,'Each of the 51 exact phrases must have an Arabic and English H symbol');
  assert(markers.every(a=>a.textContent==='H'&&!a.hasAttribute('data-gn-notes-open')&&a.dataset.noteTarget===a.dataset.gnHadithInline&&a.href.endsWith('#note-'+a.dataset.gnHadithInline)),'H symbols must target their source notes without impersonating Notes button');
  for(const note of Object.values(hadith)){
    const section=String(note.section);
    const group=doc.querySelector('[data-reading-section="'+section+'"]');
    assert(group);
    for(const language of ['.passage-ar','.passage-en']){
      const links=[...group.querySelectorAll(language+' .gn-hadith-inline-marker')];
      assert(links.length>0,'No '+language+' H symbol for §'+section);
      assert(links.every(a=>a.dataset.gnHadithInline==='HAD-R'+section.padStart(3,'0')),
        'Wrong note link for '+language+' §'+section);
    }
  }
  doc.dispatchEvent(new win.Event('gnamma-reader-route-change'));
  for(let i=0;i<4;i++)await tick();
  assert.equal(doc.querySelectorAll('.gn-hadith-inline-marker').length,102,'Redraw duplicates H links');
  const first=doc.querySelector('[data-reading-section="31"] .passage-ar .gn-hadith-inline-marker');
  const opener=doc.createElement('a');opener.dataset.gnNotesOpen='';opener.textContent='Notes (4)';doc.body.prepend(opener);
  let actualTarget=null;
  doc.addEventListener('click',event=>{
    const source=event.target.closest('[data-note-target]');
    if(!source)return;
    actualTarget=source.dataset.noteTarget;
    const layer=doc.createElement('div');layer.id='gn-scholar-layer';
    layer.innerHTML='<button data-gn-close>Return to reading</button><section class="gn-note-entry" data-note-id="HAD-R031">Hadith source note</section>';
    doc.body.append(layer);
    layer.querySelector('[data-gn-close]').focus();
  });
  first.focus();first.click();for(let i=0;i<4;i++)await tick();
  const note=doc.querySelector('#gn-scholar-layer [data-note-id="HAD-R031"]');
  assert.equal(actualTarget,'HAD-R031','Click opened the exact Hadith source record');
  assert(note,'Inline marker opens its own source note');
  assert.equal(doc.activeElement.dataset.gnClose,'','Popup focuses its close control');
  assert.equal(opener.textContent,'Notes (4)','The main Notes control must not be renamed or hijacked');
  assert(!first.hasAttribute('data-gn-notes-open'),'The H marker must not masquerade as the Notes trigger');
  dom.window.close();
  console.log('PASS: 33 Hadith note sections; 51 exact AR/EN phrase pairs; 102 H markers, no duplicates, direct source routing, clean Notes trigger and offline assets.');
}
test().catch(err=>{console.error(err);process.exitCode=1;});
