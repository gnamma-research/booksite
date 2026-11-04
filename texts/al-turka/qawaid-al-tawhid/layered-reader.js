/* Gnamma Qawāʿid / Tamhīd · two independently controlled textual layers.
   2026-11-04. No source text is modified. The original authors remain distinct. */
(function(){
'use strict';
const $=id=>document.getElementById(id), root=document.documentElement, body=document.body;
const reading=$('reading-list'), units=window.GNAMMA_QAWAID_MATN?.units||[];
if(!units.length){reading.textContent='The matn data did not load. Reload the page or use the bilingual-text link below.';return;}
const seen=new Set(), comments=[];
for(const c of [...(window.GNAMMA_TAMHID_SHARH?.units||[]),...(window.GNAMMA_TAMHID_MAIN||[]),...(window.GNAMMA_TAMHID_CONCLUSION||[])]){
 if(!c.id||seen.has(c.id))continue;seen.add(c.id);comments.push(c);
}
const closing={'SH-061-C':1,'SH-061-D':2,'SH-061-E':3,'SH-061-F':4,'SH-061-A':5,'SH-061-B':6};
comments.sort((a,b)=>String(a.matnId).localeCompare(String(b.matnId))||(closing[a.id]||a.sequence||0)-(closing[b.id]||b.sequence||0));
const byMatn=new Map(units.map(u=>[u.id,comments.filter(c=>c.matnId===u.id)]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=s=>/^https:\/\//i.test(String(s||''))?esc(s):'#';
const normal=s=>String(s||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ک/g,'ك');
const key='gnamma:qawaid:reading:v2';
let saved={},storageOK=true;
try{saved=JSON.parse(localStorage.getItem(key)||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))throw Error('Invalid reader preferences');}catch{storageOK=false;saved={};}
const clamp=(x,a,b,d)=>Number.isFinite(Number(x))?Math.max(a,Math.min(b,Number(x))):d;
const state={...saved,index:Math.round(clamp(saved.index,0,units.length-1,0)),layer:['matn','paired','sharh'].includes(saved.layer)?saved.layer:'paired',
 ar:saved.ar!==false,en:saved.en!==false,focus:[0,1,2,3].includes(saved.focus)?saved.focus:0,
 theme:['parchment','horizon','night'].includes(saved.theme)?saved.theme:'parchment',
 font:clamp(saved.font,.82,1.45,1),leading:clamp(saved.leading,1.55,2.15,1.8),width:clamp(saved.width,560,1300,960),
 notes:saved.notes===true,landscape:saved.landscape===true,bookmarks:Array.isArray(saved.bookmarks)?saved.bookmarks:[],
 personal:saved.personal&&typeof saved.personal==='object'&&!Array.isArray(saved.personal)?saved.personal:{},
 folded:Array.isArray(saved.folded)?saved.folded.filter(id=>seen.has(id)):[]};
if(!state.ar&&!state.en)state.en=true;
let timer,restoring=false,scrollFrame=false,searchValue='';
const isOn=l=>l==='matn'?state.layer!=='sharh':state.layer!=='matn';
function message(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('toast').style.display='none',2600);}
function persist(){if(!storageOK)return false;try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{storageOK=false;message('Reading works, but this browser cannot save your settings.');return false;}}
function locationFromHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return null;}
 let i=units.findIndex(u=>u.id===id);if(i>=0)return {index:i,id};
 const c=comments.find(u=>u.id===id);if(c){i=units.findIndex(u=>u.id===c.matnId);return {index:i,id,comment:true};}return null;}
