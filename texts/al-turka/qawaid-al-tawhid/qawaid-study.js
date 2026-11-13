/* Gnamma Qawāʿid study tools — dictionary, subjects, contextual quotations, PDF editions.
   User-facing reading view is clean by default. Scholarly records are optional.
*/
(function(){
'use strict';
const terms=window.GNAMMA_QAWAID_TERMS?.terms||[],references=window.GNAMMA_QAWAID_REFERENCES?.items||[];
const citationPolicy=window.GNAMMA_QAWAID_CITATION_POLICY||{grades:{},records:{}};
const referenceGrade=r=>citationPolicy.grades?.[citationPolicy.records?.[r.id]]||{group:'comparison',label:'Contextual source',explanation:'The relationship has not been independently established as a direct quotation.'};
const matn=window.GNAMMA_QAWAID_MATN?.units||[];
const sharh=[...new Map([...(window.GNAMMA_TAMHID_SHARH?.units||[]),...(window.GNAMMA_TAMHID_MAIN||[]),...(window.GNAMMA_TAMHID_CONCLUSION||[])].map(u=>[u.id,u])).values()];
const byId=new Map([...matn,...sharh].map(u=>[u.id,u]));
const $=s=>document.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
const pageUrl='https://gnamma-research.github.io/booksite/texts/al-turka/qawaid-al-tawhid/';
const termMap=new Map(terms.map(t=>[t.id,t]));
const citationMap=new Map(references.map(r=>[r.id,r]));
let apparatus=localStorageGet('gnamma:qawaid:apparatus-v1','off');
if(!['off','minimal','full'].includes(apparatus))apparatus='off';
let corpus=null,occurrences=new Map(),card=null,inlineQueued=false;
function localStorageGet(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
function localStoragePut(key,value){try{localStorage.setItem(key,value)}catch{}}
function originalCitation(r){
 const u=byId.get(r.quoteFrom)||corpus?.units?.find(x=>x.id===r.quoteFrom);
 if(!u)return {arabic:'',english:'',warning:'Quoted source passage is not loaded.'};
 // A medieval quotation may follow قال without guillemets. When the
 // source record has checked boundaries, show only that quoted excerpt.
 if(r.quoteStart&&r.quoteEnd){
  const source=String(u.arabic||'');
  const a=source.indexOf(r.quoteStart);
  const b=a<0?-1:source.indexOf(r.quoteEnd,a+r.quoteStart.length);
  if(a<0||b<=a)return {arabic:'',english:'',warning:'Quoted passage boundaries could not be checked against the loaded Arabic; nothing is invented.'};
  return {arabic:source.slice(a,b).trim(),english:r.english||'',warning:'Delimited quotation as reproduced in Tamhīd; not a collated full transcription of the separate source.'};
 }
 const q=[...String(u.arabic||'').matchAll(/«([^»]{28,12000})»/g)].map(x=>x[1].trim());
 const text=Number.isInteger(r.quoteIndex)?(q[r.quoteIndex]||''):(q.find(x=>x.length>110)||q[0]||'');
 return {arabic:text,english:r.english||'',warning:text?'Exact Arabic quotation reproduced in Ibn Turka’s commentary; this card is not a claim to reproduce the entire cited treatise.':'The quotation boundaries in this witness are not independently established; open the linked commentary rather than treating this as a complete quotation.'};
}
function unitURL(id){
 if(id.startsWith('SH-INTRO'))return 'commentary.html#'+encodeURIComponent(id);
 if(id.startsWith('SH-'))return '#'+encodeURIComponent(id);
 return '#'+encodeURIComponent(id);
}
function buildOccurrences(){
 const all=[...matn,...sharh,...(corpus?.units||[])];
 occurrences=new Map();
 for(const t of terms){
  const phrases=[t.ar,...t.aliases.filter(a=>/[\u0600-\u06ff]/.test(a)),t.en.split('/')[0].trim(),...t.aliases.filter(a=>/^[A-Za-z]/.test(a)&&a.length>5)].map(norm).filter(x=>x.length>=4);
  const found=[],seen=new Set();
  for(const u of all){
   if(!u.id||seen.has(u.id))continue;seen.add(u.id);
   const a=norm(u.arabic),e=norm(u.english);
   if(phrases.some(p=>a.includes(p)||e.includes(p))){
    found.push({id:u.id,title:u.section||u.title||u.id,source:u.sourceLocator||'Qawāʿid matn'});
   }
  }
  occurrences.set(t.id,found);
 }
}
function studyIcon(type){
 const icons={
 dictionary:'<path d="M5 4h14v16H6a3 3 0 0 1-1-5V4zM5 16h14M9 8h6M9 12h5"/>',
 index:'<path d="M8 5h12M8 12h12M8 19h12M3 5h1M3 12h1M3 19h1"/>',
 sources:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h6"/>',
 pdf:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 11h7M9 15h7"/>',
 note:'<rect x="3.6" y="3.5" width="16" height="17" rx="2"/><path d="M7 8h7M7 11h4m.6 5.9 5.3-5.3 2 2-5.3 5.3-2.8.8zM15.9 12.6l2 2"/>',
 bookmark:'<path d="M6 3.5h12v17L12 16l-6 4.5Z"/><path d="M12 8v5.3M9.35 10.65h5.3"/>',
 appearance:'<path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"/>',
 reading:'<path d="M4 5h16M4 11h16M4 17h10"/><circle cx="17" cy="17" r="3"/>',
 about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.5"/>',
 contents:'<path d="M7 5h13M7 12h13M7 19h13"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="19" r="1"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 close:'<path d="M5 5l14 14M19 5 5 19"/>',
 back:'<path d="M15 5l-7 7 7 7"/>'
 };
 return '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+(icons[type]||icons.reading)+'</svg>';
}
function applyFontPrefs(){
 const ar=localStorageGet('gnamma:qawaid:gn-arabic-font','naskh');const en=localStorageGet('gnamma:qawaid:gn-english-font','serif');
 document.documentElement.style.setProperty('--font-ar',ar==='amiri'?"Amiri,'Noto Naskh Arabic',serif":ar==='traditional'?"'Traditional Arabic',Amiri,serif":"'Noto Naskh Arabic',Amiri,serif");
 document.documentElement.style.setProperty('--font-en',en==='sans'?"'Source Sans 3',system-ui,sans-serif":"Georgia,'Iowan Old Style',serif");
}
function setup(){
 const header=document.querySelector('#topbar .right');
 if(header && !$('#new-about-button')){
  const about=document.createElement('button');about.id='new-about-button';about.type='button';about.className='icon-btn';about.setAttribute('aria-label','About the texts');about.innerHTML=studyIcon('about');header.insertBefore(about,header.firstChild);
  about.addEventListener('click',()=>openPanel('about'));
 }
 const dock=$('#reading-dock .dock-middle');
 if(dock&&!$('#dock-note-shortcut')){
  const bar=document.createElement('div');bar.className='gn-dock-personal';
  bar.innerHTML='<button id="dock-note-shortcut" type="button" class="gn-quick-icon" aria-label="Add personal note" title="My note">'+studyIcon('note')+'</button><button id="dock-bookmark-shortcut" type="button" class="gn-quick-icon" aria-label="Bookmark passage" title="Bookmark">'+studyIcon('bookmark')+'</button><button id="dock-subject-shortcut" type="button" class="gn-quick-icon" aria-label="Subjects and dictionary" title="Index">'+studyIcon('index')+'</button>';
  dock.append(bar);
  $('#dock-note-shortcut').addEventListener('click',()=>{const id=currentQT(),b=document.createElement('button');b.dataset.note=id;document.body.append(b);b.click();b.remove()});
  $('#dock-bookmark-shortcut').addEventListener('click',()=>$('#save-button')?.click());
  $('#dock-subject-shortcut').addEventListener('click',()=>openPanel('subjects'));
 }
 const save=$('#save-button');if(save){save.innerHTML=studyIcon('bookmark');save.title='Bookmark this passage';}
 const originalIntro=$('.book-intro .help-copy');
 if(originalIntro)originalIntro.textContent='Read the Arabic and English together, or choose either language. Show or hide the commentary at any passage, and explore its linked terminology, source passages, and subject index.';
 const lede=$('.book-intro .lede');
 if(lede)lede.innerHTML='Abū Ḥāmid Muḥammad Turka’s <em>Qawāʿid al-Tawḥīd</em> and Ṣāʾin al-Dīn ʿAlī Ibn Turka’s early fifteenth-century commentary, <em>Tamhīd al-Qawāʿid</em>, in one continuous reading desk. The work investigates divine unity, existence, knowledge, manifestation and the Perfect Human.';
 const summary=$('.book-intro .edition-meta');if(summary)summary.innerHTML='<span>Qawāʿid · 61 passages</span><span>Tamhīd · complete translated commentary</span>';
 const top=$('#reading-status');if(top)top.textContent='Matn · Sharḥ';
 const btn=$('#open-study');if(btn){btn.textContent='Dictionary & subject index';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openPanel('study')},true)}
 const theme=$('#theme-button');if(theme)theme.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openPanel('appearance')},true);
 const settings=$('#settings-button');if(settings)settings.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openPanel('settings')},true);
 const menu=$('#menu-button');if(menu)menu.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openPanel('menu')},true);
 // The top-level Search button belongs to the integrated matn/sharh full-text reader.
 // Its content-search dialog is not replaced by the scholarly dictionary/source panel.
 // The latter remains accessible via 'Search terms & sources' in the Reading Desk menu.
 const shelf=$('#sheet');if(shelf){shelf.addEventListener('close',()=>{if(panelOpen())panelClose()},true)}
 const pstyle=document.createElement('style');pstyle.textContent='body[data-apparatus="off"] .source-notes,body[data-apparatus="off"] .gn-term-ribbon,body[data-apparatus="off"] .gn-citation-ribbon{display:none!important}body[data-apparatus="off"] .gn-term-inline{color:inherit!important;border:0!important;text-decoration:none!important;background:transparent!important}body[data-apparatus="minimal"] .source-notes{display:none!important}';document.head.append(pstyle);
 applyFontPrefs();
 setApparatus(apparatus);
 buildOccurrences();
 fetch('data/commentary-corpus.json').then(r=>r.ok?r.json():null).then(x=>{if(!x?.units?.length)return;corpus=x;for(const u of corpus.units)if(!byId.has(u.id))byId.set(u.id,u);buildOccurrences();}).catch(()=>{});
 document.addEventListener('click',clickDelegated);
 document.addEventListener('input',inputDelegated);
 document.addEventListener('change',changeDelegated);
 ensureCard();
 scheduleAnnotations();
 const list=$('#reading-list');if(list){let observer=new MutationObserver(()=>scheduleAnnotations());observer.observe(list,{childList:true,subtree:false});}
}
function currentQT(){return ($('#location-title')?.textContent||'QT-001').match(/QT-\d{3}/)?.[0]||'QT-001';}
function panelOpen(){return Boolean($('#gn-study-dialog')?.open)}
function panelClose(){const d=$('#gn-study-dialog');if(d?.open)d.close()}
function ensureCard(){
 if($('#gn-study-dialog'))return;
 card=document.createElement('dialog');card.id='gn-study-dialog';card.className='gn-study-dialog';card.innerHTML='<header class="gn-study-head"><button class="gn-study-back" data-study-close aria-label="Close reference window">'+studyIcon('back')+'</button><div><small>GNAMMA READING DESK</small><h2 id="gn-study-title"></h2></div><button class="gn-study-close" data-study-close aria-label="Close">'+studyIcon('close')+'</button></header><div id="gn-study-content"></div>';
 document.body.append(card);
 card.addEventListener('click',e=>{if(e.target===card)panelClose()});
}
function show(title,html){
 ensureCard();
 $('#gn-study-title').textContent=title;
 $('#gn-study-content').innerHTML=html;
 if($('#sheet')?.open)$('#sheet').close();
 if(!card.open)card.showModal();
}
function groupButton(title,id,icon,small=''){return '<button class="gn-menu-row" data-open-study="'+esc(id)+'">'+studyIcon(icon)+'<span><b>'+esc(title)+'</b>'+(small?'<small>'+esc(small)+'</small>':'')+'</span>'+studyIcon('back')+'</button>'}
function openPanel(panel,param){
 if(panel==='menu'||panel==='study')return show('Reading desk',[
  groupButton('Contents','contents','contents','61 matn units, linked sharḥ'),
  groupButton('Dictionary','dictionary','dictionary','82 technical headwords with source passages'),
  groupButton('Subject index','subjects','index','Grouped themes and source locations'),
  groupButton('Citations & sources','references','sources','Attested wording, primary texts and exact passage references'),
  groupButton('Parallels & reports','parallels','sources','Editorial comparisons, named works and unverified reports'),
  groupButton('Search terms & sources','search','search','Find technical terms and source-reference cards'),
  groupButton('PDF editions','pdf','pdf','Reading, Study and Reference'),
   groupButton('Editorial & textual notes','apparatus-notes','sources','Source variants and editorial notes, outside the reading text'),
  groupButton('My notes','notes','note','Private annotations'),
  groupButton('Bookmarks','bookmarks','bookmark','Saved passages'),
  groupButton('Appearance','appearance','appearance','Themes and type sizes'),
  groupButton('Reading options','settings','reading','Languages, layers and apparatus'),
  groupButton('About this work','about','about','The authors, date and scope')
 ].join(''));
 if(panel==='dictionary')return dictionaryPanel(param);
 if(panel==='subjects')return subjectsPanel(param);
 if(panel==='references')return referencePanel(param);
 if(panel==='parallels')return referencePanel(param,'comparison');
 if(panel==='pdf')return pdfPanel();
 if(panel==='about')return aboutPanel();
 if(panel==='appearance')return appearancePanel();
 if(panel==='settings')return settingsPanel();
 if(panel==='term')return termPanel(param);
 if(panel==='source')return sourcePanel(param);
 if(panel==='notes'||panel==='bookmarks'||panel==='contents'){
  panelClose();const b=$('#location-button');if(panel==='contents')b?.click();else{
   const fake=document.createElement('button');fake.dataset.panel=panel;document.body.append(fake);fake.click();fake.remove();
  }return;
 }
 if(panel==='search'){return show('Search', '<input class="gn-study-search" id="gn-source-query" placeholder="Find a term, title or source…" type="search"><div id="gn-search-results"></div>')}
}
function editorialNotesPanel(){
 const id=currentQT(),u=byId.get(id)||matn[0],related=sharh.filter(c=>c.matnId===u.id);
 const renderNote=n=>'<li>'+esc(typeof n==='string'?n:[n.type,n.text,n.remark].filter(Boolean).join(' · '))+'</li>';
 const all=[u,...related];
 const rows=all.map(x=>{
  const notes=[...(x.notes||[]),...(x.variants||[]).map(v=>[v.lemma,v.base,v.other,(v.alternatives||[]).join(' / '),v.remark].filter(Boolean).join(' · '))].filter(Boolean);
  if(!notes.length)return '';
  return '<section class="gn-editorial-unit"><h3>'+esc(x.id)+' · '+esc(x.section||x.title||'Source readings')+'</h3><ul>'+notes.map(renderNote).join('')+'</ul></section>';
 }).filter(Boolean);
 show('Editorial & textual notes','<p class="gn-help">Modern translation decisions, source notes and variant reports are consulted here, outside the authorial matn and commentary. The authorial introduction and the original commentary remain in the reading text.</p><p class="gn-help">Current passage: '+esc(u.id)+' · '+esc(u.title)+'</p>'+(rows.join('')||'<p>No notes recorded for this passage.</p>')+'<p class="gn-help"><a href="editorial/EDITORIAL_STATUS.md" target="_blank" rel="noopener noreferrer">Editorial status and source audit</a></p>');
}

