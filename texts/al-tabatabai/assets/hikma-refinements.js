/* Progressive enhancements for the source-first Hikma reader. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const bookId = document.body.dataset.book || 'reader';
  const progressKey = 'gnamma-hikma:progress:' + bookId;
  const storageGet = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const storageSet = (key,value) => { try { localStorage.setItem(key,value); } catch (_) { /* Private mode: progress is not persisted. */ } };

  /* Restore the last chapter before the main reader resolves its initial hash. */
  if (!location.hash && storageGet(progressKey)) {
    const last = storageGet(progressKey);
    if (/^(chapter|passage)-[A-Za-z0-9_-]+$/.test(last)) {
      history.replaceState(null,'',location.pathname + location.search + '#' + last);
    }
  }

  function createHeaderButton(id,label,svgPath) {
    if ($(id)) return $(id);
    const actions = document.querySelector('.header-actions');
    if (!actions) return null;
    const b = document.createElement('button');
    b.type='button';b.id=id;b.className='text-button';b.setAttribute('aria-label',label);b.title=label;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','18');svg.setAttribute('height','18');
    svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');
    svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
    for(const d of svgPath) {
      const p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d',d);svg.appendChild(p);
    }
    b.appendChild(svg);
    const caption=document.createElement('span');caption.textContent=label;b.appendChild(caption);
    const theme=$('theme-toggle');actions.insertBefore(b,theme||null);
    return b;
  }

  let selectedText='';
  function lookupTerm(value) {
    return (value||'').trim().replace(/[\u200c-\u200f\u202a-\u202e]/g,'')
      .replace(/^[\s.,;:()[\]{}«»"“”'‘’!?؟]+|[\s.,;:()[\]{}«»"“”'‘’!?؟]+$/g,'')
      .slice(0,90);
  }
  document.addEventListener('selectionchange',()=>{
    const selection=window.getSelection();
    if(!selection||selection.isCollapsed)return;
    const node=selection.anchorNode && selection.anchorNode.parentElement;
    if(node && node.closest && node.closest('.reading-content'))selectedText=lookupTerm(selection.toString());
  });
  /* The single Glossary button also looks up text selected in the reader. */
  const glossaryButton=$('glossary-open');
  if(glossaryButton)glossaryButton.addEventListener('click',()=>{
    const search=$('glossary-search');
    if(!search)return;
    let term=lookupTerm(selectedText || (window.getSelection()?window.getSelection().toString():''));
    if(/^ال[\u0621-\u064a]{3,}$/.test(term))term=term.slice(2);
    search.value=term;
    search.dispatchEvent(new Event('input',{bubbles:true}));
    selectedText='';
  });

  /* Custom browser print: scopes and choices are temporary, including cancellation. */
  let printState=null;
  const printButton=createHeaderButton('pdf-print','Print / PDF',[
    'M6 9V3h12v6M6 18H4V9h16v9h-2','M6 15h12v6H6z','M16 12h.01'
  ]);
  const printDialog=document.createElement('dialog');
  printDialog.id='pdf-layout-dialog';printDialog.className='reader-dialog pdf-layout-dialog';
  printDialog.innerHTML=[
    '<div class="dialog-header"><h2 id="pdf-dialog-title">Print or save a PDF</h2><button class="icon-button" type="button" data-pdf-close aria-label="Close PDF options">×</button></div>',
    '<p class="pdf-dialog-intro">Choose the text and layout, then select <strong>Save as PDF</strong> in your browser’s print dialog. Your reading position and display choices are restored afterward.</p>',
    '<div class="pdf-settings"><label>Text to include<select id="pdf-scope"><option value="book">Current book · all available text</option><option value="section">Current reading section</option><option value="range">Range within this book</option><option value="filter">Current search or saved selection</option></select></label>',
    '<div id="pdf-range" hidden><label>From<select id="pdf-from"></select></label><label>Through<select id="pdf-to"></select></label></div></div>',
    '<fieldset class="pdf-mode-options"><legend>Edition layout</legend>',
    '<label><input type="radio" name="pdf-mode" value="reading"><span><strong>Reading</strong><small>English by default, in one column</small></span></label>',
    '<label><input type="radio" name="pdf-mode" value="study" checked><span><strong>Study</strong><small>Parallel Arabic and English, with passage notes</small></span></label>',
    '<label><input type="radio" name="pdf-mode" value="reference"><span><strong>Reference</strong><small>Arabic by default, with source notes</small></span></label></fieldset>',
    '<div class="pdf-settings"><label>Language<select id="pdf-language"><option value="default">Use the edition default</option><option value="english">English</option><option value="arabic">Arabic</option><option value="bilingual">Arabic and English</option></select></label>',
    '<label>Headings<select id="pdf-headings"><option value="both">Original and editorial</option><option value="original">Original headings</option><option value="editorial">Editorial reading titles</option></select></label>',
    '<label class="pdf-checkbox"><input type="checkbox" id="pdf-vowels" checked>Keep the source’s Arabic vowel marks</label>',
    '<label class="pdf-checkbox"><input type="checkbox" id="pdf-notes">Include my personal notes</label></div>',
    '<p id="pdf-selection-status" class="pdf-dialog-intro" role="status"></p>',
    '<div class="pdf-dialog-actions"><button type="button" class="pdf-cancel" data-pdf-close>Cancel</button><button type="button" class="primary-button" id="pdf-confirm">Open print dialog</button></div>'
  ].join('');
  printDialog.setAttribute('aria-labelledby','pdf-dialog-title');document.body.appendChild(printDialog);
  const editionLibrary=document.createElement('a');editionLibrary.className='pdf-library-link';
  editionLibrary.href=bookId==='combined'?'./editions/':'../editions/';editionLibrary.textContent='All published PDF editions';
  editionLibrary.setAttribute('aria-label','Browse downloadable PDF editions');printDialog.querySelector('.pdf-dialog-actions').prepend(editionLibrary);
  editionLibrary.addEventListener('click',()=>{try{sessionStorage.setItem('gnamma-hikma:edition-return',location.href);}catch(_){}});
  printDialog.querySelectorAll('[data-pdf-close]').forEach(b=>b.addEventListener('click',()=>printDialog.close()));
  function visibleUnit(){
    const line=($('reading-toolbar')?.getBoundingClientRect().bottom||110)+60;
    const nodes=[...document.querySelectorAll('.passage')];let chosen=nodes[0];
    for(const node of nodes){if(node.getBoundingClientRect().top<=line)chosen=node;else break;}
    return chosen?.dataset.unit||window.HikmaReader?.currentUnit()?.id;
  }
  let printUnit=null,printBookUnits=[];
  function selectedPrintUnits(){
    const api=window.HikmaReader,scope=$('pdf-scope').value;
    if(!api||!printUnit)return [];
    if(scope==='section')return [printUnit];
    if(scope==='range'){const a=printBookUnits.findIndex(u=>u.id===$('pdf-from').value),b=printBookUnits.findIndex(u=>u.id===$('pdf-to').value);return a<0||b<a?[]:printBookUnits.slice(a,b+1).map(u=>u.id);}
    if(scope==='filter')return api.state.units.filter(u=>(!api.state.savedOnly||api.state.bookmarks.has(u.id))&&(!api.state.query||api.normalise(api.state.query).trim().split(/\s+/).filter(Boolean).every(t=>u.searchText.includes(t)))).map(u=>u.id);
    return printBookUnits.map(u=>u.id);
  }
  function printSelectionStatus(){
    $('pdf-range').hidden=$('pdf-scope').value!=='range';
    const ids=selectedPrintUnits();$('pdf-confirm').disabled=!ids.length;
    $('pdf-selection-status').textContent=ids.length?ids.length+' reading '+(ids.length===1?'section':'sections')+' selected. '+(printUnit?.startsWith('M-')?'Muẓaffar contains a working selection; Book VI and earlier gaps remain.':''):'Choose an ending section at or after the starting section.';
  }
  for(const id of ['pdf-scope','pdf-from','pdf-to'])$(id).addEventListener('change',printSelectionStatus);
  function printBookTitle(id){return id?.startsWith('B-')?'Bidāyat al-Ḥikma':id?.startsWith('N-')?'Nihāyat al-Ḥikma':'al-Manṭiq — Muḥammad Riḍā al-Muẓaffar';}
  function restoreAfterPrint(){
    if(!printState)return;
    // Some browsers fire afterprint before they leave print media. Keep the
    // snapshot until the existing media-change listener can restore screen layout.
    if(window.matchMedia&&window.matchMedia('print').matches)return;
    const saved=printState;printState=null;const api=window.HikmaReader;
    document.body.classList.remove('gnamma-print');delete document.body.dataset.pdfMode;delete document.body.dataset.pdfLanguage;
    document.querySelectorAll('[data-pdf-exclude]').forEach(n=>delete n.dataset.pdfExclude);document.querySelectorAll('.pdf-personal-note').forEach(n=>n.remove());
    document.querySelector('.title-page h1')?.removeAttribute('data-print-title');
    api.setPreferences(saved.preferences,false);api.setFilter(saved.query,saved.savedOnly);
    api.navigateId(saved.unit,false);
    document.querySelectorAll('.footnote-details').forEach(n=>{n.open=saved.expanded.includes(n.closest('.passage')?.dataset.unit);});
    // navigateId restores the reading anchor after layout. A second scroll to
    // old page pixels would override it after the temporary print DOM is removed.
    history.replaceState(null,'',saved.url);
  }
  if(printButton)printButton.addEventListener('click',()=>{
    if(printState)return;const api=window.HikmaReader;if(!api)return;
    printUnit=visibleUnit();printBookUnits=api.state.units.filter(u=>u.id[0]===printUnit?.[0]);
    for(const id of ['pdf-from','pdf-to']){const select=$(id);select.replaceChildren();for(const u of printBookUnits){const o=document.createElement('option');o.value=u.id;o.textContent=u.id+' · '+u.title;select.append(o);}select.value=printUnit;}
    $('pdf-headings').value=api.state.preferences.headings;$('pdf-vowels').checked=api.state.preferences.vowels;
    $('pdf-notes').checked=false;$('pdf-scope').value=api.state.query||api.state.savedOnly?'filter':'book';printSelectionStatus();
    if(!printDialog.open)printDialog.showModal();$('pdf-scope').focus();
  });
  $('pdf-confirm').addEventListener('click',()=>{
    if(printState)return;const api=window.HikmaReader,ids=new Set(selectedPrintUnits());if(!ids.size)return;
    printState={preferences:{...api.state.preferences},query:api.state.query,savedOnly:api.state.savedOnly,unit:printUnit,url:location.href,expanded:[...document.querySelectorAll('.footnote-details[open]')].map(n=>n.closest('.passage').dataset.unit)};
    const scope=$('pdf-scope').value,mode=printDialog.querySelector('input[name="pdf-mode"]:checked').value;
    api.setPreferences({view:'continuous',headings:$('pdf-headings').value,vowels:$('pdf-vowels').checked},false);
    if(scope!=='filter')api.setFilter('',false);else api.refresh();
    if(scope!=='filter')api.navigateId(printUnit,false);
    document.body.classList.add('gnamma-print');document.body.dataset.pdfMode=mode;document.body.dataset.pdfLanguage=$('pdf-language').value;
    for(const node of document.querySelectorAll('.passage')){
      if(!ids.has(node.dataset.unit))node.dataset.pdfExclude='true';
      else if($('pdf-notes').checked&&api.state.notes[node.dataset.unit]){const note=document.createElement('aside');note.className='pdf-personal-note';const h=document.createElement('strong');h.textContent='Personal note';const p=document.createElement('p');p.textContent=api.state.notes[node.dataset.unit];note.append(h,p);node.append(note);}
    }
    for(const chapter of document.querySelectorAll('.chapter-section'))if(!chapter.querySelector('.passage:not([data-pdf-exclude])'))chapter.dataset.pdfExclude='true';
    for(const heading of document.querySelectorAll('.stage-heading')){let node=heading.nextElementSibling,keep=false;while(node&&!node.classList.contains('stage-heading')){if(node.classList.contains('chapter-section')&&!node.dataset.pdfExclude)keep=true;node=node.nextElementSibling;}if(!keep)heading.dataset.pdfExclude='true';}
    const title=document.querySelector('.title-page h1');if(title)title.dataset.printTitle=scope==='filter'?'Selected readings':printBookTitle(printUnit)+(scope==='book'?'':' · selected sections');
    document.querySelectorAll('.footnote-details').forEach(n=>n.open=true);printDialog.close();window.print();
  });
  window.addEventListener('afterprint',restoreAfterPrint);
  if(window.matchMedia){const media=window.matchMedia('print');if(media.addEventListener)media.addEventListener('change',e=>{if(!e.matches)restoreAfterPrint();});}

  /* The active three-book tab mirrors the reading location, including scrolling. */
  function updateReadingLocation(){
    const active=document.querySelector('#toc a[data-group][aria-current="true"]');
    const hash=active&&active.getAttribute('href');
    if(hash && /^#chapter-[A-Za-z0-9_-]+$/.test(hash))storageSet(progressKey,hash.slice(1));
    if(bookId==='combined'){
      const stage=hash&&/^#chapter-([MBN])-/.exec(hash);
      const code=stage?stage[1]:null;
      const buttons=document.querySelectorAll('[data-part-jump]');
      buttons.forEach(button=>{
        const buttonPart=/^(?:chapter|passage)-([MBN])(?:-|$)/.exec(button.dataset.partJump || '');
        const chosen=!!code && !!buttonPart && buttonPart[1] === code;
        if(chosen)button.setAttribute('aria-current','true');
        else button.removeAttribute('aria-current');
      });
    }
  }
  const locationLabel=$('current-location');
  if(locationLabel && 'MutationObserver' in window) {
    const observer=new MutationObserver(updateReadingLocation);
    observer.observe(locationLabel,{childList:true,subtree:true,characterData:true});
  }
  window.addEventListener('hashchange',updateReadingLocation);
  window.addEventListener('pagehide',updateReadingLocation);
  document.addEventListener('click',event=>{
    if(event.target && event.target.closest && event.target.closest('[data-part-jump]')) {
      requestAnimationFrame(updateReadingLocation);
    }
  });
  setTimeout(updateReadingLocation,700);

  /* Focus-mode chapter keys do not interfere with typing or modifier shortcuts. */
  document.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.ctrlKey||event.metaKey||event.altKey)return;
    const target=event.target;
    if(target && (target.isContentEditable||/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName)))return;
    if(document.querySelector('dialog[open]')||document.body.classList.contains('contents-open'))return;
    const view=$('reading-view');if(!view||!['focus','quiet'].includes(view.value))return;
    const nav=$('chapter-navigation');if(!nav||nav.hidden)return;
    const id=event.key==='ArrowRight'?'next-chapter':'previous-chapter';
    const button=$(id);if(button&&!button.disabled){event.preventDefault();button.click();}
  });
})();
