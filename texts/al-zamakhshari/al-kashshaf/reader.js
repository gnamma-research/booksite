/* GNAMMA Kashshaf reader. Content is server-rendered; enhancements fail independently. */
(() => {
  'use strict';
  const root = document.documentElement, body = document.body;
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const key = 'gnamma-kashshaf-c06';
  const defaults = { tibi: true, theme: 'sea', size: 20, focus: false, bookmarks: [] };
  let state = { ...defaults };
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch (_) {}
  if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
  state.bookmarks = state.bookmarks.filter(x => x && /^surah-\d{3}\.html#[KT]\d{3}\.\d+$/.test(x.url));
  if (!['sea', 'paper', 'night'].includes(state.theme)) state.theme = 'sea';
  state.size = Math.max(16, Math.min(28, Number(state.size) || 20));
  const sheet = $('#sheet'), sheetBody = $('#sheet-body');
  const searchData = Array.isArray(window.KASHSHAF_SEARCH) ? window.KASHSHAF_SEARCH : [];
  let toastTimer, activeId = '', openAction = '';
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {} };
  const notify = message => {
    const el = $('#toast'); el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
  };
  function apply() {
    root.dataset.theme = state.theme;
    root.style.setProperty('--font-size', state.size + 'px');
    body.classList.toggle('tibi-off', !state.tibi);
    body.classList.toggle('focus', !!state.focus);
    $$('[data-action="layers"]').forEach(b => b.setAttribute('aria-pressed', String(!!state.tibi)));
    $$('[data-action="focus"]').forEach(b => b.setAttribute('aria-pressed', String(!!state.focus)));
    const status = $('.layer-status');
    if (status) status.textContent = state.tibi ? 'Ṭībī’s commentary is shown alongside the passages it discusses.' : 'Reading al-Zamakhsharī only. Switch Ṭībī’s layer on to show his full available commentary.';
  }
  function visibleSegment() {
    const segments = $$('.segment').filter(s => state.tibi || s.dataset.author !== 'tibi');
    return segments.find(s => s.getBoundingClientRect().bottom > 100) || segments[segments.length - 1];
  }
  function toggleLayers() {
    const visible = visibleSegment();
    const base = visible && (visible.dataset.author === 'tibi' ? visible.closest('.passage-pair').querySelector('.kashshaf') : visible);
    const y = base ? base.getBoundingClientRect().top : 0;
    state.tibi = !state.tibi; apply(); persist();
    if (base) requestAnimationFrame(() => window.scrollBy(0, base.getBoundingClientRect().top - y));
    notify(state.tibi ? 'Ṭībī commentary shown' : 'Ṭībī commentary hidden');
  }
  const el = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  function open(title, action) {
    openAction = action; $('#sheet-title').textContent = title; sheetBody.replaceChildren();
    if (!sheet.open) { if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', ''); }
  }
  function close() { if (typeof sheet.close === 'function') sheet.close(); else sheet.removeAttribute('open'); openAction = ''; }
  function contents() {
    open('Contents', 'contents');
    sheetBody.append($('#contents-template').content.cloneNode(true));
    const path = location.pathname.split('/').pop();
    $$('.toc-item', sheetBody).forEach(a => { if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page'); });
    const saved = $('#saved-list', sheetBody);
    if (!state.bookmarks.length) saved.append(el('p', 'Use the bookmark control to save your current passage on this device.', 'muted'));
    state.bookmarks.forEach(b => {
      const row = el('div', undefined, 'saved-item'), a = el('a', b.label), remove = el('button', 'Remove');
      a.href = b.url; remove.type = 'button'; remove.setAttribute('aria-label', 'Remove bookmark ' + b.label);
      remove.addEventListener('click', () => { state.bookmarks = state.bookmarks.filter(x => x.url !== b.url); persist(); contents(); });
      row.append(a, remove); saved.append(row);
    });
  }
  function normal(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[ʿʾ‘’'“”]/g, '').toLowerCase(); }
  function search() {
    open('Search the translations', 'search');
    const label = el('label', 'Words or a passage reference'); label.htmlFor = 'search-input';
    const input = el('input'); input.id = 'search-input'; input.type = 'search'; input.placeholder = 'e.g. decree, wisdom, T099.09';
    const filterLabel = el('label', 'Search within'); filterLabel.htmlFor = 'author-filter';
    const filter = el('select'); filter.id = 'author-filter';
    [['all','Both authors'],['kashshaf','Al-Zamakhsharī'],['tibi','Al-Ṭībī']].forEach(([v,t]) => { const opt = el('option',t); opt.value=v; filter.append(opt); });
    const count = el('p', 'Enter a word to search all available sūrahs.', 'muted'); count.id='search-count'; count.setAttribute('role','status');
    const list = el('ol'); list.id='search-results';
    sheetBody.append(label,input,filterLabel,filter,count,list);
    let timer;
    function run() {
      list.replaceChildren(); const query=normal(input.value.trim());
      if (!query) { count.textContent='Enter a word to search all available sūrahs.';return; }
      const terms=query.split(/\s+/);
      const hits=searchData.filter(s => (filter.value==='all'||s.author===filter.value) && terms.every(t=>normal(s.id+' '+s.name+' '+s.title+' '+s.text).includes(t)));
      count.textContent=hits.length+' matching passages'+(hits.length>60?' · first 60 shown; refine your search':'')+'. Search includes Ṭībī even when his layer is hidden.';
      hits.slice(0,60).forEach(s=>{
        const li=el('li'),a=el('a',s.name+' · '+s.title),meta=el('small',s.id+' · '+(s.author==='tibi'?'Al-Ṭībī':'Al-Zamakhsharī'));
        a.href=s.url;
        a.addEventListener('click',()=>{if(s.author==='tibi'){state.tibi=true;apply();persist();}close();});
        const ix=normal(s.text).indexOf(terms[0]);const start=Math.max(0,ix-65);
        const snippet=el('p',(start?'…':'')+s.text.slice(start,start+230)+(start+230<s.text.length?'…':''));
        li.append(a,meta,snippet);list.append(li);
      });
    }
    input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,120);});filter.addEventListener('change',run);
    requestAnimationFrame(()=>input.focus());
  }
  function settings() {
    open('Reading settings', 'settings');
    const row=el('div',undefined,'settings-row'),label=el('span','Text size'),minus=el('button','A−'),plus=el('button','A+'),value=el('output',String(state.size)+' px');
    minus.type=plus.type='button';minus.setAttribute('aria-label','Decrease text size');plus.setAttribute('aria-label','Increase text size');
    const resize=d=>{state.size=Math.max(16,Math.min(28,state.size+d));apply();persist();value.textContent=state.size+' px';};
    minus.onclick=()=>resize(-1);plus.onclick=()=>resize(1);row.append(label,minus,value,plus);sheetBody.append(row);
    const themeLabel=el('label','Page colour');themeLabel.htmlFor='theme-select';const select=el('select');select.id='theme-select';
    [['sea','Ocean'],['paper','Warm paper'],['night','Night']].forEach(([v,t])=>{const opt=el('option',t);opt.value=v;select.append(opt);});select.value=state.theme;
    select.onchange=()=>{state.theme=select.value;apply();persist();};sheetBody.append(themeLabel,select);
    const layer=el('button',state.tibi?'Hide Ṭībī commentary':'Show Ṭībī commentary');layer.type='button';layer.style.marginTop='20px';layer.onclick=()=>{toggleLayers();settings();};sheetBody.append(layer);
    sheetBody.append(el('p','Preferences and bookmarks are saved in this browser. Hiding a layer does not remove it from the downloads.','muted'));
  }
  function downloads() {
    open('Keep a reading copy','downloads');
    const links=[['complete-reading-copy.txt','All translations · plain text'],['Kashshaf-Tibi-C06-Translations.zip','Individual drafts and coverage · ZIP']];
    $$('.chapter-downloads a').forEach(a=>links.push([a.getAttribute('href'),a.textContent]));
    links.forEach(([url,label])=>{const a=el('a',label,'button');a.href=url;a.setAttribute('download','');sheetBody.append(a);});
    const print=el('button','Print this reading view');print.type='button';print.onclick=()=>{close();window.print();};sheetBody.append(print);
    sheetBody.append(el('p','Downloads contain both authorial layers and all notes, including the explicitly partial Fātiḥa commentary. Printing follows the currently selected layer visibility.','muted'));
  }
  function current() {
    const s=visibleSegment(); if(s) return s;
    return activeId ? document.getElementById(activeId) : null;
  }
  function save() {
    const s=current(); if(!s){notify('Open a sūrah to save a passage.');return;}
    const url=location.pathname.split('/').pop()+'#'+s.id;
    if(state.bookmarks.some(x=>x.url===url)){notify('This passage is already saved. Find it in Contents.');return;}
    state.bookmarks.push({url,label:s.id+' · '+s.querySelector('h3').textContent});persist();notify('Passage saved in Contents');
  }
  async function copy() {
    const s=current(),url=new URL(location.href);if(s)url.hash=s.id;
    try { await navigator.clipboard.writeText(url.href);notify('Passage link copied'); }
    catch (_) {open('Copy this link','copy');const label=el('label','Passage link');label.htmlFor='copy-link';const input=el('input');input.id='copy-link';input.type='text';input.readOnly=true;input.value=url.href;sheetBody.append(label,input);input.focus();input.select();}
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    const action=b.dataset.action;
    ({contents,layers:toggleLayers,search,save,settings,downloads,copy,close,focus:()=>{state.focus=!state.focus;apply();persist();}}[action]||(()=>{}))();
  });
  sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  function followHash() {
    const id=decodeURIComponent(location.hash.slice(1));if(!/^[KT]\d{3}\.\d+$/.test(id))return;
    const target=document.getElementById(id);if(!target)return;
    if(id[0]==='T'&&!state.tibi){state.tibi=true;apply();persist();}
    activeId=id;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
  apply();followHash();window.addEventListener('hashchange',followHash);
  const start=$('#continue-reading');
  if(start && typeof state.last==='string' && /^surah-\d{3}\.html#[KT]\d{3}\.\d+$/.test(state.last) && searchData.some(s=>s.url===state.last)) {start.href=state.last;start.textContent='Continue reading';}
  let scrollTimer;
  window.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const s=current();if(s){activeId=s.id;state.last=location.pathname.split('/').pop()+'#'+s.id;persist();}},250);},{passive:true});
  // Plain-text anchors and downloads remain useful if these enhancements are unavailable.
})();
