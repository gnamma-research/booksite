/* GNAMMA Qawāʿid / Tamhīd · source-scoped research search v1.
   Runs entirely in the browser over the existing, attributed 61 + 110 units.
   No remote service, invented references, textual emendations or automated
   historical-Arabic morphology. Roots/lemmas are explicitly curated only. */
(function(){
'use strict';
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>String(s??'').toLocaleLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'')
  .replace(/[أإآٱ]/g,'ا').replace(/[ؤ]/g,'و').replace(/[ئ]/g,'ي').replace(/ى/g,'ي').replace(/ک/g,'ك').replace(/ة/g,'ه');
const norm=s=>fold(s).replace(/\s+/g,' ').trim();
const tokenRe=/[\p{L}\p{M}\p{N}]+/gu;
const TERMS=window.GNAMMA_QAWAID_TERMS?.terms||[];
const REFS=window.GNAMMA_QAWAID_REFERENCES?.items||[];
const MATN=window.GNAMMA_QAWAID_MATN?.units||[];
const SHARH=window.GNAMMA_TAMHID_CORPUS?.units||
 [...new Map([...(window.GNAMMA_TAMHID_INTRO||[]),
 ...(window.GNAMMA_TAMHID_MAIN||[]),
 ...(window.GNAMMA_TAMHID_CONCLUSION||[]),
 ...(window.GNAMMA_TAMHID_SHARH?.units||[])].map(u=>[u.id,u])).values()];
const units=[...MATN.map(u=>({...u,kind:'matn',part:'matn'})),
 ...SHARH.map(u=>({...u,kind:'sharh',part:u.part||(u.id.startsWith('SH-INTRO')?'introduction':u.id.startsWith('SH-061-')?'conclusion':'main')}))];
const byId=new Map(units.map(u=>[u.id,u]));
const work=location.pathname.includes('commentary.html')?'commentary':'combined';
const K='gnamma:qawaid:research-state:v1';
const RETURN='gnamma:qawaid:research-return:v1';

/* Curated, inspectable Arabic families, NOT general root extraction.
   Match only documented spellings and productive clitics to these forms. */
const families=[
 ['وجد','w-j-d / existence',['وجود','الموجود','موجود','موجودات','الواجد','وجدان','الوجد']],
 ['وحد','w-ḥ-d / unity',['وحده','وحدانيه','التوحيد','توحيد','واحد','الوحده','الوحدانيه']],
 ['علم','ʿ-l-m / knowledge',['علم','علوم','العلم','العلمي','المعلوم','المعلومات','العلميه']],
 ['عقل','ʿ-q-l / intellect',['عقل','عقلي','العقل','العقول','العقليه','المعقول','المعقولات','التعقل']],
 ['حقق','ḥ-q-q / reality',['حقيقه','الحقيقه','حق','الحق','حقايق','حقيقي','التحقيق','المحققين']],
 ['نظر','n-ẓ-r / inquiry',['النظر','نظر','النظار','النظري','النظريه','ينظر','النظريه']],
 ['فيض','f-y-ḍ / bestowal',['الفيض','فيض','الفياض','الافاضه','افاضه','المفيض']],
 ['عين','ʿ-y-n / determination',['عين','العين','الاعيان','عيني','العينيه','اعيان']],
 ['قوم','q-w-m / subsistence',['القائم','قيام','يقوم','قام','المقوم','المقومات']],
 ['مكن','m-k-n / possibility',['ممكن','ممكنه','الامكان','امكان','الممكنات','يمكن','الامكانيه']],
 ['وهم','w-h-m / estimation',['الوهم','وهم','الاوهام','الوهميه','متوهم','توهم']],
 ['نفس','n-f-s / soul',['النفس','نفس','النفوس','نفساني','النفسانيه']],
 ['ذوق','dh-w-q / experiential taste',['الذوق','ذوق','الذوقيه','الاذواق','التذوق']],
 ['كشف','k-sh-f / unveiling',['كشف','الكشف','المكاشفه','الانكشاف','المكاشفات']],
 ['قلب','q-l-b / heart',['القلب','قلوب','القلب','قلبيه']],
 ['حكم','ḥ-k-m / judgement',['حكم','الاحكام','الحكم','احكام','الحكمه','الحكميه']],
 ['سلك','s-l-k / wayfaring',['السلوك','السالك','السالكين','سلوك','يسلك']],
 ['جرد','j-r-d / abstraction',['تجريد','التجريد','مجرد','المجردات','التجرد']],
 ['صور','ṣ-w-r / form',['صوره','الصور','تصور','التصور','الصوره','صوري']],
 ['كمل','k-m-l / perfection',['كمال','الكمال','الكمالات','كامل','الكامله','المكمل']]
].map(([root,label,forms])=>({root:norm(root),label,forms:forms.map(norm)}));
const wordTokens=s=>Array.from(String(s||'').matchAll(tokenRe),m=>({v:norm(m[0]),raw:m[0],index:m.index,end:m.index+m[0].length})).filter(x=>x.v);
const hasArabic=s=>/[\u0600-\u06ff]/.test(s);
function equalWord(token,query){
 if(token===query)return true;
 if(!hasArabic(query)||query.length<3)return false;
 let s=token;
 // Only conservative attached particles + definite article, not unrestricted stemming.
 for(let i=0;i<2;i++){
  if(s.startsWith('ال')&&s.length>query.length+1){s=s.slice(2);if(s===query)return true;}
  else if(/^[وفبلك]/.test(s)&&s.length>query.length+1){s=s.slice(1);if(s===query)return true;}
  else break;
 }
 return false;
}
function foldMap(raw){
 let text='',offsets=[];
 for(let i=0;i<raw.length;){
  const ch=String.fromCodePoint(raw.codePointAt(i)),v=fold(ch);
  for(let j=0;j<v.length;j++)offsets.push(i);
  text+=v;i+=ch.length;
 }
 offsets.push(raw.length);
 return {text,offsets};
}
function snippet(raw,start,end){
 raw=String(raw||'');start=Math.max(0,Math.min(raw.length,start));end=Math.max(start,Math.min(raw.length,end));
 const a=Math.max(0,start-64),b=Math.min(raw.length,Math.max(end,start+1)+110);
 return (a?'…':'')+esc(raw.slice(a,start))+'<mark>'+esc(raw.slice(start,Math.max(end,start+1)))+'</mark>'+esc(raw.slice(Math.max(end,start+1),b))+(b<raw.length?'…':'');
}
function firstMatch(raw,needle,mode,second,gap,ordered,formList){
 raw=String(raw||'');if(!raw)return null;
 if(mode==='phrase'||mode==='exact'){
  const m=foldMap(raw),q=fold(needle).trim();
  if(!q)return null;
  let i=m.text.indexOf(q);
  if(mode==='exact'&&i>=0){
   while(i>=0){
    const before=m.text[i-1]||'',after=m.text[i+q.length]||'';
    if(!/[\p{L}\p{M}]/u.test(before)&&!/[\p{L}\p{M}]/u.test(after))break;
    i=m.text.indexOf(q,i+1);
   }
  }
  return i<0?null:{start:m.offsets[i],end:m.offsets[i+q.length]||raw.length};
 }
 const toks=wordTokens(raw);
 if(mode==='near'){
  const a=norm(needle),b=norm(second);if(!a||!b)return null;
  const left=toks.map((x,i)=>equalWord(x.v,a)?i:-1).filter(i=>i>=0);
  const right=toks.map((x,i)=>equalWord(x.v,b)?i:-1).filter(i=>i>=0);
  let best=null;
  for(const i of left)for(const j of right){
   if(i===j||(ordered&&j<i))continue;
   const distance=Math.abs(j-i)-1;
   if(distance<=gap&&(!best||distance<best.distance)){
    best={start:Math.min(toks[i].index,toks[j].index),end:Math.max(toks[i].end,toks[j].end),distance};
   }
  }return best;
 }
 const q=norm(needle),forms=formList||[q];
 if(!q)return null;
 for(const x of toks)if(forms.some(t=>equalWord(x.v,t)))return {start:x.index,end:x.end};
 return null;
}
function restore(){try{let v=JSON.parse(sessionStorage.getItem(K)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
let settings={q:'',mode:'words',scope:'all',lang:'both',facet:'text',second:'',gap:5,ordered:false,advanced:false,limit:30,includeNotes:false,...restore()};
const validModes=['words','exact','phrase','lemma','root','near'];
if(!validModes.includes(settings.mode))settings.mode='words';
function remember(){try{sessionStorage.setItem(K,JSON.stringify(settings))}catch{}}
function matchRoot(q){
 const folded=norm(q).replace(/[\s-]/g,'');
 return families.find(f=>f.root===folded||norm(f.label).includes(folded)||f.label.toLowerCase().startsWith(String(q).toLowerCase().trim()))||null;
}
function matchTerm(q){
 const v=norm(q);
 return TERMS.find(t=>[t.ar,t.en,t.id,...(t.aliases||[])].some(s=>norm(s)===v))||null;
}
function explainMode(){
 if(settings.mode==='root')return 'Root families are curated examples, not automatic Classical Arabic parsing. A missing family is not proof of absence.';
 if(settings.mode==='lemma')return 'Lemma/term matching uses the 82-entry editorial glossary and its attested aliases, not a morphological disambiguator.';
 if(settings.mode==='near')return 'Near searches match tokens inside one Arabic or English unit only; zero means adjacent. They never cross languages or authorial boundaries.';
 return 'Arabic harakāt and hamza variants are normalised for matching; text is displayed unchanged.';
}
function readMyNotes(){
 let out=[];
 try{
  const q=JSON.parse(localStorage.getItem('gnamma:qawaid:reading:v2')||'{}');
  for(const [id,text] of Object.entries(q.personal||{}))if(typeof text==='string'&&text.trim())out.push({id,kind:'mine',title:'My note · '+id,part:'mine',arabic:'',english:text});
  const c=JSON.parse(localStorage.getItem('gnamma:tamhid:commentary:v1')||'{}');
  for(const [id,text] of Object.entries(c.notes||{}))if(typeof text==='string'&&text.trim())out.push({id,kind:'mine',title:'My commentary note · '+id,part:'mine',arabic:'',english:text});
 }catch{}
 return out;
}
function dataForFacet(){
 if(settings.facet==='terms')return TERMS.map(t=>({id:t.id,kind:'term',part:t.category||'Dictionary',title:t.en,arabic:t.ar,english:(t.definition||'')+' '+(t.aliases||[]).join(' ')}));
 if(settings.facet==='sources')return REFS.map(r=>({id:r.id,kind:'source',part:r.kind||r.source||'Referenced work',title:r.title||r.id,arabic:r.arabic||'',english:[r.source,r.description,r.english,r.reference].filter(Boolean).join(' '),unit:(r.units||[])[0]||''}));
 if(settings.facet==='mine')return readMyNotes();
 return units;
}
function sourceScope(u){
 if(settings.scope==='all')return true;
 if(settings.scope==='matn')return u.kind==='matn';
 if(settings.scope==='sharh')return u.kind==='sharh';
 return u.kind==='sharh'&&u.part===settings.scope;
}
function searchAll(){
 const query=settings.q.trim();
 if(!query)return {items:[],total:0,help:'Enter a term, phrase, passage ID or an Arabic word.'};
 const list=dataForFacet(),results=[],mode=settings.mode;
 const term=mode==='lemma'?matchTerm(query):null;
 const family=mode==='root'?matchRoot(query):null;
 if(mode==='lemma'&&!term)return {items:[],total:0,help:'No reviewed dictionary lemma matches this spelling. Use Words or Exact instead.'};
 if(mode==='root'&&!family)return {items:[],total:0,help:'No curated root family matches. Try the spelling with Arabic letters or use Words.'};
 let a=query,b=settings.second;
 const operator=query.match(/^\s*(.+?)\s+(NEAR|BEFORE)\/(\d{1,2})\s+(.+?)\s*$/i);
 if(mode==='near'&&operator){a=operator[1];b=operator[4];settings.gap=Math.min(50,Number(operator[3]));settings.ordered=operator[2].toUpperCase()==='BEFORE';}
 for(let order=0;order<list.length;order++){
  const u=list[order];if(settings.facet==='text'&&!sourceScope(u))continue;
  let found=null,where='',label='';
  const fields=[];
  if(settings.facet==='text'){
   fields.push({name:'English',key:'english',raw:String(u.english||'')},{name:'Arabic',key:'arabic',raw:String(u.readingArabic||u.arabic||'')});
   if(settings.includeNotes)fields.push({name:'Editorial note',key:'notes',raw:(u.notes||[]).map(n=>typeof n==='string'?n:JSON.stringify(n)).join(' ')});
  }else{
   fields.push({name:'Title',key:'title',raw:String(u.title||'')},{name:'English',key:'english',raw:String(u.english||'')},{name:'Arabic',key:'arabic',raw:String(u.arabic||'')});
  }
  const exactId=norm(u.id)===norm(query);
  if(exactId)found={start:0,end:0},where='ID',label=u.title||u.id;
  for(const f of fields){
   if(found)break;
   if(settings.lang==='ar'&&f.key!=='arabic'&&settings.facet==='text')continue;
   if(settings.lang==='en'&&f.key==='arabic'&&settings.facet==='text')continue;
   if(!f.raw)continue;
   const modeActual=mode==='lemma'||mode==='root'?'words':mode;
   const forms=mode==='lemma'?[term.ar,...(term.aliases||[]),term.en.split('/')[0]].map(norm):mode==='root'?family.forms:null;
   const target=mode==='root'?family.root:mode==='lemma'?term.ar:a;
   const match=firstMatch(f.raw,target,modeActual,b,Number(settings.gap),settings.ordered,forms);
   if(match){found=match;where=f.name;label=f.raw;}
  }
  if(found){
   const text=where==='ID'?u.title||u.id:label;
   results.push({id:u.id,part:u.part||'',kind:u.kind,loc:u.sourceLocator||'',title:u.title||u.section||u.en||u.id,field:where,context:where==='ID'?esc(text):snippet(text,found.start,found.end),order,unit:u.unit||''});
  }
 }
 if(settings.facet==='text'&&settings.scope==='all'&&settings.mode!=='near'){
  // Canonical passage IDs precede word matches, then preserve text order.
  results.sort((x,y)=>(x.field==='ID'?-1:y.field==='ID'?1:0)||x.order-y.order);
 }
 return {items:results,total:results.length,help:results.length?'':(mode==='near'&&!b?'Enter a second word to search within a passage.':'No matching passage in the selected source scope.')};
}
function itemUrl(r){
 if(r.kind==='mine')return r.id.startsWith('SH-')?'commentary.html#'+encodeURIComponent(r.id):'./#'+encodeURIComponent(r.id);
 if(r.kind==='source'){
  const id=r.unit||'QT-001';return id.startsWith('SH-')?'commentary.html#'+encodeURIComponent(id):'./#'+encodeURIComponent(id);
 }
 if(r.kind==='term'){
  const t=TERMS.find(t=>t.id===r.id);
  if(t){
   const m=units.find(u=>norm(u.arabic||'').includes(norm(t.ar))||norm(u.english||'').includes(norm(t.en.split('/')[0])));
   if(m)return m.id.startsWith('SH-')?'commentary.html#'+encodeURIComponent(m.id):'./#'+encodeURIComponent(m.id);
  }
  return './';
 }
 return r.id.startsWith('SH-')?'commentary.html#'+encodeURIComponent(r.id):'./#'+encodeURIComponent(r.id);
}
function csvValue(s){return '"'+String(s??'').replace(/"/g,'""')+'"';}
let last=[];
function exportCSV(){
 if(!last.length)return;
 if(settings.facet==='mine'&&!confirm('Export private notes to a local CSV file on this device?'))return;
 const rows=[['ID','Category','Part','Title','Match field','Context'],...last.map(r=>[r.id,r.kind,r.part,r.title,r.field,r.context.replace(/<[^>]+>/g,'')])];
 const blob=new Blob(['\ufeff'+rows.map(r=>r.map(csvValue).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=u;a.download='qawaid-concordance.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function results(){
 const target=$('#qt-results');if(!target)return;
 const r=searchAll();last=r.items;remember();
 $('#qt-help').textContent=explainMode();
 $('#qt-count').textContent=r.total+' matching '+(settings.facet==='text'?'passages':'entries');
 const shown=r.items.slice(0,settings.limit);
 target.innerHTML=shown.length?shown.map(x=>
  '<a class="qt-result" href="'+esc(itemUrl(x))+'" data-qt-result="'+esc(x.id)+'"><span class="qt-result-overline">'+esc(x.kind==='matn'?'MATN · Original':x.kind==='sharh'?'SHARḤ · Commentary':x.kind==='term'?'DICTIONARY':x.kind==='mine'?'MY NOTES':'SOURCE REGISTER')+' · '+esc(x.id)+' · '+esc(x.field)+'</span><strong>'+esc(x.title)+'</strong><span class="qt-kwic">'+x.context+'</span></a>').join(''):
  '<p class="qt-empty">'+esc(r.help)+'</p>';
 $('#qt-more').hidden=r.items.length<=settings.limit;
 $('#qt-export').disabled=!r.items.length;
}
let dialog=null,timer=null;
function show(restoreQuery){
 if(!dialog)mount();
 if(!dialog)return;
 if(restoreQuery){try{const state=JSON.parse(sessionStorage.getItem(RETURN)||'null');if(state&&state.q)settings={...settings,...state,limit:30}}catch{}}
 $('#qt-query').value=settings.q;$('#qt-mode').value=settings.mode;
 $('#qt-scope').value=settings.scope;$('#qt-lang').value=settings.lang;$('#qt-facet').value=settings.facet;
 $('#qt-second').value=settings.second;$('#qt-gap').value=settings.gap;$('#qt-ordered').checked=!!settings.ordered;
 $('#qt-notes').checked=!!settings.includeNotes;$('#qt-advanced').open=!!settings.advanced;
 results();if(!dialog.open)dialog.showModal();
 requestAnimationFrame(()=>{$('#qt-query')?.focus();$('#qt-query')?.select()});
}
function close(){if(dialog?.open)dialog.close()}
function mount(){
 dialog=document.createElement('dialog');dialog.id='qt-research-dialog';dialog.setAttribute('aria-labelledby','qt-research-heading');
 dialog.innerHTML=
 '<div class="qt-research-head"><div><span class="qt-kicker">GNAMMA · QAWĀʿID / TAMHĪD</span><h2 id="qt-research-heading">Search the texts</h2><p>Quick Find and scholarly research across the original and commentary.</p></div><button id="qt-close" type="button" aria-label="Close search" title="Close search">×</button></div>'+
 '<div class="qt-search-body"><label class="qt-field-label" for="qt-query">Find a word, Arabic expression, title or section ID</label>'+
 '<div class="qt-query-row"><input id="qt-query" type="search" dir="auto" spellcheck="false" autocomplete="off" placeholder="e.g. الوجود · wujūd · SH-059" aria-describedby="qt-help"><button id="qt-go" type="button">Find</button></div>'+
 '<div class="qt-search-links"><button type="button" data-qt-suggest="الوجود">الوجود</button><button type="button" data-qt-suggest="unity">unity</button><button type="button" data-qt-suggest="QT-059">QT-059</button><button type="button" data-qt-suggest="المعرفة">المعرفة</button></div>'+
 '<details id="qt-advanced"><summary>Research controls <span>Sources · Arabic · proximity · curated roots</span></summary>'+
 '<div class="qt-controls-grid"><label>Source<select id="qt-facet"><option value="text">Original and commentary</option><option value="terms">Dictionary / terms</option><option value="sources">Existing source cards</option><option value="mine">My notes · local only</option></select></label>'+
 '<label>Part<select id="qt-scope"><option value="all">Entire work</option><option value="matn">Matn only</option><option value="sharh">All sharḥ</option><option value="introduction">Sharḥ introduction</option><option value="main">Main sharḥ</option><option value="conclusion">Closing sharḥ</option></select></label>'+
 '<label>Match<select id="qt-mode"><option value="words">Words + conservative clitics</option><option value="exact">Exact word / expression</option><option value="phrase">Exact phrase</option><option value="lemma">Curated glossary lemma</option><option value="root">Curated Arabic root family</option><option value="near">Proximity</option></select></label>'+
 '<label>Language<select id="qt-lang"><option value="both">Arabic &amp; English</option><option value="ar">Arabic</option><option value="en">English</option></select></label></div>'+
 '<div id="qt-proximity" class="qt-near-settings"><label>Second word<input id="qt-second" type="search" dir="auto" placeholder="second word"></label><label>Maximum words between<select id="qt-gap"><option value="0">0</option><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label><label class="qt-check"><input id="qt-ordered" type="checkbox">Keep entered order</label></div>'+
 '<label class="qt-check" for="qt-notes"><input id="qt-notes" type="checkbox">Include existing editorial notes in search (never shown in running text)</label>'+
 '<p class="qt-limit">Lemma and root matches are curated candidates, not comprehensive or context-disambiguated Classical Arabic morphology.</p></details>'+
 '<p id="qt-help" class="qt-help"></p><div class="qt-result-toolbar"><span id="qt-count" role="status" aria-live="polite">Search the work</span><button id="qt-export" type="button">Concordance CSV</button></div>'+
 '<div id="qt-results" class="qt-results"></div><button id="qt-more" type="button" hidden>More results</button></div>'+
 '<div class="qt-research-footer">Original text and attributed commentary remain unchanged. New cross-book links and source annotations are not added here.</div>';
 document.body.appendChild(dialog);
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 $('#qt-close').addEventListener('click',close);
 $('#qt-go').addEventListener('click',()=>{settings.limit=30;results()});
 $('#qt-more').addEventListener('click',()=>{settings.limit+=30;results()});
 $('#qt-export').addEventListener('click',exportCSV);
 $('#qt-advanced').addEventListener('toggle',()=>{settings.advanced=$('#qt-advanced').open;remember()});
 function gather(){
  settings.q=$('#qt-query').value;settings.mode=$('#qt-mode').value;settings.scope=$('#qt-scope').value;
  settings.lang=$('#qt-lang').value;settings.facet=$('#qt-facet').value;
  settings.second=$('#qt-second').value;settings.gap=Number($('#qt-gap').value);
  settings.ordered=$('#qt-ordered').checked;settings.includeNotes=$('#qt-notes').checked;
  settings.limit=30;$('#qt-proximity').hidden=settings.mode!=='near';
 }
 $('#qt-advanced').addEventListener('change',()=>{gather();results()});
 $('#qt-query').addEventListener('input',()=>{clearTimeout(timer);gather();timer=setTimeout(results,240)});
 $('#qt-query').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);gather();results()}});
 $('#qt-second').addEventListener('input',()=>{clearTimeout(timer);gather();timer=setTimeout(results,240)});
 $$('.qt-search-links button',dialog).forEach(b=>b.addEventListener('click',()=>{settings.q=b.dataset.qtSuggest;$('#qt-query').value=settings.q;settings.limit=30;results()}));
 dialog.addEventListener('click',e=>{
  const a=e.target.closest('[data-qt-result]');if(!a)return;
  try{sessionStorage.setItem(RETURN,JSON.stringify({...settings,limit:30}))}catch{}
  close();
 });
 $('#qt-proximity').hidden=settings.mode!=='near';
}
function install(){
 const search=$('#search-button');
 if(search)search.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show(false)},true);
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-open-study="search"]')){
   e.preventDefault();e.stopImmediatePropagation();show(false);
  }
 },true);
 document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.altKey||e.shiftKey)return;
  if((e.key==='k'&&(e.ctrlKey||e.metaKey))||
    (e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.target.closest('input,textarea,select,[contenteditable]'))){
   e.preventDefault();show(false);
  }
 });
 /* A non-invasive contextual inspector: appears only when reader text is selected. */
 const explore=document.createElement('button');
 explore.id='qt-explore-selection';explore.type='button';explore.textContent='Explore selection';
 explore.hidden=true;document.body.append(explore);
 let chosen='';
 document.addEventListener('pointerup',e=>{
  if(e.target.closest('dialog,button,select,input,textarea')){explore.hidden=true;return}
  requestAnimationFrame(()=>{
   const sel=window.getSelection();
   if(!sel||sel.isCollapsed||!sel.rangeCount){explore.hidden=true;return}
   const target=sel.anchorNode?.parentElement?.closest('#reading-list .ar,#reading-list .en');
   const text=sel.toString().trim();
   if(!target||text.length<2||text.length>100){explore.hidden=true;return}
   chosen=text;
   const rect=sel.getRangeAt(0).getBoundingClientRect();
   explore.style.left=Math.max(8,Math.min(window.innerWidth-156,rect.left))+'px';
   explore.style.top=Math.max(12,Math.min(window.innerHeight-52,rect.bottom+8))+'px';
   explore.hidden=false;
  });
 });
 explore.addEventListener('click',()=>{settings.q=chosen;settings.mode='words';settings.facet='text';explore.hidden=true;show(false)});
 document.addEventListener('scroll',()=>{explore.hidden=true},{capture:true,passive:true});
 // Restore the research query without introducing user search data into public URLs.
 try{const back=JSON.parse(sessionStorage.getItem(RETURN)||'null');
  if(back?.q&&!$('#qt-back-to-research')){
   const b=document.createElement('button');b.id='qt-back-to-research';b.type='button';b.textContent='Back to research';document.body.append(b);
   b.addEventListener('click',()=>{settings={...settings,...back};show(true)});
  }
 }catch{}
 window.GnammaQawaidSearch=Object.freeze({open:()=>show(false),search:(query,mode='words')=>{settings.q=String(query);settings.mode=validModes.includes(mode)?mode:'words';show(false)},sourceUnits:()=>({matn:MATN.length,commentary:SHARH.length,terms:TERMS.length,references:REFS.length})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