function apparatusMenu(){
 const options=[['off','Off','Hide study links, notes and reference markers'],['minimal','Compact','Show linked terms and quotations, hide longer notes'],['full','Expanded','Show expanded study links; textual notes remain in their separate panel']];
 return '<fieldset class="gn-apparatus-options"><legend>Apparatus</legend>'+options.map(([id,label,desc])=>'<label class="gn-setting-option"><input type="radio" name="gn-apparatus" value="'+id+'" '+(apparatus===id?'checked':'')+'><span><b>'+label+'</b><small>'+desc+'</small></span></label>').join('')+'</fieldset>';
}
function setApparatus(val){apparatus=val;document.body.dataset.apparatus=val;localStoragePut('gnamma:qawaid:apparatus-v1',val);window.GnammaQawaidReader?.setEditorialNotes?.(val==='full');
 document.body.dataset.showNotes=String(val==='full');}
function settingsPanel(){
 show('Reading options','<p class="gn-help">Control the two independently attributed texts with the Matn and Sharḥ switches in the toolbar. Their settings are retained while you navigate.</p>'+apparatusMenu()+'<div class="gn-menu-footer"><button data-open-study="appearance">Appearance and typography</button><button data-open-study="pdf">PDF editions</button></div>');
}
function appearancePanel(){
 show('Appearance','<fieldset class="gn-apparatus-options"><legend>Theme</legend>'+[['parchment','Paper'],['horizon','Horizon'],['night','Night']].map(([v,l])=>'<label class="gn-setting-option"><input type="radio" name="gn-theme" value="'+v+'" '+(document.documentElement.dataset.theme===v?'checked':'')+'><span><b>'+l+'</b></span></label>').join('')+'</fieldset><p class="gn-help">Text appearance applies to both layers and preserves your reading place.</p><div class="gn-size-row"><label>Text size <input id="gn-font-size" type="range" min=".82" max="1.45" step=".03" value="'+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale'))||1)+'"></label></div><div class="gn-size-row"><label>Line spacing <input id="gn-line-spacing" type="range" min="1.55" max="2.15" step=".05" value="'+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--leading'))||1.8)+'"></label></div><div class="gn-size-row"><label>Reading width <input id="gn-reading-width" type="range" min="560" max="1300" step="40" value="'+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reading-width'))||960)+'"></label></div><fieldset class="gn-apparatus-options"><legend>Typefaces</legend><label class="gn-setting-option">Arabic <select id="gn-arabic-font"><option value="naskh">Naskh</option><option value="amiri">Amiri</option><option value="traditional">Traditional Arabic</option></select></label><label class="gn-setting-option">English <select id="gn-english-font"><option value="serif">Classic serif</option><option value="sans">Modern sans</option></select></label></fieldset><div class="gn-menu-footer"><button data-open-study="settings">Reading options</button></div>');
}
function aboutPanel(){
 show('About the texts','<div class="gn-prose"><h3>قواعد التوحيد · Qawāʿid al-Tawḥīd</h3><p>The original treatise, by Abū Ḥāmid Ṣadr al-Dīn Muḥammad Turka al-Iṣfahānī (late thirteenth to early fourteenth century), examines divine unity, existence, divine knowledge, determinations, and the relation between demonstration and spiritual realization.</p><h3>التمهيد في شرح قواعد التوحيد</h3><p>Ṣāʾin al-Dīn ʿAlī Ibn Turka (d. approximately 835 AH / 1432 CE) wrote the commentary in the early fifteenth century. He develops his ancestor’s argument using logic, Avicennian philosophy and the terminology of Ibn ʿArabī’s tradition.</p><p>The two works are displayed as distinct texts: the ancestor’s <em>matn</em> and the descendant’s <em>sharḥ</em>. Use the switches to read them separately or together. The English navigation titles are editorial guides, not independently established original chapter rubrics.</p><p><a href="commentary.html#SH-INTRO-001">Read the commentator’s independent introduction</a></p><p class="gn-help">This is a complete source-based <em>working translation</em>, not a manuscript-established critical edition. <a href="https://github.com/gnamma-research/booksite/blob/master/texts/al-turka/qawaid-al-tawhid/editorial/SECOND_PASS_AUDIT_2026-11-07.md" target="_blank" rel="noopener noreferrer">Read the source and correction audit.</a></p></div>');
}
function dictionaryPanel(q=''){
 const hits=terms.filter(x=>!q||norm(x.en+' '+x.ar+' '+x.aliases.join(' ')).includes(norm(q)));
 const groups=[...new Set(hits.map(x=>x.category))];
 show('Technical dictionary','<input class="gn-study-search" id="gn-dictionary-filter" value="'+esc(q)+'" type="search" placeholder="Search Arabic, English, transliteration…"><p class="gn-help" id="gn-dictionary-count">'+hits.length+' entries · select a term to see its meaning and textual locations.</p>'+groups.map(g=>'<section class="gn-term-group"><h3>'+esc(g)+'</h3><div class="gn-term-grid">'+hits.filter(t=>t.category===g).map(t=>'<button data-open-term="'+esc(t.id)+'"><span lang="ar">'+esc(t.ar)+'</span><b>'+esc(t.en)+'</b></button>').join('')+'</div></section>').join(''));
}
function subjectsPanel(){
 const groups=[...new Set(terms.map(x=>x.category))];
 show('Subject index','<p class="gn-help">Select a subject to inspect its terms and locations in the matn and sharḥ.</p>'+groups.map(g=>'<details class="gn-subject-group" open><summary>'+esc(g)+' <small>'+terms.filter(t=>t.category===g).length+' entries</small></summary>'+terms.filter(t=>t.category===g).map(t=>'<button data-open-term="'+esc(t.id)+'"><span>'+esc(t.en)+'</span><small>'+esc(t.ar)+' · '+(occurrences.get(t.id)||[]).length+' locations</small></button>').join('')+'</details>').join(''));
}
function termPanel(id, expanded=false){
 const t=termMap.get(id);if(!t)return;
 const loc=occurrences.get(id)||[],shown=expanded?loc:loc.slice(0,18);
 const sourceKind=x=>x.id.startsWith('SH-INTRO')?'Tamhīd introduction':x.id.startsWith('SH-')?'Tamhīd sharḥ':'Qawāʿid matn';
 show(t.en,'<div class="gn-prose"><div class="gn-headword" lang="ar" dir="rtl">'+esc(t.ar)+'</div><small>'+esc(t.category)+'</small><p>'+esc(t.definition)+'</p>'+(t.aliases.length?'<p><strong>Also:</strong> '+esc(t.aliases.join(' · '))+'</p>':'')+'</div><h3 class="gn-subheading">Textual locations <small>('+loc.length+')</small></h3><div class="gn-locations">'+(loc.length?shown.map(x=>'<a href="'+unitURL(x.id)+'" data-study-goto="'+esc(x.id)+'"><b>'+esc(x.id)+'</b> · '+esc(x.title)+' <small>'+esc(sourceKind(x))+'</small></a>').join(''):'<p>No direct lexical match in the current reader. Browse the subject index for related topics.</p>')+'</div>'+(loc.length>18&&!expanded?'<button class="gn-more-locations" data-expand-term="'+esc(id)+'">Show all '+loc.length+' matched passages</button>':'')+'<div class="gn-menu-footer"><button data-open-study="dictionary">Dictionary</button><button data-open-study="subjects">Subject index</button></div>');
 window.GnammaQawaidHistorical?.attach?.(id);
}
function referencePanel(q='',filter=null){
 const sets=[
  {id:'direct',title:'Attested citations and quotations',description:'Displayed source phrases are linked only where they match the Arabic wording in a named passage. A quotation preserved in Tamhīd is not automatically a manuscript-collated original of another work.'},
  {id:'comparison',title:'Parallels, named works and reported attributions',description:'Separate independently located excerpts, interpretive comparisons, attributed material and unverified reports. These are never presented as new exact authorial quotations.'}
 ];
 const query=norm(q||'');
 const markup=sets.filter(g=>!filter||filter===g.id).map(group=>{
  const items=references.filter(r=>referenceGrade(r).group===group.id&&(!query||norm(r.title+' '+r.source+' '+(r.note||'')).includes(query)));
  if(!items.length)return '';
  return '<section class="gn-reference-group"><h3>'+group.title+'</h3><p class="gn-help">'+group.description+'</p>'+
   '<div class="gn-source-list">'+items.map(r=>'<button class="gn-source-row" data-open-source="'+esc(r.id)+'"><b>'+esc(r.title)+'</b><small>'+esc(referenceGrade(r).label)+' · '+esc(r.source||r.type||'')+'</small></button>').join('')+'</div></section>';
 }).join('');
 show(filter==='comparison'?'Parallels & reported sources':'Sources & quotations',
  '<p class="gn-help">Eighteen existing evidence-graded source cards. Inline marks are attached only to attested Arabic spans; all other comparisons remain here, outside the running text.</p>'+
  (markup||'<p class="gn-help">No matches in the selected source category.</p>')+
  '<div class="gn-menu-footer">'+(filter?'<button data-open-study="references">All sources</button>':'<button data-open-study="parallels">Parallels & reports</button>')+
  '<button data-open-study="dictionary">Dictionary</button></div>');
}
function sourcePanel(id){
 const r=citationMap.get(id);if(!r)return;
 const grade=referenceGrade(r);
 const quote=r.quoteFrom?originalCitation(r):{arabic:r.arabic,english:r.english};
 const units=r.units||[];
 const localUrl=typeof r.sourceUrl==='string'&&/^https:\/\/[^\s"'<>]+$/i.test(r.sourceUrl)?r.sourceUrl:'';
 const linkText=r.type==='quran'?'Open exact Qurʾānic verse':r.type==='hadith'?'Open hadith source':
  r.quoteFrom?'Open the Tamhīd quotation witness':'Open cited external edition or comparison';
 const evidence='<div class="gn-evidence-label">'+esc(grade.label)+'</div><p class="gn-evidence-disclosure">'+esc(grade.explanation)+'</p>';
 const sourceText=quote.arabic?'<blockquote class="gn-source-ar" lang="ar" dir="rtl">'+esc(quote.arabic)+'</blockquote>':'';
 const english=quote.english?(r.englishRole==='editorial-summary'
  ?'<p class="gn-help"><strong>Editorial synopsis, not a complete translation:</strong> '+esc(quote.english)+'</p>'
  :'<blockquote>'+esc(quote.english)+'</blockquote>'):'';
 const caution=citationPolicy.records?.[id]==='unverified-attribution'
  ?'<p class="gn-help"><strong>Unverified attribution.</strong> Do not treat this as an authenticated Prophetic report.</p>':'';
 const external=localUrl?'<p><a href="'+esc(localUrl)+'" target="_blank" rel="noopener noreferrer">'+linkText+'</a></p>':'';
 const warnings=(r.note?'<p>'+esc(r.note)+'</p>':'')+(quote.warning?'<p>'+esc(quote.warning)+'</p>':'');
 const locs=units.map(id=>'<a data-study-goto="'+esc(id)+'" href="'+unitURL(id)+'">'+esc(id)+' · '+esc(byId.get(id)?.section||byId.get(id)?.title||'Open passage')+'</a>').join('');
 show(r.title,'<div class="gn-prose">'+evidence+sourceText+english+caution+warnings+external+'</div>'+
  '<h3 class="gn-subheading">Passages in this book</h3><div class="gn-locations">'+(locs||'<p>No passage anchor supplied.</p>')+'</div>'+
  '<button class="gn-source-return" data-study-close type="button">Return to reading</button>'+
  '<div class="gn-menu-footer"><button data-open-study="references">All sources</button>'+
  '<button data-open-study="parallels">Parallels & reports</button></div>');
}
async function pdfPanel(){
 show('PDF editions','<p class="gn-help">Reading, Study, and Reference have separate contents and notes. Opening a PDF on iPhone may use the browser preview.</p><p>Looking up the published editions…</p>');
 try{
  const r=await fetch('pdf/manifest.json',{cache:'no-store'});if(!r.ok)throw Error();
  const data=await r.json(),items=data.files||[];
  const names={reading:'Reading',study:'Study',reference:'Reference'};
  const arr=Array.isArray(items)?items:Object.entries(items).map(([filename,x])=>({filename,...x}));
  $('#gn-study-content').innerHTML='<div class="gn-pdf-list">'+['reading','study','reference'].map(gr=>'<section><h3>'+names[gr]+'</h3>'+arr.filter(x=>x.group===gr).map(x=>'<a class="gn-pdf-row" href="pdf/'+esc(x.filename)+'" target="_blank" rel="noopener"><b>'+esc(x.title)+'</b><small>'+esc(x.description||'')+' · '+(x.pages||'?')+' pages</small><span>'+studyIcon('pdf')+' Open PDF</span></a>').join('')+'</section>').join('')+'</div><p class="gn-help">The source Arabic is not fully vowelled; no unverified fully vowelled version is offered. Your private browser notes are not silently included in published PDFs.</p>';
 }catch{const x=$('#gn-study-content');if(x)x.innerHTML='<p class="gn-help">PDF editions are not yet available from the published site. You can read the complete Arabic and English in this browser.</p>';}
}
function clickDelegated(e){
 const el=e.target.closest('[data-study-close],[data-open-study],[data-open-term],[data-expand-term],[data-open-source],[data-study-goto]');if(!el)return;
 if(el.hasAttribute('data-study-close')){panelClose();return}
 if(el.dataset.openStudy){openPanel(el.dataset.openStudy);return}
 if(el.dataset.expandTerm){termPanel(el.dataset.expandTerm,true);return}
 if(el.dataset.openTerm){openPanel('term',el.dataset.openTerm);return}
 if(el.dataset.openSource){openPanel('source',el.dataset.openSource);return}
 if(el.dataset.studyGoto){const id=el.dataset.studyGoto;panelClose();if(id.startsWith('SH-INTRO')){window.location.href='commentary.html#'+id;return}const targetId=id.startsWith('SH-')?id:id;
  if(id.startsWith('SH-')&&document.querySelector('[data-layer-switch="sharh"][aria-checked="false"]'))document.querySelector('#layer-sharh')?.click();
  window.location.hash=targetId;document.getElementById(targetId)?.scrollIntoView({block:'start'});return}
}
function inputDelegated(e){
 if(e.target.id==='gn-dictionary-filter'){
 const q=norm(e.target.value);let shown=0;
 for(const group of document.querySelectorAll('.gn-term-group')){let any=false;for(const b of group.querySelectorAll('button')){const id=b.dataset.openTerm,t=termMap.get(id);const match=!q||norm(t.ar+' '+t.en+' '+t.aliases.join(' ')).includes(q);b.hidden=!match;if(match){shown++;any=true;}}group.hidden=!any;}
 const n=document.querySelector('#gn-dictionary-count');if(n)n.textContent=shown+' matched dictionary entries';
 }
 if(e.target.id==='gn-source-query'){
 const q=norm(e.target.value);
 $('#gn-search-results').innerHTML='<div class="gn-source-list">'+[...terms.filter(t=>norm(t.ar+' '+t.en).includes(q)).slice(0,20).map(t=>'<button data-open-term="'+esc(t.id)+'">'+esc(t.ar)+' · '+esc(t.en)+'</button>'),...references.filter(r=>norm(r.title+' '+r.source).includes(q)).slice(0,20).map(r=>'<button data-open-source="'+esc(r.id)+'">'+esc(r.title)+'</button>')].join('')+'</div>';
 }
 if(e.target.id==='gn-font-size'){window.GnammaQawaidReader?.setFont?.(e.target.value);document.documentElement.style.setProperty('--scale',e.target.value);}
 if(e.target.id==='gn-line-spacing')window.GnammaQawaidReader?.setLeading?.(e.target.value);
 if(e.target.id==='gn-reading-width')window.GnammaQawaidReader?.setWidth?.(e.target.value);
}
function changeDelegated(e){
 if(e.target.name==='gn-apparatus')setApparatus(e.target.value);
 if(e.target.name==='gn-theme'){window.GnammaQawaidReader?.setTheme?.(e.target.value);document.documentElement.dataset.theme=e.target.value;}
 if(e.target.id==='gn-arabic-font'||e.target.id==='gn-english-font'){
  localStoragePut('gnamma:qawaid:'+e.target.id,e.target.value);applyFontPrefs();
 }
}
function scheduleAnnotations(){if(inlineQueued)return;inlineQueued=true;requestAnimationFrame(()=>{inlineQueued=false;annotateReading()})}
function annotateReading(){
 const list=$('#reading-list');if(!list)return;
 for(const article of $$('.layered-unit',list)){
  if(article.dataset.gnStudyDone==='1')continue;article.dataset.gnStudyDone='1';
  const qt=article.id,linked=references.filter(r=>(r.units||[]).includes(qt));
  for(const c of $$('.sharh-layer',article))linked.push(...references.filter(r=>(r.units||[]).includes(c.id)));
  if(linked.length){
   const ribbon=document.createElement('div');ribbon.className='gn-citation-ribbon';ribbon.innerHTML='<span>Sources</span>'+[...new Map(linked.map(r=>[r.id,r])).values()].map(r=>'<button type="button" data-open-source="'+esc(r.id)+'">'+studyIcon('sources')+esc(r.title)+'</button>').join('');
   article.querySelector('.unit-heading')?.append(ribbon);
  }
  const text=norm(article.textContent).slice(0,30000);let matched=terms.filter(t=>text.includes(norm(t.ar))||t.aliases.some(x=>x.length>6&&text.includes(norm(x)))).slice(0,9);
  if(matched.length){const bar=document.createElement('div');bar.className='gn-term-ribbon';bar.innerHTML='<span>Terms</span>'+matched.map(t=>'<button type="button" data-open-term="'+esc(t.id)+'">'+esc(t.en)+'</button>').join('');article.querySelector('.unit-heading')?.append(bar);}
  const ar=article.querySelector('.matn-layer .ar p')||article.querySelector('.sharh-layer .ar p');
  if(ar)annotateParagraph(ar,matched.filter(t=>t.ar.length>3).slice(0,3));
 }
}
function annotateParagraph(paragraph,matched){
 if(paragraph.dataset.gnLinked)return;paragraph.dataset.gnLinked='1';
 const node=[...paragraph.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
 if(!node)return;
 let txt=node.textContent,segment=[],cursor=0,links=0;
 for(const t of matched){
  const ix=txt.indexOf(t.ar);if(ix<cursor||ix<0)continue;
  segment.push(document.createTextNode(txt.slice(cursor,ix)));
  const button=document.createElement('button');button.type='button';button.className='gn-term-inline';button.dataset.openTerm=t.id;button.textContent=txt.slice(ix,ix+t.ar.length);button.title=t.en;
  segment.push(button);cursor=ix+t.ar.length;links++;
 }
 if(links){segment.push(document.createTextNode(txt.slice(cursor)));node.replaceWith(...segment);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();