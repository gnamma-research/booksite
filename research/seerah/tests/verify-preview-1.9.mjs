import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const data=JSON.parse(read('editorial/PREVIEW_1_9_0_THREE_FOOTNOTED_CHAPTERS.json'));
const previous=JSON.parse(read('data/chapters.json'));
const html=read('read-preview-1.9.0.html'),man=read('editorial/PREVIEW_1_9_0_THREE_FOOTNOTED_CHAPTERS.md');
assert.equal(data.edition,'1.9.0-footnoted-three-chapter-preview');
assert.equal(previous.edition,'1.8.0-metaphysical-restoration');
assert.equal(data.chapters.length,46);
assert.ok(html.includes('three revised chapters only'));
assert.equal((html.match(/<article class="chapter"/g)||[]).length,46);
assert.equal((html.match(/role="doc-endnotes"/g)||[]).length,3);
assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
function tok(s,isHtml){
 if(isHtml)s=s.replace(/<\/(?:p|li|h[1-6]|blockquote)>/g,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
 else s=s.replace(/\[\^n?(\d+)\]/g,(_,n)=>n).replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g,'$1').replace(/[*_`]/g,'');
 return(s.match(/[\p{L}\p{M}\p{N}]+/gu)||[]).map(w=>w.toLowerCase());
}
const revised=new Set([1,13,44]);let notes=0;
for(const ch of data.chapters){
 const i=ch.id,old=previous.chapters[i-1],id='ch-'+String(i).padStart(2,'0');
 if(revised.has(i)){
  assert.ok(ch.footnotes?.length>0,'Missing notes in chapter '+i);
  assert.notEqual(ch.matn,old.matn);
  assert.notEqual(ch.sharh,old.sharh);
  notes+=ch.footnotes.length;
  for(const n of ch.footnotes){
   assert.ok(html.includes('id="note-ch'+i+'-n'+n.n+'"'));
   assert.ok(html.includes('href="#ref-ch'+i+'-n'+n.n+'"'));
   assert.ok(man.includes('[^n'+n.n+']: '+n.text));
  }
  for(const term of ['Guénon','Schuon','Ibn ʿArabī','Chittick','Qūnawī','Farghānī','Futūḥāt','Fuṣūṣ','al-Qayṣarī']){
   assert.ok(!ch.matn.includes(term)&&!ch.sharh.includes(term),'Source attribution in prose '+i+': '+term);
  }
 }else{
  assert.equal(ch.matn,old.matn,'Unplanned matn change '+i);
  assert.equal(ch.sharh,old.sharh,'Unplanned sharḥ change '+i);
 }
 const start=html.indexOf('<article class="chapter" id="'+id+'"'),end=html.indexOf('</article>',start);
 assert.ok(start>=0&&end>start,'Missing article '+i);
 const article=html.slice(start,end);
 for(const layer of ['matn','sharh']){
  const match=layer==='matn'?article.match(/<section class="matn"[^>]*>([\s\S]*?)<\/section>/):article.match(/<div class="sharh-body">([\s\S]*?)<\/div>/);
  assert.ok(match,'Missing article layer '+i+'/'+layer);
  assert.deepEqual(tok(ch[layer],false),tok(match[1],true),'Text mismatch '+i+'/'+layer);
  assert.ok(man.includes(ch[layer]),'Missing full manuscript layer '+i+'/'+layer);
 }
}
assert.equal(notes,37);
assert.ok(data.chapters[0].sharh.includes('Iblīs: a partial relation made absolute'));
assert.ok(data.chapters[0].sharh.includes('The Garden and the loss of inward vision'));
assert.ok(data.chapters[12].sharh.includes('tadbīr al-manzil'));
assert.ok(data.chapters[43].sharh.includes('Sylhet'));
console.log('PASS Sīrah 1.9 preview: 46 chapter pairs, 3 source-discreet revisions, 37 accessible endnotes, 43 preserved original chapters, complete manuscript parity');
