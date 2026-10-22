/* Daruri: English phrase-to-publisher-note anchors.
 * Phrase spans are curated and unique in the published translation; unclear
 * alignments retain labelled passage-level or section-level note links.
 * This never changes the underlying English, Arabic or publisher-note data. */
(() => {
  'use strict';
  const DATA_URL='english-note-alignments.json?v=20261023-en-anchors1';
  const ID='gn-en-note';
  let map=null, main=null, scheduled=false, chooser=null, chooserOpener=null;
  const phraseBy=new Map(), scopedBy=new Map(), sectionBy=new Map();
  const key=(section,segment)=>String(section)+'|'+String(segment);
  const unique=values=>[...new Set(values)];
  function readMap(data){
    if(data?.schema!==1||!Array.isArray(data.phrases)||
       !Array.isArray(data.scoped)||!Array.isArray(data.sectionOnly))
      throw new Error('Unexpected English note alignment schema');
    for(const [section,segment,id,phrase] of data.phrases){
      if(!/^N\d+$/.test(id)||!phrase)continue;
      const k=key(section,segment);
      if(!phraseBy.has(k))phraseBy.set(k,[]);
      phraseBy.get(k).push({id,phrase});
    }
    for(const [section,segment,id] of data.scoped){
      const k=key(section,segment);
      if(!scopedBy.has(k))scopedBy.set(k,[]);
      scopedBy.get(k).push(id);
    }
    for(const [section,id] of data.sectionOnly){
      if(!sectionBy.has(String(section)))sectionBy.set(String(section),[]);
      sectionBy.get(String(section)).push(id);
    }
    map=data;
  }
  function sectionOf(grid,reader){
    const explicit=grid.closest('[data-reading-section]')?.dataset.readingSection;
    if(explicit)return String(explicit);
    const hash=decodeURIComponent(location.hash.slice(1));
    const matched=hash.match(/(?:^|&)section=([^&]+)/);
    if(matched)return matched[1];
    const label=reader.querySelector('.reader-heading .gn-section-number-ar-only')?.textContent||'';
    const numbered=label.match(/§\s*(\d+)/);
    return numbered?numbered[1]:/colophon/i.test(label)?'colophon':null;
  }
  function textPieces(root){
    const parts=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node,total=0;
    while((node=walker.nextNode())){
      if(node.parentElement?.closest('.note-ref-symbol,.gn-en-scoped-notes'))continue;
      const start=total;
      total+=node.data.length;
      parts.push({node,start,end:total});
    }
    return {parts,text:parts.map(p=>p.node.data).join('')};
  }
  function noteMarker(id,group,level='phrase'){
    const link=document.createElement('a');
    link.className='note-ref-symbol gn-en-note-ref';
    link.setAttribute('href','#note-'+id);
    link.setAttribute('data-note-target',id);
    link.dataset.gnEnGroup=group;
    link.dataset.gnEnLevel=level;
    link.setAttribute('aria-label','Open publisher note '+id+
      (level==='phrase'?' on this translated phrase':' on this '+level));
    link.title='Publisher note '+id+(level==='phrase'?'':' · '+level+' level');
    link.dir='ltr';
    link.textContent=id;
    return link;
  }
  function annotateGroup(root,parts,group,groupId){
    let last=null;
    const touched=parts.filter(p=>p.end>group.start&&p.start<group.end);
    for(let i=touched.length-1;i>=0;i--){
      const p=touched[i];
      const lo=Math.max(0,group.start-p.start);
      const hi=Math.min(p.end-p.start,group.end-p.start);
      if(hi<=lo)continue;
      const interactive=p.node.parentElement?.closest('button,a,[role="button"]');
      if(interactive){if(!last)last=interactive;continue;}
      let node=p.node;
      if(hi<node.data.length)node.splitText(hi);
      if(lo>0)node=node.splitText(lo);
      const span=document.createElement('span');
      span.className='note-anchored note-range gn-en-note-range';
      span.dataset.gnEnGroup=groupId;
      span.tabIndex=0;
      span.setAttribute('role','button');
      span.setAttribute('aria-label','Open publisher note'+(group.ids.length>1?'s ':' ')+group.ids.join(', '));
      span.title='Publisher note'+(group.ids.length>1?'s ':' ')+group.ids.join(', ');
      node.parentNode.insertBefore(span,node);
      span.appendChild(node);
      if(!last)last=span;
    }
    if(!last)return false;
    last.after(...group.ids.map(id=>noteMarker(id,groupId)));
    return true;
  }
  function contextualNotes(root,ids,level){
    const found=unique(ids);
    if(!found.length)return;
    const bar=document.createElement('div');
    bar.className='gn-en-scoped-notes';
    bar.setAttribute('role','group');
    bar.setAttribute('aria-label','Publisher notes linked at '+level+' level');
    const label=document.createElement('span');
    label.className='gn-en-scoped-label';
    label.textContent=level==='section'?'Publisher notes for this section:':
      'Publisher notes for this passage:';
    bar.append(label);
    for(const id of found)bar.append(noteMarker(id,'scope-'+level+'-'+id,level));
    root.append(bar);
  }
  function annotateGrid(grid,section,isLast){
    const en=grid.querySelector('.passage-en');
    if(!en||en.dataset.gnEnNoteIndexed==='1')return;
    const seg=Number(grid.dataset.segment);
    if(!Number.isInteger(seg))return;
    const k=key(section,seg);
    const entries=phraseBy.get(k)||[];
    const {parts,text}=textPieces(en);
    const exact=[];
    for(const entry of entries){
      const first=text.indexOf(entry.phrase);
      if(first<0||text.indexOf(entry.phrase,first+entry.phrase.length)>=0)continue;
      exact.push({start:first,end:first+entry.phrase.length,ids:[entry.id]});
    }
    exact.sort((a,b)=>a.start-b.start||b.end-a.end);
    const merged=[];
    for(const range of exact){
      const previous=merged.at(-1);
      if(previous&&range.start<previous.end){
        previous.end=Math.max(previous.end,range.end);
        previous.ids=unique([...previous.ids,...range.ids]);
      }else merged.push({...range});
    }
    const applied=new Set();
    for(let i=merged.length-1;i>=0;i--){
      const item=merged[i],token=ID+'-'+section+'-'+seg+'-'+i;
      if(annotateGroup(en,parts,item,token))item.ids.forEach(id=>applied.add(id));
    }
    const unresolved=(scopedBy.get(k)||[]).filter(id=>!applied.has(id));
    contextualNotes(en,unresolved,'passage');
    if(isLast)contextualNotes(en,sectionBy.get(String(section))||[],'section');
    en.dataset.gnEnNoteIndexed='1';
  }
  function syncNoteVisibility(){
    if(!main?.isConnected)return;
    const disabled=document.body.classList.contains('hide-notes')||
      document.body.classList.contains('focus-mode');
    for(const span of main.querySelectorAll('.gn-en-note-range'))
      span.tabIndex=disabled?-1:0;
  }
  function annotateAll(){
    if(!map||!main?.isConnected)return;
    const reader=main.querySelector('.reader');
    if(!reader)return;
    const grids=[...reader.querySelectorAll('.passage-grid[data-segment]')];
    const grouped=new Map();
    for(const grid of grids){
      const section=sectionOf(grid,reader);
      if(!section)continue;
      if(!grouped.has(section))grouped.set(section,[]);
      grouped.get(section).push(grid);
    }
    for(const [section,items] of grouped)for(let i=0;i<items.length;i++){
      try{annotateGrid(items[i],section,i===items.length-1)}
      catch(error){console.warn('English publisher-note annotation skipped',section,items[i].dataset.segment,error);}
    }
    syncNoteVisibility();
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;annotateAll()});
  }
  function closeChooser(focus=false){
    if(!chooser)return;
    chooser.remove();
    chooser=null;
    if(focus&&chooserOpener?.isConnected)chooserOpener.focus({preventScroll:true});
    chooserOpener=null;
  }
  function noteAnchors(span){
    const group=span.dataset.gnEnGroup;
    return [...(span.closest('.passage-en')?.querySelectorAll('.gn-en-note-ref')||[])]
      .filter(anchor=>anchor.dataset.gnEnGroup===group);
  }
  function activate(span){
    if(!span||document.body.classList.contains('hide-notes')||
       document.body.classList.contains('focus-mode'))return;
    if(window.getSelection?.()?.toString().trim())return;
    const choices=noteAnchors(span);
    if(choices.length===1){
      closeChooser();window.__termClickOrigin=span;choices[0].click();return;
    }
    if(!choices.length)return;
    closeChooser();
    chooserOpener=span;
    const menu=document.createElement('div');
    menu.className='gn-note-range-choice';
    menu.setAttribute('role','dialog');
    menu.setAttribute('aria-label','Choose a publisher note');
    const heading=document.createElement('p');
    heading.className='gn-note-range-choice-label';
    heading.textContent='Notes on this English phrase';
    menu.append(heading);
    for(const anchor of choices){
      const button=document.createElement('button');
      button.type='button';
      button.textContent=anchor.dataset.noteTarget;
      button.setAttribute('aria-label','Open publisher note '+anchor.dataset.noteTarget);
      button.addEventListener('click',()=>{
        const origin=chooserOpener;
        closeChooser();window.__termClickOrigin=origin;anchor.click();
      });
      menu.append(button);
    }
    document.body.append(menu);
    const rect=span.getBoundingClientRect();
    const w=menu.offsetWidth||190,h=menu.offsetHeight||80;
    menu.style.left=Math.max(8,Math.min(window.innerWidth-w-8,rect.left))+'px';
    menu.style.top=(rect.bottom+h+6<window.innerHeight-8?
      rect.bottom+6:Math.max(8,rect.top-h-6))+'px';
    chooser=menu;
    menu.querySelector('button')?.focus({preventScroll:true});
  }
  function install(){
    main=document.getElementById('mainContent');
    if(!main)return;
    document.addEventListener('click',event=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      const span=target.closest('#mainContent .passage-en .gn-en-note-range');
      if(!span||target.closest('button,a,input,textarea,select,[contenteditable="true"]'))return;
      event.preventDefault();activate(span);
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&chooser){
        event.preventDefault();event.stopPropagation();closeChooser(true);return;
      }
      if(event.key!=='Enter'&&event.key!==' ')return;
      const span=event.target.closest?.('#mainContent .passage-en .gn-en-note-range');
      if(!span)return;
      event.preventDefault();activate(span);
    });
    document.addEventListener('pointerdown',event=>{
      if(chooser&&!chooser.contains(event.target)&&
         !event.target.closest?.('.gn-en-note-range'))closeChooser();
    });
    new MutationObserver(schedule).observe(main,{childList:true});
    new MutationObserver(syncNoteVisibility).observe(document.body,{
      attributes:true,attributeFilter:['class']
    });
    window.addEventListener('hashchange',()=>{closeChooser();schedule();});
    schedule();
  }
  fetch(DATA_URL,{cache:'no-store'}).then(response=>{
    if(!response.ok)throw new Error('English notes map HTTP '+response.status);
    return response.json();
  }).then(data=>{readMap(data);install();}).catch(error=>{
    console.warn('English publisher-note map unavailable; no speculative links added.',error);
  });
})();