const initial=locationFromHash();if(initial){state.index=initial.index;if(initial.comment){state.layer=state.layer==='matn'?'paired':state.layer;state.folded=state.folded.filter(x=>x!==initial.id);}}
function sync(){
 root.dataset.theme=state.theme;body.dataset.mode=state.layer;body.dataset.focus=String(state.focus);
 body.dataset.language=state.ar&&state.en?'both':state.ar?'ar':'en';body.dataset.showNotes=String(state.notes);body.dataset.background=state.landscape?'landscape':'native';
 root.style.setProperty('--scale',state.font);root.style.setProperty('--leading',state.leading);root.style.setProperty('--reading-width',state.width+'px');
 for(const b of document.querySelectorAll('[data-layer-switch]')){const on=isOn(b.dataset.layerSwitch);b.setAttribute('aria-checked',String(on));b.querySelector('.switch-word').textContent=on?'On':'Off';}
 for(const el of document.querySelectorAll('[data-text-layer]'))el.hidden=!isOn(el.dataset.textLayer);
 $('lang-ar').setAttribute('aria-pressed',String(state.ar));$('lang-en').setAttribute('aria-pressed',String(state.en));
 $('focus-label').textContent=['Normal','Focus 1','Focus 2','Continuous'][state.focus];
 $('reading-status').textContent=(state.layer==='paired'?'Matn + sharḥ':state.layer==='matn'?'Matn only':'Sharḥ only')+' · '+units.length+' passages';
 $('save-button').setAttribute('aria-pressed',String(state.bookmarks.includes(units[state.index].id)));
 $('theme-button').title='Theme: '+state.theme;
 const sticky=$('topbar').getBoundingClientRect().height+$('controlbar').getBoundingClientRect().height;root.style.setProperty('--layer-controls-height',Math.max(110,sticky+10)+'px');
 const u=units[state.index];$('location-title').textContent=u.id+' · '+u.title;$('location-source').textContent='A pp. '+u.pages.join('–')+' · '+(isOn('sharh')?'Sharḥ on':'Sharḥ off');
 $('prev').disabled=state.index===0;$('next').disabled=state.index===units.length-1;
 $('prev-num').textContent=state.index?String(state.index).padStart(3,'0'):'—';$('next-num').textContent=state.index<units.length-1?String(state.index+2).padStart(3,'0'):'—';
}
function paragraphs(text){return String(text||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p data-position-anchor>'+esc(p)+'</p>').join('');}
function pair(ar,en){return '<div class="text-pair"><div class="ar" lang="ar" dir="rtl">'+paragraphs(ar)+'</div><div class="en" lang="en">'+paragraphs(en)+'</div></div>';}
function sourceNotes(items,label){return items?.length?'<details class="source-notes"><summary>'+esc(label)+' · '+items.length+'</summary><ul>'+items.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul></details>':'';}
function renderComment(c){
 const variants=(c.variants||[]).map(v=>[v.base,v.lemma,(v.alternatives||[]).join(' / '),v.other,v.remark].filter(Boolean).join(' · '));
 const pp=c.pages?.join('–')||c.page||'';
 return '<details class="sharh-layer" data-text-layer="sharh" id="'+esc(c.id)+'" data-sharh-id="'+esc(c.id)+'" '+(state.folded.includes(c.id)?'':'open')+'>'+ 
 '<summary data-position-anchor><span class="layer-author"><b>Sharḥ <span lang="ar">شرح</span></b><span>Ṣāʾin al-Dīn Ibn Turka</span></span><span class="sharh-heading">'+esc(c.section)+'</span><span class="fold-hint">Open / close</span></summary>'+
 '<div class="sharh-content"><div class="section-meta">'+esc(c.id)+' · <a href="'+safe(c.sourceUrl)+'" target="_blank" rel="noopener noreferrer">A pp. '+esc(pp)+'</a></div>'+pair(c.arabic,c.english)+sourceNotes([...(c.notes||[]),...variants],'Commentary notes')+'</div></details>';
}
function renderBridge(c){if(!c.precedingMatn)return '';const b=c.precedingMatn;
 return '<section class="matn-layer bridge-layer" data-text-layer="matn" id="bridge-'+esc(c.id)+'"><div class="layer-author" data-position-anchor><b>Matn <span lang="ar">متن</span></b><span>Abū Ḥāmid Turka · connecting quotation</span></div>'+pair(b.arabic,b.english)+'</section>';}
function renderUnit(u,i){
 const related=byMatn.get(u.id)||[];
 return '<article class="reading-block layered-unit" id="'+esc(u.id)+'" data-unit-index="'+i+'">'+
 '<header class="unit-heading" data-position-anchor><div class="section-meta">'+esc(u.id)+' · <a href="'+safe(u.url)+'" target="_blank" rel="noopener noreferrer">A pp. '+esc(u.pages.join('–'))+'</a></div><h2>'+esc(u.title)+'</h2></header>'+
 '<section class="matn-layer" data-text-layer="matn"><div class="layer-author" data-position-anchor><b>Matn <span lang="ar">متن</span></b><span>Abū Ḥāmid Muḥammad Turka</span></div>'+pair(u.arabic,u.english)+sourceNotes([...(u.notes||[]),...(u.variants||[]).map(v=>v.lemma+' / '+v.other+': '+v.remark)],'Matn notes')+'</section>'+
 related.map(c=>renderBridge(c)+renderComment(c)).join('')+
 (!related.length?'<p data-text-layer="sharh" class="layer-note">The linked commentary did not load. <a href="commentary.html">Open the commentary reader</a>.</p>':'')+
 '<div class="inline-actions"><button class="text-btn" type="button" data-save="'+esc(u.id)+'">'+(state.bookmarks.includes(u.id)?'Saved passage':'Save passage')+'</button><button class="text-btn" type="button" data-note="'+esc(u.id)+'">My note</button><button class="text-btn" type="button" data-copy="'+esc(u.id)+'">Copy passage link</button></div></article>';
}
function render(){reading.innerHTML=state.focus===3?units.map(renderUnit).join(''):renderUnit(units[state.index],state.index);sync();}
function scrollToId(id){const target=$(id)||$(units[state.index].id);target?.scrollIntoView({block:'start'});}
function go(i,id){if(!Number.isInteger(i)||i<0||i>=units.length)return;restoring=true;state.index=i;render();persist();history.replaceState(null,'','#'+(id||units[i].id));scrollToId(id||units[i].id);requestAnimationFrame(()=>{restoring=false;});}
function topEdge(){return Math.max(120,$('controlbar').getBoundingClientRect().bottom+10);}
function capture(){
 const top=topEdge();let best=null,dist=Infinity;
 for(const el of reading.querySelectorAll('[data-position-anchor]')){if(!el.getClientRects().length)continue;const r=el.getBoundingClientRect();if(r.bottom<top)continue;const d=Math.abs(r.top-top);if(d<dist){best=el;dist=d;}}
 const unit=best?.closest('[data-unit-index]')||$(units[state.index].id);
 return {element:best,unit,offset:best?.getBoundingClientRect().top||top};
}
function restore(anchor){
 if(anchor.unit)state.index=Number(anchor.unit.dataset.unitIndex);
 if(anchor.element?.getClientRects().length){window.scrollBy(0,anchor.element.getBoundingClientRect().top-anchor.offset);}
 else anchor.unit?.scrollIntoView({block:'start'});
 sync();persist();requestAnimationFrame(()=>{restoring=false;});
}
function toggleLayer(layer){
 const other=layer==='matn'?'sharh':'matn';if(isOn(layer)&&!isOn(other)){message('Keep at least one text layer on.');return;}
 restoring=true;const anchor=capture(),m=layer==='matn'?!isOn('matn'):isOn('matn'),s=layer==='sharh'?!isOn('sharh'):isOn('sharh');
 state.layer=m&&s?'paired':m?'matn':'sharh';sync();restore(anchor);
}
function focusNext(){state.focus=(state.focus+1)%4;go(state.index);}
function setAllCommentary(open){for(const d of reading.querySelectorAll('details[data-sharh-id]'))d.open=open;state.folded=open?[]:comments.map(c=>c.id);persist();}
function bookmark(id){const i=state.bookmarks.indexOf(id);if(i>=0)state.bookmarks.splice(i,1);else state.bookmarks.push(id);const stored=persist();sync();for(const b of reading.querySelectorAll('[data-save]'))if(b.dataset.save===id)b.textContent=i>=0?'Save passage':'Saved passage';message(stored?(i>=0?'Bookmark removed':'Passage saved'):'Bookmark kept for this session only.');}
function show(title,html){$('sheet-title').textContent=title;$('sheet-kicker').textContent='GNAMMA · MATN & SHARḤ';$('sheet-content').innerHTML=html;if(!$('sheet').open)$('sheet').showModal();}
function close(){if($('sheet').open)$('sheet').close();}
function menu(){show('Contents & reading desk','<div class="book-actions"><button class="action-btn" data-panel="saved">Saved</button><button class="action-btn" data-panel="notes">My notes</button><button class="action-btn" data-panel="study">Study</button><a class="action-btn" href="commentary.html#SH-INTRO-001">Sharḥ introduction</a></div><p class="help-copy">Matn and Sharḥ switches work independently, on this page. Open or close individual commentary sections by their headings.</p><div class="sheet-list">'+units.map((u,i)=>'<button data-jump="'+i+'">'+esc(u.id)+' · '+esc(u.title)+'<small>'+byMatn.get(u.id).length+' linked sharḥ section(s) · A pp. '+esc(u.pages.join('–'))+'</small></button>').join('')+'</div>');}
function settings(){show('Reading settings','<div class="sheet-row"><label for="setting-font">Text size</label><input id="setting-font" data-range="font" type="range" min=".82" max="1.45" step=".03" value="'+state.font+'"></div><div class="sheet-row"><label for="setting-leading">Line spacing</label><input id="setting-leading" data-range="leading" type="range" min="1.55" max="2.15" step=".05" value="'+state.leading+'"></div><div class="sheet-row"><label for="setting-width">Reading width</label><input id="setting-width" data-range="width" type="range" min="560" max="1300" step="40" value="'+state.width+'"></div><div class="sheet-row"><label for="setting-theme">Theme</label><select id="setting-theme" data-select="theme">'+['parchment','horizon','night'].map(t=>'<option '+(t===state.theme?'selected ':'')+'value="'+t+'">'+t+'</option>').join('')+'</select></div><div class="sheet-row"><label for="setting-notes">Editorial notes</label><input type="checkbox" id="setting-notes" data-check="notes" '+(state.notes?'checked':'')+'></div><div class="sheet-row"><label for="setting-landscape">Landscape backdrop</label><input type="checkbox" id="setting-landscape" data-check="landscape" '+(state.landscape?'checked':'')+'></div><div class="book-actions"><button class="action-btn" data-expand="true">Expand all sharḥ</button><button class="action-btn" data-expand="false">Collapse all sharḥ</button></div><p class="help-copy">Focus cycles Normal → Focus 1 → Focus 2 → Continuous. Layer switches remain available in the bottom dock when the toolbar is hidden. Language controls are independent of text layers.</p>');}
function study(){show('Study & sources','<div class="help-copy"><h3>Two authors, two layers</h3><p>The matn belongs to Abū Ḥāmid Turka. The linked sharḥ belongs to Ṣāʾin al-Dīn Ibn Turka. Commentary follows the passage it explains; connecting quotations are labelled as matn even when the sharḥ is hidden.</p><p>The 40-section commentary introduction has no matching ancestral lemma and is available separately. All 70 linked main and concluding explanations are here. QT-059’s source-omission note remains deferred.</p><div class="sheet-list"><a href="commentary.html#SH-INTRO-001">Commentary introduction</a><a href="commentary.html">Read the commentary alone</a><a href="data/parallel-matn.md">Bilingual matn</a><a href="data/parallel-commentary.md">Bilingual commentary</a><a href="editorial/CRITICAL_APPARATUS.md">Critical apparatus</a><a href="editorial/LUMBARD_COMMENTARY_STANDARD.md">Lumbard comparison</a><a href="editorial/TECHNICAL_GLOSSARY.md">Technical glossary</a><a href="editorial/COMMENTARY_TRANSLATION.md">Translation coverage</a></div></div>');}
function savedPanel(){show('Saved passages','<div class="sheet-list">'+(state.bookmarks.length?state.bookmarks.map(id=>{const i=units.findIndex(u=>u.id===id);return i<0?'':'<button data-jump="'+i+'">'+esc(id)+' · '+esc(units[i].title)+'</button>';}).join(''):'<p class="help-copy">No passages saved yet.</p>')+'</div><button class="action-btn" data-export>Export my notes and bookmarks</button>');}
function notesPanel(id=units[state.index].id){show('My note · '+id,'<p class="help-copy">Private notes stay in this browser, separate from the published translation.</p><textarea id="my-note" class="sheet-input" rows="7">'+esc(state.personal[id]||'')+'</textarea><div class="book-actions"><button class="action-btn primary" data-save-note="'+esc(id)+'">Save note</button><button class="action-btn" data-export>Export my data</button></div><div class="sheet-list">'+Object.keys(state.personal).filter(k=>state.personal[k]).map(k=>'<button data-note="'+esc(k)+'">'+esc(k)+'<small>'+esc(String(state.personal[k]).slice(0,110))+'</small></button>').join('')+'</div>');}
function search(){show('Search both layers','<p class="help-copy">Results name the matching layer. Selecting a sharḥ result reveals it in place, even when that layer is off.</p><input id="search-field" class="sheet-input" aria-label="Search Arabic and English" type="search" value="'+esc(searchValue)+'" placeholder="Arabic or English…"><div id="search-results" class="sheet-list"></div>');$('search-field').focus();results();}
function results(){const q=normal(searchValue).trim(),el=$('search-results');if(!el)return;if(!q){el.innerHTML='<p class="help-copy">Enter a phrase or technical term.</p>';return;}const found=[];
 units.forEach((u,i)=>{if(normal([u.id,u.title,u.arabic,u.english].join(' ')).includes(q))found.push({id:u.id,index:i,title:u.title,layer:'matn'});
 for(const c of byMatn.get(u.id)){if(normal([c.id,c.section,c.arabic,c.english,...(c.notes||[])].join(' ')).includes(q))found.push({id:c.id,index:i,title:c.section,layer:'sharh'});
 if(c.precedingMatn&&normal(c.precedingMatn.arabic+' '+c.precedingMatn.english).includes(q))found.push({id:'bridge-'+c.id,index:i,title:'Connecting quotation',layer:'matn'});}});
 el.innerHTML=found.length?found.map(r=>'<button data-result-index="'+r.index+'" data-result-id="'+esc(r.id)+'" data-result-layer="'+r.layer+'"><b>'+esc(r.id)+' · '+(r.layer==='matn'?'Matn':'Sharḥ')+'</b><small>'+esc(r.title)+'</small></button>').join(''):'<p class="help-copy">No matches.</p>';}
function exportData(){const obj={schema:'gnamma-qawaid-my-reading-v2',exportedAt:new Date().toISOString(),bookmarks:state.bookmarks,notes:state.personal};const href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=href;a.download='gnamma-qawaid-my-notes.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);}
function copy(id){const s=location.href.split('#')[0]+'#'+id;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(s).then(()=>message('Passage link copied'),()=>message(s));else message(s);}
reading.addEventListener('toggle',e=>{const d=e.target;if(!d.matches('details[data-sharh-id]')||!d.isConnected)return;const id=d.dataset.sharhId;state.folded=state.folded.filter(x=>x!==id);if(!d.open)state.folded.push(id);persist();},true);
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.layerSwitch){toggleLayer(b.dataset.layerSwitch);return;}
 if(b.hasAttribute('data-jump')){close();go(Number(b.dataset.jump));return;}
 if(b.hasAttribute('data-result-index')){const i=Number(b.dataset.resultIndex);if(!isOn(b.dataset.resultLayer))state.layer='paired';state.folded=state.folded.filter(x=>x!==b.dataset.resultId);close();go(i,b.dataset.resultId);return;}
 if(b.dataset.save){bookmark(b.dataset.save);return;}if(b.dataset.note){notesPanel(b.dataset.note);return;}if(b.dataset.copy){copy(b.dataset.copy);return;}
 if(b.dataset.panel){({saved:savedPanel,notes:notesPanel,study})[b.dataset.panel]?.();return;}
 if(b.hasAttribute('data-expand')){setAllCommentary(b.dataset.expand==='true');close();return;}
 if(b.dataset.saveNote){const id=b.dataset.saveNote,text=$('my-note').value;if(text)state.personal[id]=text;else delete state.personal[id];message(persist()?'Private note saved':'Note not saved: browser storage is unavailable.');return;}
 if(b.hasAttribute('data-export'))exportData();
});
$('menu-button').addEventListener('click',menu);$('location-button').addEventListener('click',menu);$('settings-button').addEventListener('click',settings);$('search-button').addEventListener('click',search);$('open-study').addEventListener('click',study);
$('sheet-close').addEventListener('click',close);$('sheet').addEventListener('click',e=>{if(e.target!==$('sheet'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
$('focus-button').addEventListener('click',focusNext);$('focus-recover').addEventListener('click',focusNext);
$('theme-button').addEventListener('click',()=>{state.theme=({parchment:'horizon',horizon:'night',night:'parchment'})[state.theme];sync();persist();});
for(const lang of ['ar','en'])$('lang-'+lang).addEventListener('click',()=>{if(state[lang]&&!state[lang==='ar'?'en':'ar']){message('Keep at least one language on.');return;}restoring=true;const a=capture();state[lang]=!state[lang];sync();restore(a);});
$('save-button').addEventListener('click',()=>bookmark(units[state.index].id));$('prev').addEventListener('click',()=>go(state.index-1));$('next').addEventListener('click',()=>go(state.index+1));
$('start-matn').addEventListener('click',()=>{state.layer='matn';go(0);});$('start-sharh').addEventListener('click',()=>{state.layer='paired';go(state.index);});
$('sheet-content').addEventListener('input',e=>{const t=e.target;if(t.id==='search-field'){searchValue=t.value;results();}if(t.dataset.range){state[t.dataset.range]=Number(t.value);sync();persist();}});
$('sheet-content').addEventListener('change',e=>{const t=e.target;if(t.dataset.select){state[t.dataset.select]=t.value;sync();persist();}if(t.dataset.check){state[t.dataset.check]=t.checked;sync();persist();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('sheet').open){close();return;}if($('sheet').open||e.target.closest('input,textarea,select,summary,button,a,[contenteditable]')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();go(state.index+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(state.index-1);}});
window.addEventListener('hashchange',()=>{const x=locationFromHash();if(!x)return;if(x.comment){if(!isOn('sharh'))state.layer='paired';state.folded=state.folded.filter(id=>id!==x.id);}go(x.index,x.id);});
window.addEventListener('scroll',()=>{if(state.focus!==3||restoring||scrollFrame)return;scrollFrame=true;requestAnimationFrame(()=>{scrollFrame=false;if(restoring)return;const y=topEdge();let best=state.index;for(const el of reading.querySelectorAll('[data-unit-index]')){const r=el.getBoundingClientRect();if(r.bottom>=y){best=Number(el.dataset.unitIndex);break;}}if(best!==state.index){state.index=best;sync();persist();}});},{passive:true});
window.addEventListener('resize',sync);
render();if(initial)requestAnimationFrame(()=>scrollToId(initial.id));
})();
