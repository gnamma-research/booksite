/* Daruri Editions: two reader-facing tabs, with Reading/Study profiles under
   one tab and canonical scholarly Reference under the other.
   Every PDF resolves to a SHA-verified prebuilt file. Personal content is
   exported by the existing PDF engine, mounted inline and never uploaded. */
(() => {
  'use strict';
  if(!window.GnammaEditions||window.GnammaEditions.__publishedSelector)return;
  const oldRender=window.GnammaEditions.render;
  const NAV=['reading','reference'];
  const BASE={
    reading:{en:true,ar:true,vowels:true,headings:'original',notes:'none',
      glossary:'none',index:'none',applications:'off',concordance:'off'},
    study:{en:true,ar:true,vowels:true,headings:'original',notes:'selected',
      glossary:'none',index:'basic',applications:'off',concordance:'off'},
    reference:{en:true,ar:true,vowels:true,headings:'editorial',notes:'full',
      glossary:'historical',index:'full',applications:'on',concordance:'on'}
  };
  const KEY='gnamma-published-editions-two-tabs-v2';
  const state={
    reading:{...BASE.reading},
    study:{...BASE.study},
    reference:{...BASE.reference}
  };
  let tier='reading',preset='reading',tab='reading',customOpen=false;
  let catalog=null,addon=null,reference=null,baseMaps=null,root=null,requestId=0;
  let personalReady=false,selectedFile='',selectedRow=null;
  const esc=value=>String(value??'').replace(/[&<>"']/g,
    c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iconPaths={
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    pen:'<path d="M4 20l4-1 11-11-3-3L5 16l-1 4ZM13 8l3 3"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
    glossary:'<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h4"/>',
    index:'<path d="M7 5h13M7 12h13M7 19h13M3 5h1M3 12h1M3 19h1"/>',
    applications:'<path d="M12 3v18M4 7h16M6 7l-4 7h8l-4-7ZM18 7l-4 7h8l-4-7ZM8 21h8"/>',
    concordance:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>'
  };
  const icon=(key,cls='')=>'<svg'+(cls?' class="'+esc(cls)+'"':'')+
    ' aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+iconPaths[key]+'</svg>';
  const current=()=>state[tier];
  const language=s=>s.en?(s.ar?(s.vowels?'bilingual':'bilingual-unvowelled'):'english'):
    (s.vowels?'arabic-vowelled':'arabic');
  const languageLabel=s=>s.en?(s.ar?'Bilingual':'English'):'Arabic';
  function remember(){
    try{localStorage.setItem(KEY,JSON.stringify({v:2,tab,tier,preset,customOpen,state}));}catch(_){}
  }
  function restore(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!raw||raw.v!==2)return;
      for(const kind of Object.keys(state)){
        const s=raw.state?.[kind];if(!s)continue;
        for(const k of Object.keys(BASE[kind]))
          if(typeof s[k]===typeof BASE[kind][k])state[kind][k]=s[k];
      }
      if(NAV.includes(raw.tab))tab=raw.tab;
      if(['reading','study','reference'].includes(raw.tier))tier=raw.tier;
      if(['reading','study','custom'].includes(raw.preset))preset=raw.preset;
      customOpen=Boolean(raw.customOpen);
      if(!current().en&&!current().ar)current().en=true;
      if(tab==='reference')tier='reference';
      if(tab==='reading'&&tier==='reference')tier='reading';
    }catch(_){}
  }
  restore();
  // Only genuinely prebuilt layouts are exposed. Reference is always fixed.
  Object.assign(state.reference,BASE.reference);
  Object.assign(state.study,{en:true,ar:true,vowels:true,notes:'selected'});
  const buttons=(key,pairs)=>'<div class="gn-es-opt-group" role="group" aria-label="'+esc(key)+'">'+
    pairs.map(pair=>'<button type="button" class="gn-es-choice" data-es-'+key+'="'+
    esc(pair[0])+'" aria-pressed="false">'+esc(pair[1])+'</button>').join('')+'</div>';
  const apparatus=(key,label)=>'<button type="button" class="gn-es-include" data-es-include="'+key+'" aria-pressed="false">'+
    icon(key)+'<span>'+esc(label)+'</span></button>';
  function shell(){
    return '<div class="gn-es-wrap">'+
      '<header class="gn-es-header"><h1 id="gn-es-title" tabindex="-1">Editions</h1></header>'+
      '<div class="gn-es-edition-tabs" role="tablist" aria-label="Edition type">'+
        '<button type="button" class="gn-es-tab" id="gn-es-tab-reading" role="tab" aria-controls="gn-es-panel" data-es-nav="reading" aria-selected="true">Reading &amp; Study</button>'+
        '<button type="button" class="gn-es-tab" id="gn-es-tab-reference" role="tab" aria-controls="gn-es-panel" data-es-nav="reference" aria-selected="false">Reference</button>'+
      '</div>'+
      '<section id="gn-es-panel" role="tabpanel" tabindex="0" aria-labelledby="gn-es-tab-reading">'+
        '<div class="gn-es-setting gn-es-setting-text">'+
          '<span class="gn-es-setting-label">Language</span>'+
          '<div class="gn-es-setting-body">'+
            '<div class="gn-es-text-switches">'+
              '<button type="button" data-es-toggle="en" aria-label="Include English" aria-pressed="true">EN</button>'+
              '<button type="button" data-es-toggle="ar" aria-label="Include Arabic" aria-pressed="true">AR</button>'+
              '<span class="gn-es-language-divider" aria-hidden="true"></span>'+
              '<button type="button" class="gn-es-vowels" data-es-toggle="vowels" aria-label="Arabic vowel marks" aria-pressed="true" lang="ar">عَ</button>'+
            '</div><span class="gn-es-inline-note" data-es-language-note></span>'+
          '</div></div>'+
        '<div class="gn-es-setting gn-es-presets" data-es-presets>'+
          '<span class="gn-es-setting-label">Start with</span><div class="gn-es-setting-body">'+
            '<div class="gn-es-preset-options" role="group" aria-label="Starting edition">'+
              '<button type="button" class="gn-es-preset" data-es-preset="reading" aria-pressed="true"><strong>Reading</strong><small>Clean text</small></button>'+
              '<button type="button" class="gn-es-preset" data-es-preset="study" aria-pressed="false"><strong>Study</strong><small>Guided notes</small></button>'+
              '<button type="button" class="gn-es-preset" data-es-preset="custom" aria-pressed="false"><strong>Custom</strong><small>Choose options</small></button>'+
            '</div><span class="gn-es-inline-note" data-es-preset-note></span></div>'+
        '</div>'+
        '<div class="gn-es-custom-head" data-es-custom-head>'+
          '<button type="button" class="gn-es-custom-trigger" data-es-custom aria-expanded="false" aria-controls="gn-es-custom">'+
          '<span>Customize edition</span>'+icon('chevron','gn-es-custom-arrow')+'</button></div>'+
        '<div id="gn-es-custom" class="gn-es-custom" hidden>'+
          '<div class="gn-es-custom-setting">'+
            '<span class="gn-es-setting-label">Publisher notes</span>'+
            '<div class="gn-es-setting-body">'+buttons('publisher',[['none','None'],['selected','Study notes']])+
              '<p class="gn-es-inline-note">Study notes require the published vowelled bilingual edition.</p></div></div>'+
          '<div class="gn-es-custom-setting">'+
            '<span class="gn-es-setting-label">Headings</span><div class="gn-es-setting-body">'+
            buttons('headings',[['original','Recorded'],['editorial','Editorial guide']])+'</div></div>'+
          '<div class="gn-es-custom-setting"><span class="gn-es-setting-label">Include</span>'+
            '<div class="gn-es-setting-body"><div class="gn-es-includes">'+
              apparatus('glossary','Glossary')+apparatus('index','Full index')+
              apparatus('applications','Applications')+apparatus('concordance','Concordance')+
            '</div><p class="gn-es-inline-note">Study editions already include a basic index. Options resolve only to exact published PDFs.</p></div></div>'+
        '</div>'+
        '<div class="gn-es-reference-inventory" data-es-reference-inventory hidden>'+
          '<p class="gn-es-field-title">Included in scholarly Reference</p>'+
          '<p>Recorded headings, editorial guide, full scholarly notes, historical dictionary, complete index, Bidāya applications and R/BA concordance.</p>'+
          '<p class="gn-es-inline-note">These publisher materials are fixed in the verified scholarly PDF; your own notes remain optional.</p>'+
        '</div>'+
        '<form id="pe-form" autocomplete="off">'+
          '<div hidden><label for="pe-edition">Exact selected PDF</label><select id="pe-edition"><option value="">Loading</option></select>'+
            '<label><input type="radio" name="pe-mode" value="none" checked>None</label>'+
            '<label><input type="radio" name="pe-mode" value="all">All</label>'+
            '<label><input type="radio" name="pe-mode" value="choose">Choose</label>'+
            '<label><input type="checkbox" id="pe-appendix" checked>Required personal appendix</label></div>'+
          '<div class="gn-es-setting gn-es-personal-row">'+
            '<span class="gn-es-setting-label">My annotations</span>'+
            '<div class="gn-es-setting-body">'+
              '<div class="gn-es-personal-options">'+
                '<label class="gn-es-personal-choice">'+icon('pen')+'<input type="checkbox" id="pe-personal"><span>My notes</span></label>'+
                '<label class="gn-es-personal-choice">'+icon('bookmark')+'<input type="checkbox" id="pe-bookmarks"><span>Bookmarks</span></label>'+
              '</div><span class="gn-es-inline-note">Personal material stays on your device and is added as linked P-numbered endnotes.</span>'+
              '<div id="pe-note-options" hidden>'+
                '<div class="gn-es-personal-advanced">'+
                  '<label><input id="pe-annotations" type="checkbox" checked> Linked P markers &amp; verified highlights</label>'+
                  '<label><input id="pe-dates" type="checkbox" checked> Include reliable dates</label>'+
                  '<label for="pe-order">Appendix order<select id="pe-order">'+
                    '<option value="source">Source order</option><option value="created">Oldest first</option><option value="newest">Newest first</option>'+
                  '</select></label>'+
                '</div>'+
                '<div class="gn-es-picker-mode" role="group" aria-label="Which personal entries">'+
                  '<button type="button" data-es-picker-mode="all" aria-pressed="true">All entries</button>'+
                  '<button type="button" data-es-picker-mode="choose" aria-pressed="false">Choose entries</button></div>'+
                '<div id="pe-picker" class="gn-es-picker" hidden>'+
                  '<label for="pe-search">Find an entry</label><input type="search" id="pe-search" placeholder="Search title, note or passage">'+
                  '<div class="gn-es-picker-actions"><button type="button" id="pe-check-all">Select all</button>'+
                  '<button type="button" id="pe-check-none">Clear</button></div>'+
                  '<p id="pe-picker-count"></p><div id="pe-items" class="gn-es-personal-items" role="group" aria-label="Personal entries"></div>'+
                '</div><p id="pe-count" class="gn-es-inline-note" role="status"></p>'+
              '</div>'+
            '</div></div>'+
          '<section class="gn-es-spec" aria-label="Current document configuration">'+
            '<div class="gn-es-spec-head"><strong>Selected PDF</strong><span data-es-count></span></div>'+
            '<p class="gn-es-spec-lead" data-es-spec-lead></p>'+
            '<p class="gn-es-spec-layout" data-es-spec-layout></p>'+
            '<p class="gn-es-spec-notes" data-es-spec-notes></p>'+
            '<p class="gn-es-spec-apparatus" data-es-spec-apparatus></p>'+
          '</section>'+
          '<section class="gn-es-availability" aria-live="polite" aria-atomic="true">'+
            '<strong data-es-availability-heading>Checking published PDFs…</strong><p data-es-availability-detail></p></section>'+
          '<div id="pe-alert" class="gn-es-inline-alert" role="status" hidden></div>'+
          '<p id="pe-description" class="gn-es-inline-note" hidden></p>'+
          '<div class="gn-es-actions">'+
            '<a class="gn-es-action gn-es-action-primary" data-es-action="open" aria-label="Open exact published PDF" target="_blank" rel="noopener noreferrer">'+icon('eye')+'<span>Open PDF</span></a>'+
            '<button class="gn-es-action gn-es-action-primary" type="submit" id="pe-generate" hidden disabled>Create my PDF</button>'+
          '</div>'+
          '<a id="pe-clean" hidden></a>'+
          '<div id="pe-progress" hidden role="status" aria-live="polite">'+
            '<span id="pe-progress-text"></span><progress id="pe-bar" max="100" value="0"></progress></div>'+
          '<div id="pe-result" class="gn-es-export-result" hidden>'+
            '<strong>Your personal PDF has been created on this device.</strong>'+
            '<div class="gn-es-export-result-actions">'+
              '<a id="pe-result-link" download>Download again</a>'+
              '<a id="pe-open" target="_blank" rel="noopener">Open / print PDF</a>'+
              '<button type="button" id="pe-share" hidden>Share on this device</button>'+
            '</div></div>'+
        '</form>'+
        '<p class="gn-es-study-guide" data-es-study-guide hidden>'+
          '<a href="daruri-study-guide.pdf?v=daruri6-sources-20261020" target="_blank" rel="noopener noreferrer">Study Guide PDF ↗</a></p>'+
      '</section></div>';
  }
  function apparatusLabel(s){
    const parts=[];
    if(s.glossary==='technical')parts.push('Glossary');
    else if(s.glossary==='historical')parts.push('Historical dictionary');
    if(s.index==='basic')parts.push('Basic index');
    if(s.index==='full')parts.push('Full index');
    if(s.applications==='on')parts.push('Bidāya applications');
    if(s.concordance==='on')parts.push('R/BA concordance');
    return parts.length?parts.join(' · '):'None';
  }
  function resolve(){
    const s=current(),reply={record:null,status:'unavailable',reason:''};
    if(!catalog){reply.status='loading';reply.reason='Checking verified PDF catalogue…';return reply;}
    if(tier==='reference'){
      if(reference){reply.record=reference;reply.status='ready';return reply;}
      reply.reason='The scholarly Reference PDF manifest cannot be verified.';return reply;
    }
    const lang=language(s),head=s.headings==='editorial';
    if(tier==='study'&&lang!=='bilingual'){
      reply.reason='Published Study notes currently require bilingual, vowelled text.';return reply;
    }
    const standard=tier==='study'?
      s.glossary==='none'&&s.index==='basic'&&s.applications==='off'&&s.concordance==='off':
      s.glossary==='none'&&s.index==='none'&&s.applications==='off'&&s.concordance==='off';
    if(standard){
      reply.record=catalog.find(x=>x.tier===tier&&x.language===lang&&x.editorial_titles===head)||null;
    }else if(addon){
      reply.record=addon.find(x=>x.tier===tier&&x.language===lang&&
        x.editorial_titles===head&&x.notes===s.notes&&
        x.glossary===s.glossary&&x.index===s.index&&
        x.applications===s.applications&&x.concordance===s.concordance&&
        x.scope==='full'&&x.layout==='parallel'&&x.density==='standard')||null;
    }
    if(reply.record){reply.status='ready';return reply;}
    reply.reason='No published PDF matches this exact combination. Choose a preset or change an option.';
    return reply;
  }
  function publicFile(result){
    if(!result.record)return '';
    return tier==='reference'?'daruri.pdf':'editions/'+result.record.file;
  }
  function hasPersonal(){
    return Boolean(root?.querySelector('#pe-personal')?.checked||
      root?.querySelector('#pe-bookmarks')?.checked);
  }
  function syncExport(file){
    const bridge=window.GnammaPersonalExportInline;
    if(!bridge?.ready)return false;
    return bridge.choose(file);
  }
  function refresh(){
    if(!root?.isConnected)return;
    const s=current(),result=resolve(),isPersonal=hasPersonal();
    for(const button of root.querySelectorAll('[data-es-nav]')){
      const active=button.dataset.esNav===tab;
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
    }
    root.querySelector('#gn-es-panel').setAttribute('aria-labelledby','gn-es-tab-'+tab);
    root.querySelector('[data-es-presets]').hidden=tab==='reference';
    root.querySelector('[data-es-custom-head]').hidden=tab==='reference';
    root.querySelector('#gn-es-custom').hidden=tab==='reference'||!customOpen;
    root.querySelector('[data-es-custom]').setAttribute('aria-expanded',String(customOpen&&tab!=='reference'));
    root.querySelector('[data-es-reference-inventory]').hidden=tab!=='reference';
    for(const button of root.querySelectorAll('[data-es-preset]')){
      button.setAttribute('aria-pressed',String(button.dataset.esPreset===preset));
      // Never silently change an English-only or unvowelled selection to
      // bilingual merely because the reader asks for a Study preset.
      if(button.dataset.esPreset==='study')
        button.disabled=!(s.en&&s.ar&&s.vowels);
    }
    for(const b of root.querySelectorAll('[data-es-toggle]')){
      const key=b.dataset.esToggle;
      b.setAttribute('aria-pressed',String(Boolean(s[key])));
      b.disabled=tab==='reference'||tier==='study'||
        (key==='en'&&s.en&&!s.ar)||(key==='ar'&&s.ar&&!s.en);
      b.hidden=key==='vowels'&&!s.ar;
      if(key==='vowels')b.textContent=s.vowels?'عَ':'ع';
    }
    root.querySelector('.gn-es-language-divider').hidden=!s.ar;
    root.querySelector('[data-es-language-note]').textContent=tab==='reference'?
      'The full scholarly edition is bilingual and vowelled.':
      tier==='study'?'Study notes are currently prebuilt only in vowelled bilingual PDFs.':
      'Select English, Arabic or both; AR vowel marks are optional.';
    root.querySelector('[data-es-preset-note]').textContent=
      !(s.en&&s.ar&&s.vowels)&&tab==='reading'?
        'Study notes are currently published only in bilingual vowelled form; your language choice is preserved.':
      preset==='study'?'Selected publisher notes and a basic index are included.':
      preset==='custom'?'Fine-tune publisher notes and apparatus using Customize edition.':
      'A clean A4 reading edition with no publisher notes.';
    for(const b of root.querySelectorAll('[data-es-publisher]'))
      b.setAttribute('aria-pressed',String(b.dataset.esPublisher===s.notes));
    for(const b of root.querySelectorAll('[data-es-headings]'))
      b.setAttribute('aria-pressed',String(b.dataset.esHeadings===s.headings));
    for(const b of root.querySelectorAll('[data-es-include]')){
      const k=b.dataset.esInclude;
      b.setAttribute('aria-pressed',String(
        k==='glossary'?s.glossary==='technical':
        k==='index'?s.index==='full':s[k]==='on'));
      b.disabled=tier==='reading'&&!s.en;
      if(k==='index')b.querySelector('span').textContent=tier==='study'?'Full index':'Index';
    }
    root.querySelector('[data-es-spec-lead]').textContent=
      (tier==='reference'?'Reference':tier==='study'?'Study':'Reading')+' · '+
      languageLabel(s)+(s.ar?' · '+(s.vowels?'Vowelled':'Unvowelled'):'')+' · Complete work';
    root.querySelector('[data-es-spec-layout]').textContent='A4 · '+
      (s.en&&s.ar?'English left / Arabic right':'Single language')+' · '+
      (tier==='reference'?'Recorded headings + editorial guide':
       s.headings==='editorial'?'Editorial guide':'Recorded headings');
    root.querySelector('[data-es-spec-notes]').textContent=
      'Publisher notes: '+(tier==='reference'?'Full':tier==='study'?'Selected':'None')+
      ' · My notes: '+(root.querySelector('#pe-personal').checked?'On':'Off')+
      ' · Bookmarks: '+(root.querySelector('#pe-bookmarks').checked?'On':'Off');
    root.querySelector('[data-es-spec-apparatus]').textContent='Apparatus: '+apparatusLabel(s);
    root.querySelector('[data-es-count]').textContent=result.status==='ready'?
      result.record.pages+' pages · '+Math.round(Number(result.record.bytes||result.record.size_bytes||0)/1024)+' KB':'';
    const msg=root.querySelector('[data-es-availability-heading]');
    const detail=root.querySelector('[data-es-availability-detail]');
    msg.textContent=result.status==='ready'?'Verified PDF available':
      result.status==='loading'?'Checking published editions…':'PDF not available for this selection';
    detail.textContent=result.status==='ready'?
      'This exact published PDF will be used. Personal notes are never uploaded.':result.reason;
    root.querySelector('.gn-es-availability').dataset.esStatus=result.status;
    const link=root.querySelector('[data-es-action="open"]');
    const pdfFile=publicFile(result);
    selectedRow=result.record;
    selectedFile=pdfFile;
    const mapReady=result.status==='ready'&&(
      tier==='reference'||Boolean(result.record.map_file));
    if(result.status==='ready'){
      link.href=(tier==='reference'?'daruri.pdf':'editions/'+result.record.file)+
        '?v='+encodeURIComponent((result.record.sha256||'published').slice(0,12));
    }else link.removeAttribute('href');
    link.setAttribute('aria-disabled',String(result.status!=='ready'));
    if(personalReady)syncExport(mapReady?pdfFile:'');
    const openVisible=!isPersonal;
    link.hidden=!openVisible;
    const generated=root.querySelector('#pe-generate');
    generated.hidden=openVisible;
    if(isPersonal&&(!mapReady||!personalReady)){
      generated.disabled=true;
      if(!mapReady)detail.textContent='This exact PDF has no verified personal map. Choose another edition; no substitute will be used.';
      else detail.textContent='Preparing browser-local personal PDF tools…';
    }
    root.querySelector('[data-es-study-guide]').hidden=tier!=='study';
    for(const b of root.querySelectorAll('[data-es-picker-mode]')){
      const value=b.dataset.esPickerMode;
      const checked=root.querySelector('input[name="pe-mode"]:checked')?.value;
      b.setAttribute('aria-pressed',String(value===checked));
    }
    remember();
  }
  function presetSelect(which){
    if(which==='study'){
      if(!(current().en&&current().ar&&current().vowels))return;
      tab='reading';tier='study';Object.assign(state.study,BASE.study);
      preset='study';customOpen=false;
    }else if(which==='reading'){
      const prev=current();
      const languageSettings={en:prev.en,ar:prev.ar,vowels:prev.vowels};
      tier='reading';state.reading={...BASE.reading,...languageSettings};
      preset='reading';customOpen=false;
    }else{
      preset='custom';customOpen=true;
    }
    refresh();
  }
  function switchPublisher(profile){
    if(profile===current().notes)return;
    if(profile==='selected'){
      const prev=current();
      if(!(prev.en&&prev.ar&&prev.vowels)){
        // A click is never permitted to secretly replace English/Arabic-only
        // content with bilingual. Explain the exact Study limitation.
        const detail=root.querySelector('[data-es-availability-detail]');
        detail.textContent='Study notes are only published in bilingual vowelled form. Enable EN, AR and vowel marks before choosing Study notes.';
        return;
      }
      tier='study';
      state.study={...BASE.study,...prev,en:true,ar:true,vowels:true,
        notes:'selected',index:prev.index==='full'?'full':'basic'};
    }else{
      const prev=current();
      tier='reading';
      state.reading={...BASE.reading,...prev,notes:'none',
        index:prev.index==='full'?'full':'none'};
    }
    preset='custom';refresh();
  }
  function personalChanged(){
    const personal=hasPersonal();
    const next=personal?(
      root.querySelector('input[name="pe-mode"][value="choose"]').checked?'choose':'all'):'none';
    const radio=root.querySelector('input[name="pe-mode"][value="'+next+'"]');
    if(radio)radio.checked=true;
    root.querySelector('#pe-note-options').hidden=!personal;
    if(personalReady)window.GnammaPersonalExportInline.setMode(next);
    refresh();
  }
  function onClick(event){
    const b=event.target.closest('button');
    if(!b||!root?.contains(b))return;
    if(b.dataset.esNav){
      tab=b.dataset.esNav;
      tier=tab==='reference'?'reference':tier==='reference'?'reading':tier;
      refresh();b.focus();return;
    }
    if(b.dataset.esPreset){presetSelect(b.dataset.esPreset);return;}
    if(b.dataset.esCustom!==undefined){customOpen=!customOpen;refresh();return;}
    if(b.dataset.esToggle){
      if(tab==='reference'||tier==='study')return;
      const s=current(),k=b.dataset.esToggle;
      if(s[k]&&k!=='vowels'&&!s[k==='en'?'ar':'en'])return;
      s[k]=!s[k];
      // English-language appendices have no valid Arabic-only counterpart.
      if(!s.en)Object.assign(s,{glossary:'none',index:'none',applications:'off',concordance:'off'});
      refresh();return;
    }
    if(b.dataset.esPublisher){switchPublisher(b.dataset.esPublisher);return;}
    if(b.dataset.esHeadings){
      current().headings=b.dataset.esHeadings;preset='custom';refresh();return;
    }
    if(b.dataset.esInclude){
      const s=current(),key=b.dataset.esInclude;
      if(!s.en)return;
      if(key==='glossary')s.glossary=s.glossary==='technical'?'none':'technical';
      else if(key==='index')s.index=s.index==='full'?(tier==='study'?'basic':'none'):'full';
      else s[key]=s[key]==='on'?'off':'on';
      preset='custom';refresh();return;
    }
    if(b.dataset.esPickerMode){
      const value=b.dataset.esPickerMode;
      root.querySelector('input[name="pe-mode"][value="'+value+'"]').checked=true;
      if(personalReady)window.GnammaPersonalExportInline.setMode(value);
      refresh();return;
    }
  }
  function onChange(event){
    if(event.target.matches('#pe-personal,#pe-bookmarks'))personalChanged();
    else if(event.target.matches('#pe-dates,#pe-annotations,#pe-order'))refresh();
  }
  function onKey(event){
    const target=event.target.closest('[data-es-nav]');
    if(!target||!root?.contains(target)||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const index=NAV.indexOf(target.dataset.esNav);
    const next=event.key==='Home'?0:event.key==='End'?1:
      (index+(event.key==='ArrowRight'?1:-1)+NAV.length)%NAV.length;
    const control=root.querySelector('[data-es-nav="'+NAV[next]+'"]');
    control.click();control.focus();
  }
  function loadScript(name){
    return new Promise((resolve,reject)=>{
      const url=name+'?v=two-tabs-20261022';
      const el=document.createElement('script');
      el.src=url;el.async=true;
      el.onload=resolve;el.onerror=()=>reject(Error('Unable to load local '+name));
      document.head.append(el);
    });
  }
  async function loadPersonalTools(mounted){
    try{
      // editions.js fully recreates its host on each visit. Bind the shared
      // exporter to the *new* inline form, not detached elements from an older
      // Reading/Study visit.
      if(window.GnammaPersonalExportInline?.ready){
        personalReady=false;
        await window.GnammaPersonalExportInline.remount();
        if(root===mounted){personalReady=true;personalChanged();}
        return;
      }
      if(!window.GnammaPdfUpgrade)
        await loadScript('personal-pdf-enhancements.js');
      if(!window.GnammaPersonalExportInline)
        await loadScript('personal-export.js');
      if(root===mounted&&window.GnammaPersonalExportInline?.ready){
        personalReady=true;personalChanged();
      }
    }catch(error){
      if(root===mounted){
        mounted.querySelector('[data-es-availability-detail]').textContent=
          'Personal PDF tools could not load: '+String(error.message||error)+'. Published PDFs remain available.';
      }
    }
  }
  function mount(main){
    const legacy=main.querySelector('.gn-editions');
    if(!legacy)return;
    main.querySelector('.gn-es')?.remove();
    const holder=document.createElement('div');
    holder.hidden=true;holder.setAttribute('aria-hidden','true');
    holder.className='gn-es-legacy';holder.append(legacy);
    const mounted=document.createElement('div');
    mounted.className='gn-es';mounted.innerHTML=shell();
    main.prepend(mounted);main.append(holder);root=mounted;
    mounted.addEventListener('click',onClick);
    mounted.addEventListener('change',onChange);
    mounted.addEventListener('keydown',onKey);
    document.addEventListener('gnamma-personal-export-ready',()=>{
      if(root!==mounted)return;
      personalReady=true;
      personalChanged();
    });
    refresh();
    const req=++requestId;
    const json=path=>fetch(path,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
    Promise.all([
      json('editions/manifest.json?v=two-tabs-20261022'),
      json('editions/apparatus/manifest.json?v=two-tabs-20261022'),
      json('pdf-editions-manifest.json?v=two-tabs-20261022'),
      json('editions/maps/manifest.json?v=two-tabs-20261022')
    ]).then(([base,extra,canon,maps])=>{
      if(req!==requestId||root!==mounted)return;
      if(base?.status==='verified'&&base.files?.length===12){
        catalog=base.files.filter(row=>/^(reading|study)\/daruri-(reading|study)-(bilingual|bilingual-unvowelled|english|arabic|arabic-vowelled)-titles-(on|off)\.pdf$/.test(row.file)&&
          /^[0-9a-f]{64}$/.test(row.sha256||'')&&Number.isInteger(row.pages));
      }
      baseMaps=maps?.status==='verified'&&maps.files?.length===12?maps.files:null;
      if(catalog&&baseMaps){
        const m=new Map(baseMaps.map(x=>[x.file,x]));
        catalog=catalog.map(row=>{
          const matching=m.get(row.file);
          return matching&&matching.sha256===row.sha256&&matching.verified_sections===258&&
            matching.map_coverage===1?{...row,map_file:matching.map_file,
              metadata_file:matching.metadata_file,map_sha256:matching.map_sha256}:row;
        });
      }
      addon=extra?.status==='verified'&&extra.files?.length===120?
        extra.files.filter(row=>/^[0-9a-f]{64}$/.test(row.sha256||'')&&
          /^[0-9a-f]{64}$/.test(row.map_sha256||'')&&
          row.verified_sections===258&&row.map_coverage===1&&
          catalog?.some(base=>base.file===row.source_base&&base.sha256===row.base_sha256)):null;
      const ref=canon?.files?.['daruri.pdf'];
      reference=ref&&Number.isInteger(ref.pages)&&/^[0-9a-f]{64}$/.test(ref.sha256||'')?ref:null;
      refresh();
    });
    loadPersonalTools(mounted);
  }
  window.GnammaEditions.render=function(main,payload){
    const response=oldRender.call(this,main,payload);
    mount(main);
    return response;
  };
  window.GnammaEditions.__publishedSelector=true;
  window.GnammaEditions.__getPublicationSelection=()=>{
    const found=resolve();
    return {tier,tab,preset,open:customOpen,settings:{...current()},
      resolution:found.status,pdf:publicFile(found),personal:hasPersonal()};
  };
})();
