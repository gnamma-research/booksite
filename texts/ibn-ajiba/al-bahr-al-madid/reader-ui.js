/* Daruri interface contract, adapted to the unchanged Ibn Ajiba corpus.
 * Source: booksite ab110c52, 30 October 2026. Book state remains isolated. */
(function(){
'use strict';
const R=window.BahrReader,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],E=R.E;
const icon=name=>'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const button=(action,label,glyph)=>'<button type="button" data-ui="'+action+'" aria-label="'+E(label)+'" title="'+E(label)+'">'+icon(glyph)+'</button>';
const palettes=[
 ['almohad','Almohad plaster',['#f3eee6','#fdfaf4','#82503d','#292d2a','#8b7350']],
 ['cordoba','Córdoba arches',['#f5f1e9','#fffdfa','#984d45','#2c2e30','#9b795c']],
 ['nasrid','Nasrid mineral',['#eef3f1','#fcfefa','#2e617b','#21323a','#a3864f']],
 ['zellij','Zellij green',['#f0f3ed','#fdfef9','#2b6b59','#27342e','#88865a']],
 ['gnamma','Gnamma landscape',['#bfa38a','#faf4e7','#35616b','#c5a88b','#332f2a']],
 ['gnamma-air','Gnamma · open landscape',['#bfa38a','#f4e5d4','#2e6570','#f8f3eb','#3b3832']]
];
const uiDefaults={mode:'reading',focusApparatus:false,pageStyle:'quiet',palette:'almohad',appearance:'system',arabicFont:'amiri',englishFont:'original',fontScale:1,parallelSide:'right',stackedOrder:'top',showNotes:true,showTerms:true,showConcepts:true};
const existing=R.prefs;
for(const [key,value] of Object.entries(uiDefaults))if(existing[key]===undefined)existing[key]=value;
if(!existing.uiVersion){
 existing.mode=existing.scope==='continuous'?'continuous':existing.focus==='normal'?'reading':'focus';
 existing.appearance=existing.theme==='night'?'dark':existing.theme==='system'?'system':'light';
 existing.parallelSide=existing.order==='ar'?'left':'right';existing.uiVersion=1;
}
let navOpen=false,navTrigger=null,modalY=0,modalFrozen=false,lastDock='',modeBusy=false;
const compact=()=>matchMedia('(max-width:940px), (max-height:540px)').matches;
const items=[['read','Read','book'],['contents','Contents','toc'],['desk','Reading Desk','library'],
 ['label','Reference tools'],['indices','Subject index','subject'],['dictionary','Dictionary · معجم','dictionary'],
 ['research','Scholarly research','balance'],['label','Explore further'],['study','Guided study','study'],
 ['editions','Editions & downloads','editions'],['help','Help & guide','info']];
function navHTML(){return items.map(([route,label,glyph])=>route==='label'?'<p class="gn-nav-section-label">'+label+'</p>':
 '<button class="nav-item" type="button" data-nav="'+route+'">'+icon(glyph)+'<span>'+label+'</span></button>').join('');}
function install(){
 document.body.insertAdjacentHTML('afterbegin','<svg class="symbols" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+window.BAHR_UI_ASSETS.symbols+'</svg>');
 $('#topbar').innerHTML='<div id="readingControls" class="reading-controls-inner" aria-label="Navigation and reading controls">'+
 '<div class="gn-reader-global-leading"><button type="button" id="menuBtn" class="gn-top-tile" data-ui="menu" aria-label="Open or close Contents" aria-controls="leftNav" aria-expanded="false" title="Contents"></button>'+
 '<button type="button" id="gnTopHome" data-nav="home" aria-label="Home">'+icon('home')+'<span>Home</span></button><button type="button" id="gnTopRead" data-nav="read" aria-label="Read or resume the book">'+icon('book')+'<span>Read</span></button></div>'+
 '<div class="reading-tools"><div class="persistent-languages" role="group" aria-label="Visible languages; at least one must remain active"><button data-language="ar" title="Arabic: hidden, source marks, or unvowelled" aria-label="Toggle Arabic">Ar</button><button data-language="en" title="English" aria-label="Toggle English">En</button></div>'+
 '<div class="reader-action-slot"><button type="button" id="focusToolbar" data-action="focus" aria-haspopup="dialog" aria-label="Reading mode: Reading, Focus or Continuous" title="Reading mode">'+icon('focus')+'<span class="sr-only" id="focus-label"></span></button>'+
 '<button type="button" id="readerSaveAction" data-ui="bookmark" aria-label="Bookmark section" title="Bookmark section">'+icon('bookmark')+'</button>'+
 '<div class="copy-group">'+button('copy-menu','Copy options','copy')+'</div>'+button('share','Share section','share')+'</div></div>'+
 '<div class="gn-reader-global-trailing"><button type="button" data-action="search" id="searchBtn" aria-label="Search the book and reference tools" title="Search">'+icon('search')+'</button><button type="button" data-action="settings" id="settingsBtn" aria-label="Visuals: display, themes and reading tools" title="Visuals">'+icon('sliders')+'</button></div></div>';
 document.body.insertAdjacentHTML('beforeend','<div id="drawerShade" hidden></div><aside id="leftNav" hidden aria-label="Reader navigation"><div class="nav-heading"><h2><cite lang="ar" dir="rtl">البحر المديد</cite><span>Ibn ʿAjība</span></h2>'+button('menu-close','Close navigation','close')+'</div><nav class="primary-nav" aria-label="Main navigation">'+navHTML()+'</nav><div class="gn-nav-footer-links"><button type="button" data-nav="home">Home</button><button type="button" data-nav="about">About</button><a href="../../../">Gnamma library</a></div></aside>');
 $('#sheet-close').innerHTML=icon('close');
 $('#sheet').addEventListener('close',()=>{unlock();sync();});
 $('#sheet').addEventListener('cancel',()=>unlock());
 new MutationObserver(()=>{if($('#sheet').open)lock();}).observe($('#sheet'),{attributes:true,attributeFilter:['open']});
 $('#drawerShade').addEventListener('click',()=>setNav(false));
 window.addEventListener('resize',()=>{if(navOpen)setNav(true);sync();});
 window.addEventListener('hashchange',()=>{setNav(false);setTimeout(sync,0);});
 $('#reading-dock').insertAdjacentHTML('beforeend','<div id="saved-counts" hidden></div>');
 new MutationObserver(()=>{sync();enhanceDictionary();}).observe($('#main'),{childList:true});
 new MutationObserver(enhanceDictionary).observe($('#sheet-body'),{childList:true});
 sync();
}
function lock(){if(modalFrozen)return;modalFrozen=true;modalY=scrollY;document.body.style.overflow='hidden';document.documentElement.style.overscrollBehavior='none';}
function unlock(){if(navOpen&&compact())return;modalFrozen=false;document.body.style.overflow='';document.documentElement.style.overscrollBehavior='';}
function setNav(open){
 const modal=compact();navOpen=open;$('#leftNav').hidden=!open;$('#drawerShade').hidden=!(open&&modal);
 document.body.classList.toggle('nav-open',open);document.body.classList.toggle('nav-modal',open&&modal);
 $('#menuBtn').setAttribute('aria-expanded',String(open));
 for(const id of ['main','topbar','reading-dock'])$('#'+id).inert=open&&modal;
 const nav=$('#leftNav');if(open&&modal){nav.setAttribute('role','dialog');nav.setAttribute('aria-modal','true');lock();}
 else{nav.removeAttribute('role');nav.removeAttribute('aria-modal');if(!$('#sheet').open)unlock();}
 if(open){navTrigger=document.activeElement;if(modal)nav.querySelector('button')?.focus({preventScroll:true});}
 else{if(navTrigger?.isConnected)navTrigger.focus({preventScroll:true});navTrigger=null;}
}
function sync(){
 const p=R.prefs,root=document.documentElement;
 root.dataset.theme=p.appearance==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p.appearance;
 root.dataset.palette=p.palette;root.dataset.pageStyle=p.pageStyle;root.dataset.arabicFont=p.arabicFont;root.dataset.englishFont=p.englishFont;
 root.style.setProperty('--en-size',(20*p.fontScale)+'px');root.style.setProperty('--ar-size',(28*p.fontScale)+'px');
 root.style.setProperty('--arabic',({'amiri':'"Amiri"','scheherazade':'"Scheherazade New"','noto':'"Noto Naskh Arabic"'})[p.arabicFont]+',serif');
 root.style.setProperty('--serif',({'original':'"Iowan Old Style",Georgia','source-serif':'"Source Sans 3"','literata':'"Lexend"'})[p.englishFont]+',serif');
 document.body.classList.toggle('ui-focus',R.view==='read'&&p.mode!=='reading');
 document.body.classList.toggle('ui-continuous',R.view==='read'&&p.mode==='continuous');
 document.body.classList.toggle('ui-hide-apparatus',R.view==='read'&&p.mode!=='reading'&&!p.focusApparatus);
 document.body.classList.toggle('ui-hide-notes',!p.showNotes);document.body.classList.toggle('ui-hide-terms',!p.showTerms);
 document.body.classList.toggle('ui-parallel-right',p.parallelSide==='right');document.body.classList.toggle('ui-stack-bottom',p.stackedOrder==='bottom');
 const ar=$('#topbar [data-language="ar"]');if(ar){ar.textContent=p.ar&&p.marks==='source'?'Arَ':'Ar';ar.setAttribute('aria-pressed',String(p.ar));ar.setAttribute('aria-label','Arabic: '+(p.ar?(p.marks==='source'?'source vowel marks':'unvowelled'):'hidden')+'. Activate to cycle.');}
 const en=$('#topbar [data-language="en"]');if(en)en.setAttribute('aria-pressed',String(p.en));
 if($('#focusToolbar')){$('#focusToolbar').setAttribute('aria-pressed',String(p.mode!=='reading'));$('#focus-label').textContent=p.mode;}
 $$('[data-nav]').forEach(b=>{const active=b.dataset.nav===R.view||(b.dataset.nav==='read'&&R.view==='read');if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const id=R.visiblePlace()?.r||R.current;if(id)dock(id);
 if($('#sheet').open&&$('#sheet').classList.contains('visuals'))syncVisuals();
}
function dock(id){
 lastDock=id;const r=R.byId.get(id);if(!r)return;
 const prev=$('#previous'),next=$('#next');if(prev){prev.innerHTML=icon('left')+'<span>'+(r.index>0?r.index:'')+'</span>';prev.setAttribute('aria-label','Previous section'+(r.index>0?' '+r.index:''));}
 if(next){next.innerHTML='<span>'+(r.index<388?r.index+2:'')+'</span>'+icon('right');next.setAttribute('aria-label','Next section'+(r.index<388?' '+(r.index+2):''));}
 const active=R.desk.filter(x=>!x.archived&&x.r===id),bookmarked=active.some(x=>x.type==='bookmark'&&x.anchor==='unit-'+id),save=$('#readerSaveAction');
 if(save){save.innerHTML=icon(bookmarked?'bookmark-filled':'bookmark');save.setAttribute('aria-pressed',String(bookmarked));save.setAttribute('aria-label',bookmarked?'Section bookmarked; open Reading Desk':'Bookmark section');}
 const counts=$('#saved-counts');if(counts){const markup=['bookmark','highlight','note'].map(kind=>{const n=active.filter(x=>x.type===kind).length;return n?'<button type="button" data-ui="saved" aria-label="'+n+' saved '+kind+' items">'+icon(kind==='bookmark'?'bookmark-filled':kind==='note'?'notes':'check')+'<span>'+n+'</span></button>':'';}).join('');if(counts.innerHTML!==markup)counts.innerHTML=markup;counts.hidden=!markup;}
}
async function set(values,repaint=false){await R.setPrefs(values,repaint);sync();}
async function readingMode(mode){
 if(modeBusy)return;modeBusy=true;try{R.closeSheet();await set({mode,focus:mode==='reading'?'normal':'quiet',scope:mode==='continuous'?'continuous':'passage'},true);}finally{modeBusy=false;}
}
function modes(){
 R.sheet('Reading mode','<div class="mode-choices" role="radiogroup" aria-label="Reading mode choices">'+
 [['reading','Reading','Section and scholarly apparatus'],['focus','Focus','One section, fewer distractions'],['continuous','Continuous','Scroll through the whole text']].map(([id,label,detail])=>'<button type="button" role="radio" data-mode="'+id+'" aria-checked="'+(R.prefs.mode===id)+'"><span>'+label+'<small>'+detail+'</small></span></button>').join('')+'</div><label class="toggle-row"><input type="checkbox" id="focus-apparatus" '+(R.prefs.focusApparatus?'checked':'')+'> In Focus, show apparatus below the text</label><button type="button" data-nav="home">Home</button>','modes');
}
function visuals(){
 R.sheet('Visuals','<div class="gn-visuals-panel">'+window.BAHR_UI_ASSETS.visuals+'</div>','visuals');
 syncVisuals();
}
function syncVisuals(){
 const p=R.prefs,attributes={'data-page-style-choice':p.pageStyle,'data-arabic-font-choice':p.arabicFont,'data-english-font-choice':p.englishFont,'data-parallel-side':p.parallelSide,'data-stacked-order':p.stackedOrder};
 for(const [attr,val] of Object.entries(attributes))$$('['+attr+']').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute(attr)===val)));
 if($('#fontSizeLabel'))$('#fontSizeLabel').textContent=Math.round(p.fontScale*100)+'%';
 if($('#palettePicker'))$('#palettePicker').innerHTML=palettes.map(([id,name,colours])=>'<button type="button" class="palette-option" data-palette="'+id+'" aria-label="'+E(name)+'" title="'+E(name)+'" aria-pressed="'+(id===p.palette)+'"><span class="palette-swatches">'+colours.map(c=>'<span style="background:'+c+'"></span>').join('')+'</span><strong>'+E(name)+'</strong></button>').join('');
 if($('#settingsTheme'))$('#settingsTheme').innerHTML=['system','light','dark'].map(id=>'<button type="button" data-theme-choice="'+id+'" aria-pressed="'+(id===p.appearance)+'">'+id[0].toUpperCase()+id.slice(1)+'</button>').join('');
}
function notice(label){$('#sheet-kicker').textContent=label;}
async function font(key,value){
 const families={amiri:'Amiri',scheherazade:'Scheherazade New',noto:'Noto Naskh Arabic','source-serif':'Source Sans 3',literata:'Lexend'};
 try{if(value!=='original'){const faces=await document.fonts.load('400 24px "'+families[value]+'"');if(!faces.length)throw Error('Font unavailable');}await set({[key]:value});notice(families[value]||'Original');}
 catch{R.toast('This font could not load. Your current typeface is retained.');}
}
function target(){return R.selected||R.visiblePlace()||{r:R.current};}
function textFor(kind,quoted=false){
 const t=target(),r=R.byId.get(t.r||R.current);if(!r)return '';
 const unit=document.getElementById('unit-'+r.id),parts=[];
 if(kind==='citation')return 'Ibn ʿAjība, al-Baḥr al-Madīd, Volume I, '+r.title+', Cairo '+r.cairo+'.\n'+new URL(R.readURL(r.id,t.anchor||''),location.href).href;
 if(kind==='link')return new URL(R.readURL(r.id,t.anchor||''),location.href).href;
 if(quoted&&R.selected?.quote)return R.selected.quote;
 if(!unit)return '';
 if(kind==='with-heading')parts.push(r.title);
 if(R.prefs.ar)parts.push(unit.querySelector('.ar-column').innerText);
 if(R.prefs.en)parts.push(unit.querySelector('.en-column').innerText);
 return parts.join('\n\n');
}
async function clipboard(value){
 try{await navigator.clipboard.writeText(value);R.toast('Copied.');R.closeSheet();}
 catch{R.sheet('Copy','<textarea id="copy-fallback" readonly aria-label="Text to copy">'+E(value)+'</textarea>');$('#copy-fallback').select();}
}
function copyMenu(){R.sheet('Copy','<div class="panel-nav">'+[['text','Visible text'],['with-heading','Text and heading'],['citation','Citation'],['link','Link to this place']].map(([id,label])=>'<button type="button" data-copy-choice="'+id+'">'+icon(id==='link'?'external':'copy')+' '+label+'</button>').join('')+'</div>','copy-options');}
function share(){
 R.sheet('Share a passage','<p class="muted">Share a direct link, with the heading or text you choose.</p><fieldset><legend>Include with the link</legend>'+
 [['link','Link only'],['heading','Heading'],['text','Visible text']].map(([id,label])=>'<label class="toggle-row"><input type="radio" name="share-content" value="'+id+'" '+(id==='heading'?'checked':'')+'>'+label+'</label>').join('')+'</fieldset><div class="desk-toolbar"><button type="button" data-ui="share-copy">Copy message</button><button type="button" data-ui="share-native">Share…</button></div>','share-options');
}
function shareText(){const kind=$('[name="share-content"]:checked')?.value||'link',r=R.byId.get(target().r||R.current);return(kind==='text'?textFor('text')+'\n\n':kind==='heading'?(r?.title||'The Immense Ocean')+'\n':'')+textFor('link');}
function saved(){
 const rows=R.desk.filter(x=>!x.archived&&x.r===lastDock);
 R.sheet('Your saved items','<div class="panel-nav">'+rows.map(x=>'<a href="'+R.readURL(x.r,x.anchor,x.lang)+'">'+icon(x.type==='bookmark'?'bookmark-filled':'notes')+' '+E(x.note||x.quote||x.type)+'</a>').join('')+'</div><button type="button" data-nav="desk">Manage in Reading Desk</button>','saved-items');
}
function help(){R.page('Help & guide','Read, study and keep your place.','<div class="help-steps"><h2>'+icon('book')+' Reading</h2><p>Ar cycles between source marks, hidden Arabic and unvowelled Arabic. En shows or hides English. At least one language remains visible. Source marks are retained from the supplied edition.</p><h2>'+icon('focus')+' Reading modes</h2><p>Reading shows one section. Focus reduces the controls and lets you choose whether apparatus remains below the text. Continuous includes all 389 sections. The centre of the bottom dock opens the section navigator.</p><h2>'+icon('search')+' Search & references</h2><p>Search Arabic, English and the scholarly reference layers. Dictionary entries retain their historical sources and exact occurrences. Closing a reference returns to your place.</p><h2>'+icon('library')+' Reading Desk</h2><p>Bookmark a section, or select text to highlight and annotate it. Your notes remain in this browser. Export a backup to transfer them, and use Import & merge to retain both collections.</p><h2>'+icon('editions')+' Editions & downloads</h2><p>Choose the supplied PDF editions, keep the complete HTML reader offline, or print your selected personal notes.</p><h2>'+icon('sliders')+' Visuals</h2><p>Choose page style, font, size, language order, six palettes and System, Light or Dark appearance. Layout choices for columns and stacked text are independent.</p></div>');}
function enhanceDictionary(){
 const body=$('#sheet-body');if(!body||$('#sheet-kicker')?.textContent!=='HISTORICAL DICTIONARY'||body.dataset.enhanced==='yes')return;
 body.dataset.enhanced='yes';const sections=[...body.querySelectorAll(':scope > .source-evidence')];
 for(const [i,section] of sections.entries()){
  const title=section.querySelector('h3')?.textContent||'Historical source '+(i+1),d=document.createElement('details');
  d.className='dictionary-source';const summary=document.createElement('summary');summary.textContent=title;d.append(summary);
  while(section.firstChild)d.append(section.firstChild);section.replaceWith(d);
 }
 const close=document.createElement('button');close.dataset.action='close-sheet';close.textContent='Return to your place';body.append(close);
}
function enhanceEditions(){
 if(R.view!=='editions'||$('.edition-tabs'))return;
 const grid=$('.edition-grid');if(!grid)return;
 const tabs=document.createElement('div');tabs.className='edition-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Editions');
 tabs.innerHTML='<button type="button" role="tab" id="published-tab" aria-selected="true" aria-controls="published-editions" data-edition-tab="published">'+icon('editions')+' Published editions</button><button type="button" role="tab" id="personal-tab" aria-selected="false" aria-controls="personal-editions" data-edition-tab="personal">'+icon('library')+' Personal printouts</button>';
 grid.before(tabs);grid.id='published-editions';grid.setAttribute('role','tabpanel');grid.setAttribute('aria-labelledby','published-tab');
 const panel=document.createElement('section');panel.id='personal-editions';panel.hidden=true;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','personal-tab');
 panel.innerHTML='<h2>Personal printouts</h2><p>Print your saved passages, highlights and personal notes from Reading Desk.</p><button type="button" data-nav="desk">'+icon('library')+' Open Reading Desk</button>';
 grid.after(panel);
 $$('.book-number').forEach(n=>n.innerHTML=icon('editions'));
}
document.addEventListener('click',async event=>{
 const b=event.target.closest('button,a');if(!b)return;const d=b.dataset;
 const handled=d.ui||d.nav||d.mode||d.copyChoice||d.pageStyleChoice||d.arabicFontChoice||d.englishFontChoice||d.parallelSide||d.stackedOrder||d.palette||d.themeChoice||d.editionTab||d.language||['focus','settings','menu'].includes(d.action)||['smallerType','largerType'].includes(b.id);
 if(!handled)return;event.preventDefault();event.stopImmediatePropagation();
 try{
  if(d.nav){setNav(false);R.closeSheet();if(d.nav==='read')return await R.resume();if(d.nav==='contents')return R.contents();if(d.nav==='help'){location.hash='#/help';return;}location.hash='#/'+d.nav;return;}
  if(d.mode)return await readingMode(d.mode);
  if(d.language){
   if(d.language==='en'){if(!R.prefs.en||R.prefs.ar)await set({en:!R.prefs.en});}
   else if(!R.prefs.ar)await set({ar:true,marks:'unvowelled'},true);
   else if(R.prefs.marks==='unvowelled')await set({marks:'source'},true);
   else await set(R.prefs.en?{ar:false}:{marks:'unvowelled'},!R.prefs.en);
   return;
  }
  if(d.pageStyleChoice){await set({pageStyle:d.pageStyleChoice});notice(b.getAttribute('aria-label'));return;}
  if(d.arabicFontChoice)return await font('arabicFont',d.arabicFontChoice);
  if(d.englishFontChoice)return await font('englishFont',d.englishFontChoice);
  if(d.parallelSide){await set({parallelSide:d.parallelSide});return;}
  if(d.stackedOrder){await set({stackedOrder:d.stackedOrder});return;}
  if(d.palette){await set({palette:d.palette});notice(b.getAttribute('aria-label'));return;}
  if(d.themeChoice){await set({appearance:d.themeChoice});return;}
  if(b.id==='smallerType'||b.id==='largerType'){await set({fontScale:Math.min(1.5,Math.max(.8,+(R.prefs.fontScale+(b.id==='largerType'?.05:-.05)).toFixed(2)))});return;}
  if(d.copyChoice)return await clipboard(textFor(d.copyChoice));
  if(d.editionTab){for(const el of $$('[data-edition-tab]'))el.setAttribute('aria-selected',String(el===b));$('#published-editions').hidden=d.editionTab!=='published';$('#personal-editions').hidden=d.editionTab!=='personal';return;}
  switch(d.ui||d.action){
   case'menu':if(R.prefs.mode!=='reading'&&R.view==='read')await readingMode('reading');setNav(!navOpen);break;
   case'menu-close':setNav(false);break;case'focus':modes();break;case'settings':visuals();break;
   case'bookmark':R.addBookmark(lastDock||R.current);dock(lastDock||R.current);break;
   case'copy-menu':copyMenu();break;case'share':share();break;case'share-copy':await clipboard(shareText());break;
   case'share-native':if(navigator.share){try{await navigator.share({title:'The Immense Ocean',text:shareText()});}catch(err){if(err.name!=='AbortError')R.toast('Sharing is unavailable. Use Copy message.');}}else await clipboard(shareText());break;
   case'saved':saved();break;
  }
 }catch(err){R.toast(err.message||String(err));}
},true);
document.addEventListener('change',event=>{if(event.target.id==='focus-apparatus')set({focusApparatus:event.target.checked});});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&navOpen){event.preventDefault();setNav(false);return;}
 if(event.key==='Escape'&&!$('#sheet').open&&R.prefs.mode!=='reading'&&R.view==='read')readingMode('reading');
 if(event.key==='Tab'&&navOpen&&compact()){
  const list=$$('#leftNav button,#leftNav a[href]'),first=list[0],last=list[list.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
});
window.addEventListener('hashchange',()=>{if(location.hash==='#/help')setTimeout(help,0);});
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',sync);
window.BahrUI={sync,dock};
install();R.savePrefs();if(location.hash==='#/help')help();
})();