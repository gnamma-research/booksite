'use strict';
/* Verifies the exact Daruri phrase-level H markers, collapsed headings and native note routing. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..');
const src=p=>fs.readFileSync(path.join(base,p),'utf8');
const edition={textContent:''};
vm.runInNewContext(src('edition-r3-20261020.js'),{document:{getElementById:()=>edition}});
const book=JSON.parse(edition.textContent);
const holder={window:{}};
vm.runInNewContext(src('hadith-anchor-data.js'),holder);
const map=holder.window.GnammaHadithAnchorMap;
assert.equal(Object.keys(map.notes).length,33);
assert.equal(Object.values(map.notes).reduce((s,n)=>s+n.anchors.length,0),46);
assert.equal(Object.keys(map.quranRelated).length,4);
const strip=s=>String(s).replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'');
const byId=new Map(book.sections.map(s=>[+s.id,s]));
for(const [id,note] of Object.entries(map.notes)){
 const section=byId.get(note.section);assert(section,'Missing section '+id);
 for(const anchor of note.anchors){
  const text=strip(section.segments[anchor.seg].ar),word=strip(anchor.ar),pos=text.indexOf(word);
  assert(pos>=0&&text.indexOf(word,pos+word.length)<0,'Ambiguous/missing source phrase '+id+' '+anchor.ar);
 }
}
const html=src('index.html');
assert(html.includes("if(note.source_type==='quran'||note.source_type==='hadith')"),
  'Hadith marker must use the same native single-note modal as Quran');
assert(html.includes('source-reference-data.js?v=20261023-hnux1'),'Reader must load the new note bridge');
const wait=()=>new Promise(resolve=>setTimeout(resolve,0));
async function test(){
 const section=byId.get(49);
 const doc=new JSDOM('<!doctype html><html><head></head><body><div id="reader" class="reader"><div class="passage-ar" data-ar-seg="2">'+section.segments[2].ar+'</div></div></body></html>',
 {url:'https://gnamma-research.github.io/booksite/daruri/#section=49',runScripts:'outside-only',pretendToBeVisual:true});
 const w=doc.window,d=w.document,orig=d.head.append.bind(d.head),errors=[];
 w.console.warn=(...args)=>errors.push(args.join(' '));
 d.head.append=function(...nodes){
  const result=orig(...nodes);
  for(const node of nodes){
   if(node.tagName==='SCRIPT'&&node.src.includes('hadith-')||node.tagName==='SCRIPT'&&node.src.includes('quran-context-data.js')){
    const file=new URL(node.src).pathname.split('/').at(-1);
    try{w.eval(src(file));queueMicrotask(()=>node.onload?.());}
    catch(error){errors.push(String(error));queueMicrotask(()=>node.onerror?.(error));}
   }
  }
  return result;
 };
 w.eval(src('hadith-note-integration.js'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 for(let i=0;i<12;i++)await wait();
 assert.equal(d.querySelectorAll('#reader .gn-inline-hadith-ref[data-note-target="HAD-R049"]').length,1);
 let total=0;
 for(const [id,note] of Object.entries(map.notes)){
  w.history.replaceState(null,'','#section='+note.section);
  const reader=d.querySelector('#reader');reader.replaceChildren();
  const sec=byId.get(note.section);
  for(const [i,seg] of sec.segments.entries()){
   const passage=d.createElement('div');passage.className='passage-ar';passage.dataset.arSeg=i;passage.textContent=seg.ar;reader.append(passage);
  }
  for(let i=0;i<3;i++)await wait();
  const marked=[...reader.querySelectorAll('.gn-inline-hadith-ref')];
  assert.equal(marked.length,note.anchors.length,'Missing/duplicated inline marker '+id);
  assert(marked.every(x=>x.textContent==='H'&&x.dataset.noteTarget===id),'Source H label/target '+id);
  total+=marked.length;
 }
 assert.equal(total,46,'All verified inline markers placed in the actual Arabic text');
 w.history.replaceState(null,'','#section=49');
 const parent=d.querySelector('#reader');parent.replaceChildren();
 const p=d.createElement('div');p.className='passage-ar';p.dataset.arSeg='2';
 const phrase=map.notes['HAD-R049'].anchors[0].ar,raw=section.segments[2].ar,ix=raw.indexOf(phrase);
 p.append(d.createTextNode(raw.slice(0,ix)));
 const button=d.createElement('button');button.textContent=phrase;p.append(button,d.createTextNode(raw.slice(ix+phrase.length)));parent.append(p);
 for(let i=0;i<3;i++)await wait();
 assert.equal(p.querySelectorAll('button a').length,0,'Do not nest a source hyperlink inside a term button');
 assert.equal(p.querySelectorAll('.gn-inline-hadith-ref').length,1);
 const anchorCard=d.createElement('section');anchorCard.className='gn-note-entry';anchorCard.dataset.noteId='HAD-R049';
 anchorCard.innerHTML='<h3>Hadith source <small>HAD-R049</small></h3><p>Technical long source note text</p>';d.body.append(anchorCard);
 const qCard=d.createElement('section');qCard.className='gn-note-entry';qCard.dataset.noteId='QUR-R049-Q003';
 qCard.innerHTML='<h3>Qurʾān source <small>QUR-R049-Q003</small></h3><p>Quran citation</p><a class="quran-source-ref">Q1</a>';d.body.append(qCard);
 for(let i=0;i<10;i++)await wait();
 assert(anchorCard.querySelector('h3 .gn-source-heading-primary'),'Hadith heading should use authorial wording');
 assert(anchorCard.querySelector('h3 .gn-quiet-note-id')?.textContent==='HAD-R049','Reference ID remains accessible');
 assert(!anchorCard.querySelector('p').textContent.includes('Technical long'),'Original editorial explanation is condensed');
 assert(qCard.querySelector('h3 .gn-source-heading-ar')?.textContent.includes('سَقَرَ')||
        qCard.querySelector('h3 .gn-source-heading-ar')?.textContent.length>20,'Quran note begins with source ayah');
 assert.equal(qCard.querySelector('a.quran-source-ref').textContent,'Q','No extra Quran marker numbering in inline passage');
 assert(!errors.some(x=>/Hadith anchor data unavailable|Uncaught/.test(x)),errors.join('\n'));
 console.log('PASS: all 33 Hadith notes, 46 inline H markers, same native note modal, word-safe insertion, quiet labels, Quran heading and compact references.');
 doc.window.close();
}
test().catch(e=>{console.error(e);process.exitCode=1;});