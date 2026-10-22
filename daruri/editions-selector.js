/* Daruri Editions: two reader-facing tabs, with Reading/Study profiles under
   one tab and canonical scholarly Reference under the other.
   Every PDF resolves to a SHA-verified prebuilt file. Personal content is
   exported by the existing PDF engine, mounted inline and never uploaded. */
(() => {
  'use strict';
  if(!window.GnammaEditions||window.GnammaEditions.__publishedSelector)return;
  const oldRender=window.GnammaEditions.render;
  const NAV=['pdf','offline'];
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
  let tier='reading',preset='reading',tab='pdf',customOpen=false;
  let catalog=null,addon=null,reference=null,baseMaps=null,root=null,requestId=0;
  let personalReady=false,selectedFile='',selectedRow=null;
  let preparedPdf=null,preparing=false,prepareAbort=null,downloadError='';
  const esc=value=>String(value??'').replace(/[&<>"']/g,
    c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iconPaths={
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    note:'<rect x="3.6" y="3.5" width="16" height="17" rx="2"/><path d="M7 8h7M7 11h4"/><path d="m11.6 16.9 5.3-5.3 2 2-5.3 5.3-2.8.8zM15.9 12.6l2 2"/>',
    highlight:'<path d="m15 4 5 5M4 20l4-.5L20 7a3 3 0 0 0-4-4L4 15z"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
    glossary:'<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h4"/>',
    index:'<path d="M7 5h13M7 12h13M7 19h13M3 5h1M3 12h1M3 19h1"/>',
    applications:'<path d="M12 3v18M4 7h16M6 7l-4 7h8l-4-7ZM18 7l-4 7h8l-4-7ZM8 21h8"/>',
    concordance:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>'
  };
  const icon=(key,cls='')=>{
    const shared=window.GnammaBookmarkUI;
    if(key==='note'&&shared?.noteIcon)return shared.noteIcon();
    if(key==='highlight'&&shared?.highlightIcon)return shared.highlightIcon();
    return '<svg'+(cls?' class="'+esc(cls)+'"':'')+
      ' aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+iconPaths[key]+'</svg>';
  };
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
      else if(raw.tab==='reference'||raw.tab==='reading')tab='pdf';
      if(['reading','study','reference'].includes(raw.tier))tier=raw.tier;
      if(['reading','study','custom'].includes(raw.preset))preset=raw.preset;
      customOpen=Boolean(raw.customOpen);
      if(!current().en&&!current().ar)current().en=true;
      if(raw.tab==='reference')tier='reference';
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
      '<header class="gn-es-header"><h1 id="gn-es-title" tabindex="-1">Download a copy</h1><p>Choose a PDF edition or download the offline HTML reader.</p></header>'+
      '<div class="gn-es-edition-tabs" role="tablist" aria-label="Download format">'+
        '<button type="button" class="gn-es-tab" id="gn-es-tab-pdf" role="tab" aria-controls="gn-es-panel" data-es-nav="pdf" aria-selected="true">PDF editions</button>'+
        '<button type="button" class="gn-es-tab" id="gn-es-tab-offline" role="tab" aria-controls="gn-es-panel" data-es-nav="offline" aria-selected="false">Offline reader</button>'+
      '</div>'+
      '<section id="gn-es-panel" role="tabpanel" tabindex="0" aria-labelledby="gn-es-tab-pdf">'+
      '<div data-es-pdf-panel>'+
        '<div class="gn-es-setting gn-es-presets" data-es-presets>'+
          '<span class="gn-es-setting-label">PDF edition</span><div class="gn-es-setting-body">'+
            '<div class="gn-es-preset-options" role="group" aria-label="Starting edition">'+
              '<button type="button" class="gn-es-preset" data-es-preset="reading" aria-pressed="true"><strong>Reading</strong><small>Clean text</small></button>'+
              '<button type="button" class="gn-es-preset" data-es-preset="study" aria-pressed="false"><strong>Study</strong><small>Explanatory notes</small></button>'+
              '<button type="button" class="gn-es-preset" data-es-preset="reference" aria-pressed="false"><strong>Reference</strong><small>Full apparatus</small></button>'+
            '</div><span class="gn-es-inline-note" data-es-preset-note></span></div>'+
        '</div>'+
        '<div class="gn-es-setting gn-es-setting-text">'+
          '<span class="gn-es-setting-label">Language</span>'+
          '<div class="gn-es-setting-body">'+
            '<div class="gn-es-text-switches" role="group" aria-label="Edition languages and Arabic vowel marks">'+
              '<div class="gn-es-language-pair" role="group" aria-label="Included languages; activate AR to cycle Off, Plain and Vowelled">'+
                '<button type="button" data-es-toggle="en" aria-label="Include English" aria-pressed="true"><span class="gn-es-language-label" aria-hidden="true">EN</span></button>'+
                '<button type="button" data-es-toggle="ar" data-es-arabic-state="vowelled" aria-label="Arabic: vowelled. Activate to turn off Arabic" aria-pressed="true"><span class="gn-es-language-label" aria-hidden="true">AR</span><small class="gn-es-ar-form" aria-hidden="true">Vowelled</small></button>'+
              '</div>'+
            '</div><span class="gn-es-inline-note" data-es-language-note></span>'+
          '</div></div>'+
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
            '<span class="gn-es-setting-label">Personal additions</span>'+
            '<div class="gn-es-setting-body">'+
              '<div class="gn-es-personal-options">'+
                '<label class="gn-es-personal-choice">'+icon('note')+'<input type="checkbox" id="pe-personal"><span>My notes</span></label>'+
                '<label class="gn-es-personal-choice">'+icon('bookmark')+'<input type="checkbox" id="pe-bookmarks"><span>Bookmarks</span></label>'+
                '<label class="gn-es-personal-choice">'+icon('highlight')+'<input type="checkbox" id="pe-highlights"><span>Highlights</span></label>'+
              '</div><span class="gn-es-inline-note">Choose your own notes, bookmarks and highlights separately. Publisher notes are unaffected; your additions stay on this device.</span>'+
              '<div id="pe-note-options" hidden>'+
                '<div class="gn-es-personal-advanced">'+
                  '<label><input id="pe-annotations" type="checkbox" checked> Add in-text P links and mark matching quotations</label>'+ 
                   '<span class="gn-es-inline-note">PDF presentation only; this does not select your notes, bookmarks or highlights. Quotations are marked only where locations are verified.</span>'+
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
            '<div class="gn-es-spec-head"><strong>Your PDF</strong><span data-es-count></span></div>'+
            '<p class="gn-es-spec-lead" data-es-spec-lead></p>'+
            '<details class="gn-es-spec-more"><summary>PDF details</summary>'+
              '<p class="gn-es-spec-layout" data-es-spec-layout></p>'+
              '<p class="gn-es-spec-notes" data-es-spec-notes></p>'+
              '<p class="gn-es-spec-apparatus" data-es-spec-apparatus></p>'+
            '</details>'+
          '</section>'+
          '<section class="gn-es-availability" aria-live="polite" aria-atomic="true">'+
            '<strong data-es-availability-heading>Checking PDF options…</strong><p data-es-availability-detail></p></section>'+
          '<div id="pe-alert" class="gn-es-inline-alert" role="status" hidden></div>'+
          '<p id="pe-description" class="gn-es-inline-note" hidden></p>'+
          '<div class="gn-es-actions">'+
            '<button type="button" class="gn-es-action gn-es-action-primary" data-es-prepare>Prepare PDF<span class="gn-es-button-progress" hidden><progress max="100" value="0" aria-label="PDF transfer progress"></progress></span></button>'+
            '<a class="gn-es-action gn-es-action-primary" data-es-action="open" aria-label="Download prepared PDF" download hidden><span>Download PDF</span></a>'+
            '<a class="gn-es-action gn-es-action-secondary" data-es-action="view" aria-label="Open prepared PDF" target="_blank" rel="noopener noreferrer" hidden>Open PDF</a>'+
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
      '</div>'+
      '<section class="gn-es-offline" data-es-offline hidden aria-label="Download the offline HTML reader">'+
        '<h2>Offline reader (HTML)</h2>'+
        '<p>Download the Arabic–English reader, dictionary and supporting files. Extract the ZIP, then open <strong>daruri/index.html</strong> in a desktop browser.</p>'+
        '<div class="gn-es-offline-download"><a class="gn-es-action gn-es-action-primary" data-daruri-bundle="html" href="https://github.com/gnamma-research/booksite/archive/refs/heads/master.zip">Download offline reader (ZIP)</a><span class="gn-offline-bundle-status" role="status" aria-live="polite"></span></div>'+
        '<p class="gn-es-offline-caveat">This download excludes PDFs. Local HTML behaviour varies by browser; external references and online services still need internet access. On iPhone or iPad, an installed website is generally more reliable than opening an HTML file from Files.</p>'+
        '<details class="gn-es-offline-more"><summary>Need the PDFs too?</summary><p>The complete archive is larger and contains the reader and published PDFs.</p><div class="gn-es-offline-download"><a class="gn-es-action" data-daruri-bundle="full" href="https://github.com/gnamma-research/booksite/archive/refs/heads/master.zip">Download HTML and PDFs (ZIP)</a><span class="gn-offline-bundle-status" role="status" aria-live="polite"></span></div></details>'+
      '</section>'+
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
      root?.querySelector('#pe-bookmarks')?.checked||
      root?.querySelector('#pe-highlights')?.checked);
  }
  function syncExport(file){
    const bridge=window.GnammaPersonalExportInline;
    if(!bridge?.ready)return false;
    return bridge.choose(file);
  }
  function resetPrepared(){
    if(prepareAbort){prepareAbort.abort();prepareAbort=null;}
    preparing=false;
    downloadError='';
    if(preparedPdf){URL.revokeObjectURL(preparedPdf.url);preparedPdf=null;}
  }
  function pdfName(file){
    return file.split('/').pop().replace(/[^a-zA-Z0-9._-]/g,'_');
  }
  async function preparePdf(){
    const selection=resolve(),file=publicFile(selection);
    if(preparing||tab!=='pdf'||hasPersonal()||selection.status!=='ready'||!file)return;
    if(preparedPdf&&preparedPdf.file===file){refresh();return;}
    resetPrepared();
    const controller=new AbortController();
    prepareAbort=controller;
    preparing=true;
    const button=root.querySelector('[data-es-prepare]');
    const meter=button.querySelector('progress');
    meter.value=0;meter.removeAttribute('value'); // Unknown until real transfer bytes arrive.
    refresh();
    try{
      const expected=Number(selection.record.bytes||selection.record.size_bytes||0);
      const url=file+'?v='+encodeURIComponent((selection.record.sha256||'published').slice(0,12));
      const response=await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'same-origin'});
      if(!response.ok)throw Error('The selected PDF could not be retrieved (HTTP '+response.status+').');
      const size=Number(response.headers.get('content-length'))||expected;
      const chunks=[];
      let loaded=0;
      if(response.body&&response.body.getReader){
        const reader=response.body.getReader();
        while(true){
          const {done,value}=await reader.read();
          if(done)break;
          chunks.push(value);loaded+=value.length;
          if(size>0){
            meter.value=Math.min(100,Math.floor(100*loaded/size));
            meter.setAttribute('aria-valuetext',Math.floor(100*loaded/size)+'% downloaded');
          }
        }
      }else{
        const buf=new Uint8Array(await response.arrayBuffer());
        chunks.push(buf);loaded=buf.length;
      }
      const bytes=new Uint8Array(loaded);
      let offset=0;
      for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      if(expected&&loaded!==expected)throw Error('The published PDF size did not match its catalogue.');
      if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')
        throw Error('The downloaded file was not a PDF.');
      const sha=String(selection.record.sha256||'').toLowerCase();
      if(/^[a-f0-9]{64}$/.test(sha)&&window.crypto?.subtle){
        const hash=await window.crypto.subtle.digest('SHA-256',bytes);
        const actual=Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
        if(actual!==sha)throw Error('The PDF checksum did not match this edition. Reload and try again.');
      }
      if(controller.signal.aborted||root?.querySelector('[data-es-prepare]')!==button||
         selectedFile!==file)return;
      const objectURL=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
      preparedPdf={file,url:objectURL,name:pdfName(file)};
    }catch(error){
      if(!controller.signal.aborted)downloadError=String(error?.message||error);
    }finally{
      if(prepareAbort===controller){
        prepareAbort=null;preparing=false;
        if(meter)meter.value=100;
        refresh();
      }
    }
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
    root.querySelector('[data-es-pdf-panel]').hidden=tab!=='pdf';
    root.querySelector('[data-es-offline]').hidden=tab!=='offline';
    root.querySelector('.gn-es-setting-text').hidden=tier==='reference';
    root.querySelector('[data-es-custom-head]').hidden=tier==='reference';
    root.querySelector('#gn-es-custom').hidden=tier==='reference'||!customOpen;
    root.querySelector('[data-es-custom]').setAttribute('aria-expanded',String(customOpen&&tier!=='reference'));
    root.querySelector('[data-es-reference-inventory]').hidden=tier!=='reference';
    for(const button of root.querySelectorAll('[data-es-preset]')){
      button.setAttribute('aria-pressed',String(button.dataset.esPreset===tier));
      button.disabled=false;
    }
    for(const b of root.querySelectorAll('[data-es-toggle]')){
      const key=b.dataset.esToggle;
      b.setAttribute('aria-pressed',String(Boolean(s[key])));
      b.disabled=tier==='reference'||tier==='study'||(key==='en'&&s.en&&!s.ar);
      if(key==='ar'){
        const status=!s.ar?'off':s.vowels?'vowelled':'plain';
        const next=!s.ar?'plain':s.vowels?(s.en?'off':'plain'):'vowelled';
        b.dataset.esArabicState=status;
        b.querySelector('.gn-es-ar-form').textContent=status==='plain'?'Plain':status==='vowelled'?'Vowelled':'Off';
        b.setAttribute('aria-label','Arabic: '+status+'. Activate for '+next+' Arabic.');
        b.title='AR: '+status+'. Next: '+next+'. Cycle Off → Plain → Vowelled.';
      }
      if(key==='en')b.setAttribute('aria-label',s.en?'English included. Activate to remove English.':'English off. Activate to include English.');
    }
    root.querySelector('[data-es-language-note]').textContent=tier==='reference'?
      'The full scholarly edition is bilingual and vowelled.':
      tier==='study'?'Study notes are currently prebuilt only in vowelled bilingual PDFs.':
      'Tap AR to cycle: Off → Plain → Vowelled. No separate vowel button.';
    root.querySelector('[data-es-preset-note]').textContent=
      tier==='reference'?'The full scholarly text with its complete reference apparatus.':
      tier==='study'?'Guided reading with selected published explanatory notes and a basic index.':
      'Clean reading text without publisher notes. Expand Customize edition for more options.';
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
      ' · Bookmarks: '+(root.querySelector('#pe-bookmarks').checked?'On':'Off')+
      ' · Highlights: '+(root.querySelector('#pe-highlights').checked?'On':'Off');
    root.querySelector('[data-es-spec-apparatus]').textContent='Apparatus: '+apparatusLabel(s);
    root.querySelector('[data-es-count]').textContent=result.status==='ready'?
      result.record.pages+' pages · '+Math.round(Number(result.record.bytes||result.record.size_bytes||0)/1024)+' KB':'';
    const msg=root.querySelector('[data-es-availability-heading]');
    const detail=root.querySelector('[data-es-availability-detail]');
    const availability=root.querySelector('.gn-es-availability');
    availability.hidden=result.status==='ready'&&!downloadError;
    msg.textContent=downloadError?'Could not prepare the PDF':
      result.status==='loading'?'Finding the selected PDF…':'PDF unavailable';
    detail.textContent=downloadError||result.reason;
    availability.dataset.esStatus=result.status;
    const link=root.querySelector('[data-es-action="open"]');
    const view=root.querySelector('[data-es-action="view"]');
    const prepare=root.querySelector('[data-es-prepare]');
    const pdfFile=publicFile(result);
    if(selectedFile&&selectedFile!==pdfFile)resetPrepared();
    selectedRow=result.record;
    selectedFile=pdfFile;
    const mapReady=result.status==='ready'&&(
      tier==='reference'||Boolean(result.record.map_file));
    const downloadReady=Boolean(preparedPdf&&preparedPdf.file===pdfFile);
    if(downloadReady){
      link.href=preparedPdf.url;
      link.download=preparedPdf.name;
      view.href=preparedPdf.url;
    }else{
      link.removeAttribute('href');
      view.removeAttribute('href');
    }
    link.hidden=!downloadReady||isPersonal;
    view.hidden=!downloadReady||isPersonal;
    prepare.hidden=isPersonal||downloadReady;
    prepare.disabled=preparing||result.status!=='ready';
    prepare.firstChild.textContent=preparing?'Preparing PDF…':'Prepare PDF';
    prepare.querySelector('.gn-es-button-progress').hidden=!preparing;
    if(personalReady)syncExport(mapReady?pdfFile:'');
    const generated=root.querySelector('#pe-generate');
    generated.hidden=!isPersonal;
    if(isPersonal&&(!mapReady||!personalReady)){
      generated.disabled=true;
      if(!mapReady){
        availability.hidden=false;
        msg.textContent='Personal PDF unavailable';
        detail.textContent='No verified note-to-page map exists for this combination. Select another edition.';
      }else{
        availability.hidden=false;
        msg.textContent='Loading personal PDF tools';
        detail.textContent='Your notes stay on this device.';
      }
    }
    for(const b of root.querySelectorAll('[data-es-picker-mode]')){
      const value=b.dataset.esPickerMode;
      const checked=root.querySelector('input[name="pe-mode"]:checked')?.value;
      b.setAttribute('aria-pressed',String(value===checked));
    }
    remember();
  }
  function presetSelect(which){
    if(which==='study'){
      tier='study';
      state.study={...BASE.study};
      preset='study';customOpen=false;
    }else if(which==='reading'){
      tier='reading';
      // The default is a clean reading copy; retain the reader's chosen languages.
      const prev=state.reading;
      state.reading={...BASE.reading,en:prev.en,ar:prev.ar,vowels:prev.vowels};
      preset='reading';customOpen=false;
    }else if(which==='reference'){
      tier='reference';
      preset='reference';customOpen=false;
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
        detail.textContent='Study notes require bilingual vowelled text. Enable EN, then tap AR until it says Vowelled.';
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
      refresh();b.focus();return;
    }
    if(b.dataset.esPreset){presetSelect(b.dataset.esPreset);return;}
    if(b.dataset.esCustom!==undefined){customOpen=!customOpen;refresh();return;}
    if(b.matches('[data-es-prepare]')){preparePdf();return;}
    if(b.dataset.esToggle){
      if(tier==='reference'||tier==='study')return;
      const s=current(),k=b.dataset.esToggle;
      if(k==='ar'){
        // A single AR control cycles Off → Plain → Vowelled.
        // Arabic-only settings cannot turn off their sole language.
        if(!s.ar){s.ar=true;s.vowels=false;}
        else if(!s.vowels)s.vowels=true;
        else if(s.en){s.ar=false;s.vowels=false;}
        else s.vowels=false;
      }else if(k==='en'){
        if(s.en&&!s.ar)return; // One language must remain enabled.
        s.en=!s.en;
      }
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
    if(event.target.matches('#pe-personal,#pe-bookmarks,#pe-highlights'))personalChanged();
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
      const url=name+'?v=20261023-annotations';
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
    resetPrepared();
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
