/* Daruri Editions & Printing. Real source data, browser-local settings and
   browser print/Save as PDF. No third-party PDF service or user-data upload.
   Scholarly reference remains a fixed published edition. */
(() => {
  'use strict';
  const KEYS=['reading','study'];
  const PARTS=[
    {id:'intro',label:'Introduction · §§1–9',ar:'المقدمة',from:1,to:9},
    {id:'rulings',label:'Part I · Rulings · §§10–61',ar:'الأحكام',from:10,to:61},
    {id:'sources',label:'Part II · Sources · §§62–147',ar:'الأصول',from:62,to:147},
    {id:'derivation',label:'Part III · Derivation · §§148–229',ar:'الاستنباط',from:148,to:229},
    {id:'authority',label:'Part IV · Juristic authority · §§230–258',ar:'الاجتهاد والتقليد',from:230,to:258}
  ];
  const defaults={
    reading:{language:'bilingual',columns:'parallel',vowels:true,density:'balanced',editorial:false,notes:'none',personal:'none',scope:'full',part:'rulings',lesson:'purpose',from:1,to:9},
    study:{language:'bilingual',columns:'parallel',vowels:true,density:'comfortable',editorial:true,notes:'study',personal:'none',scope:'full',part:'rulings',lesson:'purpose',from:1,to:9}
  };
  const memory=Object.fromEntries(KEYS.map(key=>[key,{...defaults[key]}]));
  let book=null,host=null;
  let sectionByNumber=new Map(), noteById=new Map(), lessons=[];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const attr=esc;
  const paths={
    book:'<path d="M12 6c-3-2-6-2-9-2v14c3 0 6 0 9 2 3-2 6-2 9-2V4c-3 0-6 0-9 2Z"/><path d="M12 6v14"/>',
    notes:'<path d="M5 3h14v18l-4-3-4 3-3-3-3 3V3Z"/><path d="M9 8h6M9 12h6"/>',
    library:'<path d="M4 5h5v15H4zM10 3h5v17h-5zM16 7h4v13h-4z"/>',
    pen:'<path d="m4 20 4-1 11-11-3-3L4 16zM13 6l4 4"/>',
    printer:'<path d="M6 8V3h12v5M6 17H4V9h16v8h-2M7 14h10v7H7zM17 11h.01"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    download:'<path d="M12 3v12M7 10l5 5 5-5M4 18v3h16v-3"/>',
    open:'<path d="M13 5h6v6M19 5l-9 9"/><path d="M19 13v6H5V5h6"/>',
    settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="2.5" fill="currentColor" stroke="none"/>'
  };
  const svg=name=>'<svg class="gn-ed-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
  const link=(href,label,name='open',download=false)=>'<a href="'+attr(href)+'" '+
    (download?'download ':'target="_blank" rel="noopener noreferrer" ')+
    'class="gn-ed-action" aria-label="'+attr(label)+'" data-ep-info-kind="PDF" data-ep-info-label="'+attr(label)+'">'+svg(name)+'</a>';
  const pdfActions=(href,title)=>'<div class="gn-ed-pdf-actions">'+link(href,'Read '+title,'open')+
    link(href,'Download '+title,'download',true)+'</div>';
  function showInfo(kind,value,detail='') {
    const region=host?.querySelector('.gn-editions');
    if(!region)return;
    const a=region.querySelector('[data-ep-info-kind]');
    const b=region.querySelector('[data-ep-info-value]');
    const d=region.querySelector('[data-ep-info-detail]');
    if(a)a.textContent=kind;
    if(b)b.textContent=value;
    if(d)d.textContent=detail;
  }
  const select=(tier,key,items)=>'<select data-ep-control="'+key+'" id="ep-'+tier+'-'+key+'">'+
    items.map(([value,label])=>'<option value="'+attr(value)+'"'+(String(memory[tier][key])===String(value)?' selected':'')+'>'+esc(label)+'</option>').join('')+'</select>';
  const field=(tier,label,key,choices)=>'<label class="gn-ed-field"><span class="gn-ed-field-name">'+label+'</span>'+select(tier,key,choices)+'</label>';
  const languages=[['bilingual','Arabic + English'],['english','English only'],['arabic','Arabic only']];
  const columns=[['parallel','Side by side / two columns'],['stacked','Stacked / one column'],['2','Two reading columns'],['1','One reading column']];
  const density=[['comfortable','Comfortable · 17 mm margins'],['balanced','Balanced · 13 mm margins'],['compact','Compact · 11 mm margins']];
  const scope=[['full','Entire work · §§1–258'],['part','One major part'],['lesson','Study Guide lesson'],['range','Section range']];
  const noteChoices={
    reading:[['none','None (shortest)'],['essential','Essential clarifications only']],
    study:[['none','None'],['essential','Essential clarifications'],['study','Study notes and Qurʾān sources']]
  };
  const personalChoices=[['none','None (default)'],['notes','My notes'],['all','My notes and bookmarks']];
  const toggleEditorial=(tier)=>'<label class="gn-ed-toggle"><input data-ep-control="editorial" type="checkbox" '+
    (memory[tier].editorial?'checked ':'')+'/><span class="gn-ed-field-name"><strong>Include editorial section titles</strong></span></label>';
  const controls=tier=>'<div class="gn-ed-config" data-ep-tier="'+tier+'">'+
    '<div class="gn-ed-fields">'+
    field(tier,'Language','language',languages)+
    field(tier,'Column arrangement','columns',columns)+
    field(tier,'Page density','density',density)+
    field(tier,'Notes','notes',noteChoices[tier])+
    field(tier,'Reading Desk · private material','personal',personalChoices)+
    field(tier,'What to print','scope',scope)+
    '<label class="gn-ed-toggle gn-ed-vowels"><input data-ep-control="vowels" type="checkbox" '+(memory[tier].vowels?'checked ':'')+
    '/><span>Arabic with editorial vowel marks</span></label>'+
    toggleEditorial(tier)+
    '</div>'+
    '<div class="gn-ed-range" data-ep-range="part">'+field(tier,'Major part','part',PARTS.map(x=>[x.id,x.label]))+'</div>'+
    '<div class="gn-ed-range" data-ep-range="lesson">'+field(tier,'Course lesson','lesson',lessons.map(x=>[x.id,'Question '+x.number+' · '+x.title]))+'</div>'+
    '<div class="gn-ed-range gn-ed-pair" data-ep-range="range">'+
      '<label class="gn-ed-field"><span>From §</span><input data-ep-control="from" type="number" min="1" max="258" value="'+memory[tier].from+'"></label>'+
      '<label class="gn-ed-field"><span>Through §</span><input data-ep-control="to" type="number" min="1" max="258" value="'+memory[tier].to+'"></label>'+
    '</div>'+
    '<div class="gn-ed-preview-label" aria-hidden="true">'+svg('eye')+'</div>'+
    '<div class="gn-ed-paper" data-ep-preview="'+tier+'"></div>'+
    '<p class="gn-ed-print-count" data-ep-count="'+tier+'" role="status"></p>'+
    '<div class="gn-ed-actions"><button type="button" class="gn-ed-primary" data-ep-action="print" data-ep-tier="'+tier+'" aria-label="Print or save selected passages as PDF">'+svg('printer')+'</button>'+
      '<button type="button" class="gn-ed-secondary" data-ep-action="prepare" data-ep-tier="'+tier+'" aria-label="Show full preview">'+svg('eye')+'</button></div>'+
    '<div class="gn-ed-notice" data-ep-message="'+tier+'" role="status" hidden></div>'+
  '</div>';

  // Download choices appear only after the PDFs and verified manifest exist.
  // Browser-local print/Save-as-PDF remains available independently.
  function showReadyPDFs() {
    if (!host || typeof fetch !== 'function') return;
    fetch('editions/manifest.json?v=20261021-a4', {cache:'no-store'})
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!host || !data || data.status !== 'verified' || !Array.isArray(data.files)) return;
        const approved = data.files.filter(file => file &&
          ['reading','study'].includes(file.tier) &&
          ['bilingual','english','arabic','arabic-vowelled'].includes(file.language) &&
          typeof file.editorial_titles === 'boolean' &&
          Number.isInteger(file.pages) && file.pages > 0 &&
          typeof file.file === 'string' &&
          /^(reading|study)\/daruri-(reading|study)-(bilingual|english|arabic|arabic-vowelled)-titles-(on|off)\.pdf$/.test(file.file));
        for (const tier of ['reading','study']) {
          const panel = host.querySelector('[data-ep-published="' + tier + '"]');
          if (!panel) continue;
          const records = approved.filter(x => x.tier === tier);
          if (records.length !== (tier === 'reading' ? 8 : 2)) continue;
          const language = tier === 'reading' ?
            '<label class="gn-ed-field"><span>Language</span><select data-ep-ready-lang>' +
              [['bilingual','Arabic & English'],['english','English only'],
               ['arabic','Arabic without vowel marks'],['arabic-vowelled','Arabic fully vowelled']]
                .map(([key,title]) => '<option value="' + key + '">' + esc(title) + '</option>').join('') +
            '</select></label>' : '';
          panel.innerHTML = '<div class="gn-ed-fields">' + language +
              '<label class="gn-ed-field"><span class="gn-ed-field-name">Editorial section titles</span><select data-ep-ready-titles>' +
                '<option value="off">Off · original headings</option>' +
                '<option value="on">On · include descriptive headings</option></select></label>' +
            '</div><p class="gn-ed-pdf-detail" data-ep-ready-detail role="status"></p>' +
            '<div class="gn-ed-pdf-actions"><a class="gn-ed-primary" data-ep-ready-download download aria-label="Download selected '+tier+' PDF">'+svg('download')+'</a>' +
            '<a class="gn-ed-secondary" data-ep-ready-open target="_blank" rel="noopener noreferrer" aria-label="Read selected '+tier+' PDF">'+svg('open')+'</a></div>';
          panel.hidden = false;
          // Hide the older Study link only after the verified release catalog is loaded.
          if (tier === 'study') { const legacy = host.querySelector('[data-ep-legacy-study]'); if (legacy) legacy.hidden = true; }
          const update = () => {
            const lang = tier === 'study' ? 'bilingual' :
              panel.querySelector('[data-ep-ready-lang]').value;
            const editorial = panel.querySelector('[data-ep-ready-titles]').value === 'on';
            const file = records.find(x => x.language === lang && x.editorial_titles === editorial);
            if (!file) return;
            const href = 'editions/' + file.file;
            panel.querySelector('[data-ep-ready-open]').href = href;
            panel.querySelector('[data-ep-ready-download]').href = href;
            const description=file.pages+' A4 pages · '+file.bookmarks+' PDF bookmarks · '+
              (editorial?'Editorial titles':'Original headings')+
              (tier==='study'?' · study notes':'');
            panel.querySelector('[data-ep-ready-detail]').textContent=description;
            panel.dataset.epDescription=description;
            if(tier==='reading'&&!host.dataset.gnEpInteracted)showInfo('Reading PDF','Arabic + English',description);
          };
          panel.addEventListener('change', event => {
            if (event.target.matches('[data-ep-ready-lang], [data-ep-ready-titles]')) update();
          });
          update();
        }
      }).catch(() => {});
  }

  function render(main,payload) {
    book=payload;host=main;
    sectionByNumber=new Map(book.sections.filter(x=>/^\d+$/.test(String(x.id))).map(x=>[Number(x.id),x]));
    noteById=new Map((book.notes||[]).map(x=>[x.id,x]));
    lessons=window.DARURI_STUDY_DATA?.lessons||[];
    host.innerHTML='<div class="gn-editions">'+
    '<header class="gn-ed-top"><h1 id="gn-ed-title" tabindex="-1">Editions</h1>'+
      '<div class="gn-ed-status" role="status" aria-live="polite" aria-atomic="true"><span data-ep-info-kind>Edition</span>'+
        '<strong data-ep-info-value>Reading · bilingual</strong><small data-ep-info-detail></small></div></header>'+
    '<nav class="gn-ed-quicknav" aria-label="Edition levels">'+
      '<a href="#gn-ed-reading" aria-label="Reading edition" data-ep-info-kind="Edition" data-ep-info-label="Reading">'+svg('book')+'</a>'+
      '<a href="#gn-ed-study" aria-label="Study edition" data-ep-info-kind="Edition" data-ep-info-label="Study">'+svg('notes')+'</a>'+
      '<a href="#gn-ed-reference" aria-label="Scholarly reference" data-ep-info-kind="Edition" data-ep-info-label="Reference">'+svg('library')+'</a>'+
      '<a href="personal-export.html" aria-label="Personal PDF and Reading Desk notes" data-ep-info-kind="Personal PDF" data-ep-info-label="Notes and bookmarks">'+svg('pen')+'</a></nav>'+
    '<section id="gn-ed-reading" class="gn-ed-tier"><h2>Reading</h2>'+
      '<div class="gn-ed-config gn-ed-published" data-ep-published="reading" hidden></div>'+
      '<details class="gn-ed-study-custom gn-ed-reading-custom"><summary aria-label="Custom Reading printout" data-ep-info-kind="Custom printout" data-ep-info-label="Reading settings">'+svg('settings')+'</summary>'+
      controls('reading')+'</details></section>'+
    '<section id="gn-ed-study" class="gn-ed-tier"><h2>Study</h2>'+
      '<div class="gn-ed-config gn-ed-published" data-ep-published="study" hidden></div>'+
      '<div class="gn-ed-grid"><article class="gn-ed-card" data-ep-legacy-study><h3>Study PDF</h3>'+
        pdfActions('daruri-study.pdf?v=daruri8-structure-20261020','study PDF')+'</article>'+
      '<article class="gn-ed-card"><h3>Study Guide</h3>'+
        pdfActions('daruri-study-guide.pdf?v=daruri6-sources-20261020','study guide')+'</article></div>'+
      '<details class="gn-ed-study-custom"><summary aria-label="Custom Study printout" data-ep-info-kind="Custom printout" data-ep-info-label="Study settings">'+svg('settings')+'</summary>'+
      controls('study')+'</details></section>'+
    '<section id="gn-ed-reference" class="gn-ed-tier"><h2>Reference</h2>'+
      '<article class="gn-ed-card"><h3>Scholarly reference</h3>'+
        pdfActions('daruri.pdf?v=daruri8-structure-20261020','scholarly reference PDF')+
      '</article></section></div>';
    if (!host.dataset.gnEpBound) {
      host.addEventListener('change',onChange);
      host.addEventListener('input',onInput);
      host.addEventListener('click',onClick);
      host.dataset.gnEpBound='1';
    }
    KEYS.forEach(update);
    host.dataset.gnEpInteracted='';
    showReadyPDFs();
  }
  function selection(tier) {
    const s=memory[tier];let chosen=[];
    if(s.scope==='full')chosen=Array.from(sectionByNumber.keys()).sort((a,b)=>a-b);
    else if(s.scope==='part'){const part=PARTS.find(p=>p.id===s.part)||PARTS[1];chosen=Array.from({length:part.to-part.from+1},(_,i)=>part.from+i);}
    else if(s.scope==='lesson'){const l=lessons.find(l=>l.id===s.lesson);chosen=[...new Set((l?.levels?.basic?.sections||[1]).map(Number))].sort((a,b)=>a-b);}
    else {
      const a=Math.max(1,Math.min(258,Number(s.from)||1)),b=Math.max(1,Math.min(258,Number(s.to)||258));
      chosen=Array.from({length:Math.abs(b-a)+1},(_,i)=>Math.min(a,b)+i);
    }
    return chosen.map(n=>sectionByNumber.get(n)).filter(Boolean);
  }
  function notesFor(tier,section) {
    const style=memory[tier].notes;
    if(style==='none')return [];
    const kinds=style==='essential'?['interpretive','lexical']:
      style==='study'?['interpretive','lexical','translation','quran-source']:
        ['interpretive','lexical','translation','quran-source'];
    return (section.noteIds||[]).map(id=>noteById.get(id)).filter(n=>n&&kinds.includes(n.kind));
  }
  function personalPrintRows(tier,sections) {
    const setting=memory[tier];
    if(setting.personal==='none')return [];
    try {
      const raw=localStorage.getItem('gnamma-reading-desk-v1');
      if(!raw)return [];
      const data=JSON.parse(raw);
      if(data?.format!=='gnamma-reading-desk'||data.version!==1||!Array.isArray(data.items))return [];
      const ids=new Set(sections.map(s=>String(s.id)));
      const includeUnattached=setting.scope==='full';
      const filtered=data.items.filter(r=>r&&typeof r==='object'&&!r.deleted&&
        ((r.kind==='note'&&typeof r.body==='string'&&r.body.trim())||
          (setting.personal==='all'&&r.kind!=='note'&&r.target)) &&
        (ids.has(String(r.target?.section))||(includeUnattached&&!r.target?.section)));
      if(filtered.length>500)throw Error('More than 500 personal items match this print selection. Narrow the print range or use the personal PDF chooser.');
      return filtered.sort((a,b)=>{
        const n=t=>Number(t?.target?.section)||999999;
        return n(a)-n(b)||(Number(a.target?.segment??-1)-Number(b.target?.segment??-1))||
          (Number(a.created)||0)-(Number(b.created)||0);
      }).map((r,i)=>({row:r,n:i+1}));
    }catch(_){return [];}
  }
  function personalDate(row){
    if(row.dateSource!=='recorded'||!Number(row.created))return 'Original date unknown';
    const date=n=>new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(n));
    try{return 'Saved '+date(row.created)+(row.modified?' · Edited '+date(row.modified):'');}
    catch(_){return 'Date unavailable';}
  }
  function personalRefs(rows,id,segment){
    const matched=rows.filter(({row})=>String(row.target?.section)===String(id)&&
      (segment==null?row.target?.segment==null:Number(row.target?.segment)===Number(segment)));
    if(!matched.length)return '';
    return '<span class="gn-ep-personal-refs" aria-label="Your Reading Desk references">Personal '+
      matched.map(({n})=>'<a href="#gn-ep-personal-'+n+'">['+n+']</a>').join(' ')+'</span>';
  }
  function personalAppendix(rows){
    if(!rows.length)return '';
    return '<section class="gn-ep-personal-appendix" role="doc-endnotes"><h2>My Reading Desk · personal observations</h2>'+
      '<p class="gn-ep-personal-notice">These are reader-created notes and bookmarks, not Ibn Rushd’s original text or Gnamma editorial notes.</p>'+
      rows.map(({row,n})=>{
        const t=row.target||{},name=t.section?'§'+esc(t.section)+(t.segment!=null?' · paragraph '+(Number(t.segment)+1):''):
          (t.term?'Dictionary / index: '+esc(t.term):t.lesson?'Study lesson: '+esc(t.lesson):
            t.app?'Bidāya application: '+esc(t.app):'Unattached personal note');
        const link=t.section?'<a href="#gn-ep-section-'+esc(t.section)+'">Return to §'+esc(t.section)+'</a>':'';
        const body=row.kind==='note'?esc(String(row.body||'').slice(0,30000)).replace(/\n/g,'<br>'):
          '<em>Saved bookmark</em>';
        const quote=t.quote?'<blockquote lang="'+(t.lang==='ar'?'ar':'en')+'" dir="'+(t.lang==='ar'?'rtl':'ltr')+'">'+esc(t.quote)+'</blockquote>':'';
        return '<article id="gn-ep-personal-'+n+'"><h3>'+n+'. '+name+'</h3>'+
          '<h4>'+esc(row.title||'Personal observation')+'</h4>'+body+quote+
          '<p class="gn-ep-personal-meta">'+esc(personalDate(row))+' · '+link+'</p></article>';
      }).join('')+'</section>';
  }
  function paragraph(text,lang,number) {
    return '<p class="gn-ep-paragraph '+(lang==='ar'?'gn-ep-ar':'gn-ep-en')+'"'+
      (lang==='ar'?' lang="ar" dir="rtl"':' lang="en" dir="ltr"')+'>'+
      (number?'<span class="gn-ep-number">§'+number+'</span> ':'')+esc(text)+'</p>';
  }
  function bodySections(tier,sections,preview=false) {
    const settings=memory[tier],lang=settings.language,all=[],endnotes=[];
    const personal=preview?[]:personalPrintRows(tier,sections);
    for(const section of sections){
      const id=Number(section.id),english=lang!=='arabic',arabic=lang!=='english';
      const part=PARTS.find(x=>x.from===id);
      if(part)all.push('<h2 class="gn-ep-part">'+(english?esc(part.label):'')+
        (english&&arabic?' · ':'')+(arabic?'<span lang="ar" dir="rtl">'+esc(part.ar)+'</span>':'')+'</h2>');
      if(section.headingAr||section.headingEn) {
        all.push('<div class="gn-ep-original">'+(english?'<div lang="en">'+esc(section.headingEn||'')+'</div>':'')+
          (arabic?'<div lang="ar" dir="rtl">'+esc(settings.vowels?section.headingVocalized||section.headingAr:section.headingAr||'')+'</div>':'')+'</div>');
      }
      if(settings.editorial)all.push('<h3 class="gn-ep-editorial"><span>Editorial §'+id+'</span> · '+esc(section.title||'')+'</h3>');
      const noteRecords=preview?[]:notesFor(tier,section);
      const keys=[];
      for(const note of noteRecords){
        let found=endnotes.find(x=>x.id===note.id);
        if(!found){found={id:note.id,note,section:id,index:endnotes.length+1};endnotes.push(found);}
        keys.push('<sup>'+found.index+'</sup>');
      }
      const segments=preview?section.segments.slice(0,2):section.segments;
      const sectionParts=[];
      for(const [i,segment] of segments.entries()){
        const label=i===0?id:null;
        const en=english?paragraph(segment.en,'en',label):'';
        const ar=arabic?paragraph(settings.vowels?segment.vocalized||segment.ar:segment.ar,'ar',label):'';
        if(lang==='bilingual'&&settings.columns==='stacked')sectionParts.push('<div class="gn-ep-stacked">'+ar+en+'</div>');
        else if(lang==='bilingual')sectionParts.push('<table class="gn-ep-pair"><tbody><tr><td class="gn-ep-left">'+en+'</td><td class="gn-ep-right">'+ar+'</td></tr></tbody></table>');
        else sectionParts.push(en||ar);
        if(personal.length)sectionParts.push(personalRefs(personal,id,i));
      }
      if(personal.length)sectionParts.push(personalRefs(personal,id,null));
      if(keys.length)sectionParts.push('<span class="gn-ep-note-refs" aria-label="Notes for this section">'+keys.join(' ')+'</span>');
      all.push('<section class="gn-ep-section" id="gn-ep-section-'+id+'">'+sectionParts.join('')+'</section>');
    }
    if(endnotes.length){
      all.push('<section class="gn-ep-endnotes"><h2>Selected explanatory notes</h2>'+
        endnotes.map(item=>'<p><strong>'+item.index+'. §'+item.section+' · '+esc(item.note.kind)+'</strong> '+esc(item.note.text)+'</p>').join('')+'</section>');
    }
    if(personal.length)all.push(personalAppendix(personal));
    return all.join('');
  }
  function printStyle(tier) {
    const s=memory[tier],margin=s.density==='comfortable'?17:s.density==='compact'?11:13;
    const width=s.density==='comfortable'?10.2:s.density==='compact'?9.1:9.7;
    const ar=s.density==='comfortable'?14:s.density==='compact'?12.5:13.4;
    const columns=s.language==='bilingual'?1:(s.columns==='1'?1:2);
    return '@page{size:A4;margin:'+margin+'mm}'+
      '.gn-ep-sheet{font-family:Georgia,"Noto Serif",serif;font-size:'+width+'pt;line-height:1.42;color:#141414;direction:ltr;}'+
      '.gn-ep-sheet .gn-ep-flow{column-count:'+columns+';column-gap:13mm;}'+
      '.gn-ep-sheet .gn-ep-ar{font-family:"Noto Naskh Arabic",Amiri,serif;font-size:'+ar+'pt;line-height:1.62;direction:rtl;text-align:right;}'+
      '.gn-ep-sheet .gn-ep-en{font-family:"Noto Serif",Georgia,serif;}'+
      '.gn-ep-sheet .gn-ep-pair{width:100%;table-layout:fixed;border-collapse:collapse;direction:ltr;}'+
      '.gn-ep-sheet .gn-ep-pair td{vertical-align:top;width:50%;padding:0 0 5pt 0;}'+
      '.gn-ep-sheet .gn-ep-left{padding-right:9pt!important;border-right:.4pt solid #bbb;}'+
      '.gn-ep-sheet .gn-ep-right{padding-left:9pt!important;}'+
      '.gn-ep-sheet .gn-ep-stacked{margin-bottom:9pt;border-bottom:.3pt solid #ddd;}'+
      '.gn-ep-sheet .gn-ep-paragraph{margin:0 0 6pt;orphans:2;widows:2;overflow-wrap:break-word;}'+
      '.gn-ep-sheet .gn-ep-part{font:600 11pt/1.4 Georgia,serif;border-top:.7pt solid #666;padding-top:5pt;margin:12pt 0 9pt;break-after:avoid;}'+
      '.gn-ep-sheet .gn-ep-original{font-weight:bold;border-top:.3pt solid #999;padding:4pt 0;margin:8pt 0 4pt;break-after:avoid;}'+
      '.gn-ep-sheet .gn-ep-original [lang=ar]{font-family:"Noto Naskh Arabic",Amiri,serif;text-align:right;direction:rtl;font-size:'+ar+'pt;}'+
      '.gn-ep-sheet .gn-ep-editorial{font:500 9pt/1.35 Georgia,serif;color:#484848;margin:6pt 0;break-after:avoid;}'+
      '.gn-ep-sheet .gn-ep-editorial span{font:600 7pt Arial,sans-serif;text-transform:uppercase;}'+
      '.gn-ep-sheet .gn-ep-number{font:600 7pt Arial,sans-serif;color:#555;white-space:nowrap;unicode-bidi:isolate;}'+
      '.gn-ep-sheet .gn-ep-section{break-inside:auto;}'+
      '.gn-ep-sheet .gn-ep-endnotes{margin-top:14pt;break-before:page;}'+
      '.gn-ep-sheet .gn-ep-endnotes p{font:8.7pt/1.4 Georgia,serif;margin:0 0 8pt;}'+
      '.gn-ep-sheet .gn-ep-note-refs{font-size:8pt;}'+
       '.gn-ep-sheet .gn-ep-personal-refs{display:block;font:7.5pt Arial,sans-serif;margin:0 0 4pt;color:#424242;}'+
       '.gn-ep-sheet .gn-ep-personal-appendix{column-span:all;break-before:page;margin-top:14pt;font:9.6pt/1.5 Georgia,serif;}'+
       '.gn-ep-sheet .gn-ep-personal-appendix article{break-inside:avoid-page;margin:0 0 13pt;}'+
       '.gn-ep-sheet .gn-ep-personal-appendix h3{font-size:11pt;margin:12pt 0 3pt;}'+
       '.gn-ep-sheet .gn-ep-personal-appendix h4{font-size:10pt;margin:3pt 0 5pt;}'+
       '.gn-ep-sheet .gn-ep-personal-appendix blockquote{border-left:1pt solid #888;padding-left:8pt;margin:5pt 0;}'+
       '.gn-ep-sheet .gn-ep-personal-appendix [lang=ar]{font-family:"Noto Naskh Arabic",Amiri,serif;direction:rtl;text-align:right;font-size:12pt;}'+
       '.gn-ep-sheet .gn-ep-personal-meta{font:8pt Arial,sans-serif;color:#555;}'+
       '.gn-ep-sheet .gn-ep-personal-notice{font-style:italic;}'+
      '.gn-ep-sheet .gn-ep-head{border-bottom:.6pt solid #888;margin:0 0 12pt;padding:0 0 7pt;font:11pt/1.4 Georgia,serif;}'+
      '.gn-ep-sheet .gn-ep-head small{display:block;font:8pt/1.4 Arial,sans-serif;}';
  }
  function assembled(tier,preview=false) {
    const secs=selection(tier),selected=preview?secs.slice(0,2):secs;
    const scope=memory[tier].scope;
    let title=tier==='reading'?'Reading & Printing':'Study selection';
    if(scope==='lesson'){const l=lessons.find(l=>l.id===memory[tier].lesson);title=l?'Lesson '+l.number+' · '+l.title:title;}
    else if(scope==='part'){const p=PARTS.find(p=>p.id===memory[tier].part);title=p?p.label:title;}
    else if(scope==='range')title='Source §§'+String(secs[0]?.id||'')+'–'+String(secs[secs.length-1]?.id||'');
    const head='<header class="gn-ep-head"><strong>Al-Ḍarūrī · Ibn Rushd</strong> · '+esc(title)+
      '<small>Reading edition · Gnamma Research · Source text from al-ʿAlawī (1994), with documented editorial revisions. '+(memory[tier].editorial?'Supplementary section titles marked editorial. ':'')+'Original section references retained.</small></header>';
    return {markup:'<article class="gn-ep-sheet"><div class="gn-ep-inner">'+head+'<div class="gn-ep-flow">'+bodySections(tier,selected,preview)+'</div></div></article>',sections:secs,previewCount:selected.length};
  }
  function update(tier) {
    if(!host)return;
    const config=host.querySelector('[data-ep-tier="'+tier+'"]');
    if(!config)return;
    const s=memory[tier];
    const columnsSelect=config.querySelector('[data-ep-control="columns"]');
    for(const option of columnsSelect.options){
      const bilingual=s.language==='bilingual';
      option.hidden=bilingual?['1','2'].includes(option.value):['parallel','stacked'].includes(option.value);
      option.disabled=option.hidden;
    }
    if(s.language==='bilingual'&&!['parallel','stacked'].includes(s.columns))s.columns='parallel';
    if(s.language!=='bilingual'&&!['1','2'].includes(s.columns))s.columns='2';
    columnsSelect.value=s.columns;
    config.querySelector('.gn-ed-vowels').hidden=s.language==='english';
    config.querySelectorAll('[data-ep-range]').forEach(node=>{node.hidden=node.dataset.epRange!==s.scope;});
    const sample=assembled(tier,true);
    const preview=config.querySelector('[data-ep-preview]');
    preview.innerHTML=sample.markup;
    preview.dataset.epFormat=s.language;
    preview.dataset.epColumns=s.columns;
    preview.dataset.epDensity=s.density;
    config.querySelector('[data-ep-count]').textContent=sample.sections.length+' numbered source sections selected · '+(s.notes==='none'?'no editorial notes':'selected editorial notes at the end')+' · '+(s.personal==='none'?'no private notes':'Reading Desk material at the end')+' · complete text retained.';
  }
  function message(tier,text) {
    const box=host?.querySelector('[data-ep-message="'+tier+'"]');
    if(box){box.hidden=false;box.textContent=text;}
  }
  function onChange(event) {
    const input=event.target.closest('[data-ep-control]');
    const container=input?.closest('[data-ep-tier]');
    if(!container)return;
    const tier=container.dataset.epTier,key=input.dataset.epControl;
    memory[tier][key]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;
    update(tier);
    host.dataset.gnEpInteracted='1';
    const fieldName=input.closest('.gn-ed-field, .gn-ed-toggle')?.querySelector('.gn-ed-field-name')?.textContent?.trim()||key;
    const value=input.type==='checkbox'?(input.checked?'On':'Off'):
      input.tagName==='SELECT'?(input.selectedOptions[0]?.textContent||input.value):String(input.value);
    const count=host.querySelector('[data-ep-count="'+tier+'"]')?.textContent||'';
    showInfo(fieldName,value,tier.charAt(0).toUpperCase()+tier.slice(1)+' · '+count);
  }
  function onInput(event) {
    if(event.target.matches('input[type="number"][data-ep-control]'))onChange(event);
  }
  function prepare(tier) {
    let result;
    try{result=assembled(tier);}catch(error){message(tier,'Could not prepare printout: '+error.message);return false;}
    if(!result.sections.length){message(tier,'No source sections selected.');return false;}
    document.getElementById('gnEpPacket')?.remove();
    document.getElementById('gnEpPageStyle')?.remove();
    const div=document.createElement('div');
    div.id='gnEpPacket';
    div.innerHTML=result.markup;
    div.className='gn-ep-print-document';
    const style=document.createElement('style');
    style.id='gnEpPageStyle';
    style.textContent='@media print{'+printStyle(tier)+
      'body.gn-ed-print-ready>*:not(#gnEpPacket){display:none!important;}' +
      'body.gn-ed-print-ready #gnEpPacket{display:block!important;position:static!important;visibility:visible!important;}' +
      'body.gn-ed-print-ready #gnEpPacket *{visibility:visible!important;}' +
      'html:has(body.gn-ed-print-ready),body.gn-ed-print-ready{height:auto!important;overflow:visible!important;}' +
      '}';
    document.head.append(style);
    document.body.append(div);
    return true;
  }
  function onClick(event) {
    const action=event.target.closest('[data-ep-action]');
    if(action) {
      event.preventDefault();
      const tier=action.dataset.epTier;
      if(!prepare(tier))return;
      message(tier,'Complete printable selection prepared from the source. Use Print / Save as PDF to open the browser print dialog.');
      if(action.dataset.epAction==='print'){
        document.body.classList.add('gn-ed-print-ready');
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));
      } else {
        const details=host.querySelector('[data-ep-tier="'+tier+'"]');
        const paper=details?.querySelector('[data-ep-preview]');
        if(paper){paper.innerHTML=document.getElementById('gnEpPacket').innerHTML;paper.classList.add('gn-ed-full-preview');paper.scrollIntoView({block:'nearest'});}
      }
      return;
    }
    const nav=event.target.closest('.gn-ed-quicknav a');
    if(nav) {
      event.preventDefault();
      const section=host.querySelector(nav.getAttribute('href'));
      section?.scrollIntoView({block:'start',behavior:'smooth'});
    }
  }
  window.GnammaEditions={render,buildPrintable:prepare,showInfo};
})();
