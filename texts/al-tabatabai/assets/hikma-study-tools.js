/* Shared study tools: reviewed connections, sense-based dictionary, private desk.
   Published strings are escaped; quote emphasis uses the shared safe renderer. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  let api, index, activeUnit, activeParagraph, copyTarget, lastOpener, initialized = false;
  const bookNames = {M:'Muẓaffar · al-Manṭiq', B:'Bidāyat al-Ḥikma', N:'Nihāyat al-Ḥikma'};
  const shortNames = {M:'Muẓaffar', B:'Bidāya', N:'Nihāya'};
  const relationNames = {development:'Develop this argument', orientation:'Review the introductory account', foundation:'Philosophical foundation', qualification:'Compare the qualification', 'logical-tool':'Logical distinction used here', parallel:'Compare the discussion'};
  const make = (tag, cls, text) => {const n=document.createElement(tag); if(cls)n.className=cls; if(text!=null)n.textContent=String(text); return n;};
  const button = (label, fn, cls='study-button') => { const n=make('button',cls,label); n.type='button'; if(fn)n.addEventListener('click',fn); return n; };
  function field(label, control) {const box=make('label','study-field');box.append(make('span','',label),control);return box;}
  function select(id, choices, value, fn) {const node=make('select');node.id=id;for(const [v,t] of choices){const o=make('option','',t);o.value=v;node.append(o);}node.value=value;if(fn)node.addEventListener('change',()=>fn(node.value));return node;}
  function closeDialogs(){for(const d of document.querySelectorAll('dialog[open]'))d.close();}
  function open(dialog, opener){api.closeSidebar(false);closeDialogs();lastOpener=opener||document.activeElement;dialog._opener=lastOpener;dialog.showModal();}
  function dialog(id,title,intro){
    const d=make('dialog','reader-dialog study-dialog');d.id=id;d.setAttribute('aria-labelledby',id+'-title');
    const head=make('header','dialog-heading');head.append(make('h2','',title));head.firstChild.id=id+'-title';
    const close=button('×',()=>d.close(),'icon-button');close.setAttribute('aria-label','Close '+title);head.append(close);d.append(head);
    if(intro)d.append(make('p','dialog-intro',intro));
    d.addEventListener('close',()=>{if(d._opener?.isConnected)d._opener.focus();});
    d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
    document.body.append(d);return d;
  }
  function unitInfo(id){return index?.units?.[id]||api.state.byUnit.get(id)||{id,title:id};}
  function cleanTitle(t){return String(t||'').replace(/^Chapter (?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|\d+):\s*/,'');}
  function label(id){const u=unitInfo(id);return shortNames[id[0]]+' · '+id.replace(/^[MBN]-/,'').replace(/-0(?=\d)/g,'-')+' · '+cleanTitle(u.title);}
  function canonical(id){return new URL(api.sharedBase,location.href).href.split('#')[0]+'#'+encodeURIComponent(id.startsWith('para-')||id.startsWith('passage-')?id:'passage-'+id);}
  function current(){
    const visible=[...document.querySelectorAll('.passage')];
    const line=($('reading-toolbar')?.getBoundingClientRect().bottom||110)+60;
    let chosen=visible[0];for(const node of visible){if(node.getBoundingClientRect().top<=line)chosen=node;else break;}
    return chosen?.dataset.unit||api.currentUnit()?.id;
  }
  function currentParagraphId(){
    const node=document.getElementById('passage-'+current());if(!node)return null;
    const ps=[...node.querySelectorAll('[data-paragraph]')].filter(p=>p.getClientRects().length);
    const line=($('reading-toolbar')?.getBoundingClientRect().bottom||110)+60;
    let chosen=ps[0];for(const p of ps){if(p.getBoundingClientRect().top<=line)chosen=p;}
    return chosen?.id||null;
  }
  function go(destination, remember=true){
    const id=typeof destination==='string'?destination:(destination.paragraph||'passage-'+destination.unit);
    const targetUnit=typeof destination==='object'?destination.unit:index?.paragraphLookup?.[id]?.unit||id.replace(/^passage-/,'');
    const from=currentParagraphId()||'passage-'+current();
    if(remember&&from!==id){
      try{sessionStorage.setItem('gnamma-hikma:return',JSON.stringify({url:location.href.split('#')[0]+'#'+from,label:label(current())}));}catch(_){}
    }
    closeDialogs();
    if(/-en-\d+$/.test(id)&&api.state.preferences.language==='arabic')api.setPreferences({language:'bilingual'});
    if(/-ar-\d+$/.test(id)&&api.state.preferences.language==='english')api.setPreferences({language:'bilingual'});
    if(api.navigateId(id)){
      updateDock();updateReturn();
      requestAnimationFrame(()=>{const n=$(id);if(n){n.classList.remove('linked-target');void n.offsetWidth;n.classList.add('linked-target');}});
    }else if(targetUnit&&index?.units?.[targetUnit])location.href=canonical(id);
  }
  function passageLink(destination, title){const a=make('a','study-passage-link',title||label(destination.unit));a.href=canonical(destination.paragraph||destination.unit);a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();go(destination);});return a;}
  function updateReturn(){
    const bar=$('study-return');if(!bar)return;bar.replaceChildren();let prior;
    try{prior=JSON.parse(sessionStorage.getItem('gnamma-hikma:return'));}catch(_){}
    if(!prior?.url){bar.hidden=true;return;}
    try{const u=new URL(prior.url);if(u.origin!==location.origin||!u.pathname.includes('/texts/al-tabatabai/')){bar.hidden=true;return;}}catch(_){bar.hidden=true;return;}
    bar.hidden=false;const back=make('a','', '← Return to '+prior.label);back.href=prior.url;
    back.addEventListener('click',e=>{const u=new URL(prior.url);if(u.pathname===location.pathname){e.preventDefault();go(decodeURIComponent(u.hash.slice(1)),false);try{sessionStorage.removeItem('gnamma-hikma:return');}catch(_){}bar.hidden=true;}});
    const dismiss=button('×',()=>{try{sessionStorage.removeItem('gnamma-hikma:return');}catch(_){}bar.hidden=true;},'icon-button');dismiss.setAttribute('aria-label','Dismiss return link');bar.append(back,dismiss);
  }
  function buildMenus(){
    const header=document.querySelector('.header-actions');
    const settings=button('Display',()=>open($('study-display'),settings),'text-button');settings.id='study-display-open';
    const tools=button('Tools',()=>open($('study-menu'),tools),'text-button');tools.id='study-menu-open';tools.setAttribute('aria-haspopup','dialog');
    header.append(settings,tools);
    const direct=make('a','text-button','Editions');direct.id='study-editions-open';direct.href=api.sharedBase+'editions/';direct.addEventListener('click',()=>rememberEditionReturn());header.insertBefore(direct,$('pdf-print')||settings);
    $('theme-toggle').hidden=true;
    const nav=make('nav','study-nav');nav.setAttribute('aria-label','Reading and reference tools');
    nav.append(button('Contents',e=>showContents(e.currentTarget)),button('Subject index',e=>showIndex(e.currentTarget)),button('Dictionary',e=>showDictionary('',e.currentTarget)),button('Reading Desk',e=>showDesk(e.currentTarget)));
    $('contents-panel').insertBefore(nav,document.querySelector('.search-box'));
    const menu=dialog('study-menu','Reading tools','Your text, references and private study materials.');
    const grid=make('nav','study-menu-grid');grid.setAttribute('aria-label','Reader tools');
    grid.append(button('Read / resume',()=>{closeDialogs();api.navigateId('passage-'+current());}),button('Contents',e=>showContents(e.currentTarget)),button('Reading Desk',e=>showDesk(e.currentTarget)),button('Subject index',e=>showIndex(e.currentTarget)),button('Dictionary · معجم',e=>showDictionary('',e.currentTarget)),button('Display',e=>open($('study-display'),e.currentTarget)));
    const editions=make('a','study-button','Editions & downloads');editions.href=api.sharedBase+'editions/';editions.addEventListener('click',rememberEditionReturn);grid.append(editions,button('Print / PDF',()=>{closeDialogs();$('pdf-print').click();}));
    grid.append(button('Edition details & sources',()=>{closeDialogs();$('sources-open').click();}),button('Help & guide',e=>open($('study-help'),e.currentTarget)));
    menu.append(grid);
    const help=dialog('study-help','Reader guide');
    for(const [h,t] of [
      ['Read in the way you need','Continuous follows one complete available book. Section shows one reading division at a time. Focus uses that same division with a wider, quieter reading surface. Arabic and English can be shown separately or together; on phones they form one column.'],
      ['Headings and divisions','Book structure follows the recorded divisions of the Arabic work. Editorial titles are navigation aids. Muẓaffar reading sections are not numbered authorial chapters, and its six-book map includes material not yet translated.'],
      ['Across the books','Connections explain a shared argument, a development, a prerequisite or a qualification. They are editorial references, not claims that one author cited the other. Return links bring you back to your previous passage.'],
      ['Dictionary and subject index','Reviewed discussions are separated from recorded glossary references and automatic word matches. Each entry reports all three books, including books with no indexed occurrence in the currently published text. A word match alone does not establish the same philosophical sense.'],
      ['Your Reading Desk','Bookmarks and notes are shared across the combined and individual readers on this device. Export a backup to keep a copy or import it on another device. Private notes are included in a copied passage only when you select that option.'],
      ['Precise links and keyboard use','Each paragraph has an action button for copying text or a stable link. Press / to search. Escape closes an open panel. Previous and next work from the bottom reading bar; arrow keys also work in section and focus views.'],
      ['Printed editions','Editions & downloads contains all nine A4 files. Reading prioritises English, Study includes Arabic and English, and Reference prioritises Arabic. Print / PDF creates a customised file from the current reader selection.']
    ])help.append(make('h3','',h),make('p','',t));
    const returnBar=make('div','study-return');returnBar.id='study-return';returnBar.hidden=true;$('reading-content').before(returnBar);
  }
  function rememberEditionReturn(){try{sessionStorage.setItem('gnamma-hikma:edition-return',location.href.split('#')[0]+'#'+(currentParagraphId()||'passage-'+current()));}catch(_){}}
  function buildDisplay(){
    const d=dialog('study-display','Display','Preferences are shared across the three books and remembered on this device.');
    const p=api.state.preferences, grid=make('div','study-settings-grid');
    function pref(k,v,redraw=false){const at=currentParagraphId()||'passage-'+current();api.setPreferences({[k]:v},redraw);if(redraw)api.navigateId(at,false);}
    grid.append(field('Appearance',select('study-theme',[['system','System'],['light','Light'],['dark','Dark']],p.theme,v=>pref('theme',v))));
    grid.append(field('Palette',select('study-palette',[['plaster','Almohad plaster'],['cordoba','Córdoba arches'],['nasrid','Nasrid mineral'],['zellij','Zellij green'],['landscape','Gnamma landscape'],['open-landscape','Gnamma · open landscape']],p.palette,v=>pref('palette',v))));
    grid.append(field('Page style',select('study-page-style',[['quiet','Quiet reading'],['book','Book page'],['structured','Structured page']],p.pageStyle,v=>pref('pageStyle',v))));
    grid.append(field('Headings',select('study-headings',[['both','Original and editorial'],['original','Original headings'],['editorial','Editorial titles']],p.headings,v=>pref('headings',v))));
    grid.append(field('Arabic font',select('study-arabic-font',[['amiri','Amiri'],['scheherazade','Scheherazade New'],['naskh','Noto Naskh Arabic']],p.arabicFont,v=>pref('arabicFont',v))));
    grid.append(field('English font',select('study-english-font',[['original','Original serif'],['source-sans','Source Sans 3'],['lexend','Lexend']],p.englishFont,v=>pref('englishFont',v))));
    grid.append(field('Language order',select('study-order',[['arabic-first','Arabic first'],['english-first','English first']],p.order,v=>pref('order',v))));
    const vowels=make('input');vowels.type='checkbox';vowels.id='study-vowels';vowels.checked=p.vowels;vowels.addEventListener('change',()=>pref('vowels',vowels.checked,true));grid.append(field('Show Arabic vowel marks',vowels));
    const size=make('input');size.id='study-text-size';size.type='range';size.min='16';size.max='26';size.step='1';size.value=p.size;size.addEventListener('input',()=>{pref('size',Number(size.value));$('study-size-value').textContent=size.value+' px';});const sizeField=field('Text size',size);const out=make('output','',p.size+' px');out.id='study-size-value';out.htmlFor=size.id;sizeField.append(out);grid.append(sizeField);
    d.append(grid,make('p','dialog-intro','Arabic vowel settings affect prose. Complement marks over logical term letters are preserved because they change the meaning of a formula.'));
    const view=$('reading-view');view.querySelector('option[value="focus"]').textContent='Section';const quiet=make('option','','Focus');quiet.value='quiet';view.append(quiet);view.value=p.view;
    document.addEventListener('hikma:preferences',()=>{for(const [id,k] of [['study-theme','theme'],['study-order','order'],['study-headings','headings'],['study-text-size','size']])if($(id))$(id).value=api.state.preferences[k];});
  }
  function buildContents(){
    const d=dialog('study-contents','Contents','Choose the recorded book structure or the detailed editorial reading titles.');
    const controls=make('div','study-filter-row');controls.append(field('Contents view',select('study-contents-mode',[['original','Book structure'],['editorial','Editorial section titles']],'original',renderContents)),field('Book',select('study-contents-book',[['all','All three books'],['M',bookNames.M],['B',bookNames.B],['N',bookNames.N]],'all',renderContents)));
    const filter=make('input');filter.type='search';filter.id='study-contents-filter';filter.placeholder='Find a heading';filter.setAttribute('aria-label','Filter contents');filter.addEventListener('input',renderContents);d.append(controls,filter,make('div','study-contents-list'));d.lastChild.id='study-contents-list';
  }
  function showContents(opener){$('study-contents-book').value=current()?.[0]||'all';renderContents();open($('study-contents'),opener);}
  function renderContents(){
    const list=$('study-contents-list');list.replaceChildren();const mode=$('study-contents-mode').value,book=$('study-contents-book').value,q=api.normalise($('study-contents-filter').value);
    for(const code of ['M','B','N']){
      if(book!=='all'&&book!==code)continue;
      const bookBox=make('section','study-contents-book');bookBox.append(make('h3','',bookNames[code]));
      if(mode==='original'&&code==='M'&&index?.authorialMap){
        bookBox.append(make('p','dialog-intro','Six original books. The translated reading sections below are editorial subdivisions; the source map also records material not yet available here.'));
        for(const part of index.authorialMap.parts){
          const units=Object.values(index.units).filter(u=>u.id[0]==='M'&&u.authorialBook===part.book);const found=!q||api.normalise(part.title+' '+part.arabic+' '+(part.topics||[]).map(t=>t.english+' '+t.arabic).join(' ')).includes(q);if(!found)continue;
          const box=make('details','study-contents-part');box.append(make('summary','',(part.book?'Book '+part.book+' · ':'')+part.title));
          const ar=make('p','source-heading',part.arabic);ar.lang='ar';ar.dir='rtl';box.append(ar,make('p','dialog-intro',units.length?units.length+' available reading sections':'Translation not yet available in this reader'));
          if(units.length)box.append(passageLink({unit:units[0].id},'Read the available text'));
          const topics=make('ul');for(const t of part.topics||[]){const li=make('li');li.append(make('span','',t.english+' · '),make('span','source-heading',t.arabic));topics.append(li);}box.append(topics);bookBox.append(box);
        }
        const full=make('a','study-passage-link','Full source map and coverage');full.href=api.sharedBase+'muzaffar-al-mantiq/contents.html';bookBox.append(full);
      }else{
        let lastStage,stage;
        for(const u of Object.values(index?.units||{})){
          if(u.id[0]!==code||q&&!api.normalise(u.title+' '+u.arabicTitle).includes(q))continue;
          if(u.stage!==lastStage){stage=make('details','study-contents-part');stage.open=!!q;stage.append(make('summary','',u.stageTitle||u.stage));bookBox.append(stage);lastStage=u.stage;}
          const row=make('div','study-contents-row');
          row.append(passageLink({unit:u.id},(mode==='original'?(/^\d+$/.test(String(u.chapter||''))?'Chapter '+u.chapter:u.id.endsWith('-PRE')?'Stage preface':'Introduction')+' · ':'')+cleanTitle(u.title)));
          if(mode==='original'&&u.arabicTitle){const ar=make('p','source-heading',u.arabicTitle);ar.lang='ar';ar.dir='rtl';row.append(ar);}
          stage.append(row);
        }
      }
      list.append(bookBox);
    }
  }
  function buildDictionary(){
    // Replace the first-match glossary with one shared, explicit index.
    const old=$('glossary-open');old.childNodes.forEach(n=>{if(n.nodeType===3)n.textContent='';});old.append(document.createTextNode('Dictionary'));
    old.setAttribute('aria-label','Dictionary across all three books');
    old.addEventListener('click',e=>{e.stopImmediatePropagation();showDictionary(window.getSelection()?.toString().trim()||'',old);},true);
    const d=dialog('study-dictionary','Dictionary · معجم','Definitions, reviewed discussions and word occurrences across Muẓaffar, Bidāya and Nihāya.');
    const search=make('input');search.type='search';search.id='study-dictionary-search';search.placeholder='Arabic, English or transliteration';search.setAttribute('aria-label','Search dictionary');search.addEventListener('input',renderDictionary);
    const list=make('div','study-dictionary-list');list.id='study-dictionary-list';const status=make('p','dialog-intro');status.id='study-dictionary-status';status.setAttribute('role','status');d.append(search,status,list);
  }
  function showDictionary(query='',opener){$('study-dictionary-search').value=query;renderDictionary();open($('study-dictionary'),opener);$('study-dictionary-search').focus();}
  function renderDictionary(){
    const list=$('study-dictionary-list');list.replaceChildren();
    const q=api.normalise($('study-dictionary-search').value).trim();
    const terms=(index?.terms||[]).filter(t=>!q||api.normalise([t.label,t.arabic,t.transliteration,...t.aliases,t.definition].join(' ')).includes(q)).sort((a,b)=>Number(api.normalise(b.label)===q)-Number(api.normalise(a.label)===q)||a.label.localeCompare(b.label));
    $('study-dictionary-status').textContent=terms.length+' '+(terms.length===1?'entry':'entries')+(q?' matching this search':' · choose an entry to see all three books');
    if(!index){list.append(make('p','','The shared dictionary could not load. Reload the page to try again.'));return;}
    for(const term of terms){
      const details=make('details','dictionary-sense');details.dataset.term=term.id;details.open=terms.length<=2||api.normalise(term.label)===q;
      const sum=make('summary');sum.append(make('span','',term.label));const ar=make('span','dictionary-arabic',term.arabic);ar.lang='ar';ar.dir='rtl';sum.append(ar);details.append(sum);
      const body=make('div','dictionary-sense-body');details.append(body);
      const fill=()=>{if(body.childNodes.length)return;renderSense(term,body);};details.addEventListener('toggle',()=>{if(details.open)fill();});if(details.open)fill();list.append(details);
    }
  }
  async function renderSense(term,body){
    if (!term.occurrences && !term.occurrenceLoadFailed) {
      body.append(make('p','dialog-intro','Loading the locations for this entry…'));
      try {
        const response = await fetch(api.sharedBase+'data/occurrences/'+encodeURIComponent(term.id)+'.json');
        if (!response.ok) throw Error('Locations unavailable');
        term.occurrences = await response.json();
      } catch (_) { term.occurrenceLoadFailed = true; }
      body.replaceChildren();
    }
    if (term.occurrenceLoadFailed) body.append(make('p','sense-caution','Word locations could not be loaded. The reviewed discussions remain available; reload the reader to retry.'));

    body.append(make('p','glossary-romanization',term.transliteration),make('p','',term.definition));
    if(term.scopeNote)body.append(make('p','sense-caution',term.scopeNote));
    if(term.bookDefinitions?.length>1){const defs=make('details','study-small-details');defs.append(make('summary','','Definitions in the reading editions'));for(const def of term.bookDefinitions)defs.append(make('p','',shortNames[def.book]+': '+def.definition));body.append(defs);}
    for(const book of ['M','B','N']){
      const section=make('section','dictionary-book');section.dataset.book=book;section.append(make('h4','',bookNames[book]));
      const discussions=(term.discussions||[]).filter(d=>d.unit[0]===book);
      const recorded=(term.recordedReferences||[]).filter(d=>d.unit[0]===book&&!discussions.some(x=>x.unit===d.unit));
      if(discussions.length){section.append(make('p','occurrence-kind','Reviewed discussions'));for(const item of discussions){const box=make('div','dictionary-hit');box.append(passageLink(item),make('p','',item.note||item.role||'Discussion'));if(item.quote){const quote=make('blockquote');quote.innerHTML=HikmaRichText.inline(item.quote);box.append(quote);}section.append(box);}}
      if(recorded.length){const refs=make('details','study-small-details');refs.append(make('summary','',recorded.length+' recorded glossary '+(recorded.length===1?'reference':'references')));refs.append(make('p','dialog-intro','Preserved from the edition’s glossary; these are separate from newly reviewed cross-text connections.'));for(const r of recorded)refs.append(passageLink(r));section.append(refs);}
      const hits=(term.occurrences||[]).filter(o=>o.unit[0]===book);
      if(hits.length){const lex=make('details','study-small-details lexical-occurrences');lex.append(make('summary','',hits.length+' word '+(hits.length===1?'occurrence':'occurrences')+' · inspect context'));lex.append(make('p','dialog-intro','Automatic phrase matches in the current text. A match may be an example, an incidental mention or another sense; it does not create a philosophical connection.'));
        const hitList=make('div');let shown=0;const more=button('Show more occurrences',()=>add());function add(){for(const hit of hits.slice(shown,shown+20)){const row=make('div','dictionary-hit');row.append(passageLink(hit),make('p',hit.language==='arabic'?'occurrence-arabic':'',hit.snippet));if(hit.language==='arabic'){row.lastChild.lang='ar';row.lastChild.dir='rtl';}hitList.append(row);}shown+=20;more.hidden=shown>=hits.length;}lex.append(hitList,more);lex.addEventListener('toggle',()=>{if(lex.open&&shown===0)add();});section.append(lex);}
      if(!discussions.length&&!recorded.length&&!hits.length&&!term.occurrenceLoadFailed)section.append(make('p','dialog-intro','No indexed occurrence in the currently published '+(book==='M'?'Muẓaffar selections':'text')+'.'));
      body.append(section);
    }
  }
  function buildIndex(){const d=dialog('study-index','Subject index','Find discussions by subject. The dictionary keeps lexical occurrences separate from these conceptual routes.');const search=make('input');search.id='study-index-search';search.type='search';search.placeholder='Find a subject';search.setAttribute('aria-label','Filter subject index');search.addEventListener('input',renderIndex);d.append(search,make('div','study-index-list'));d.lastChild.id='study-index-list';}
  function showIndex(opener){renderIndex();open($('study-index'),opener);}
  function renderIndex(){const list=$('study-index-list');list.replaceChildren();const q=api.normalise($('study-index-search').value);const categories=[...new Set((index?.terms||[]).map(t=>t.category||'Other concepts'))];for(const category of categories){const terms=index.terms.filter(t=>(t.category||'Other concepts')===category&&(!q||api.normalise(t.label+' '+t.arabic+' '+t.aliases.join(' ')).includes(q)));if(!terms.length)continue;const sec=make('section');sec.append(make('h3','',category));for(const term of terms){const row=make('div','subject-row');const jump=button(term.label,e=>showDictionary(term.label,e.currentTarget));const books=['M','B','N'].map(b=>{const reviewed=(term.discussions||[]).filter(d=>d.unit[0]===b).length,recorded=(term.recordedReferences||[]).filter(d=>d.unit[0]===b).length,words=term.occurrenceCounts?.[b]||0;return shortNames[b]+': '+[reviewed?reviewed+' reviewed':null,recorded?recorded+' glossary refs':null,words?words+' word matches':null].filter(Boolean).join(', ')+(reviewed||recorded||words?'':'none indexed');});row.append(jump,make('span','',books.join(' · ')));sec.append(row);}list.append(sec);}}
  function attachPassages(){
    if(!index)return;
    for(const node of document.querySelectorAll('.passage')){
      const id=node.dataset.unit;const unit=api.state.byUnit.get(id);if(!unit)continue;
      const head=node.closest('.chapter-section')?.querySelector('.chapter-heading');
      if(head&&!head.querySelector('.heading-provenance')){const label=make('span','heading-provenance',id[0]==='M'?'Editorial reading section':'Recorded chapter · editorial reading title');head.querySelector('.chapter-heading-text')?.prepend(label);if(id[0]!=='M'){const sourceTitle=make('h3','recorded-heading-en',cleanTitle(unit.title));head.querySelector('.chapter-heading-text')?.append(sourceTitle);}}
      for(const p of node.querySelectorAll('[data-paragraph]'))if(!p.querySelector('.paragraph-action')){
        const action=button('¶',e=>showCopy({unit:id,paragraph:p.id},e.currentTarget),'paragraph-action');action.setAttribute('aria-label','Copy or link to this '+(p.closest('[lang="ar"]')?'Arabic':'English')+' paragraph');p.append(action);
      }
      if(node.querySelector('.study-context'))continue;
      const connections=(index.links||[]).filter(l=>l.from.unit===id);const terms=index.terms.filter(t=>(t.discussions||[]).some(d=>d.unit===id));
      if(!connections.length&&!terms.length)continue;
      const context=make('aside','study-context');context.setAttribute('aria-label','Editorial study connections');
      if(connections.length){const details=make('details','cross-text-links');details.append(make('summary','', 'Across the books · '+connections.length));details.append(make('p','dialog-intro','Editorial connections: each link gives a reason to read the other passage.'));
        for(const link of connections){const row=make('article','cross-text-link');row.dataset.link=link.id;row.append(make('span','relation-label',relationNames[link.type]||'Related discussion'),passageLink(link.to),make('p','',link.rationale));if(link.caution)row.append(make('p','sense-caution',link.caution));details.append(row);}context.append(details);
      }
      if(terms.length){const keywords=make('div','passage-concepts');keywords.append(make('span','','Concepts: '));for(const term of terms)keywords.append(button(term.label,e=>showDictionary(term.label,e.currentTarget),'concept-button'));context.append(keywords);}
      node.append(context);
    }
    for(const scroll of document.querySelectorAll('.hikma-table-scroll'))if(!scroll.previousElementSibling?.classList.contains('table-scroll-hint')){
      const caption=scroll.querySelector('caption');const hint=make('p','table-scroll-hint',(caption?.textContent||'Table')+' · Scroll horizontally if needed');scroll.before(hint);if(caption)caption.classList.add('sr-only');
    }
    updateHeadingMode();updateDock();
  }
  function updateHeadingMode(){
    for(const anchor of document.querySelectorAll('#toc a[data-group]')){
      const group=api.state.groups.find(g=>g.key===anchor.dataset.group);const title=anchor.querySelector('.toc-chapter-title');if(!group||!title)continue;
      title.textContent=api.state.preferences.headings==='original'?(group.arabicTitle||group.title):cleanTitle(group.title);title.dir=api.state.preferences.headings==='original'?'auto':'ltr';
    }
  }
  function buildDock(){
    const dock=make('nav','study-dock');dock.id='study-dock';dock.setAttribute('aria-label','Adjacent passages and study actions');
    const prev=button('←',()=>adjacent(-1));prev.id='study-prev';prev.setAttribute('aria-label','Previous reading section');
    const location=button('Contents',e=>showContents(e.currentTarget),'study-dock-location');location.id='study-dock-location';
    const save=button('Save',()=>api.toggleBookmark(current()));save.id='study-save';save.setAttribute('aria-pressed','false');
    const note=button('Note',e=>api.openNote(current(),e.currentTarget));note.id='study-note';
    const copy=button('Copy / link',e=>showCopy({unit:current()},e.currentTarget));copy.id='study-copy';
    const next=button('→',()=>adjacent(1));next.id='study-next';next.setAttribute('aria-label','Next reading section');
    dock.append(prev,location,save,note,copy,next);document.body.append(dock);
    let timer=0;window.addEventListener('scroll',()=>{if(timer)return;timer=requestAnimationFrame(()=>{timer=0;updateDock();});},{passive:true});
  }
  function adjacent(delta){const id=current(),units=api.state.units,at=units.findIndex(u=>u.id===id),next=units[at+delta];if(next)go({unit:next.id},false);}
  function updateDock(){if(!$('study-dock'))return;const id=current();if(!id)return;activeUnit=id;const u=unitInfo(id),position=api.state.units.findIndex(u=>u.id===id);$('study-dock-location').textContent=shortNames[id[0]]+' · '+cleanTitle(u.title);$('study-dock-location').setAttribute('aria-label','Current reading section: '+label(id)+'. Open contents.');$('study-prev').disabled=position<=0;$('study-next').disabled=position>=api.state.units.length-1;$('study-save').setAttribute('aria-pressed',String(api.state.bookmarks.has(id)));$('study-save').textContent=api.state.bookmarks.has(id)?'Saved':'Save';$('study-note').classList.toggle('has-note',!!api.state.notes[id]);}
  function buildCopy(){
    const d=dialog('study-copy-dialog','Copy and link','Copy the passage or a precise link. Personal notes stay private unless you include them.');const where=make('p','dialog-intro');where.id='study-copy-location';
    const controls=make('div','study-settings-grid');
    controls.append(field('Scope',select('study-copy-scope',[['section','Complete reading section'],['paragraph','Selected paragraph'],['selection','Selected text']],'section',renderCopy)),field('Language',select('study-copy-language',[['bilingual','Arabic and English'],['english','English'],['arabic','Arabic']],'bilingual',renderCopy)));
    for(const [id,title,checked] of [['study-copy-citation','Include citation',true],['study-copy-notes','Include my personal note',false]]){const input=make('input');input.type='checkbox';input.id=id;input.checked=checked;input.addEventListener('change',renderCopy);controls.append(field(title,input));}
    const preview=make('textarea');preview.id='study-copy-preview';preview.readOnly=true;preview.rows=8;preview.setAttribute('aria-label','Copy preview');
    const actions=make('div','study-actions');actions.append(button('Copy text',()=>copyText(preview.value)),button('Copy stable link',()=>copyText(canonical($('study-copy-scope').value==='paragraph'?copyTarget.paragraph:copyTarget.unit))));d.append(where,controls,preview,actions);
    // An explicitly chosen paragraph can sit below the reader's tracking line.
    // Restore that anchor after focus returns from the modal, so subsequent
    // Focus/Next actions operate on the copied section rather than its predecessor.
    d.addEventListener('close',()=>{if(copyTarget?.paragraph)api.navigateId(copyTarget.paragraph,false);});
  }
  function showCopy(target,opener){copyTarget={...target,selection:window.getSelection()?.toString().trim()||''};$('study-copy-scope').value=target.paragraph?'paragraph':'section';$('study-copy-scope').querySelector('[value="paragraph"]').disabled=!target.paragraph;$('study-copy-scope').querySelector('[value="selection"]').disabled=!copyTarget.selection;$('study-copy-language').value=target.paragraph?.includes('-ar-')?'arabic':target.paragraph?'english':api.state.preferences.language;renderCopy();open($('study-copy-dialog'),opener);}
  function plainParagraph(id){const p=$(id);if(!p)return '';const c=p.cloneNode(true);c.querySelectorAll('button,.footnote-references').forEach(n=>n.remove());return c.textContent.trim();}
  function renderCopy(){if(!copyTarget)return;const unit=api.state.byUnit.get(copyTarget.unit);if(!unit)return;const scope=$('study-copy-scope').value,lang=$('study-copy-language').value;let content;
    if(scope==='selection')content=copyTarget.selection;
    else if(scope==='paragraph')content=plainParagraph(copyTarget.paragraph);
    else content=(lang==='bilingual'?['arabic','english']:[lang]).map(l=>l==='arabic'&&!api.state.preferences.vowels?HikmaRichText.stripVowels(unit[l]):unit[l]).join('\n\n');
    if($('study-copy-notes').checked&&api.state.notes[unit.id])content+='\n\nPersonal note:\n'+api.state.notes[unit.id];
    if($('study-copy-citation').checked)content+='\n\n'+label(unit.id)+'\n'+canonical(scope==='paragraph'?copyTarget.paragraph:unit.id);
    $('study-copy-location').textContent=label(unit.id)+(scope==='paragraph'?' · '+copyTarget.paragraph:'');$('study-copy-preview').value=content;
    $('study-copy-language').disabled=scope!=='section';
  }
  async function copyText(value){try{await navigator.clipboard.writeText(value);api.notify('Copied.');}catch(_){const area=$('study-copy-preview');area.value=value;area.select();api.notify('Select and copy the text shown here.');}}
  function buildDesk(){
    const d=dialog('study-desk','Reading Desk','Your bookmarks and notes are stored on this device and shared by the combined and individual readers.');const actions=make('div','study-actions');
    const upload=make('input');upload.type='file';upload.accept='.json,application/json';upload.id='study-desk-import';upload.hidden=true;upload.addEventListener('change',importDesk);
    actions.append(button('Export backup',exportDesk),button('Import backup',()=>upload.click()));const list=make('div');list.id='study-desk-list';d.append(actions,upload,list);
  }
  function showDesk(opener){renderDesk();open($('study-desk'),opener);}
  function renderDesk(){const list=$('study-desk-list');list.replaceChildren();const ids=[...new Set([...api.state.bookmarks,...Object.keys(api.state.notes)])].filter(id=>index?.units?.[id]);
    for(const book of ['M','B','N']){const found=ids.filter(id=>id[0]===book);if(!found.length)continue;const sec=make('section');sec.append(make('h3','',bookNames[book]));for(const id of found){const row=make('article','desk-entry');row.append(passageLink({unit:id}));if(api.state.bookmarks.has(id))row.append(make('span','relation-label','Bookmarked'));if(api.state.notes[id])row.append(make('p','desk-note',api.state.notes[id]));if(api.state.byUnit.has(id))row.append(button(api.state.notes[id]?'Edit note':'Add note',e=>{closeDialogs();api.openNote(id,e.currentTarget);}));sec.append(row);}list.append(sec);}
    if(!ids.length)list.append(make('p','','Save a passage or add a note from the reading bar.'));
    const conflicts=api.readStorage('gnamma-hikma:desk:migration-conflicts',[]);if(conflicts.length){const box=make('details');box.append(make('summary','','Preserved earlier note versions · '+conflicts.length));for(const c of conflicts)box.append(make('h4','',label(c.id)),make('p','desk-note',c.text));list.append(box);}
  }
  function exportDesk(){const data={schema:'gnamma-hikma-desk-1',exported:new Date().toISOString(),bookmarks:[...api.state.bookmarks],notes:api.state.notes,preferences:api.state.preferences,earlierNotes:api.readStorage('gnamma-hikma:desk:migration-conflicts',[])};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=make('a');a.href=url;a.download='hikma-reading-desk.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  async function importDesk(){const file=$('study-desk-import').files[0];if(!file)return;try{if(file.size>5000000)throw Error('The backup is too large.');const data=JSON.parse(await file.text());if(data.schema!=='gnamma-hikma-desk-1'||!Array.isArray(data.bookmarks)||!data.notes||typeof data.notes!=='object')throw Error('This is not a Reading Desk backup.');const earlier=api.readStorage('gnamma-hikma:desk:migration-conflicts',[]);for(const id of data.bookmarks)if(typeof id==='string'&&index.units[id])api.state.bookmarks.add(id);for(const [id,value] of Object.entries(data.notes)){if(!index.units[id]||typeof value!=='string'||value.length>200000)continue;if(api.state.notes[id]&&api.state.notes[id]!==value)earlier.push({id,text:value,source:'Imported backup'});else api.state.notes[id]=value;}api.writeStorage('gnamma-hikma:desk:migration-conflicts',earlier);api.saveDesk();renderDesk();api.notify('Backup imported. Differing note versions are preserved below.');}catch(e){api.notify(e.message||'The backup could not be read.');}finally{$('study-desk-import').value='';}}
  function init(){if(initialized||!window.HikmaReader?.state.book)return;initialized=true;api=window.HikmaReader;index=api.state.studyIndex;
    if(index){index.paragraphLookup={};for(const [unit,languages] of Object.entries(index.paragraphs||{}))for(const [language,rows] of Object.entries(languages))for(const row of rows)index.paragraphLookup[row.id]={unit,language};}
    buildMenus();buildDisplay();buildContents();buildDictionary();buildIndex();buildDock();buildCopy();buildDesk();attachPassages();updateReturn();
    document.addEventListener('hikma:render',attachPassages);document.addEventListener('hikma:location',updateDock);document.addEventListener('hikma:desk',()=>{updateDock();if($('study-desk').open)renderDesk();});document.addEventListener('hikma:preferences',updateHeadingMode);
    document.addEventListener('keydown',e=>{if(e.key==='d'&&e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();showDictionary(window.getSelection()?.toString()||'',document.activeElement);}});
    const params=new URLSearchParams(location.search);if(params.get('term'))showDictionary(params.get('term'));
    document.dispatchEvent(new CustomEvent('hikma:study-ready'));
  }
  document.addEventListener('hikma:ready',init);init();
})();
