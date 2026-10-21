/* Icon-first edition controls. Progressive enhancement over the tested native
   selectors: the original edition renderer, PDF links and print logic stay intact. */
(() => {
  'use strict';
  if (!window.GnammaEditions || window.GnammaEditions.__iconEnhanced) return;

  const icons = {
    book:'<path d="M12 6c-2.7-1.8-5.9-2.4-9-2v14c3.1-.4 6.3.2 9 2 2.7-1.8 5.9-2.4 9-2V4c-3.1-.4-6.3.2-9 2Z"/><path d="M12 6v14"/>',
    text:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    columns:'<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/>',
    stacked:'<rect x="4" y="3" width="16" height="8" rx="1"/><rect x="4" y="13" width="16" height="8" rx="1"/>',
    single:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h8"/>',
    wide:'<rect x="2.5" y="4" width="19" height="16" rx="1"/><path d="M6 8h12M6 12h12M6 16h9"/>',
    compact:'<rect x="4" y="3" width="16" height="18" rx="1"/><rect x="5.6" y="4.6" width="12.8" height="14.8" rx=".5"/><path d="M7 9h10M7 12h10M7 15h10"/>',
    comfortable:'<rect x="4" y="3" width="16" height="18" rx="1"/><rect x="8" y="7" width="8" height="10" rx=".5"/><path d="M9 10h6M9 13h6"/>',
    sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="2.5" fill="currentColor" stroke="none"/>',
    notes:'<path d="M5 3h14v18l-4-3-4 3-3-3-3 3V3Z"/><path d="M9 8h6M9 12h6"/>',
    noNotes:'<path d="M5 3h14v18H5zM8 8h8M8 12h7"/><path d="m3 21 18-18"/>',
    pen:'<path d="m4 20 4.5-1 11-11-3.5-3.5-11 11L4 20Z"/><path d="m14.5 6 3.5 3.5M4 20h16"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
    outline:'<path d="M7 5h13M7 12h13M7 19h13"/><circle cx="3" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="19" r="1" fill="currentColor" stroke="none"/>',
    none:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 9h8M8 13h8"/>',
    plus:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M7 8h6M7 12h6M7 16h6M17 10v7M14 13.5h6"/>',
    chapter:'<path d="M4 3h16v18H4zM4 9h16M8 5v2M8 13h8M8 17h8"/>',
    list:'<path d="M8 5h12M8 12h12M8 19h12"/><path d="M3 5h1M3 12h1M3 19h1"/>',
    range:'<path d="M8 4H5v16h3M16 4h3v16h-3M10 12h4"/>',
    arabic:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 12c2 3 6 2 7-2M10 8h.1M14 7h.1"/>',
    marked:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 13c2 3 6 2 7-2M9 7l2-2M15 7l2-2"/>',
    page:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 11h7M9 15h7"/>'
  };

  function icon(key, value) {
    let shape='book';
    if(key==='language') shape=value==='bilingual'?'book':value==='english'?'text':value==='arabic-vowelled'?'marked':'arabic';
    else if(key==='columns') shape=value==='parallel'||value==='2'?'columns':value==='stacked'?'stacked':'single';
    else if(key==='density') shape=value==='comfortable'?'comfortable':value==='compact'?'compact':'wide';
    else if(key==='notes') shape=value==='none'?'noNotes':'notes';
    else if(key==='personal') shape=value==='none'?'noNotes':value==='notes'?'pen':'bookmark';
    else if(key==='scope') shape=value==='full'?'book':value==='part'?'chapter':value==='lesson'?'list':'range';
    else if(key==='part') shape='chapter';
    else if(key==='lesson') shape='book';
    else if(key==='editorial') shape=value==='on'||value==='true'?'plus':'none';
    else shape='page';
    return '<svg class="gn-ed-choice-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[shape]+'</svg>';
  }

  let observer=null, activeRoot=null, changing=false;

  function kindOf(select) {
    return select.dataset.epControl || (select.hasAttribute('data-ep-ready-lang')?'language':
      select.hasAttribute('data-ep-ready-titles')?'editorial':'other');
  }

  function upgrade(select) {
    if(select.dataset.epIconified === '1') return;
    const originalField=select.closest('label.gn-ed-field');
    if(originalField) {
      const replacement=document.createElement('div');
      replacement.className=originalField.className;
      while(originalField.firstChild) replacement.append(originalField.firstChild);
      originalField.replaceWith(replacement);
    }
    const wrapper=select.closest('.gn-ed-field') || select.parentElement;
    if(!wrapper) return;
    const key=kindOf(select);
    const options=Array.from(select.options);
    if(!options.length) return;
    const heading=wrapper.querySelector('span')?.textContent?.trim() ||
      (key==='editorial'?'Editorial section titles':key==='language'?'Language':'Options');
    const group=document.createElement('div');
    group.className='gn-ed-icon-options';
    group.setAttribute('role','radiogroup');
    group.setAttribute('aria-label',heading);
    group.dataset.epIconKind=key;
    if(options.length>12) group.classList.add('gn-ed-icon-many');
    group.__originalSelect=select;
    for(const option of options) {
      const button=document.createElement('button');
      button.type='button'; button.setAttribute('role','radio');
      button.className='gn-ed-icon-option';
      button.dataset.epIconValue=option.value;
      button.dataset.epIconIndex=String(Array.from(select.options).indexOf(option));
      const span=document.createElement('span');span.className='gn-ed-icon-label';
      span.textContent=option.textContent.trim();
      button.innerHTML=icon(key,option.value);
      button.append(span);
      group.append(button);
    }
    select.insertAdjacentElement('afterend',group);
    select.dataset.epIconified='1';
    select.classList.add('gn-ed-native-select');
    select.tabIndex=-1;
    select.setAttribute('aria-hidden','true');
    refresh(group);
  }

  function refresh(group) {
    const select=group.__originalSelect;
    if(!select || !select.isConnected) return;
    const buttons=Array.from(group.querySelectorAll('.gn-ed-icon-option'));
    for(const button of buttons) {
      const option=select.options[Number(button.dataset.epIconIndex)];
      if(!option) continue;
      const unavailable=Boolean(option.hidden || option.disabled);
      const checked=select.value===option.value;
      button.hidden=unavailable;
      button.disabled=unavailable;
      button.setAttribute('aria-checked',String(checked));
      button.tabIndex=checked&&!unavailable?0:-1;
    }
    // A native select can change programmatically when another setting changes.
    const visible=buttons.filter(x=>!x.hidden&&!x.disabled);
    if(visible.length&&!visible.some(x=>x.tabIndex===0))visible[0].tabIndex=0;
  }

  function update() {
    if(!activeRoot || changing) return;
    changing=true;
    try {
      activeRoot.querySelectorAll('.gn-editions select:not([data-ep-iconified])').forEach(upgrade);
      activeRoot.querySelectorAll('.gn-ed-icon-options').forEach(refresh);
    } finally {changing=false;}
  }

  function onClick(event) {
    const button=event.target.closest('.gn-ed-icon-option');
    if(!button || !activeRoot.contains(button))return;
    const group=button.closest('.gn-ed-icon-options');
    const select=group?.__originalSelect;
    if(!select || button.disabled)return;
    if(select.value!==button.dataset.epIconValue) {
      select.value=button.dataset.epIconValue;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
    update();
    button.focus();
  }

  function onKey(event) {
    const current=event.target.closest('.gn-ed-icon-option');
    if(!current || !activeRoot.contains(current))return;
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const candidates=Array.from(current.parentElement.querySelectorAll('.gn-ed-icon-option:not([hidden]):not(:disabled)'));
    if(candidates.length<2)return;
    const now=candidates.indexOf(current);
    const next=event.key==='Home'?0:event.key==='End'?candidates.length-1:
      (now+(event.key==='ArrowRight'||event.key==='ArrowDown'?1:-1)+candidates.length)%candidates.length;
    event.preventDefault();
    candidates[next].click();
    candidates[next].focus();
  }

  function enhance(root) {
    observer?.disconnect();
    activeRoot=root;
    if(!root.dataset.epIconBound) {
      root.addEventListener('click',onClick);
      root.addEventListener('keydown',onKey);
      root.addEventListener('change',()=>update());
      root.dataset.epIconBound='1';
    }
    update();
    if(typeof MutationObserver==='function') {
      observer=new MutationObserver(()=>update());
      observer.observe(root,{childList:true,subtree:true});
    }
  }

  const prior=window.GnammaEditions.render;
  window.GnammaEditions.render=function(...args) {
    const value=prior.apply(this,args);
    enhance(args[0]);
    return value;
  };
  window.GnammaEditions.__iconEnhanced=true;
})();
