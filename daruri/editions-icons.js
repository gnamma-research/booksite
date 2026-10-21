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
    page:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 11h7M9 15h7"/>',
    en:'<rect x="2" y="3" width="20" height="18" rx="2"/><text x="12" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui" font-size="9" font-weight="700">EN</text>',
    ar:'<rect x="2" y="3" width="20" height="18" rx="2"/><text x="12" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui" font-size="9" font-weight="700">AR</text>',
    bilingual:'<path d="M12 3v18M2.5 3h19v18h-19z"/><text x="7" y="13" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui" font-size="6.5" font-weight="700">EN</text><text x="17" y="13" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui" font-size="6.5" font-weight="700">AR</text>',
    essential:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 9h8"/>',
    study:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h8"/>',
    subtle:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 10h8"/>',
    print:'<path d="M6 8V3h12v5M6 17H4V9h16v8h-2M7 14h10v7H7z"/>'
  };

  function icon(key, value) {
    let shape='book';
    if(key==='language') shape=value==='bilingual'?'bilingual':value==='english'?'en':value==='arabic-vowelled'?'marked':'ar';
    else if(key==='columns') shape=value==='parallel'||value==='2'?'columns':value==='stacked'?'stacked':'single';
    else if(key==='density') shape=value==='comfortable'?'comfortable':value==='compact'?'compact':'wide';
    else if(key==='notes') shape=value==='none'?'noNotes':value==='essential'?'essential':'study';
    else if(key==='personal') shape=value==='none'?'noNotes':value==='notes'?'pen':'bookmark';
    else if(key==='scope') shape=value==='full'?'book':value==='part'?'chapter':value==='lesson'?'list':'range';
    else if(key==='part') shape='chapter';
    else if(key==='lesson') shape='book';
    else if(key==='editorial') shape=value==='on'||value==='true'?'plus':'none';
    else if(key==='vowels') shape=value==='on'||value==='true'?'marked':'ar';
    else shape='page';
    return '<svg class="gn-ed-choice-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[shape]+'</svg>';
  }

  const fieldGlyphs={
    language:'bilingual',columns:'columns',density:'sliders',notes:'notes',
    personal:'bookmark',scope:'range',part:'chapter',lesson:'list',
    editorial:'plus',vowels:'marked'
  };
  function marker(key) {
    const el=document.createElement('span');
    el.className='gn-ed-field-marker';
    el.setAttribute('aria-hidden','true');
    const path=icons[fieldGlyphs[key]||'page'];
    el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
    return el;
  }
  function show(kind,value,detail='') {
    window.GnammaEditions.showInfo?.(kind,value,detail);
  }
  const shortNames={language:'Language',editorial:'Editorial titles',vowels:'Vowel marks',
    columns:'Layout',density:'Page density',personal:'Reading Desk',
    scope:'Print selection',notes:'Notes'};
  function detailFor(element) {
    const ready=element.closest('[data-ep-published]');
    if(ready)return ready.dataset.epDescription||'';
    const custom=element.closest('[data-ep-tier]');
    if(!custom)return '';
    const count=custom.querySelector('[data-ep-count]')?.textContent||'';
    const number=count.match(/^(\d+)/)?.[1]||'';
    const tier=custom.dataset.epTier;
    return (tier==='study'?'Study':'Reading')+(number?' · '+number+' sections':'');
  }
  function describe(target) {
    const option=target.closest('.gn-ed-icon-option');
    if(option&&activeRoot?.contains(option)){
      const group=option.closest('.gn-ed-icon-options');
      const category=shortNames[group?.dataset.epIconKind]||
        group?.getAttribute('aria-label')||'Edition option';
      const label=option.getAttribute('aria-label')||'Option';
      show(category,label,detailFor(option));
      return;
    }
    const link=target.closest('[data-ep-info-kind], [data-ep-ready-open], [data-ep-ready-download], .gn-ed-actions button');
    if(link&&activeRoot?.contains(link)){
      const label=link.dataset.epInfoLabel||link.getAttribute('aria-label')||'Edition';
      const kind=link.dataset.epInfoKind||
        (link.matches('.gn-ed-actions button')?'Printout':'PDF');
      show(kind,label,link.dataset.epTabDetail||detailFor(link));
      return;
    }
    const native=target.closest('select[data-ep-iconified="native"]');
    if(native&&activeRoot?.contains(native)){
      const heading=native.closest('.gn-ed-field')?.querySelector('.gn-ed-field-name')?.textContent||'Selection';
      show(heading,native.selectedOptions[0]?.textContent||'', '');
    }
  }
  let observer=null, activeRoot=null, changing=false;

  function kindOf(select) {
    return select.dataset.epControl || (select.hasAttribute('data-ep-ready-lang')?'language':
      select.hasAttribute('data-ep-ready-titles')?'editorial':'other');
  }

  function upgrade(select) {
    if(select.dataset.epIconified) return;
    // A five-part selector and 28-lesson course list are navigation data, not
    // toolbar choices. Keep the accessible native picker for longer lists.
    const key=kindOf(select);
    const options=Array.from(select.options);
    if(!options.length)return;
    if((key==='part'||key==='lesson') && options.length>4){
      select.dataset.epIconified='native';
      select.closest('.gn-ed-field')?.insertBefore(marker(key),select);
      return;
    }
    const originalField=select.closest('label.gn-ed-field');
    if(originalField) {
      const replacement=document.createElement('div');
      replacement.className=originalField.className;
      while(originalField.firstChild) replacement.append(originalField.firstChild);
      originalField.replaceWith(replacement);
    }
    const wrapper=select.closest('.gn-ed-field') || select.parentElement;
    if(!wrapper) return;
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
      button.setAttribute('aria-label',option.textContent.trim());
      button.innerHTML=icon(key,option.value);
      group.append(button);
    }
    select.insertAdjacentElement('afterend',group);
    wrapper.insertBefore(marker(key),group);
    select.dataset.epIconified='1';
    select.classList.add('gn-ed-native-select');
    select.tabIndex=-1;
    select.setAttribute('aria-hidden','true');
    refresh(group);
  }


  function upgradeToggle(input) {
    if(input.dataset.epIconified === '1') return;
    const original=input.closest('label.gn-ed-toggle');
    if(!original)return;
    const field=document.createElement('div');
    field.className=original.className;
    while(original.firstChild)field.append(original.firstChild);
    original.replaceWith(field);
    const descriptive=field.querySelector('span');
    const label=descriptive?.querySelector('strong')?.textContent?.trim() ||
      descriptive?.textContent?.trim() || 'On or off';
    const key=input.dataset.epControl;
    const group=document.createElement('div');
    group.className='gn-ed-icon-options gn-ed-icon-toggle-options';
    group.setAttribute('role','radiogroup');
    group.setAttribute('aria-label',label);
    group.dataset.epIconKind=key;
    group.__originalToggle=input;
    for(const [value,name] of [['off','Off'],['on','On']]){
      const button=document.createElement('button');
      button.type='button';
      button.setAttribute('role','radio');
      button.className='gn-ed-icon-option';
      button.dataset.epIconValue=value;
      button.setAttribute('aria-label',name);
      button.innerHTML=icon(key,value);
      group.append(button);
    }
    field.append(marker(key),group);
    input.dataset.epIconified='1';
    input.classList.add('gn-ed-native-select');
    input.tabIndex=-1;
    input.setAttribute('aria-hidden','true');
    refresh(group);
  }

  function refresh(group) {
    const toggle=group.__originalToggle;
    if(toggle){
      if(!toggle.isConnected)return;
      for(const button of group.querySelectorAll('.gn-ed-icon-option')){
        const selected=button.dataset.epIconValue === (toggle.checked ? 'on' : 'off');
        button.setAttribute('aria-checked',String(selected));
        button.tabIndex=selected?0:-1;
      }
      return;
    }
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
      activeRoot.querySelectorAll('.gn-editions .gn-ed-toggle input[type=checkbox]:not([data-ep-iconified])').forEach(upgradeToggle);
      activeRoot.querySelectorAll('.gn-ed-icon-options').forEach(refresh);
    } finally {changing=false;}
  }

  function onClick(event) {
    const button=event.target.closest('.gn-ed-icon-option');
    if(!button){
      const clicked=event.target.closest('[data-ep-info-kind], [data-ep-ready-open], [data-ep-ready-download], .gn-ed-actions button');
      if(clicked&&activeRoot.contains(clicked))describe(clicked);
      return;
    }
    if(!activeRoot.contains(button))return;
    const group=button.closest('.gn-ed-icon-options');
    const toggle=group?.__originalToggle;
    if(toggle) {
      const next=button.dataset.epIconValue === 'on';
      if(toggle.checked!==next){toggle.checked=next;toggle.dispatchEvent(new Event('change',{bubbles:true}));}
      update();describe(button);button.focus();return;
    }
    const select=group?.__originalSelect;
    if(!select || button.disabled)return;
    if(select.value!==button.dataset.epIconValue) {
      select.value=button.dataset.epIconValue;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
    update();
    describe(button);
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
      root.addEventListener('focusin',event=>describe(event.target));
      root.addEventListener('mouseover',event=>{
        const target=event.target.closest('.gn-ed-icon-option, [data-ep-info-kind], [data-ep-ready-open], [data-ep-ready-download], .gn-ed-actions button, select[data-ep-iconified="native"]');
        if(target&&!target.contains(event.relatedTarget))describe(target);
      });
      root.dataset.epIconBound='1';
    }
    root.querySelector?.('.gn-editions')?.classList.add('gn-ed-icon-ready');
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
