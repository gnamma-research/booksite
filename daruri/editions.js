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
    reading:{language:'bilingual',columns:'parallel',vowels:true,density:'balanced',editorial:false,notes:'none',scope:'full',part:'rulings',lesson:'purpose',from:1,to:9},
    study:{language:'bilingual',columns:'parallel',vowels:true,density:'comfortable',editorial:true,notes:'study',scope:'full',part:'rulings',lesson:'purpose',from:1,to:9}
  };
  const memory=Object.fromEntries(KEYS.map(key=>[key,{...defaults[key]}]));
  let book=null,host=null;
  let sectionByNumber=new Map(), noteById=new Map(), lessons=[];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const attr=esc;
  const link=(href,label)=>'<a href="'+attr(href)+'" target="_blank" rel="noopener noreferrer" class="gn-ed-action">'+label+' ↗</a>';
  const select=(tier,key,items)=>'<select data-ep-control="'+key+'" id="ep-'+tier+'-'+key+'">'+
    items.map(([value,label])=>'<option value="'+attr(value)+'"'+(String(memory[tier][key])===String(value)?' selected':'')+'>'+esc(label)+'</option>').join('')+'</select>';
  const field=(tier,label,key,choices)=>'<label class="gn-ed-field"><span>'+label+'</span>'+select(tier,key,choices)+'</label>';
  const languages=[['bilingual','Arabic + English'],['english','English only'],['arabic','Arabic only']];
  const columns=[['parallel','Side by side / two columns'],['stacked','Stacked / one column'],['2','Two reading columns'],['1','One reading column']];
  const density=[['comfortable','Comfortable · 17 mm margins'],['balanced','Balanced · 13 mm margins'],['compact','Compact · 11 mm margins']];
  const scope=[['full','Entire work · §§1–258'],['part','One major part'],['lesson','Study Guide lesson'],['range','Section range']];
  const noteChoices={
    reading:[['none','None (shortest)'],['essential','Essential clarifications only']],
    study:[['none','None'],['essential','Essential clarifications'],['study','Translation, interpretation & Qurʾān sources'],['sources','Study notes + hadith sources']]
  };
  const toggleEditorial=(tier)=>'<label class="gn-ed-toggle"><input data-ep-control="editorial" type="checkbox" '+
    (memory[tier].editorial?'checked ':'')+'/><span><strong>Include editorial section titles</strong>'+
    '<small>Extra descriptive titles for numbered §§, clearly marked as editorial—not Ibn Rushd’s original chapter headings. The existing English editorial labels are shown even in Arabic-only output.</small></span></label>';
  const controls=tier=>'<div class="gn-ed-config" data-ep-tier="'+tier+'">'+
    '<div class="gn-ed-fields">'+
    field(tier,'Language','language',languages)+
    field(tier,'Column arrangement','columns',columns)+
    field(tier,'Page density','density',density)+
    field(tier,'Notes','notes',noteChoices[tier])+
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
    '<div class="gn-ed-preview-label"><strong>A4 preview from the actual text</strong><span>Representative excerpt · exact PDF page count is determined when printing</span></div>'+
    '<div class="gn-ed-paper" data-ep-preview="'+tier+'"></div>'+
    '<p class="gn-ed-print-count" data-ep-count="'+tier+'" role="status"></p>'+
    '<div class="gn-ed-actions"><button type="button" class="gn-ed-primary" data-ep-action="print" data-ep-tier="'+tier+'">Print / Save as PDF</button>'+
      '<button type="button" class="gn-ed-secondary" data-ep-action="prepare" data-ep-tier="'+tier+'">Prepare full preview</button></div>'+
    '<p class="gn-ed-small">Use your browser’s print window to print on ordinary A4 or select “Save as PDF”. Nothing is sent to a server; the selected passages are assembled in this browser.</p>'+
    '<div class="gn-ed-notice" data-ep-message="'+tier+'" role="status" hidden></div>'+
  '</div>';
  function render(main,payload) {
    book=payload;host=main;
    sectionByNumber=new Map(book.sections.filter(x=>/^\d+$/.test(String(x.id))).map(x=>[Number(x.id),x]));
    noteById=new Map((book.notes||[]).map(x=>[x.id,x]));
    lessons=window.DARURI_STUDY_DATA?.lessons||[];
    host.innerHTML='<div class="gn-editions">'+
    '<header><p class="gn-ed-eyebrow">AL-ḌARŪRĪ · EDITIONS</p><h1 id="gn-ed-title" tabindex="-1">Editions & Printing</h1>'+
      '<p class="gn-ed-intro">Choose a reading text, prepare a course handout, or consult the scholarly reference. The three levels below run from minimal to maximal apparatus.</p></header>'+
    '<nav class="gn-ed-quicknav" aria-label="Edition levels"><a href="#gn-ed-reading">1 · Reading & Printing</a><a href="#gn-ed-study">2 · Study</a><a href="#gn-ed-reference">3 · Reference</a></nav>'+
    '<section id="gn-ed-reading" class="gn-ed-tier"><div class="gn-ed-tier-head"><span class="gn-ed-number">1</span><div><h2>Reading & Printing</h2>'+
      '<p>Complete text or a short selection, with almost no apparatus. All choices use ordinary portrait A4. The default has no notes or editorial headings.</p></div></div>'+
      controls('reading')+'</section>'+
    '<section id="gn-ed-study" class="gn-ed-tier"><div class="gn-ed-tier-head"><span class="gn-ed-number">2</span><div><h2>Study Editions</h2>'+
      '<p>For courses and close reading: explanatory notes and original or optional editorial headings, without the full lexicon and manuscript apparatus.</p></div></div>'+
      '<div class="gn-ed-grid"><article class="gn-ed-card"><h3>Existing bilingual study PDF</h3><p class="gn-ed-meta">131 pages · Arabic & English · selected notes</p>'+
      '<p>Previously published fixed study edition. Arabic-right layout in the rebuilt edition remains subject to release verification.</p>'+
      link('daruri-study.pdf?v=daruri8-structure-20261020','Open study PDF')+'</article>'+
      '<article class="gn-ed-card"><h3>Study Guide companion</h3><p class="gn-ed-meta">85 pages · learning activities</p>'+
      '<p>The three-level companion to the online lessons, separate from the main reading text.</p>'+
      link('daruri-study-guide.pdf?v=daruri6-sources-20261020','Open study guide')+'</article></div>'+
      '<details class="gn-ed-study-custom"><summary>Customise a Study printout — language, notes and editorial titles</summary>'+
      '<p class="gn-ed-small">These settings affect this printout only; they do not modify the published PDF.</p>'+controls('study')+'</details></section>'+
    '<section id="gn-ed-reference" class="gn-ed-tier"><div class="gn-ed-tier-head"><span class="gn-ed-number">3</span><div><h2>Scholarly Reference</h2>'+
      '<p>Fixed, fully documented bilingual edition with linguistic and textual apparatus, source notes, applications, indexes and historical dictionary material. No layout customisation is offered for this tier.</p></div></div>'+
      '<article class="gn-ed-card"><h3>Full bilingual reference</h3><p class="gn-ed-meta">243 pages · Arabic & English · scholarly apparatus</p>'+
      '<p>This is the established reference target for website citations and section links. Its published page references remain unchanged during the reading-layout review.</p>'+
      link('daruri.pdf?v=daruri8-structure-20261020','Open reference PDF')+'</article></section>'+
    '<footer class="gn-ed-extra"><h2>Print a chapter or course selection</h2><p>Select “One major part”, “Study Guide lesson” or “Section range” above. We preserve whole numbered source passages; a lesson handout can draw on nonconsecutive passages without claiming to be a continuous abridgment.</p>'+
      '<p class="gn-ed-small">Original headings are always retained; editorial headings are optional and identified separately. Arabic-right/English-left presentation is used for every newly generated bilingual printout.</p></footer></div>';
    if (!host.dataset.gnEpBound) {
      host.addEventListener('change',onChange);
      host.addEventListener('input',onInput);
      host.addEventListener('click',onClick);
      host.dataset.gnEpBound='1';
    }
    KEYS.forEach(update);
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
        ['interpretive','lexical','translation','quran-source','hadith-source'];
    return (section.noteIds||[]).map(id=>noteById.get(id)).filter(n=>n&&kinds.includes(n.kind));
  }
  function paragraph(text,lang,number) {
    return '<p class="gn-ep-paragraph '+(lang==='ar'?'gn-ep-ar':'gn-ep-en')+'"'+
      (lang==='ar'?' lang="ar" dir="rtl"':' lang="en" dir="ltr"')+'>'+
      (number?'<span class="gn-ep-number">§'+number+'</span> ':'')+esc(text)+'</p>';
  }
  function bodySections(tier,sections,preview=false) {
    const settings=memory[tier],lang=settings.language,all=[],endnotes=[];
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
      }
      if(keys.length)sectionParts.push('<span class="gn-ep-note-refs" aria-label="Notes for this section">'+keys.join(' ')+'</span>');
      all.push('<section class="gn-ep-section" id="gn-ep-section-'+id+'">'+sectionParts.join('')+'</section>');
    }
    if(endnotes.length){
      all.push('<section class="gn-ep-endnotes"><h2>Selected explanatory notes</h2>'+
        endnotes.map(item=>'<p><strong>'+item.index+'. §'+item.section+' · '+esc(item.note.kind)+'</strong> '+esc(item.note.text)+'</p>').join('')+'</section>');
    }
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
    config.querySelector('[data-ep-count]').textContent=sample.sections.length+' numbered source sections selected · '+(s.notes==='none'?'no notes':'selected notes at the end')+' · complete text retained.';
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
  }
  function onInput(event) {
    if(event.target.matches('input[type="number"][data-ep-control]'))onChange(event);
  }
  function prepare(tier) {
    const result=assembled(tier);
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
  window.GnammaEditions={render,buildPrintable:prepare};
})();
