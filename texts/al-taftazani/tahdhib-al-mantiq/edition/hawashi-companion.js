/* Separated, attributed secondary commentary reader.
 * THIS IS NOT THE ORIGINAL AL-YAZDI MAIN SHARH AND DOES NOT CREATE A THIRD TEXT-LAYER MODE.
 * Each card translates a selected excerpt only; surrounding commentary is editorial analysis.
 */
(function(){
'use strict';
const sources=[
 window.GNAMMA_YAZDI_HAWASHI_BATCH_127_140,
 window.GNAMMA_YAZDI_HAWASHI_BATCH_RECOVERED,
 window.GNAMMA_YAZDI_HAWASHI_BATCH_142_155,
 window.GNAMMA_YAZDI_HAWASHI_BATCH_156_168,
 window.GNAMMA_YAZDI_HAWASHI_BATCH_169_178
].flatMap(x=>Array.isArray(x)?x:[]);
const seen=new Set();const entries=sources.filter(e=>{
 if(!e||!Number.isInteger(e.page)||seen.has(e.page))return false;seen.add(e.page);return true;
}).sort((a,b)=>a.page-b.page);
const $=id=>document.getElementById(id);
const make=(tag,cls,content)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=content;return el};
const chunks=[
 {name:'Preface and praise',start:127,end:140},
 {name:'Prologue, language and discourse',start:141,end:155},
 {name:'Introduction and logical canons',start:156,end:168},
 {name:'Knowledge, assent and demonstration',start:169,end:178}
];
const list=$('reader-pages'),toc=$('toc-pages'),search=$('reader-search'),group=$('range-select'),count=$('visible-count'),status=$('reader-status');
const render=()=>{
 if(!list||!toc)return;
 list.replaceChildren();toc.replaceChildren();
 const text=(search?.value||'').toLocaleLowerCase().trim(),range=group?.value||'all';
 // A bare page number is a precise locator, not a broad text search:
 // searching 163 must not also match a note on p164 that mentions p163.
 const exactPage=/^\\d{1,3}$/.test(text)?Number(text):null;
 const filtered=entries.filter(e=>(range==='all'||chunks.some((g,i)=>String(i)===range&&e.page>=g.start&&e.page<=g.end))&&
  (exactPage!==null?e.page===exactPage:
   !text||[e.title,e.englishExcerpt,e.editorialAnalysis,e.arabicExcerpt,e.attribution,String(e.page)].some(x=>String(x).toLocaleLowerCase().includes(text))));
 for(const e of filtered){
  const card=make('article','hw-page');card.id='page-'+e.page;card.dataset.page=String(e.page);
  const heading=make('header','hw-page-header');
  const head=make('div','hw-heading-wrap');
  head.append(make('span','hw-page-number','Qum p. '+e.page),make('h2','hw-page-title',e.title));
  const source=make('a','hw-source','View printed Arabic');
  source.href=e.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';
  heading.append(head,source);card.append(heading);
  const meta=make('p','hw-author','Named voices on printed page: '+e.attribution+'. Verify signature at the individual note before assigning its author.');
  card.append(meta);
  const pair=make('div','hw-pair');
  const arwrap=make('section','hw-pair-cell');arwrap.append(make('div','hw-eyebrow','Arabic · selected excerpt'));
  const ar=make('p','hw-arabic',e.arabicExcerpt);ar.lang='ar';ar.dir='rtl';arwrap.append(ar);
  const enwrap=make('section','hw-pair-cell');enwrap.append(make('div','hw-eyebrow','English · translation of excerpt'));
  const en=make('p','hw-english',e.englishExcerpt);en.lang='en';enwrap.append(en);
  pair.append(arwrap,enwrap);card.append(pair);
  const analysis=make('div','hw-analysis');analysis.append(make('div','hw-eyebrow','Editorial analysis · not a full-page translation'));
  analysis.append(make('p',null,e.editorialAnalysis));
  card.append(analysis);
  const foot=make('footer','hw-foot','Working source-linked excerpt; no manuscript collation and no complete-page claim. The marginal voices are distinct from al-Yazdī.');
  card.append(foot);
  list.append(card);
  const a=make('a','hw-toc-link',e.page+' · '+e.title);
  a.href='#page-'+e.page;toc.append(a);
 }
 if(count)count.textContent=filtered.length+' / '+entries.length+' source pages';
 if(status)status.textContent=entries.length===52&&entries[0]?.page===127&&entries.at(-1)?.page===178?'52 source pages reviewed · 52 selected passages translated · 0 complete-page certifications':'Source coverage differs from the 52-page register; inspect the files';
 if(!filtered.length)list.append(make('p','hw-empty','No excerpts match this search.'));
};
group?.addEventListener('change',render);
search?.addEventListener('input',render);
$('clear-search')?.addEventListener('click',()=>{if(search)search.value='';if(group)group.value='all';render()});
$('toggle-menu')?.addEventListener('click',()=>{const nav=$('reader-menu');if(!nav)return;const will=nav.hidden;nav.hidden=!will;$('toggle-menu').setAttribute('aria-expanded',String(will))});
$('close-menu')?.addEventListener('click',()=>{const nav=$('reader-menu');if(nav)nav.hidden=true;$('toggle-menu')?.setAttribute('aria-expanded','false')});
for(const [id,kind] of [['toggle-english','en'],['toggle-arabic','ar']]){
 const button=$(id);button?.addEventListener('click',()=>{
  const next=document.body.dataset.languages===kind?'both':kind;
  document.body.dataset.languages=next;
  for(const [other,k] of [['toggle-english','en'],['toggle-arabic','ar']])$(other)?.setAttribute('aria-pressed',String(next==='both'||next===k));
 });
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const nav=$('reader-menu');if(nav)nav.hidden=true;$('toggle-menu')?.setAttribute('aria-expanded','false')}});
render();
window.GnammaHawashiCompanion=Object.freeze({sourcePages:entries.length,firstPage:entries[0]?.page,lastPage:entries.at(-1)?.page,fullPageTranslations:0,excerptOnly:true,unverifiedManuscripts:true});
})();
