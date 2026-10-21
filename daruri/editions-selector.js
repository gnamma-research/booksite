/* Daruri published-edition selector.
   No server-side public PDF generation: Open PDF resolves to a verified file,
   never an unrelated substitute.
   The historical local A4 assembler remains internal for older consumers,
   but is not attached to these public PDF actions. */
(() => {
  'use strict';
  if (!window.GnammaEditions || window.GnammaEditions.__publishedSelector) return;
  const prior = window.GnammaEditions.render;
  const TIERS = ['reading','study','reference'];
  const LABELS = {reading:'Reading',study:'Study',reference:'Reference'};
  const STORAGE_KEY = 'gnamma-published-editions-state-v1';
  // These are the apparatus already included in the twelve published A4 PDFs
  // and the canonical scholarly Reference PDF. Other choices need new PDFs.
  const APPARATUS = {
    reading:{glossary:'none',index:'none',applications:'off',concordance:'off'},
    study:{glossary:'none',index:'basic',applications:'off',concordance:'off'},
    reference:{glossary:'historical',index:'full',applications:'on',concordance:'on'}
  };
  const PARTS = [
    ['intro','Introduction · §§1–9'],
    ['rulings','I · Rulings · §§10–61'],
    ['sources','II · Sources · §§62–147'],
    ['derivation','III · Derivation · §§148–229'],
    ['authority','IV · Authority · §§230–258']
  ];
  const PRESETS = {
    reading: {en:true,ar:true,vowels:true,headings:'original',notes:'none',
      personalNotes:false,personalBookmarks:false,scope:'full',part:'rulings',
      lesson:'',from:1,to:258,layout:'parallel',density:'standard'},
    study: {en:true,ar:true,vowels:true,headings:'original',notes:'selected',
      personalNotes:false,personalBookmarks:false,scope:'full',part:'rulings',
      lesson:'',from:1,to:258,layout:'parallel',density:'standard'},
    reference: {en:true,ar:true,vowels:true,headings:'editorial',notes:'full',
      personalNotes:false,personalBookmarks:false,scope:'full',part:'rulings',
      lesson:'',from:1,to:258,layout:'parallel',density:'standard'}
  };
  for(const name of TIERS)Object.assign(PRESETS[name],APPARATUS[name]);
  let state = Object.fromEntries(TIERS.map(t=>[t,{...PRESETS[t]}]));
  let tier = 'reading',category = 'layout',customOpen = false;
  let mainRoot = null, catalog = null, apparatusCatalog = null, canonical = null, requestId = 0;
  const escape = value => String(value==null?'':value).replace(/[&<>"']/g,
    c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function restore(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved || saved.v!==1)return;
      for(const name of TIERS){
        const s=saved.state&&saved.state[name];
        if(!s || typeof s!=='object')continue;
        const clean={...PRESETS[name]};
        for(const key of Object.keys(clean))
          if(typeof s[key]===typeof clean[key])clean[key]=s[key];
        if(!clean.en&&!clean.ar)clean.en=true;
        state[name]=clean;
      }
      if(TIERS.includes(saved.tier))tier=saved.tier;
    }catch(_){}
  }
  restore();
  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({v:1,tier,state}));}catch(_){}
  }
  const paths={
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    download:'<path d="M12 3v12M7 10l5 5 5-5M4 18v3h16v-3"/>',
    print:'<path d="M6 8V3h12v5M6 17H4V9h16v8h-2M7 14h10v7H7z"/><path d="M17 11h.01"/>',
    sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="2.5" fill="currentColor" stroke="none"/>'
  };
  function icon(name){
    return '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
  }
  function language(s){
    if(s.en&&s.ar)return s.vowels?'bilingual':'bilingual-unvowelled';
    if(s.en)return 'english';
    return s.vowels?'arabic-vowelled':'arabic';
  }
  function summaryLanguage(s){
    if(s.en&&s.ar)return 'Bilingual';
    return s.en?'English only':'Arabic only';
  }
  function scopeLabel(s){
    if(s.scope==='full')return 'Complete work';
    if(s.scope==='part')return PARTS.find(x=>x[0]===s.part)?.[1]||'One part';
    if(s.scope==='lesson')return 'Lesson '+(s.lesson||'—');
    return '§§'+s.from+'–'+s.to;
  }
  function notesLabel(notes){
    return {none:'None',selected:'Selected',full:'Full'}[notes]||notes;
  }
  function apparatusLabel(s){
    const items=[];
    if(s.glossary==='technical')items.push('Technical glossary');
    if(s.glossary==='historical')items.push('Historical dictionary');
    if(s.index==='basic')items.push('Basic index');
    if(s.index==='full')items.push('Full index');
    if(s.applications==='on')items.push('Bidāya applications');
    if(s.concordance==='on')items.push('R/BA concordance');
    return items.length?items.join(' · '):'None';
  }
  function resolve(){
    const s=state[tier];
    const reply={record:null,reason:'',status:'unavailable'};
    if(!catalog){reply.status='loading';reply.reason='Checking the verified PDF catalogue…';return reply;}
    if(s.scope!=='full'){reply.reason='No published PDF for this text selection. Only the complete work is currently available here.';return reply;}
    if(s.en&&s.ar&&s.layout!=='parallel'){reply.reason='Stacked bilingual layout has not been published.';return reply;}
    if(s.density!=='standard'){reply.reason='This print-density variant has not been published.';return reply;}
    const standardApparatus=Object.keys(APPARATUS[tier]).every(k=>s[k]===APPARATUS[tier][k]);
    if(!standardApparatus){
      if(!apparatusCatalog){
        reply.reason='No verified published PDF currently matches that apparatus selection.';
        return reply;
      }
      const extra=apparatusCatalog.find(row=>
        row.tier===tier && row.language===language(s) &&
        row.editorial_titles===(s.headings==='editorial') &&
        row.notes===s.notes &&
        row.glossary===s.glossary &&
        row.index===s.index &&
        row.applications===s.applications &&
        row.concordance===s.concordance &&
        row.scope==='full' && row.layout==='parallel' && row.density==='standard');
      if(extra){
        reply.record=extra;
        reply.status='ready';
        return reply;
      }
      reply.reason='This apparatus combination has not been published as a verified PDF.';
      return reply;
    }
    if(tier==='reading'){
      if(s.notes!=='none'){reply.reason='Reading PDFs without publisher notes are available. The chosen publisher-note profile is not published.';return reply;}
      reply.record=catalog.find(x=>x.tier==='reading'&&x.language===language(s)&&
        x.editorial_titles===(s.headings==='editorial'))||null;
    }else if(tier==='study'){
      if(s.notes!=='selected'){reply.reason='Only the Selected publisher-note profile is published for Study.';return reply;}
      if(!s.en||!s.ar){reply.reason='English-only and Arabic-only Study PDFs are not yet published.';return reply;}
      if(!s.vowels){reply.reason='An unvowelled bilingual Study PDF is not yet published.';return reply;}
      reply.record=catalog.find(x=>x.tier==='study'&&x.language==='bilingual'&&
        x.editorial_titles===(s.headings==='editorial'))||null;
    }else{
      if(s.notes!=='full'){reply.reason='The canonical Reference PDF includes its full publisher apparatus. This alternative note profile is not published.';return reply;}
      if(!s.en||!s.ar){reply.reason='Reference is currently published only as a bilingual PDF.';return reply;}
      if(!s.vowels){reply.reason='The unvowelled Reference PDF has not been published.';return reply;}
      if(s.headings!=='editorial'){reply.reason='The Reference PDF currently includes both recorded headings and an editorial contents guide.';return reply;}
      if(!canonical){reply.reason='Reference PDF metadata is unavailable; this variant cannot be verified yet.';return reply;}
      reply.record=canonical;
    }
    if(!reply.record){reply.reason='No verified PDF exists for this exact combination.';return reply;}
    reply.status='ready';
    return reply;
  }
  const options=(label,kind,pairs)=>'<div class="gn-es-opt-group" role="group" aria-label="'+escape(label)+'">'+
    pairs.map(([value,text])=>'<button type="button" class="gn-es-choice" data-es-'+kind+'="'+escape(value)+'" aria-pressed="false">'+escape(text)+'</button>').join('')+'</div>';
  function shell(){
    return '<div class="gn-es-wrap">'+
      '<header class="gn-es-header"><h1 id="gn-es-title" tabindex="-1">Editions</h1></header>'+
      '<div class="gn-es-edition-tabs" role="tablist" aria-label="Edition type">'+
      TIERS.map(t=>'<button type="button" role="tab" class="gn-es-tab" id="gn-es-tab-'+t+
        '" data-es-tier="'+t+'" aria-controls="gn-es-panel" aria-selected="false" tabindex="-1">'+LABELS[t]+'</button>').join('')+
      '</div>'+
      '<section id="gn-es-panel" role="tabpanel" aria-labelledby="gn-es-tab-reading" tabindex="0">'+
        '<div class="gn-es-primary"><span class="gn-es-label">Text</span>'+
          '<div class="gn-es-text-switches">'+
            '<button type="button" data-es-toggle="en" aria-label="Include English" aria-pressed="true">EN</button>'+
            '<button type="button" data-es-toggle="ar" aria-label="Include Arabic" aria-pressed="true">AR</button>'+
            '<span class="gn-es-language-divider" aria-hidden="true"></span>'+
            '<button type="button" class="gn-es-vowels" data-es-toggle="vowels" aria-label="Arabic vowel marks" aria-pressed="true" lang="ar">عَ</button>'+
          '</div></div>'+
        '<section class="gn-es-spec" aria-label="Current document configuration">'+
          '<div class="gn-es-spec-head"><strong>Current document</strong><span data-es-count></span></div>'+
          '<p class="gn-es-spec-lead" data-es-spec-lead></p>'+
          '<p class="gn-es-spec-layout" data-es-spec-layout></p>'+
          '<p class="gn-es-spec-notes" data-es-spec-notes></p>'+
          '<p class="gn-es-spec-apparatus" data-es-spec-apparatus></p>'+
        '</section>'+
        '<div class="gn-es-custom-head"><button type="button" class="gn-es-custom-trigger" data-es-custom aria-expanded="false" aria-controls="gn-es-custom">'+icon('sliders')+'<span>Customize</span><span class="gn-es-custom-arrow" aria-hidden="true">⌄</span></button></div>'+
        '<div id="gn-es-custom" class="gn-es-custom" hidden>'+
          '<div class="gn-es-category-tabs" role="tablist" aria-label="Customize PDF settings">'+
            ['content','layout','notes','apparatus'].map(c=>'<button type="button" class="gn-es-category" role="tab" data-es-category="'+c+'" aria-selected="false" aria-controls="gn-es-options" tabindex="-1">'+c.charAt(0).toUpperCase()+c.slice(1)+'</button>').join('')+
          '</div>'+
          '<section class="gn-es-options" id="gn-es-options" role="tabpanel" tabindex="0" aria-label="Selected customization settings">'+
            '<div data-es-section="content" hidden>'+
              '<p class="gn-es-field-title">Text selection</p>'+
              options('Content scope','scope',[['full','Complete work'],['part','One part'],['lesson','Course lesson'],['range','Section range']])+
              '<div class="gn-es-conditional" data-es-part-row hidden><label>Part <select data-es-input="part">'+
                PARTS.map(([value,text])=>'<option value="'+escape(value)+'">'+escape(text)+'</option>').join('')+
              '</select></label></div>'+
              '<div class="gn-es-conditional" data-es-lesson-row hidden><label>Lesson <select data-es-input="lesson"><option value="">Choose lesson</option></select></label></div>'+
              '<div class="gn-es-conditional gn-es-range" data-es-range-row hidden>'+
                '<label>From § <input type="number" min="1" max="258" data-es-input="from" value="1"></label>'+
                '<label>Through § <input type="number" min="1" max="258" data-es-input="to" value="258"></label></div>'+
              '<p class="gn-es-hint">Only complete-work PDFs are currently published for these edition tabs. Choosing a smaller selection shows its availability before download.</p>'+
            '</div>'+
            '<div data-es-section="layout" hidden>'+
              '<p class="gn-es-field-title">Paper</p><p class="gn-es-fixed">A4 · Published print size</p>'+
              '<p class="gn-es-field-title">Headings</p>'+
              options('Section headings','headings',[['original','Recorded headings'],['editorial','Editorial headings']])+
              '<p class="gn-es-field-title">Bilingual arrangement</p>'+
              options('Bilingual text arrangement','layout',[['parallel','Side by side'],['stacked','Stacked']])+
              '<p class="gn-es-field-title">Print density</p>'+
              options('Density','density',[['standard','Published'],['compact','Compact']])+
              '<p class="gn-es-hint">Settings without a published PDF are labelled unavailable in the document summary. We never substitute another layout.</p>'+
            '</div>'+
            '<div data-es-section="notes" hidden>'+
              '<p class="gn-es-field-title">Publisher notes</p>'+
              options('Publisher notes','notes',[['none','None'],['selected','Selected'],['full','Full']])+
              '<p class="gn-es-field-title">My Reading Desk</p>'+
              '<div class="gn-es-personal-options">'+
                '<button type="button" class="gn-es-personal-choice" data-es-personal="personalNotes" aria-pressed="false"><span>Include my notes</span><span data-es-flag="personalNotes">Off</span></button>'+
                '<button type="button" class="gn-es-personal-choice" data-es-personal="personalBookmarks" aria-pressed="false"><span>Include my bookmarks</span><span data-es-flag="personalBookmarks">Off</span></button>'+
              '</div>'+
              '<p class="gn-es-hint">Your personal notes stay on this device. The five canonical PDFs have precise-word maps; the new apparatus editions have their own verified section and reference-entry maps. Unsupported word-level highlights fall back safely to linked P-numbered section notes.</p>'+
              '<a class="gn-es-personal-link" href="personal-export.html">Open local personal PDF tools <span aria-hidden="true">↗</span></a>'+
            '</div>'+
            '<div data-es-section="apparatus" hidden>'+
              '<p class="gn-es-field-title">Glossary / dictionary</p>'+
              options('Glossary and dictionary','glossary',[['none','None'],['technical','Technical glossary'],['historical','Historical dictionary']])+
              '<p class="gn-es-field-title">Subject index</p>'+
              options('Index','index',[['none','None'],['basic','Basic index'],['full','Full index']])+
              '<p class="gn-es-field-title">Bidāya applications</p>'+
              options('Legal applications','applications',[['off','Off'],['on','On']])+
              '<p class="gn-es-field-title">Textual concordance (R/BA)</p>'+
              options('Textual concordance','concordance',[['off','Off'],['on','On']])+
              '<p class="gn-es-hint">Only combinations with a published, complete PDF can be opened. The current document summary retains your apparatus selections.</p>'+
            '</div>'+
          '</section>'+
        '</div>'+
        '<section class="gn-es-availability" aria-live="polite" aria-atomic="true"><strong data-es-availability-heading>Checking PDF…</strong><p data-es-availability-detail></p></section>'+
        '<div class="gn-es-actions" aria-label="Document action">'+
          '<a data-es-action="open" class="gn-es-action gn-es-action-primary" aria-label="Open selected published PDF" target="_blank" rel="noopener noreferrer">'+icon('eye')+'<span>Open PDF</span></a>'+
        '</div>'+
        '<p class="gn-es-private-hint" data-es-private-hint hidden>Your selected PDF contains no private notes until the local personal-PDF tool appends them as linked P-numbered pages. Use Customize → Notes to create that copy on this device.</p>'+
        '<p class="gn-es-study-guide" data-es-study-guide hidden><a href="daruri-study-guide.pdf?v=daruri6-sources-20261020" target="_blank" rel="noopener noreferrer">Study Guide PDF ↗</a></p>'+
      '</section></div>';
  }
  function active(){
    return state[tier];
  }
  function loadLessons(){
    if(!mainRoot)return;
    const select=mainRoot.querySelector('[data-es-input="lesson"]');
    if(!select)return;
    const lessons=window.DARURI_STUDY_DATA?.lessons||[];
    if(!lessons.length)return;
    select.innerHTML='<option value="">Choose lesson</option>'+
      lessons.map((x,i)=>'<option value="'+escape(x.id)+'">'+escape('Lesson '+(x.number||i+1)+' · '+(x.title||x.id))+'</option>').join('');
  }
  function refresh(){
    const root=mainRoot;if(!root||!root.isConnected)return;
    const s=active(),result=resolve(),isPersonal=s.personalNotes||s.personalBookmarks;
    for(const node of root.querySelectorAll('[data-es-tier]')){
      const chosen=node.dataset.esTier===tier;
      node.setAttribute('aria-selected',String(chosen));node.tabIndex=chosen?0:-1;
    }
    root.querySelector('#gn-es-panel').setAttribute('aria-labelledby','gn-es-tab-'+tier);
    for(const btn of root.querySelectorAll('[data-es-toggle]')){
      const key=btn.dataset.esToggle;
      btn.setAttribute('aria-pressed',String(Boolean(s[key])));
      btn.disabled=(key==='en'&&s.en&&!s.ar)||(key==='ar'&&s.ar&&!s.en);
      btn.hidden=key==='vowels'&&!s.ar;
      if(key==='vowels')btn.textContent=s.vowels?'عَ':'ع';
    }
    const divider=root.querySelector('.gn-es-language-divider');
    divider.hidden=!s.ar;
    root.querySelector('[data-es-spec-lead]').textContent=
      LABELS[tier]+' · '+summaryLanguage(s)+(s.ar?' · '+(s.vowels?'Vowelled':'Unvowelled'):'')+' · '+scopeLabel(s);
    root.querySelector('[data-es-spec-layout]').textContent=
      'A4 · '+(s.en&&s.ar?(s.layout==='parallel'?'English left / Arabic right':'Stacked bilingual'):'Monolingual')+
      ' · '+(s.density==='standard'?'Published density':'Compact density')+
      ' · '+(tier==='reference'&&s.headings==='editorial'?'Recorded + editorial guide':s.headings==='editorial'?'Editorial headings':'Recorded headings');
    root.querySelector('[data-es-spec-notes]').textContent=
      'Publisher notes: '+notesLabel(s.notes)+' · My notes: '+(s.personalNotes?'On':'Off')+
      ' · Bookmarks: '+(s.personalBookmarks?'On':'Off');
    root.querySelector('[data-es-spec-apparatus]').textContent='Apparatus: '+apparatusLabel(s);
    const hasCurrent=result.status==='ready';
    root.querySelector('[data-es-count]').textContent=hasCurrent?
      result.record.pages+' pages · '+formatBytes(result.record.bytes||result.record.size_bytes):'';
    root.querySelector('[data-es-availability-heading]').textContent=hasCurrent?
      'Published PDF available':result.status==='loading'?'Checking published PDFs…':'PDF not published for this selection';
    root.querySelector('[data-es-availability-detail]').textContent=hasCurrent?
      result.record.pages+' A4 pages · '+(isPersonal?'Public PDF only — private notes are not included':'Open this PDF to read, save, share or print'):
      result.reason;
    root.querySelector('.gn-es-availability').dataset.esStatus=result.status;
    const action=root.querySelector('[data-es-action="open"]');
    action.setAttribute('aria-disabled',String(!hasCurrent));
    if(hasCurrent){
      const record=result.record;
      action.href=tier==='reference'?
        'daruri.pdf?v='+encodeURIComponent((record.sha256||'published').slice(0,12)):
        'editions/'+record.file+'?v='+encodeURIComponent((record.sha256||'published').slice(0,12));
    }else action.removeAttribute('href');
    root.querySelector('[data-es-private-hint]').hidden=!isPersonal;
    const local=root.querySelector('.gn-es-personal-link');
    // Preselect this exact verified apparatus PDF in the browser-local
    // personal exporter. Unavailable variants cannot create invalid exports.
    if(hasCurrent && result.record.map_file){
      const path='editions/'+result.record.file;
      local.href='personal-export.html?pdf='+encodeURIComponent(path)+
        '&personal='+(s.personalNotes?'1':'0')+
        '&bookmarks='+(s.personalBookmarks?'1':'0');
    }else{
      local.href='personal-export.html'+(isPersonal?
        '?personal='+(s.personalNotes?'1':'0')+'&bookmarks='+(s.personalBookmarks?'1':'0'):'');
    }
    root.querySelector('[data-es-study-guide]').hidden=tier!=='study';
    root.querySelector('[data-es-custom]').setAttribute('aria-expanded',String(customOpen));
    root.querySelector('#gn-es-custom').hidden=!customOpen;
    for(const node of root.querySelectorAll('[data-es-category]')){
      const chosen=node.dataset.esCategory===category;
      node.setAttribute('aria-selected',String(chosen));
      node.tabIndex=chosen?0:-1;
    }
    const panel=root.querySelector('#gn-es-options');
    panel.setAttribute('aria-label',category.charAt(0).toUpperCase()+category.slice(1)+' settings');
    for(const node of root.querySelectorAll('[data-es-section]'))node.hidden=node.dataset.esSection!==category;
    for(const key of ['scope','headings','layout','density','notes','glossary','index','applications','concordance']){
      for(const node of root.querySelectorAll('[data-es-'+key+']')){
        const selected=node.dataset['es'+key.charAt(0).toUpperCase()+key.slice(1)]===s[key];
        node.setAttribute('aria-pressed',String(selected));
        const notAllowed=key==='notes'&&node.dataset.esNotes==='full'&&tier!=='reference';
        node.hidden=notAllowed;
      }
    }
    for(const node of root.querySelectorAll('[data-es-personal]')){
      const key=node.dataset.esPersonal;
      node.setAttribute('aria-pressed',String(s[key]));
      node.querySelector('[data-es-flag]').textContent=s[key]?'On':'Off';
    }
    for(const [key,selector] of [['part','[data-es-part-row]'],['lesson','[data-es-lesson-row]'],['range','[data-es-range-row]']]){
      root.querySelector(selector).hidden=s.scope!==key;
    }
    for(const node of root.querySelectorAll('[data-es-input]')){
      const key=node.dataset.esInput;
      if(node.value!==String(s[key]))node.value=String(s[key]);
    }
    root.querySelector('[data-es-layout="stacked"]').disabled=!(s.en&&s.ar)?true:false;
    if(!s.en||!s.ar){
      if(s.layout!=='parallel')s.layout='parallel';
      root.querySelector('[data-es-layout="parallel"]').setAttribute('aria-pressed','true');
      root.querySelector('[data-es-layout="stacked"]').setAttribute('aria-pressed','false');
    }
    save();
  }
  function formatBytes(bytes){
    return bytes?Math.round(Number(bytes)/1024)+' KB':'PDF';
  }
  function choose(key,value){
    const s=active();
    if(key==='en'||key==='ar'){
      if(s[key]&&!s[key==='en'?'ar':'en'])return;
      s[key]=!s[key];
      if(!s.en||!s.ar)s.layout='parallel';
    }else if(key==='vowels')s.vowels=!s.vowels;
    else if(key==='personalNotes'||key==='personalBookmarks')s[key]=!s[key];
    else s[key]=value;
    refresh();
  }
  function selectTier(next,focus=false){
    if(!TIERS.includes(next))return;
    tier=next;
    refresh();
    if(focus)mainRoot?.querySelector('[data-es-tier="'+tier+'"]')?.focus();
  }
  function selectCategory(next,focus=false){
    if(!['content','layout','notes','apparatus'].includes(next))return;
    category=next;
    customOpen=true;
    refresh();
    if(focus)mainRoot?.querySelector('[data-es-category="'+category+'"]')?.focus();
  }
  function onClick(event){
    const root=mainRoot;if(!root||!root.contains(event.target))return;
    const b=event.target.closest('button');
    if(!b||!root.contains(b))return;
    if(b.dataset.esTier){selectTier(b.dataset.esTier,true);return;}
    if(b.dataset.esCategory){selectCategory(b.dataset.esCategory,true);return;}
    if(b.dataset.esToggle){choose(b.dataset.esToggle);return;}
    if(b.dataset.esCustom!==undefined){customOpen=!customOpen;refresh();return;}
    if(b.dataset.esPersonal){choose(b.dataset.esPersonal);return;}
    for(const key of ['scope','headings','layout','density','notes','glossary','index','applications','concordance']){
      const prop='es'+key.charAt(0).toUpperCase()+key.slice(1);
      if(b.dataset[prop]!==undefined){choose(key,b.dataset[prop]);return;}
    }
  }
  function onChange(event){
    const node=event.target.closest('[data-es-input]');
    if(!node||!mainRoot?.contains(node))return;
    const key=node.dataset.esInput;
    if(key==='from'||key==='to')active()[key]=Math.min(258,Math.max(1,Number(node.value)||1));
    else active()[key]=node.value;
    refresh();
  }
  function onKey(event){
    const tab=event.target.closest('[role="tab"]');
    if(!tab||!mainRoot?.contains(tab))return;
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const type=tab.dataset.esTier?'tier':'category';
    const names=type==='tier'?TIERS:['content','layout','notes','apparatus'];
    const name=type==='tier'?tab.dataset.esTier:tab.dataset.esCategory;
    const i=names.indexOf(name);
    const next=event.key==='Home'?0:event.key==='End'?names.length-1:
      (i+(event.key==='ArrowRight'?1:-1)+names.length)%names.length;
    event.preventDefault();
    if(type==='tier')selectTier(names[next],true);
    else selectCategory(names[next],true);
  }
  function mount(main){
    const legacy=main.querySelector('.gn-editions');
    if(!legacy)return;
    const holder=document.createElement('div');
    holder.hidden=true;
    holder.setAttribute('aria-hidden','true');
    holder.className='gn-es-legacy';
    holder.appendChild(legacy);
    const root=document.createElement('div');
    root.className='gn-es';
    root.innerHTML=shell();
    main.prepend(root);
    main.append(holder);
    mainRoot=root;
    loadLessons();
    root.addEventListener('click',onClick);
    root.addEventListener('change',onChange);
    root.addEventListener('keydown',onKey);
    refresh();
    const thisRequest=++requestId;
    const check=fetch('editions/manifest.json?v=published-selector-v1',{cache:'no-store'})
      .then(r=>r.ok?r.json():null).catch(()=>null);
    const reference=fetch('pdf-editions-manifest.json?v=published-selector-v1',{cache:'no-store'})
      .then(r=>r.ok?r.json():null).catch(()=>null);
    const apparatus=fetch('editions/apparatus/manifest.json?v=apparatus-verified1',{cache:'no-store'})
      .then(r=>r.ok?r.json():null).catch(()=>null);
    Promise.all([check,reference,apparatus]).then(([a,b,extra])=>{
      if(thisRequest!==requestId||mainRoot!==root)return;
      catalog=a?.status==='verified'&&Array.isArray(a.files)?
        a.files.filter(x=>x&&['reading','study'].includes(x.tier)&&
          /^(reading|study)\/daruri-(reading|study)-(bilingual-unvowelled|bilingual|arabic-vowelled|english|arabic)-titles-(on|off)\.pdf$/.test(x.file||'')&&
          Number.isInteger(x.pages)&&x.pages>0&&/^[0-9a-f]{64}$/.test(x.sha256||'')):null;
      apparatusCatalog=extra?.status==='verified'&&Array.isArray(extra.files)?
        extra.files.filter(row=>row && ['reading','study'].includes(row.tier) &&
          /^apparatus\/daruri-(reading|study)-(bilingual|bilingual-unvowelled)-(glossary|index|glossary-index|concordance|applications)\.pdf$/.test(row.file||'') &&
          Number.isInteger(row.pages)&&row.pages>40&&row.verified_sections===258 &&
          row.map_coverage===1 &&
          /^[0-9a-f]{64}$/.test(row.sha256||'') &&
          /^[0-9a-f]{64}$/.test(row.map_sha256||'') &&
          catalog?.some(base=>base.file===row.source_base&&base.sha256===row.base_sha256)):null;
      const pdf=b?.files?.['daruri.pdf'];
      canonical=pdf&&Number.isInteger(pdf.pages)&&pdf.pages>0&&/^[0-9a-f]{64}$/.test(pdf.sha256||'')?pdf:null;
      refresh();
    });
  }
  window.GnammaEditions.render=function(main,payload){
    const result=prior.call(this,main,payload);
    mount(main);
    return result;
  };
  window.GnammaEditions.__publishedSelector=true;
  window.GnammaEditions.__getPublicationSelection=()=>({tier,category,open:customOpen,
    settings:{...state[tier]},resolution:resolve().status});
})();
