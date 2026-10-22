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
  // Existing PDFs are retrieved and SHA-256 checked on request, never falsely "generated".
  let preparation={key:'',root:null,controller:null,request:0,busy:false,url:null,error:''};
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
            '<div class="gn-es-text-switches" role="group" aria-label="Edition languages and Arabic vowel marks">'+
              '<div class="gn-es-language-pair" role="group" aria-label="Included languages; activate AR to cycle Off, Plain and Vowelled">'+
                '<button type="button" data-es-toggle="en" aria-label="Include English" aria-pressed="true"><span class="gn-es-language-label" aria-hidden="true">EN</span></button>'+
                '<button type="button" data-es-toggle="ar" data-es-arabic-state="vowelled" aria-label="Arabic: vowelled. Activate to turn off Arabic" aria-pressed="true"><span class="gn-es-language-label" aria-hidden="true">AR</span><small class="gn-es-ar-form" aria-hidden="true">Vowelled</small></button>'+
              '</div>'+
            '</div><span class="gn-es-inline-note" data-es-language-note></span>'+
          '</div></div>'+
        '<div class="gn-es-setting gn-es-presets" data-es-presets>'+
          '<span class="gn-es-setting-label">Start with</span><div class="gn-es-setting-body">'+
            '<div class="gn-es-preset-options" role="group" aria-label="Starting edition">'+
              '<button type="button" class="gn-es-preset" data-es-preset="reading" aria-pressed="true"><strong>Reading</strong><small>Text only</small></button>'+
              '<button type="button" class="gn-es-preset" data-es-preset="study" aria-pressed="false"><strong>Study</strong><small>Notes + index</small></button>'+
              '<button type="button" class="gn-es-preset" data-es-preset="custom" aria-pressed="false"><strong>Customize</strong><small>Other options</small></button>'+
            '</div><span class="gn-es-inline-note" data-es-preset-note></span></div>'+
        '</div>'+
        '<div class="gn-es-custom-head" data-es-custom-head hidden>'+
          '<button type="button" class="gn-es-custom-trigger" data-es-custom aria-expanded="false" aria-controls="gn-es-custom">'+
          '<span>Custom edition settings</span>'+icon('chevron','gn-es-custom-arrow')+'</button></div>'+
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
            '<div class="gn-es-spec-head"><strong>Your selected edition</strong><span data-es-count></span></div>'+
            '<p class="gn-es-spec-lead" data-es-spec-lead></p>'+
            '<p class="gn-es-spec-layout" data-es-spec-layout></p>'+
            '<details class="gn-es-spec-detail"><summary>What’s included</summary>'+
              '<p class="gn-es-spec-notes" data-es-spec-notes></p>'+
              '<p class="gn-es-spec-apparatus" data-es-spec-apparatus></p></details>'+
          '</section>'+
          '<section class="gn-es-availability" aria-live="polite" aria-atomic="true">'+
            '<strong data-es-availability-heading>Checking PDF selection…</strong><p data-es-availability-detail></p></section>'+
          '<div id="pe-alert" class="gn-es-inline-alert" role="status" hidden></div>'+
          '<p id="pe-description" class="gn-es-inline-note" hidden></p>'+
          '<div class="gn-es-actions">'+
            '<button type="button" class="gn-es-action gn-es-action-primary" id="gn-es-prepare" data-es-prepare>'+
              '<span data-es-prepare-label>Prepare PDF</span><progress data-es-prepare-progress aria-label="PDF retrieval and verification progress" max="100" value="0" hidden></progress></button>'+
            '<a class="gn-es-action gn-es-action-primary" data-es-action="download" download hidden>Download PDF</a>'+
            '<a class="gn-es-action gn-es-action-secondary" data-es-action="open" aria-label="Open existing published PDF in browser" target="_blank" rel="noopener noreferrer">'+icon('eye')+'<span>Open existing PDF</span></a>'+
            '<button class="gn-es-action gn-es-action-primary" type="submit" id="pe-generate" hidden disabled>Create my PDF</button>'+
          '</div><p id="gn-es-prepare-status" class="gn-es-prepare-status" role="status" hidden></p>'+
          '<a id="pe-clean" hidden></a>'+
          '<div id="pe-progress" hidden role="status" aria-live="polite">'+
            '<span id="pe-progress-text"></span><progress id="pe-bar" max="100" value="0"></progress></div>'+
          '<div id="pe-result" class="gn-es-export-result" hidden>'+
            '<strong>Your personal PDF is prepared.</strong>'+
            '<div class="gn-es-export-result-actions">'+
              '<a id="pe-result-link" download>Download my PDF</a>'+
              '<a id="pe-open" target="_blank" rel="noopener">Open / print PDF</a>'+
              '<button type="button" id="pe-share" hidden>Share on this device</button>'+
            '</div></div>'+
        '</form>'+
      '</section>'+
      '<section class="gn-es-offline" aria-labelledby="gn-es-offline-title">'+
        '<h2 id="gn-es-offline-title">Offline reader · HTML</h2>'+
        '<p>Download the reading website, dictionary, fonts and supporting files. This is not a PDF, and your private Reading Desk notes are not included.</p>'+
        '<button type="button" class="gn-es-offline-download" data-daruri-bundle="html">Download HTML reader (.zip)</button>'+
        '<details class="gn-es-offline-more"><summary>Also need the PDFs offline?</summary>'+
          '<p>Download the same HTML reader with the available book PDFs. This is a much larger archive.</p>'+
          '<button type="button" class="gn-es-offline-download gn-es-offline-secondary" data-daruri-bundle="full">Download HTML + PDFs (.zip)</button>'+
        '</details>'+
        '<p class="gn-offline-bundle-status" role="status" aria-live="polite"></p>'+
        '<p class="gn-es-offline-footnote">Unzip without moving individual files. For complete functionality on desktop, open the folder using a local web server; opening file:// directly can restrict browser features. No internet is needed when served locally.</p>'+
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
  // The published-file workflow is a real download and SHA-256 verification,
  // not a simulated PDF generator. Future on-demand rendering can use this
  // preparation boundary without changing the reader-facing action flow.
  function clearPreparation(nextKey=''){
    if(preparation.controller)preparation.controller.abort();
    if(preparation.url)URL.revokeObjectURL(preparation.url);
    preparation={key:nextKey,root,controller:null,request:preparation.request+1,
      busy:false,url:null,error:''};
  }
  function syncPreparation(found,isPersonal,file){
    const key=file+'@'+(found.record?.sha256||'');
    if(preparation.key!==key||preparation.root!==root)clearPreparation(key);
    const prepare=root.querySelector('#gn-es-prepare');
    const download=root.querySelector('[data-es-action="download"]');
    const open=root.querySelector('[data-es-action="open"]');
    const bar=prepare.querySelector('[data-es-prepare-progress]');
    const status=root.querySelector('#gn-es-prepare-status');
    prepare.hidden=isPersonal||!!preparation.url;
    prepare.disabled=found.status!=='ready'||preparation.busy;
    prepare.setAttribute('aria-busy',String(preparation.busy));
    prepare.querySelector('[data-es-prepare-label]').textContent=
      preparation.busy?'Preparing PDF…':'Prepare PDF';
    bar.hidden=!preparation.busy;
    download.hidden=isPersonal||!preparation.url;
    if(preparation.url){
      download.href=preparation.url;
      download.download=(file.split('/').pop()||'daruri.pdf').replace(/[^a-z0-9._-]/gi,'_');
    }else download.removeAttribute('href');
    open.hidden=isPersonal;
    status.hidden=!preparation.error;
    status.textContent=preparation.error;
  }
  async function prepareExistingPDF(){
    const host=root,found=resolve(),file=publicFile(found);
    if(!host?.isConnected||found.status!=='ready'||!file||hasPersonal())return;
    const key=file+'@'+(found.record?.sha256||'');
    if(preparation.key!==key||preparation.root!==host)clearPreparation(key);
    if(preparation.busy||preparation.url)return;
    const original=host.querySelector('[data-es-action="open"]').getAttribute('href');
    if(!original)return;
    const abort=new AbortController(),serial=++preparation.request;
    const stillCurrent=()=>host.isConnected&&host===root&&
      preparation.request===serial&&preparation.key===key;
    preparation.controller=abort;preparation.busy=true;preparation.error='';
    const progress=host.querySelector('[data-es-prepare-progress]');
    progress.hidden=false;progress.removeAttribute('value');
    syncPreparation(found,false,file);
    try{
      const response=await fetch(new URL(original,document.baseURI),{
        cache:'no-store',credentials:'same-origin',signal:abort.signal
      });
      if(!response.ok)throw Error('PDF request failed (HTTP '+response.status+').');
      const expectedLength=Number(response.headers.get('Content-Length'))||0;
      if(expectedLength>100*1024*1024)throw Error('Selected PDF exceeds the browser preparation limit.');
      let bytes;
      if(response.body?.getReader){
        const reader=response.body.getReader(),chunks=[];let received=0;
        if(expectedLength){progress.max=expectedLength;progress.value=0;}
        while(true){
          const {done,value}=await reader.read();
          if(done)break;
          if(!stillCurrent()){await reader.cancel();return;}
          received+=value.length;
          if(received>100*1024*1024)throw Error('Selected PDF is unexpectedly large.');
          chunks.push(value);
          if(expectedLength)progress.value=Math.min(received,expectedLength);
        }
        bytes=new Uint8Array(received);let offset=0;
        for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      }else bytes=new Uint8Array(await response.arrayBuffer());
      if(!stillCurrent())return;
      if(bytes.length<5||String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')
        throw Error('The selected file is not a PDF.');
      const expected=String(found.record?.sha256||'').toLowerCase();
      if(!/^[a-f0-9]{64}$/.test(expected))
        throw Error('The publication does not have a verified SHA-256 checksum.');
      if(!crypto?.subtle?.digest)
        throw Error('PDF verification is unavailable in this browser. Use Open existing PDF.');
      progress.removeAttribute('value'); // Actual hash verification is indeterminate.
      const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.buffer));
      const actual=Array.from(hash,byte=>byte.toString(16).padStart(2,'0')).join('');
      if(actual!==expected)throw Error('PDF verification failed; no download was prepared.');
      if(!stillCurrent())return;
      preparation.url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    }catch(error){
      if(stillCurrent()&&error?.name!=='AbortError')
        preparation.error=String(error?.message||error)+
          ' You can still open the published PDF directly.';
    }finally{
      if(stillCurrent()){
        preparation.busy=false;preparation.controller=null;
        syncPreparation(found,false,file);
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
    root.querySelector('[data-es-presets]').hidden=tab==='reference';
    root.querySelector('[data-es-custom-head]').hidden=tab==='reference'||preset!=='custom';
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
      b.disabled=tab==='reference'||tier==='study'||(key==='en'&&s.en&&!s.ar);
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
    root.querySelector('[data-es-language-note]').textContent=tab==='reference'?
      'The full scholarly edition is bilingual and vowelled.':
      tier==='study'?'Study notes are currently prebuilt only in vowelled bilingual PDFs.':
      'Tap AR to cycle: Off → Plain → Vowelled. No separate vowel button.';
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
      ' · Bookmarks: '+(root.querySelector('#pe-bookmarks').checked?'On':'Off')+
      ' · Highlights: '+(root.querySelector('#pe-highlights').checked?'On':'Off');
    root.querySelector('[data-es-spec-apparatus]').textContent='Apparatus: '+apparatusLabel(s);
    root.querySelector('[data-es-count]').textContent=result.status==='ready'?
      result.record.pages+' pages · '+Math.round(Number(result.record.bytes||result.record.size_bytes||0)/1024)+' KB':'';
    const msg=root.querySelector('[data-es-availability-heading]');
    const detail=root.querySelector('[data-es-availability-detail]');
    const availability=root.querySelector('.gn-es-availability');
    availability.hidden=result.status==='ready';
    msg.textContent=result.status==='loading'?'Checking PDF selection…':'PDF unavailable for this selection';
    detail.textContent=result.reason||'';
    availability.dataset.esStatus=result.status;
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
    syncPreparation(result,isPersonal,pdfFile);
    const openVisible=!isPersonal;
    const generated=root.querySelector('#pe-generate');
    generated.hidden=openVisible;
    if(isPersonal&&(!mapReady||!personalReady)){
      generated.disabled=true;
      availability.hidden=false;
      msg.textContent=!mapReady?'Personal PDF cannot be prepared':'Preparing personal PDF tools…';
      detail.textContent=!mapReady?
        'This edition has no verified map for personal notes. Choose another selection.':
        'Personal notes are processed on your device, not uploaded.';
    }
    // Study Guide is a separate teaching companion, linked from its own Study Guide page.
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
    if(b.dataset.esPrepare!==undefined){void prepareExistingPDF();return;}
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
    if(preparation.controller)preparation.controller.abort();
    if(preparation.url)URL.revokeObjectURL(preparation.url);
    preparation={key:'',root:null,controller:null,request:preparation.request+1,busy:false,url:null,error:''};
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
