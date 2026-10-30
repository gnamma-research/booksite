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

let copyConfig=null,copyRecord=null,copyTarget=null;
const copyModes={selected:'Selected text',text:'Text',notes:'Scholarly notes',research:'Research extract',citation:'Citation',link:'Link'};
const copySymbol={
 selected:'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke-dasharray="2 2"/><path d="M7 9h10M7 13h6"/></svg>',
 text:'<span class="gn-copy-type-mark">Aa</span>',
 notes:'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4zM8 9h8M8 13h6"/></svg>',
 research:'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6" width="4.5" height="15" rx="1"/><path d="M10 3.5h4.5V21H10zM16.5 8.5l3.8-1 2 12.7-3.8 1zM3.5 18h2.5M11 18h2.5M18.2 18l2.7-.4"/></svg>',citation:'❞',link:'↗'
};
function copyMenu(){
 copyTarget={...target()};R.sheet('Copy','<div class="panel-nav" role="menu" aria-label="Copy options">'+Object.entries(copyModes).filter(([id])=>id!=='selected'||copyTarget.quote).map(([id,label])=>'<button type="button" role="menuitem" data-copy-kind="'+id+'"><span class="copy-option-icon">'+copySymbol[id]+'</span><span>'+label+'</span><span aria-hidden="true">›</span></button>').join('')+'</div>','copy-options');
}
function copyParagraphs(lang){
 const r=copyRecord;if(lang==='ar')return r.ar.split('\n').map((text,i)=>({id:'ar-'+r.id+'-'+(i+1),text})).filter(x=>x.text.trim());
 return r.segments.flatMap((s,i)=>{const root=document.createElement('div');root.innerHTML=s.html;const ps=[...root.querySelectorAll('p')];return ps.length?ps.map((p,j)=>({id:'en-'+r.id+'-s'+(i+1)+'-p'+(j+1),text:p.textContent,html:p.outerHTML})):[];});
}
const copyRadio=(name,values,current)=>'<div class="copy-choices">'+values.map(([v,t])=>'<label><input type="radio" name="'+name+'" value="'+v+'" '+(v===current?'checked':'')+'> '+t+'</label>').join('')+'</div>';
const copyCheck=(name,label)=>'<label class="toggle-row"><input type="checkbox" data-copy-option="'+name+'" '+(copyConfig[name]?'checked':'')+'> '+label+'</label>';
async function copySheet(kind){
 copyTarget=copyTarget||target();copyRecord=await R.record(copyTarget.r||R.current);
 copyConfig={kind,scope:kind==='selected'?'selected':'section',language:R.prefs.ar&&R.prefs.en?'both':R.prefs.ar?'ar':'en',marks:R.prefs.marks==='source',editorial:true,sources:true,variants:kind==='research',quranContext:kind==='research',hadithContext:kind==='research',dictionary:kind==='research',research:kind==='research',sectionNotes:kind==='research',personal:false,appendCitation:false,appendLink:false,rich:false,citationSource:'translation',arStart:0,arEnd:0,enStart:0,enEnd:0};
 for(const lang of ['ar','en']){const i=copyParagraphs(lang).findIndex(x=>x.id===copyTarget.anchor);if(i>=0)copyConfig[lang+'Start']=copyConfig[lang+'End']=i;}
 drawCopy();
}
function drawCopy(){
 const c=copyConfig,simple=['citation','link','selected'].includes(c.kind),languages=c.language==='both'?['ar','en']:[c.language];
 const chooser=(lang,end)=>{const key=lang+(end?'End':'Start');return '<label>'+((lang==='ar'?'Arabic':'English')+(end?' · To':' · From'))+'<select data-copy-option="'+key+'">'+copyParagraphs(lang).map((p,i)=>'<option value="'+i+'" '+(i===Number(c[key])?'selected':'')+'>¶'+(i+1)+' · '+E(p.text.slice(0,65))+'</option>').join('')+'</select></label>';};
 const scopes=c.kind==='selected'?[['selected','Selected text']]:[['paragraph','Paragraph'],['range','Range'],['section','Section']];
 const extras=['notes','research'].includes(c.kind)?'<details><summary>Adjust included material</summary>'+[['editorial','Editorial, translation and grammar notes'],['sources','Qurʾān / ḥadīth references'],['variants','Textual variants and manuscript notes'],['quranContext','Full cited verses and available Qurʾān context'],['hadithContext','Full cited ḥadīth transmissions and translations'],['dictionary','Historical dictionary excerpts'],['research','Relevant critical questions'],['sectionNotes','Also include section-wide notes (labelled)'],['personal','My personal Reading Desk notes (private)']].map(([key,label])=>copyCheck(key,label)).join('')+'</details>':'';
 R.sheet(copyModes[c.kind],'<p class="muted">'+E(copyRecord.title)+'</p><div class="copy-config"><strong>'+(c.kind==='link'?'Link to':c.kind==='citation'?'Reference for':'What to copy')+'</strong>'+copyRadio('copy-scope',scopes,c.scope)+
 (!simple?'<strong>Language</strong>'+copyRadio('copy-language',[['en','English'],['ar','Arabic'],['both','Both']],c.language)+(c.language!=='en'?copyCheck('marks','Arabic vowel marks'):''):'')+
 (c.scope==='paragraph'||c.scope==='range'?'<div class="copy-ranges">'+(simple?[(copyTarget.lang||'en')]:languages).map(lang=>chooser(lang,false)+(c.scope==='range'?chooser(lang,true):'')).join('')+'<p class="muted">Arabic and English paragraph divisions follow their respective source texts.</p></div>':'')+
 (c.kind==='citation'?'<strong>What are you citing?</strong>'+copyRadio('copy-citation',[['original','Arabic original'],['translation','Gnamma translation']],c.citationSource):'')+extras+
 (!['link','citation'].includes(c.kind)?'<details><summary>Output options</summary>'+copyCheck('appendCitation','Add scholarly citation')+copyCheck('appendLink','Append one Gnamma passage link')+copyCheck('rich','Rich text (when supported)')+'</details>':'')+
 '<p class="muted">'+(c.kind==='research'?'Available source contexts only; personal notes are excluded unless selected.':c.kind==='selected'?'The exact selected words; no automatic translation.':'')+'</p><p id="copy-status" role="status"></p><button type="button" data-ui="copy-submit">'+(c.kind==='link'?'Copy link':c.kind==='citation'?'Copy citation':'Copy')+'</button></div>','copy-configuration');
}
function chosenParagraphs(lang){const all=copyParagraphs(lang);if(copyConfig.scope==='section')return all;const a=Number(copyConfig[lang+'Start']),b=copyConfig.scope==='range'?Number(copyConfig[lang+'End']):a;if(b<a)throw Error('Ending paragraph must not precede starting paragraph.');return all.slice(a,b+1);}
function copyLink(){
 const c=copyConfig,lang=copyTarget.lang||'en',parts=chosenParagraphs(lang),anchor=c.scope==='section'?'':parts[0]?.id||'';
 const link=new URL(R.readURL(copyRecord.id,anchor),location.href);if(c.scope==='range'&&parts.length>1)link.hash+='&through='+encodeURIComponent(parts.at(-1).id);return link.href;
}
function copyCitation(){return 'Ibn ʿAjība, '+(copyConfig.citationSource==='original'?'al-Baḥr al-Madīd':'The Immense Ocean (al-Baḥr al-Madīd), Gnamma translation')+', Volume I, '+copyRecord.q+', Cairo '+copyRecord.cairo+'.';}
async function doCopy(){
 const c=copyConfig,r=copyRecord,parts=[];
 try{
  if(c.kind==='link')parts.push(copyLink());else if(c.kind==='citation')parts.push(copyCitation());else{
   if(c.kind==='selected')parts.push(copyTarget.quote||'');
   if(['text','research'].includes(c.kind))for(const lang of c.language==='both'?['ar','en']:[c.language]){
    let text=chosenParagraphs(lang).map(x=>x.text).join('\n\n');if(lang==='ar'&&!c.marks)text=text.replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,'');parts.push(text);
   }
   if(['notes','research'].includes(c.kind)){
    const [notes,reports,sources,questions,dict]=await Promise.all(['notes','reports','sources','questions','dictionary'].map(R.data));
    const full=r.segments.map(s=>s.html).join('\n'),fragment=c.scope==='section'?full:chosenParagraphs('en').map(p=>p.html||'').join('\n');
    const relevant=notes.filter(n=>fragment.includes('/note/'+n.id+'"')||(c.scope==='section'||c.sectionNotes)&&(n.scope||[]).some(p=>p.record_id===r.id));
    if(c.editorial||c.variants)parts.push('Translator annotations\n'+relevant.filter(n=>c.editorial||/variant|manuscript|reading/i.test(n.title+' '+n.content)).map(n=>(n.title||n.id)+'\n'+n.content+'\n'+(n.source||'')).join('\n\n'));
    if(c.sources)parts.push('Section source references\n'+sources.filter(s=>s.passage_record===r.id).map(s=>[s.legacy_marker,s.current_status,s.current_source_locators].filter(Boolean).join('\n')).join('\n\n'));
    if(c.quranContext&&r.quran_ar)parts.push('Qurʾānic passage · '+r.q+'\n'+(c.language!=='en'?r.quran_ar+'\n':'')+(c.language!=='ar'?r.quran_en:''));
    if(c.hadithContext)parts.push('Cited report dossiers\n'+reports.filter(h=>fragment.includes('/hadith/'+h.id+'"')).map(h=>[h.title,h.arabic,h.english,h.source,h.grade,h.remarks].filter(Boolean).join('\n')).join('\n\n'));
    if(c.dictionary)parts.push('Historical dictionary · section occurrences\n'+dict.filter(d=>d.occurrences.some(o=>o.r===r.id)).map(d=>d.term+' · '+d.ar+'\n'+d.gloss+'\n'+d.sources.map(s=>[s.author,s.work,s.quote,s.translation,s.comment].filter(Boolean).join('\n')).join('\n\n')).join('\n\n'));
    if(c.research)parts.push('Section critical questions\n'+questions.filter(q=>q.passages.includes(r.id)).map(q=>[q.question,q.status,q.passage].filter(Boolean).join('\n')).join('\n\n'));
    if(c.personal)parts.push('Private Reading Desk notes\n'+R.desk.filter(x=>!x.archived&&x.r===r.id&&x.note).map(x=>x.note).join('\n\n'));
   }
   if(c.appendCitation)parts.push(copyCitation());if(c.appendLink)parts.push(copyLink());
  }
  const text=parts.filter(Boolean).join('\n\n');
  if(c.rich&&navigator.clipboard?.write&&window.ClipboardItem){try{await navigator.clipboard.write([new ClipboardItem({'text/plain':new Blob([text],{type:'text/plain'}),'text/html':new Blob(['<div style="white-space:pre-wrap">'+E(text)+'</div>'],{type:'text/html'})})]);R.toast('Copied.');R.closeSheet();return;}catch{}}
  await clipboard(text);
 }catch(error){if($('#copy-status'))$('#copy-status').textContent=error.message;}
}
let shareSelection='',shareId='';
function share(){
 const t=target(),r=R.byId.get(t.r||R.current);shareId=r?.id||R.current;shareSelection=t.quote||'';
 R.sheet('Share a passage','<p class="muted">Share a direct link to this section, with the heading or text you choose.</p><fieldset><legend>Include with the link</legend><div class="share-mode-options">'+
 [['editorial','Editorial title','The descriptive English heading'],['original','Original heading','With its English translation'],['excerpt','First passage','In the selected reading language(s)'],['selection','Selected text','The words highlighted in the passage'],['full','Complete section','The visible Arabic, English or both'],['link','Link only','']].map(([id,label,detail])=>'<label '+(id==='original'||id==='selection'&&!shareSelection?'hidden':'')+'><input type="radio" name="share-content" value="'+id+'" '+(id==='editorial'?'checked':'')+' '+(id==='original'?'disabled':'')+'><span>'+label+'<small>'+detail+'</small></span></label>').join('')+'</div></fieldset><label for="share-preview">Message preview</label><textarea id="share-preview" readonly rows="5"></textarea><div class="desk-toolbar"><button type="button" data-ui="share-copy">Copy message</button><button type="button" data-ui="share-native">Share…</button></div>','share-options');$('#share-preview').value=shareText();
}
function shareText(){
 const kind=$('[name="share-content"]:checked')?.value||'editorial',r=R.byId.get(shareId),unit=document.getElementById('unit-'+shareId),link=new URL(R.readURL(shareId),location.href).href;
 if(kind==='link')return link;let text=r?.title||'';
 if(kind==='selection')text=shareSelection;
 if(kind==='excerpt')text+='\n\n'+['ar','en'].filter(l=>R.prefs[l]).map(l=>unit?.querySelector('.'+l+'-column p')?.innerText||'').join('\n\n');
 if(kind==='full')text+='\n\n'+['ar','en'].filter(l=>R.prefs[l]).map(l=>unit?.querySelector('.'+l+'-column')?.innerText||'').join('\n\n');
 return 'Ibn ʿAjība · al-Baḥr al-Madīd\n'+text+'\n\n'+link;
}
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
 const handled=d.ui||d.nav||d.mode||d.copyChoice||d.copyKind||d.pageStyleChoice||d.arabicFontChoice||d.englishFontChoice||d.parallelSide||d.stackedOrder||d.palette||d.themeChoice||d.editionTab||d.language||['focus','settings','menu'].includes(d.action)||['smallerType','largerType'].includes(b.id);
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
  if(d.copyKind)return await copySheet(d.copyKind);
  if(d.copyChoice)return await clipboard(textFor(d.copyChoice));
  if(d.editionTab){for(const el of $$('[data-edition-tab]'))el.setAttribute('aria-selected',String(el===b));$('#published-editions').hidden=d.editionTab!=='published';$('#personal-editions').hidden=d.editionTab!=='personal';return;}
  switch(d.ui||d.action){
   case'menu':if(R.prefs.mode!=='reading'&&R.view==='read')await readingMode('reading');setNav(!navOpen);break;
   case'menu-close':setNav(false);break;case'focus':modes();break;case'settings':visuals();break;
   case'bookmark':R.addBookmark(lastDock||R.current);dock(lastDock||R.current);break;
   case'copy-menu':copyMenu();break;case'copy-submit':await doCopy();break;case'share':share();break;case'share-copy':await clipboard(shareText());break;
   case'share-native':if(navigator.share){try{await navigator.share({title:'The Immense Ocean',text:shareText()});}catch(err){if(err.name!=='AbortError')R.toast('Sharing is unavailable. Use Copy message.');}}else await clipboard(shareText());break;
   case'saved':saved();break;
  }
 }catch(err){R.toast(err.message||String(err));}
},true);
document.addEventListener('change',event=>{
 const t=event.target;if(t.id==='focus-apparatus')set({focusApparatus:t.checked});
 if(t.name==='share-content'&&$('#share-preview'))$('#share-preview').value=shareText();
 if(!copyConfig)return;
 if(t.dataset.copyOption){copyConfig[t.dataset.copyOption]=t.type==='checkbox'?t.checked:t.value;}
 if(t.name==='copy-scope'){copyConfig.scope=t.value;drawCopy();}
 if(t.name==='copy-language'){copyConfig.language=t.value;drawCopy();}
 if(t.name==='copy-citation')copyConfig.citationSource=t.value;
});
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