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

  let printState=null;
  const printButton=createHeaderButton('pdf-print','Print / PDF',[
    'M6 9V3h12v6M6 18H4V9h16v9h-2',
    'M6 15h12v6H6z',
    'M16 12h.01'
  ]);
  function restoreAfterPrint(){
    if(!printState)return;
    const saved=printState;printState=null;
    document.body.classList.remove('gnamma-print');
    for(const node of saved.expanded){if(node.isConnected)node.open=false;}
    const view=$('reading-view');
    if(view&&view.value!==saved.view){
      view.value=saved.view;view.dispatchEvent(new Event('change',{bubbles:true}));
    }
    history.replaceState(null,'',saved.url);
    requestAnimationFrame(()=>window.scrollTo({top:saved.scrollY,left:0,behavior:'instant'}));
  }
  if(printButton)printButton.addEventListener('click',()=>{
    if(printState)return;
    const view=$('reading-view');
    const expanded=[];
    printState={view:view?view.value:'continuous',url:location.href,scrollY:window.scrollY,expanded};
    if(view&&view.value!=='continuous'){
      view.value='continuous';view.dispatchEvent(new Event('change',{bubbles:true}));
    }
    document.body.classList.add('gnamma-print');
    document.querySelectorAll('.footnote-details:not([open])').forEach(note=>{note.open=true;expanded.push(note);});
    window.print();
  });
  window.addEventListener('afterprint',restoreAfterPrint);

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
        const chosen=!!code && button.dataset.partJump.startsWith('chapter-'+code+'-');
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
    const view=$('reading-view');if(!view||view.value!=='focus')return;
    const nav=$('chapter-navigation');if(!nav||nav.hidden)return;
    const id=event.key==='ArrowRight'?'next-chapter':'previous-chapter';
    const button=$(id);if(button&&!button.disabled){event.preventDefault();button.click();}
  });
})();
