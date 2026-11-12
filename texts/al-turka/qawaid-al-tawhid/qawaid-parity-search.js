/* GNAMMA Qawtaw17 — Daruri family research search.
   Uses the exact shared bounded pattern and proximity matchers. No network
   service, invented morphology or changes to the source Arabic.
*/
(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>String(s??'').toLowerCase().normalize('NFD')
 .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'')
 .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
 .replace(/[ʿʾ‘’ʻ']/g,'').replace(/\s+/g,' ').trim();
const matn=window.GNAMMA_QAWAID_MATN?.units||[];
const terms=window.GNAMMA_QAWAID_TERMS?.terms||[];
const sources=window.GNAMMA_QAWAID_REFERENCES?.items||[];
const TYPE=[['all','Everything'],['matn','Original matn'],['sharh','Commentary'],['intro','Introduction'],['editorial','Editorial notes'],['term','Dictionary'],['source','Primary sources'],['mine','My saved work']];
const MODE=[['normal','Normal'],['literal','Exact word'],['phrase','Exact phrase'],['aliases','Related terms'],['near','Nearby words'],['pattern','Advanced pattern']];
const KEY='gnamma:qawaid:research-queries:v1';
const PAGE=40;
let corpus=[],dlg=null,term='',scope='all',mode='normal',lang='both',near='',gap=5,ordered=false,sort='source',expanded=false,curPage=0,results=[],error='',builder=[{join:'AND',kind:'word',field:'all',text:''}];
let saved=[];try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(v))saved=v.filter(x=>typeof x.query==='string').slice(0,30)}catch(_){}
const option=(pairs,v)=>pairs.map(([k,t])=>'<option value="'+esc(k)+'"'+(k===v?' selected':'')+'>'+esc(t)+'</option>').join('');
const idSort=s=>{const m=String(s).match(/\d+/);return m?Number(m[0]):0};
function list(){
 let r=[];
 for(const u of matn)r.push({id:u.id,type:'matn',title:u.title||u.id,ar:u.readingArabic||u.arabic,en:u.english||'',body:'',link:'#'+u.id,source:'Abū Ḥāmid Turka · matn'});
 const sharh=corpus.length?corpus:[...(window.GNAMMA_TAMHID_SHARH?.units||[]),...(window.GNAMMA_TAMHID_MAIN||[]),...(window.GNAMMA_TAMHID_CONCLUSION||[])];
 const seen=new Set();
 for(const u of sharh){if(seen.has(u.id))continue;seen.add(u.id);
 r.push({id:u.id,type:u.id.startsWith('SH-INTRO')?'intro':'sharh',title:u.section||u.id,
  ar:u.readingArabic||u.arabic,en:u.english||'',body:'',link:u.id.startsWith('SH-INTRO')?'commentary.html#'+u.id:'#'+u.id,source:'Ṣāʾin al-Dīn Ibn Turka · sharḥ'});
 }
 for(const u of [...matn,...sharh]){
  const text=[...(u.notes||[]),...(u.variants||[]).map(x=>JSON.stringify(x))].join(' ');
  if(text)r.push({id:'N-'+u.id,type:'editorial',title:'Textual notes · '+u.id,ar:'',en:'',body:text,
   link:u.id.startsWith('SH-INTRO')?'commentary.html#'+u.id:'#'+u.id,source:'Modern apparatus'});
 }
 for(const u of terms)r.push({id:'T-'+u.id,type:'term',title:u.en,ar:u.ar,en:u.definition||'',body:(u.aliases||[]).join(' '),link:'#QT-001',source:'Technical dictionary',target:u.id});
 for(const u of sources)r.push({id:'R-'+u.id,type:'source',title:u.title,ar:u.arabic||'',en:u.english||'',body:u.source||'',link:'#'+(u.units?.[0]||'QT-001'),source:'Primary reference',target:u.id});
 const mine=window.GnammaQawaidDesk?.records?.()||[];
 for(const u of mine.filter(x=>!x.deleted))r.push({id:'P-'+u.id,type:'mine',title:u.title||u.kind,ar:u.lang==='ar'?u.quote:'',en:u.lang==='en'?u.quote:'',body:u.body||'',link:'#'+(u.target?.id||'QT-001'),source:'Private'});
 return r;
}
function alias(term){
 const k=fold(term),out=[];
 for(const t of terms){const x=[t.ar,t.en,...(t.aliases||[])];
  if(x.some(v=>fold(v)===k))out.push(...x.filter(v=>fold(v)!==k&&v.length>1));
 }
 return [...new Set(out)].slice(0,16);
}
function entries(u){
 return ['ar','en','title','body'].filter(kind=>lang==='both'||!['ar','en'].includes(kind)||kind===lang)
  .filter(kind=>u[kind]).map(kind=>({kind,raw:u[kind],rec:u,
   tokens:(original,norm)=>window.GnammaScholarly.tokenize(u[kind],norm,original)}));
}
function simple(u,words){
 const fields=lang==='ar'?[u.id,u.ar,u.title,u.body]:lang==='en'?[u.id,u.en,u.title,u.body]:[u.id,u.ar,u.en,u.title,u.body];
 return words.some(w=>fields.some(v=>fold(v).includes(fold(w))));
}
function search(){
 results=[];curPage=0;error='';
 const q=term.trim();
 if(!q){renderResults();return;}
 if(q.length>350){error='Queries must be under 350 characters.';renderResults();return;}
 const api=window.GnammaScholarly,nearApi=window.GnammaProximity;
 const ast=['literal','pattern'].includes(mode)?api?.parse(mode==='literal'?q:q,fold):null;
 if(ast?.error){error=ast.error;renderResults();return;}
 for(const u of list().filter(v=>scope==='all'||v.type===scope)){
  let ok=false,desc='';
  if(mode==='normal'||mode==='phrase')ok=simple(u,[q.replace(/^"|"$/g,'')]);
  if(mode==='aliases'){ok=simple(u,[q,...alias(q)]);desc='Curated term equivalents, not a verified root analysis.';}
  if(['literal','pattern'].includes(mode))ok=!!api?.evaluate(ast.ast,entries(u),{normalize:fold,aliasProvider:alias}).ok;
  if(mode==='near'){
   if(!near.trim()){error='Enter a second word for proximity search.';break;}
   const texts=lang==='ar'?[u.ar]:lang==='en'?[u.en]:[u.ar,u.en];
   ok=texts.some(raw=>nearApi?.find(raw,[q],[near],{normalize:fold,maxGap:gap,ordered}));
   desc=ok?'Terms within '+gap+' intervening words in the same language.':'';
  }
  if(ok)results.push({...u,description:desc});
 }
 if(sort==='alpha')results.sort((a,b)=>a.title.localeCompare(b.title));
 if(sort==='kind')results.sort((a,b)=>a.type.localeCompare(b.type)||a.id.localeCompare(b.id));
 renderResults();
}
function snippet(u){
 const q=term.replace(/[~*?"']/g,'').trim(),raw=lang==='ar'?u.ar:lang==='en'?u.en:
  fold(u.ar).includes(fold(q))?u.ar:fold(u.en).includes(fold(q))?u.en:u.body||u.title;
 const i=q?raw.toLowerCase().indexOf(q.toLowerCase()):-1,start=i>=0?Math.max(0,i-80):0;
 return (start?'…':'')+esc(raw.slice(start,start+270))+(raw.length>start+270?'…':'');
}
function resultHTML(){
 if(error)return '<p class="qaw-error" role="alert">'+esc(error)+'</p>';
 if(!term.trim())return '<p>Search all 61 original units, 110 commentary units, editorial notes, 82 dictionary headwords, 18 sources and locally saved items.</p>';
 if(!results.length)return '<p>No matches. Try other spelling, content or language filters.</p>';
 const start=curPage*PAGE,n=Math.ceil(results.length/PAGE);
 return '<p class="qaw-count"><strong>'+results.length+'</strong> matches · full count, pages of '+PAGE+'</p>'+
 '<ol class="qaw-result-list">'+results.slice(start,start+PAGE).map((u,i)=>'<li><button data-qaw-result="'+(start+i)+'" type="button"><b>'+esc(u.title)+'</b>'+
 '<small>'+esc(u.id)+' · '+esc(u.type)+' · '+esc(u.source)+'</small><span dir="auto">'+snippet(u)+'</span>'+
 (u.description?'<em>'+esc(u.description)+'</em>':'')+'</button></li>').join('')+'</ol>'+
 '<div class="qaw-flex"><button data-qaw-search="prev"'+(curPage===0?' disabled':'')+'>Previous</button><span>Page '+(curPage+1)+' of '+n+'</span>'+
 '<button data-qaw-search="next"'+(curPage+1===n?' disabled':'')+'>Next</button></div>';
}
function renderResults(){const el=$('#qaw-research-results');if(el)el.innerHTML=resultHTML();}
function builderHTML(){
 const kinds=[['word','Word'],['phrase','Exact phrase'],['prefix','Prefix'],['pattern','Letter pattern'],['fuzzy1','Within 1 letter'],['fuzzy2','Within 2 letters']];
 return builder.map((x,i)=>'<div class="qaw-builder-row">'+(i?'<select data-qaw-join="'+i+'">'+option([['AND','AND'],['OR','OR'],['AND NOT','AND NOT']],x.join)+'</select>':'<span>Find</span>')+
 '<select data-qaw-kind="'+i+'">'+option(kinds,x.kind)+'</select><input data-qaw-text="'+i+'" value="'+esc(x.text)+'" placeholder="Word or phrase" aria-label="Condition '+(i+1)+'">'+
 '<select data-qaw-field="'+i+'">'+option([['all','Both'],['ar','Arabic'],['en','English']],x.field)+'</select>'+
 (i?'<button type="button" data-qaw-remove="'+i+'" aria-label="Remove condition">×</button>':'')+'</div>').join('')+
 '<div class="qaw-flex"><button type="button" data-qaw-search="add">Add condition</button><button type="button" data-qaw-search="build">Use expression</button></div>';
}
function formHTML(){
 return '<div class="qaw-tabs"><button data-qaw-search="quick" aria-pressed="'+(!expanded)+'">Quick Find</button>'+
 '<button data-qaw-search="research" aria-pressed="'+expanded+'">Research Search</button></div>'+
 '<form id="qaw-research-form"><label>Arabic or English<input id="qaw-term" dir="auto" type="search" autocomplete="off" value="'+esc(term)+'" placeholder="Search both texts…"></label>'+
 '<div class="qaw-filters"><label>Find<select id="qaw-mode">'+option(expanded?MODE:MODE.slice(0,3),mode)+'</select></label>'+
 '<label>Content<select id="qaw-scope">'+option(TYPE,scope)+'</select></label>'+
 '<label>Language<select id="qaw-lang">'+option([['both','Both'],['ar','Arabic'],['en','English']],lang)+'</select></label>'+
 (expanded?'<label>Sort<select id="qaw-sort">'+option([['source','Text order'],['alpha','A–Z'],['kind','Content type']],sort)+'</select></label>':'')+'</div>'+
 (mode==='near'?'<div class="qaw-flex"><label>Second word<input id="qaw-near" value="'+esc(near)+'"></label>'+
 '<label>Intervening words<select id="qaw-gap">'+[0,1,3,5,10,20,50].map(n=>'<option'+(gap===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
 '<label><input type="checkbox" id="qaw-ordered"'+(ordered?' checked':'')+'>Keep order</label></div>':'')+
 (expanded?'<details id="qaw-builder" ><summary>Build a Boolean search without operators</summary>'+builderHTML()+'</details>':'')+
 '<div class="qaw-flex"><button type="submit" class="qaw-primary">Find passages</button><button type="button" data-qaw-search="save">Save search</button>'+
 '<button type="button" data-qaw-search="csv">Export CSV</button></div></form>'+
 '<p class="qaw-help">Arabic is normalized for vowel marks and common hamza spellings. Advanced patterns use the same bounded matcher as Darūrī. Related terms are curated; a complete Qawāʿid morphological index is not claimed.</p>'+
 (expanded?'<details><summary>Saved queries ('+saved.length+')</summary>'+saved.map((v,i)=>'<div class="qaw-flex"><button data-qaw-load="'+i+'">'+esc(v.name||v.query)+'</button><button data-qaw-delete="'+i+'" aria-label="Delete saved query">×</button></div>').join('')+'</details>':'');
}
function render(){if(!dlg)return;$('#qaw-research-controls').innerHTML=formHTML();renderResults();}
function close(){if(dlg?.open)dlg.close();}
function show(){if(!dlg)make();if(!dlg.open)dlg.showModal();render();$('#qaw-term')?.focus();}
function saveFile(text,name,type){
 const url=URL.createObjectURL(new Blob([text],{type:type||'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function jump(u){
 close();
 if(u.type==='term'){window.GnammaQawaidStudy?.openTerm?.(u.target);return;}
 if(u.type==='source'){window.GnammaQawaidStudy?.openSource?.(u.target);return;}
 if(u.type==='mine'){window.GnammaQawaidDesk?.open?.();return;}
 if(u.link.startsWith('commentary.html')){location.href=u.link;return;}
 try{sessionStorage.setItem('gnamma:qawaid:search-return',JSON.stringify({term,mode,scope,lang,expanded}));}catch(_){}
 const old=location.hash;location.hash=u.link;
 if(old===location.hash)window.dispatchEvent(new Event('hashchange'));
}
function make(){
 dlg=document.createElement('dialog');dlg.id='qaw-research-dialog';dlg.className='qaw-parity-dialog';
 dlg.setAttribute('aria-label','Research Search');
 dlg.innerHTML='<header class="qaw-parity-head"><strong>Research Search · Qawāʿid / Tamhīd</strong><button type="button" data-qaw-search="close" aria-label="Close">×</button></header>'+
 '<section id="qaw-research-controls"></section><section id="qaw-research-results" aria-live="polite"></section>';
 document.body.append(dlg);
 dlg.addEventListener('click',e=>{
  if(e.target===dlg){close();return;}
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.qawResult!==undefined){jump(results[Number(b.dataset.qawResult)]);return;}
  if(b.dataset.qawLoad!==undefined){const x=saved[Number(b.dataset.qawLoad)];term=x.query;mode=x.mode;scope=x.scope;lang=x.lang;expanded=true;search();render();return;}
  if(b.dataset.qawDelete!==undefined){saved.splice(Number(b.dataset.qawDelete),1);persist();render();return;}
  if(b.dataset.qawRemove!==undefined){builder.splice(Number(b.dataset.qawRemove),1);render();return;}
  const k=b.dataset.qawSearch;
  if(k==='close'){close();return;}
  if(k==='quick'||k==='research'){expanded=k==='research';if(!expanded&&!['normal','literal','phrase'].includes(mode))mode='normal';render();return;}
  if(k==='prev'){curPage=Math.max(0,curPage-1);renderResults();return;}
  if(k==='next'){curPage=Math.min(Math.ceil(results.length/PAGE)-1,curPage+1);renderResults();return;}
  if(k==='add'){if(builder.length<8)builder.push({join:'AND',kind:'word',field:'all',text:''});render();$('#qaw-builder').open=true;return;}
  if(k==='build'){try{term=window.GnammaScholarly.safeBuilder(builder);mode='pattern';search();render();}catch(e){error=e.message;renderResults();}return;}
  if(k==='save'){if(!term.trim())return;const name=prompt('Name this search',term.slice(0,60));if(name===null)return;
   saved.unshift({name:name.slice(0,120),query:term,mode,scope,lang});saved=saved.slice(0,30);persist();render();return;}
  if(k==='csv'){if(!results.length)return;
   const cell=x=>'"'+String(x??'').replace(/"/g,'""')+'"',rows=[['ID','Kind','Title','Source','Link','Arabic','English']];
   for(const u of results)rows.push([u.id,u.type,u.title,u.source,new URL(u.link,location.href).href,u.ar,u.en]);
   saveFile('\ufeff'+rows.map(x=>x.map(cell).join(',')).join('\r\n'),'qawaid-search-results.csv','text/csv;charset=utf-8');
  }
 });
 dlg.addEventListener('submit',e=>{if(e.target.id==='qaw-research-form'){e.preventDefault();term=$('#qaw-term').value;search();}});
 dlg.addEventListener('input',e=>{
  const t=e.target;if(t.id==='qaw-term')term=t.value;if(t.id==='qaw-near')near=t.value;
  if(t.dataset.qawText!==undefined)builder[Number(t.dataset.qawText)].text=t.value;
 });
 dlg.addEventListener('change',e=>{
  const t=e.target;if(t.id==='qaw-mode'){mode=t.value;render();}if(t.id==='qaw-scope')scope=t.value;
  if(t.id==='qaw-lang')lang=t.value;if(t.id==='qaw-sort')sort=t.value;
  if(t.id==='qaw-gap')gap=Number(t.value);if(t.id==='qaw-ordered')ordered=t.checked;
  if(t.dataset.qawJoin!==undefined)builder[Number(t.dataset.qawJoin)].join=t.value;
  if(t.dataset.qawKind!==undefined)builder[Number(t.dataset.qawKind)].kind=t.value;
  if(t.dataset.qawField!==undefined)builder[Number(t.dataset.qawField)].field=t.value;
 });
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(_){console.warn('Saved searches not persistent on this browser');}}
window.GnammaQawaidSearch=Object.freeze({
 open:show,close,records:list,ready:()=>corpus.length===110,
 query:(q,options={})=>{term=q;scope=options.scope||'all';mode=options.mode||'normal';lang=options.lang||'both';search();return results.slice();}
});
fetch('data/commentary-corpus.json').then(x=>x.ok?x.json():null).then(x=>{if(x?.units?.length===110)corpus=x.units;}).catch(()=>{});
})();
