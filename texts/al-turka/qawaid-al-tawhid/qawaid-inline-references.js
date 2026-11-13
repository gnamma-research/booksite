/* GNAMMA · Qawāʿid/Tamhīd source-graded, exact-span reference markers.
 * A marker is inserted AFTER the cited Arabic words; the Arabic words
 * themselves remain a text node, never a link or rewritten quotation.
 * Normal reading alone displays markers. Focus 1/2/3 and print hide them.
 * The 18 reference cards remain the single source for attributed texts.
 */
(function(){
'use strict';
const references=window.GNAMMA_QAWAID_REFERENCES?.items||[];
const policy=window.GNAMMA_QAWAID_CITATION_POLICY||{};
const grades=policy.grades||{}, classified=policy.records||{};
const reading=document.getElementById('reading-list');
if(!reading||!references.length)return;
const byId=new Map(references.map(r=>[r.id,r]));
const allUnits=[
 ...(window.GNAMMA_QAWAID_MATN?.units||[]),
 ...(window.GNAMMA_TAMHID_CORPUS?.units||[]),
 ...(window.GNAMMA_TAMHID_MAIN||[]),
 ...(window.GNAMMA_TAMHID_SHARH?.units||[])
];
const unitById=new Map(allUnits.map(x=>[x.id,x]));
const MASK=/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g;
const arRe=/[\u0600-\u06ff]/;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=s=>/^https:\/\/[^\s"'<>]+$/i.test(String(s||''))?s:null;
const isDirect=r=>(grades[classified[r.id]]?.group==='direct');
const markable=references.filter(isDirect);
const allDirectIds=new Set(markable.map(r=>r.id));
const gradeFor=r=>grades[classified[r.id]]||{group:'comparison',label:'Contextual comparison',explanation:'Not independently established as a direct quotation.'};
const isCombined=!!window.GnammaQawaidReader;
const initialArabicById=new Map();
let currentlyOpen=null,returnTo=null,oldFocus=null;
let markerCount=0,attempts=0,annotations=0;

function normalizeWithPositions(str){
 let text='',start=[],end=[];
 for(let i=0;i<str.length;){
  const c=String.fromCodePoint(str.codePointAt(i)),begin=i;
  i+=c.length;
  const f=c.normalize('NFD').replace(MASK,'')
   .replace(/[أإآٱ]/g,'ا').replace(/[ؤ]/g,'و').replace(/[ئ]/g,'ي')
   .replace(/ى/g,'ي').replace(/ک/g,'ك').replace(/ة/g,'ه').toLowerCase();
  for(const ch of f){text+=ch;start.push(begin);end.push(i);}
 }
 return {text,start,end};
}
function limitedOpening(phrase,n=8){
 const first=String(phrase||'').trim().replace(/^[«“]/,'').split(/\s+/).slice(0,n).join(' ');
 return first.length>=13?first:'';
}
function quotationOpening(r,unit){
 if(r.quoteStart)return limitedOpening(r.quoteStart,7);
 if(!Number.isInteger(r.quoteIndex))return '';
 const quoted=[...String(unit.arabic||'').matchAll(/«([^»]{28,12000})»/g)].map(m=>m[1].trim());
 return limitedOpening(quoted[r.quoteIndex],7);
}
function phrasesFor(r,id){
 if(!(r.units||[]).includes(id))return [];
 const received=policy.phraseOverrides?.[r.id]?.[id];
 if(Array.isArray(received)&&received.length)return received.filter(x=>arRe.test(x));
 if(r.inlineAnchors?.length && (r.type==='quran'||r.type==='hadith'))
  return r.inlineAnchors.filter(x=>arRe.test(x));
 if(r.quoteFrom===id){
  const unit=unitById.get(id);
  const p=unit?quotationOpening(r,unit):'';
  return p?[p]:[];
 }
 return [];
}
function insertAfter(node,phrase,r){
 if(!node||node.nodeType!==Node.TEXT_NODE)return false;
 const original=node.nodeValue||'';
 if(!original||!phrase)return false;
 const mapped=normalizeWithPositions(original),wanted=normalizeWithPositions(phrase).text;
 if(!wanted||wanted.length<8)return false;
 const at=mapped.text.indexOf(wanted);
 if(at<0)return false;
 const a=mapped.start[at],b=mapped.end[at+wanted.length-1];
 if(a<0||b<=a||b>original.length)return false;
 const frag=document.createDocumentFragment();
 frag.append(document.createTextNode(original.slice(0,a)));
 frag.append(document.createTextNode(original.slice(a,b)));
 const sup=document.createElement('sup');
 sup.className='gn-inline-source-marker';
 const btn=document.createElement('button');
 btn.type='button';
 btn.className='gn-source-inline';
 btn.dataset.openSource=r.id;
 btn.dataset.sourceGrade=classified[r.id];
 btn.setAttribute('aria-haspopup','dialog');
 btn.setAttribute('aria-label','Read reference: '+r.title);
 btn.setAttribute('title',r.title+' · '+gradeFor(r).label);
 // The decorative glyph is CSS-only: authorial paragraph textContent remains byte-identical.
 btn.textContent='';
 sup.append(btn);frag.append(sup);
 frag.append(document.createTextNode(original.slice(b)));
 node.replaceWith(frag);
 markerCount++;
 return true;
}
function addMarker(section,phrase,r){
 const blocks=[...section.querySelectorAll('.ar[lang="ar"],.ar[dir="rtl"],.gn-source-ar')];
 if(!blocks.length)return false;
 for(const block of blocks){
  // Source quotations are never linked inside another footnote or modal.
  if(block.closest('.source-notes,dialog'))continue;
  const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);
  const texts=[];
  for(let n=walker.nextNode();n;n=walker.nextNode()){
   const parent=n.parentElement;
   if(parent?.closest('button,a,script,style,.text-label,.gn-source-inline,.gn-term-inline'))continue;
   texts.push(n);
  }
  for(const node of texts)if(insertAfter(node,phrase,r))return true;
 }
 return false;
}
function annotate(){
 if(document.body.dataset.focus!=='0')return;
 for(const r of markable){
  for(const id of r.units||[]){
   const section=document.getElementById(id);
   if(!section||!reading.contains(section))continue;
   if(section.querySelector('.gn-source-inline[data-open-source="'+r.id+'"]'))continue;
   const phrases=phrasesFor(r,id);
   if(!phrases.length)continue;
   attempts++;
   for(const phrase of phrases)if(addMarker(section,phrase,r)){annotations++;break;}
  }
 }
}
let pending=false;
function schedule(){
 if(pending)return;
 pending=true;
 requestAnimationFrame(()=>{pending=false;annotate()});
}
function sourceQuote(r){
 if(!r.quoteFrom)return {arabic:r.arabic||'',english:r.english||'',warning:''};
 const unit=unitById.get(r.quoteFrom);
 if(!unit)return {arabic:'',english:r.english||'',warning:'The original quotation unit is not available in this reader.'};
 const ar=String(unit.arabic||'');
 if(r.quoteStart&&r.quoteEnd){
  const a=ar.indexOf(r.quoteStart),b=a<0?-1:ar.indexOf(r.quoteEnd,a+r.quoteStart.length);
  if(a>=0&&b>a)return {arabic:ar.slice(a,b),english:r.english||'',warning:'Excerpt delimited within Ibn Turka’s quotation; not collated as a complete separate original.'};
  return {arabic:'',english:r.english||'',warning:'This inherited quotation boundary could not be matched exactly; no words have been supplied.'};
 }
 const all=[...ar.matchAll(/«([^»]{28,12000})»/g)].map(m=>m[1].trim());
 const q=all[r.quoteIndex||0]||'';
 return {arabic:q,english:r.english||'',warning:q?'Quotation as preserved within Tamhīd, not a separately collated complete text of the cited work.':'Quoted text could not be delimited in the loaded edition.'};
}
function renderCard(r){
 const grade=gradeFor(r);
 const quote=sourceQuote(r);
 const isBad=classified[r.id]==='unverified-attribution';
 const gradeDescription='<p class="gn-citation-grade">'+esc(grade.label)+'</p><p class="gn-citation-caution">'+esc(grade.explanation)+'</p>';
 const ar=quote.arabic?'<blockquote class="gn-citation-ar" dir="rtl" lang="ar">'+esc(quote.arabic)+'</blockquote>':'';
 const en=quote.english?(r.englishRole==='editorial-summary'?'<p><strong>Editorial synopsis, not a complete translation.</strong> '+esc(quote.english)+'</p>':'<blockquote class="gn-citation-en">'+esc(quote.english)+'</blockquote>'):'';
 const note=r.note?'<p class="gn-citation-caution">'+esc(r.note)+'</p>':'';
 const warn=quote.warning?'<p class="gn-citation-caution">'+esc(quote.warning)+'</p>':'';
 const link=safe(r.sourceUrl)?'<a href="'+esc(r.sourceUrl)+'" target="_blank" rel="noopener noreferrer">View '+(r.type==='quran'?'verse':r.type==='hadith'?'hadith source':'cited edition or quotation witness')+'</a>':'';
 const sections=(r.units||[]).map(id=>'<a href="'+(id.startsWith('SH-')?'commentary.html#':'./#')+encodeURIComponent(id)+'" data-gn-citation-unit="'+esc(id)+'">'+esc(id)+'</a>').join(' · ');
 return '<div class="gn-source-article">'+gradeDescription+ar+en+note+warn
   +(isBad?'<p class="gn-citation-caution"><strong>Not authenticated as a Prophetic report.</strong></p>':'')
   +(link?'<p>'+link+'</p>':'')
   +'<p class="gn-citation-locations">Referenced in this edition: '+(sections||'no exact passage listed')+'</p></div>';
}
function ensureDialog(){
 let d=document.getElementById('gn-citation-standalone');
 if(d)return d;
 d=document.createElement('dialog');
 d.id='gn-citation-standalone';
 d.className='gn-citation-dialog';
 d.setAttribute('aria-labelledby','gn-citation-heading');
 d.innerHTML='<header><button type="button" data-citation-back aria-label="Back to references">‹</button><h2 id="gn-citation-heading">References</h2><button type="button" data-citation-close aria-label="Return to reading">×</button></header><div id="gn-citation-body"></div><footer><button type="button" data-citation-return>Return to reading</button></footer>';
 document.body.append(d);
 d.addEventListener('click',e=>{
  const btn=e.target.closest('button,[data-gn-citation-unit]');
  if(e.target===d){d.close();return}
  if(btn?.hasAttribute('data-citation-close')||btn?.hasAttribute('data-citation-return')){d.close();return}
  if(btn?.hasAttribute('data-citation-back')){renderIndex();return}
  if(btn?.dataset.citationOpen){const r=byId.get(btn.dataset.citationOpen);if(r)renderSource(r);return}
  if(btn?.hasAttribute('data-gn-citation-unit'))d.close();
 });
 d.addEventListener('close',()=>{if(returnTo?.isConnected)returnTo.focus({preventScroll:true});returnTo=null});
 return d;
}
function showDialog(){const d=ensureDialog();if(!d.open)d.showModal();}
function renderSource(r){
 const d=ensureDialog();
 d.querySelector('#gn-citation-heading').textContent=r.title;
 d.querySelector('#gn-citation-body').innerHTML=renderCard(r);
 d.querySelector('[data-citation-back]').hidden=false;
 currentlyOpen=r.id;showDialog();
}
function renderIndex(){
 const d=ensureDialog();
 d.querySelector('#gn-citation-heading').textContent='Sources and parallels';
 const groupNames={direct:'Cited passages and quotations',comparison:'Comparisons, work references and uncertain reports'};
 const groups=['direct','comparison'].map(kind=>
 '<section class="gn-source-index-group"><h3>'+groupNames[kind]+'</h3>'+
 references.filter(r=>gradeFor(r).group===kind).map(r=>
  '<button data-citation-open="'+esc(r.id)+'"><strong>'+esc(r.title)+'</strong><small>'+esc(gradeFor(r).label)+'</small></button>'
 ).join('')+'</section>').join('');
 d.querySelector('#gn-citation-body').innerHTML='<p class="gn-citation-caution">Only individually attested Arabic passages have inline markers. Interpretive comparisons and unverified reports are never disguised as quotations.</p>'+groups;
 d.querySelector('[data-citation-back]').hidden=true;
 currentlyOpen=null;showDialog();
}
function install(){
 const observer=new MutationObserver(schedule);
 observer.observe(reading,{childList:true,subtree:false});
 schedule();
 if(!isCombined){
  const menu=document.querySelector('.commentary-tools');
  if(menu&&!document.getElementById('gn-open-citation-index')){
   const b=document.createElement('button');
   b.id='gn-open-citation-index';b.type='button';b.className='action-btn';
   b.textContent='References & parallels';b.addEventListener('click',()=>{returnTo=b;renderIndex()});
   menu.append(b);
  }
  document.addEventListener('click',e=>{
   const btn=e.target.closest('.gn-source-inline[data-open-source]');
   if(!btn)return;
   const r=byId.get(btn.dataset.openSource);
   if(!r)return;
   e.preventDefault();e.stopImmediatePropagation();returnTo=btn;renderSource(r);
  },true);
 }
 window.GnammaQawaidCitations=Object.freeze({
  active:()=>({markerCount,annotatedRelations:annotations,attemptedRelations:attempts,directSourceCards:markable.length,allCards:references.length}),
  openIndex:()=>renderIndex(),
  policyFor:id=>classified[id]||null
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
