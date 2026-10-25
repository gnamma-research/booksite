/* Gnamma Daruri: optional, local Qur'anic context for both note entry points.
   No network request is made until the reader expands a source note. */
(() => {
  'use strict';
  if (window.__gnQuranContextInstalled) return;
  window.__gnQuranContextInstalled = true;

  // Install the independent dictionary expansion layer alongside Qurʾān context.
  // Its large, full-source payload remains unloaded until the reader asks for it.
  if (!document.querySelector('script[data-gn-full-dictionary-context]')) {
    const fullScript = document.createElement('script');
    fullScript.dataset.gnFullDictionaryContext = '1';
    fullScript.async = true;
    fullScript.src = new URL('full-dictionary-context.js?v=20261025-dossier4',
      document.currentScript?.src || document.baseURI).href;
    document.head.append(fullScript);
  }
  const selfURL=document.currentScript?.src || new URL('quran-context-ui.js',document.baseURI).href;
  const dataScriptURL=new URL('quran-context-data.js?v=20261022-qcontext1',selfURL).href;
  let dataPromise=null;
  const el=(tag,cls,content) => {
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(content!==undefined)node.textContent=String(content);
    return node;
  };
  function link(label,href){
    const a=el('a',null,label);
    a.href=href;a.target='_blank';a.rel='noopener noreferrer';
    return a;
  }
  function getData(){
    if(window.GnammaQuranContextData)return Promise.resolve(window.GnammaQuranContextData);
    if(!dataPromise){
      // A normal local <script> loads on file:// too, unlike fetch(JSON), which
      // may be blocked by WebKit/Chromium local-file CORS rules.
      dataPromise=new Promise((resolve,reject)=>{
        const script=document.createElement('script');
        script.async=true;script.src=dataScriptURL;
        script.onload=()=>resolve(window.GnammaQuranContextData);
        script.onerror=()=>reject(Error('Local Qur\u02bean context script unavailable'));
        document.head.append(script);
      }).then(data=>{
        if(data?.schema_version!==1 || !data.notes || !data.verses)throw Error('Qur\u02bean context data invalid');
        return data;
      }).catch(error=>{dataPromise=null;throw error;});
    }
    return dataPromise;
  }
  function verseCard(key,record,ref){
    const verse=record.verses[key];
    if(!verse || !verse.ar || !verse.en)throw Error('Missing verified verse '+key);
    const n=Number(key.split(':')[1]);
    const kind=n<ref.start?'Preceding':n>ref.end?'Following':'Referenced';
    const card=el('figure','gn-context-ayah'+(kind==='Referenced'?' gn-context-cited':''));
    card.append(el('figcaption','gn-context-ayah-label',key+' · '+kind));
    const arabic=el('blockquote','gn-quran-quotation');
    arabic.setAttribute('lang','ar');arabic.setAttribute('dir','rtl');
    arabic.append(el('span','gn-quran-bracket','﴿'),document.createTextNode(' '),
      el('span','gn-quran-words',verse.ar),document.createTextNode(' '),
      el('span','gn-quran-bracket','﴾'));
    const english=el('p','gn-context-translation',verse.en);
    english.setAttribute('lang','en');english.setAttribute('dir','ltr');
    card.append(arabic,english);
    return card;
  }
  function renderContext(noteId,host,record){
    host.replaceChildren();
    const refs=record.notes[noteId];
    if(!Array.isArray(refs)||!refs.length)throw Error('No contextual reference for '+noteId);
    for(const ref of refs){
      const group=el('section','gn-quran-context-group');
      const heading=el('h4','gn-quran-context-heading',ref.label+' · '+ref.range);
      group.append(heading);
      for(const key of ref.verses)group.append(verseCard(key,record,ref));
      const external=el('p','gn-quran-context-link');
      external.append(link('Read this passage at Quran.com ↗',ref.url));
      group.append(external);host.append(group);
    }
    const credit=el('p','gn-quran-context-credit');
    credit.append(document.createTextNode('Arabic: '),link('Tanzil Uthmānī v1.1','https://tanzil.net/docs/Text_License'),
      document.createTextNode(' (verbatim, CC BY 3.0). English: Marmaduke Pickthall (1930, public domain). '),
      document.createTextNode('Context is supplied editorially, not necessarily quoted by Ibn Rushd.'));
    host.append(credit);
  }
  function enhance(note){
    if(note.dataset.gnContextEnhanced==='1')return;
    const id=note.dataset.noteId;
    if(!id || !/^QUR-R\d+-Q\d+$/.test(id))return;
    note.dataset.gnContextEnhanced='1';
    const details=el('details','gn-quran-context');
    details.dataset.gnQuranContext=id;
    const summary=el('summary','gn-quran-context-toggle');
    const arrow=el('span','gn-quran-context-chevron','›');
    arrow.setAttribute('aria-hidden','true');
    summary.append(arrow,el('span','gn-quran-context-closed','Show full verse and surrounding context'),
      el('span','gn-quran-context-open','Hide Qurʾānic context'));
    const host=el('div','gn-quran-context-body');
    details.append(summary,host);
    note.append(details);
    details.addEventListener('toggle',()=>{
      if(!details.open || details.dataset.gnContextReady==='1'||details.dataset.gnContextLoading==='1')return;
      details.dataset.gnContextLoading='1';
      host.replaceChildren(el('p','gn-quran-context-status','Loading verified Qurʾānic text…'));
      getData().then(record=>{
        if(!details.isConnected)return;
        renderContext(id,host,record);
        details.dataset.gnContextReady='1';
      }).catch(error=>{
        if(details.isConnected)host.replaceChildren(el('p','gn-quran-context-error',
          'The contextual text could not be loaded. Please use the Qurʾān source link in the note.'));
        console.warn('Gnamma Quran context:',error);
      }).finally(()=>{delete details.dataset.gnContextLoading;});
    });
  }
  function enhanceWithin(root){
    if(root.nodeType!==1 && root.nodeType!==9)return;
    if(root.matches?.('.gn-note-entry[data-note-id]'))enhance(root);
    root.querySelectorAll?.('.gn-note-entry[data-note-id]').forEach(enhance);
  }
  function start(){
    enhanceWithin(document);
    const observer=new MutationObserver(records=>{
      for(const mutation of records)for(const added of mutation.addedNodes)enhanceWithin(added);
    });
    observer.observe(document.body,{subtree:true,childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();