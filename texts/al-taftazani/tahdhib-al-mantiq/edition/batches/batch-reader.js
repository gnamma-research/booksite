/* Two verifiable bilingual batches of main al-Yazdī ḥāshiya.
 * Source data are loaded from ../yazdi-continuous-*.js in fixed order.
 * Never mistake the printed later hāmish for principal authorial text. */
(function(){
'use strict';
const config={
 1:{first:7,last:66,markdown:'yazdi-main-batch-01-q7-66.md',other:'batch-02-q67-123.html',expected:55},
 2:{first:67,last:123,markdown:'yazdi-main-batch-02-q67-123.md',other:'batch-01-q7-66.html',expected:55}
};
const batch=Number(document.body.dataset.batch||1),cfg=config[batch],status=document.getElementById('batch-status');
if(!cfg){status.textContent='Unknown batch';return}
const refs=[
 ['GNAMMA_YAZDI_CONTIGUOUS_Q7_13','L.01'],['GNAMMA_YAZDI_CONTIGUOUS_Q14_19','L.02'],['GNAMMA_YAZDI_CONTIGUOUS_L03','L.03'],
 ['GNAMMA_YAZDI_CONTIGUOUS_UNIVERSALS',null],['GNAMMA_YAZDI_CONTIGUOUS_L07','L.07'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q48_51',null],['GNAMMA_YAZDI_CONTIGUOUS_Q54_58','L.10'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q59_64','L.11'],['GNAMMA_YAZDI_CONTIGUOUS_Q65_69','L.12'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q70_73','L.13'],['GNAMMA_YAZDI_CONTIGUOUS_Q74_80','L.14'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q81_84','L.15'],['GNAMMA_YAZDI_CONTIGUOUS_Q86_94','L.16'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q95_97','L.16'],['GNAMMA_YAZDI_CONTIGUOUS_Q98_101','L.16'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q102_104','L.17'],['GNAMMA_YAZDI_CONTIGUOUS_Q105_108','L.18'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q110_113','L.18'],['GNAMMA_YAZDI_CONTIGUOUS_Q114_118','L.19'],
 ['GNAMMA_YAZDI_CONTIGUOUS_Q119_123','L.19']
];
const all=refs.flatMap(([key,defaultUnit])=>{
 const doc=window[key];if(!doc)return[];
 const entries=[doc.blocks,doc.sourcePages,doc.sourceBlocks].find(Array.isArray)||[];
 return entries.map((p,i)=>({...p,unit:p.unit||doc.unit||defaultUnit||'',_order:i,_book:key}));
}).filter(x=>x.page>=cfg.first&&x.page<=cfg.last)
 .sort((a,b)=>a.page-b.page||Number(a.unit.slice(2))-Number(b.unit.slice(2))||a._order-b._order);
const pages=[...new Set(all.map(p=>p.page))],contents=document.getElementById('batch-contents'),book=document.getElementById('batch-book');
function make(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e}
if(pages.length!==cfg.expected||all.some(b=>!b.ar||!b.en||!b.sourceUrl)){
 status.textContent='Source-text integrity warning: expected '+cfg.expected+' translated printed-page positions, loaded '+pages.length+'. No missing source text has been fabricated.';
 status.dataset.error='true';return
}
const aw=all.reduce((n,p)=>n+p.ar.trim().split(/\s+/).length,0),ew=all.reduce((n,p)=>n+p.en.trim().split(/\s+/).length,0);
status.textContent=pages.length+' Qum main-text page positions · '+aw.toLocaleString()+' Arabic words · '+ew.toLocaleString()+' English words';
document.getElementById('batch-download').href=cfg.markdown;
document.getElementById('other-batch').href=cfg.other;
document.getElementById('batch-number').textContent='Batch '+batch+' / 2';
for(const p of pages){
 const option=make('option',null,'Qum p. '+p);option.value='q'+p;contents.append(option);
 const article=make('article','yazdi-page');article.id='q'+p;article.dataset.page=String(p);
 const head=make('div','yazdi-page-head'),h=make('h2',null,'Qum · '+p),sub=make('span',null,[...new Set(all.filter(x=>x.page===p).map(x=>x.unit))].join(' · '));
 head.append(h,sub);article.append(head);
 const segments=all.filter(x=>x.page===p);
 for(let i=0;i<segments.length;i++){
  const block=segments[i],seg=make('section','yazdi-segment');
  seg.append(make('h3',null,block.title||'Commentary'+(segments.length>1?' · segment '+(i+1):'')));
  const spread=make('div','yazdi-pair');
  const arcol=make('div','yazdi-ar-col'),encol=make('div','yazdi-en-col');
  arcol.append(make('span','yazdi-lang-label','العربية'));
  const ar=make('p','yazdi-ar',block.ar);ar.lang='ar';ar.dir='rtl';arcol.append(ar);
  encol.append(make('span','yazdi-lang-label','English'));
  const en=make('p','yazdi-en',block.en);en.lang='en';encol.append(en);spread.append(arcol,encol);seg.append(spread);
  const provenance=make('div','yazdi-provenance');
  const link=make('a',null,'Qum printed Arabic · p. '+block.page);
  link.href=block.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
  provenance.append(link,make('span',null,'Principal sharḥ · searchable transcription; photograph/manuscript unchecked'));seg.append(provenance);
  if(block.notes?.length){
   const detail=make('details','yazdi-notes');detail.append(make('summary',null,'Editorial and textual notes ('+block.notes.length+')'));
   for(const note of block.notes)detail.append(make('p',null,note));seg.append(detail);
  }
  if(block.seam){
   seg.append(make('p','yazdi-seam','Source boundary: '+block.seam));
  }
  article.append(seg);
 }
 book.append(article);
}
if(batch===2){
 const col=window.GNAMMA_YAZDI_CONTIGUOUS_Q119_123?.colophon;
 if(col){
  const sec=make('section','yazdi-colophon');
  sec.append(make('h2',null,'Separate printed completion notice — not al-Yazdī’s prose'));
  const a=make('p','yazdi-ar',col.text);a.lang='ar';a.dir='rtl';sec.append(a);
  sec.append(make('p','yazdi-en',col.english));
  const link=make('a',null,'Read the printed source');link.href=col.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
  sec.append(link,make('p','yazdi-seam',col.attribution));book.append(sec);
 }
}
contents.addEventListener('change',()=>{
 const page=document.getElementById(contents.value);page?.scrollIntoView({block:'start',behavior:'smooth'});
});
const toggles={ar:document.getElementById('toggle-ar'),en:document.getElementById('toggle-en')};
for(const [lang,button] of Object.entries(toggles)){
 button.addEventListener('click',()=>{
  const show=document.body.dataset[lang]!=='off';
  const other=lang==='ar'?'en':'ar';
  if(show&&document.body.dataset[other]==='off')return;
  document.body.dataset[lang]=show?'off':'on';
  button.setAttribute('aria-pressed',String(!show));
 });
}
})();