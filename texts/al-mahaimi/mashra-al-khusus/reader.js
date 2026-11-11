(() => {
  'use strict';
  const corpus = JSON.parse(document.getElementById('corpus-json').textContent);
  const coverage = JSON.parse(document.getElementById('coverage-json').textContent);
  const root = document.documentElement;
  const $ = id => document.getElementById(id);
  const storageKey = 'nama-mahaimi-reader-v1';
  const bookmarksKey = storageKey + '-bookmarks';
  const positionKey = storageKey + '-position';
  const defaults = {lang: 'both', work: 'sharh', source: 'qunawi_original_proof', scale: 100, theme: 'system', font: 'serif', order: 'ar-first', notes: true, headings: true, sources: true, sidebar: true};
  const readStore = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } };
  const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const stored = readStore(storageKey, {});
  const state = {...defaults, ...stored};
  for (const [key, allowed] of Object.entries({lang:['ar','en','both'],work:['all','matn','sharh'],source:['all','qunawi_original_proof','qunawi_online_transcription','qunawi_original'],theme:['system','light','night'],font:['serif','sans'],order:['ar-first','en-first']})) if (!allowed.includes(state[key])) state[key] = defaults[key];
  state.scale = Math.max(85, Math.min(145, Number(state.scale) || 100));
  for (const key of ['notes','headings','sources','sidebar']) state[key] = typeof state[key] === 'boolean' ? state[key] : defaults[key];
  const savedPosition = readStore(positionKey, null);
  let bookmarks = readStore(bookmarksKey, []);
  if (!Array.isArray(bookmarks)) bookmarks = [];
  const byId = new Map(corpus.map(s => [s.id, s]));
  bookmarks = [...new Set(bookmarks.filter(id => typeof id === 'string' && byId.has(id)))];
  const elements = new Map();
  const navElements = new Map();
  const layerNames = {commentary:'Al-Mahāʾimī · commentary', qunawi_original_proof:'Qūnawī · 2008 appendix page proofs', qunawi_original:'Qūnawī · earlier English draft', qunawi_online_transcription:'Qūnawī · separate online transcription'};
  const layerOrder = ['commentary','qunawi_original_proof','qunawi_online_transcription','qunawi_original'];
  const matnLayers = [...new Set(corpus.filter(s=>s.edition_layer!=='commentary').map(s=>s.edition_layer))];
  if(!matnLayers.includes(state.source)&&state.source!=='all')state.source=matnLayers[0]||'all';
  for(const option of [...$('matn-source').options])if(option.value!=='all'&&!matnLayers.includes(option.value))option.remove();
  if(matnLayers.length===1)$('matn-source').querySelector('[value="all"]')?.remove();
  if(matnLayers.length===1&&state.source==='all')state.source=matnLayers[0];
  const readingOrder = [...corpus].sort((a,b) => {
    const layer = layerOrder.indexOf(a.edition_layer) - layerOrder.indexOf(b.edition_layer);
    if (layer) return layer;
    if (a.edition_layer === 'qunawi_original_proof') return a.printed_pages[0] - b.printed_pages[0];
    return corpus.indexOf(a) - corpus.indexOf(b);
  });
  const isCommentary = s => s.edition_layer === 'commentary';
  const pageLabel = s => s.printed_pages?.[0] > 0 ? 'p. ' + (s.printed_pages[0] === s.printed_pages[1] ? s.printed_pages[0] : s.printed_pages.join('–')) : (s.appendix_segment ? 'English segment ' + s.appendix_segment : 'Separate source');
  const el = (tag, attrs = {}, text) => {
    const n = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) n.setAttribute(key, String(value));
    if (text != null) n.textContent = text;
    return n;
  };
  const icon = name => { const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('class','icon'); svg.setAttribute('aria-hidden','true'); const use = document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href','#i-' + name); svg.append(use); return svg; };
  const safeUrl = value => { if (!value) return ''; try { const u = new URL(value, location.href); return ['https:','http:','file:'].includes(u.protocol) ? u.href : ''; } catch (_) { return ''; } };
  const normalize = text => String(text || '').normalize('NFKD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[ʾʿ’']/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const searchIndex = new Map(corpus.map(s => [s.id, normalize([s.id,s.title,pageLabel(s),...s.pairs.flatMap(p => [p.ar || '', p.en || ''])].join(' '))]));
  const inline = (parent, text) => {
    // Only a small set of Markdown emphasis is interpreted; source HTML is always text.
    for (const part of String(text || '').split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g)) {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) parent.append(el('strong',{},part.slice(2,-2)));
      else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) parent.append(el('em',{},part.slice(1,-1)));
      else parent.append(document.createTextNode(part));
    }
  };
  const prose = (text, lang) => {
    const block = el('div',{class:'prose ' + lang,lang,dir:lang === 'ar'?'rtl':'ltr'});
    for (const chunk of String(text || '').split(/\n\s*\n/)) {
      if (!chunk.trim()) continue;
      const heading = chunk.match(/^#{1,5}\s+([^\n]+)(?:\n([\s\S]*))?$/);
      if (heading) { const h = el('h3'); inline(h,heading[1]); block.append(h); if (heading[2]) {const p = el('p'); inline(p,heading[2]); block.append(p);} }
      else if (chunk.split('\n').every(line => /^\s*[-*]\s+/.test(line))) { const ul = el('ul'); for (const line of chunk.split('\n')) {const li = el('li'); inline(li,line.replace(/^\s*[-*]\s+/,'')); ul.append(li);} block.append(ul); }
      else { const p = el('p'); inline(p,chunk); block.append(p); }
    }
    return block;
  };
  let toastTimer;
  const toast = message => { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => {$('toast').hidden = true;},2500); };
  const persist = () => writeStore(storageKey, state);
  const themeMedia = matchMedia('(prefers-color-scheme: dark)');
  const mobileMedia = matchMedia('(max-width: 860px)');
  const applyAppearance = () => {
    root.dataset.lang = state.lang;
    root.dataset.theme = state.theme === 'system' ? (themeMedia.matches ? 'night' : 'light') : state.theme;
    root.dataset.font = state.font;
    root.dataset.order = state.order;
    root.dataset.notes = state.notes ? 'on' : 'off';
    root.dataset.headings = state.headings ? 'on' : 'off';
    root.dataset.sources = state.sources ? 'on' : 'off';
    root.dataset.sidebar = state.sidebar ? 'shown' : 'hidden';
    root.style.setProperty('--scale', String(state.scale / 100));
    document.querySelectorAll('button[data-lang]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.lang === state.lang)));
    $('text-scale').value = state.scale;
    $('scale-value').textContent = state.scale + '%';
    $('smaller').disabled = state.scale <= 85;
    $('larger').disabled = state.scale >= 145;
    $('theme-select').value = state.theme;
    $('font-select').value = state.font;
    $('column-order').value = state.order;
    $('notes-toggle').checked = state.notes;
    $('headings-toggle').checked = state.headings;
    $('sources-toggle').checked = state.sources;
  };
  const updateBookmarkButtons = () => {
    for (const [id, article] of elements) {
      const b = article.querySelector('[data-bookmark]');
      const marked = bookmarks.includes(id);
      b.setAttribute('aria-pressed', String(marked));
      b.setAttribute('aria-label',(marked?'Remove bookmark: ':'Bookmark: ') + byId.get(id).title);
      b.title = marked ? 'Remove bookmark' : 'Bookmark this section';
    }
    $('bookmark-count').textContent = bookmarks.length;
    $('bookmark-count').hidden = !bookmarks.length;
  };
  const toggleBookmark = id => {
    const exists = bookmarks.includes(id);
    bookmarks = exists ? bookmarks.filter(x => x !== id) : [...bookmarks,id];
    writeStore(bookmarksKey, bookmarks);
    updateBookmarkButtons();
    renderBookmarks();
    toast(exists ? 'Bookmark removed' : 'Bookmark saved on this device');
  };
  const copyLink = async id => {
    const url = new URL(location.href); url.hash = id;
    try { await navigator.clipboard.writeText(url.href); toast('Passage link copied'); }
    catch (_) {
      const field = el('textarea', {class:'sr-only'}); field.value = url.href; document.body.append(field); field.select();
      try { const copied = document.execCommand('copy'); toast(copied ? 'Passage link copied' : 'Passage link is in the address bar'); } catch (_) { toast('Passage link is in the address bar'); }
      field.remove(); history.replaceState(null,'',url.hash);
    }
  };
  const fragment = document.createDocumentFragment();
  for (const s of readingOrder) {
    const article = el('section',{class:'entry',id:s.id,'data-work-layer':isCommentary(s)?'sharh':'matn','data-edition-layer':s.edition_layer});
    const heading = el('div',{class:'entry-heading'});
    const headingText = el('div');
    const eyebrow = el('div',{class:'eyebrow'});
    eyebrow.append(el('span',{class:'entry-id'},pageLabel(s)),el('span',{},isCommentary(s)?'Al-Mahāʾimī':'Qūnawī'));
    const source = safeUrl(s.source_url);
    if (source) eyebrow.append(el('a',{class:'source-link',href:source,target:'_blank',rel:'noopener'},'Arabic source ↗'));
    headingText.append(eyebrow,el('h2',{},s.title));
    const actions = el('div',{class:'entry-actions'});
    const bookmark = el('button',{class:'icon-btn','data-bookmark':s.id,'aria-label':'Bookmark: '+s.title,'aria-pressed':'false',type:'button'}); bookmark.append(icon('bookmark')); bookmark.addEventListener('click',() => toggleBookmark(s.id));
    const copy = el('button',{class:'icon-btn','aria-label':'Copy link to '+s.title,title:'Copy passage link',type:'button'}); copy.append(icon('link')); copy.addEventListener('click',() => copyLink(s.id));
    actions.append(bookmark,copy);heading.append(headingText,actions);article.append(heading);
    if (s.speaker_layer) article.append(el('p',{class:'speaker-credit'},s.speaker_layer));
    const hasArabic = s.pairs.some(p => p.ar?.trim());
    let confidence = isCommentary(s) ? 'Commentary · English working translation' : (layerNames[s.edition_layer] || 'Qūnawī original');
    confidence += hasArabic ? ' · Arabic text available' : ' · Arabic source text pending';
    if (s.heading_is_editorial) confidence += ' · Editorial heading';
    article.append(el('p',{class:'source-confidence'},confidence));
    if (s.source_locator) article.append(el('p',{class:'source-locator'},s.source_locator));
    for (const p of s.pairs) {
      const pair = el('div',{class:'pair','data-pair':String(p.sequence)});
      for (const lang of ['ar','en']) {
        const col = el('div',{class:lang+'-wrap'});
        const present = Boolean(p[lang]?.trim());
        col.append(el('div',{class:'language-label'+(present?'':' label-pending')},lang==='ar'?'Arabic':'English · working translation'));
        if (present) col.append(prose(p[lang],lang));
        else col.append(el('p',{class:'pending-source',lang:'en',dir:'ltr'},lang==='ar'?'The Arabic source text for this passage has not yet been included. The English remains a working draft.':'An English translation for this source passage has not yet been included.'));
        pair.append(col);
      }
      article.append(pair);
    }
    if (s.editorial_note) {
      const note = el('details',{class:'entry-note editorial'});
      note.append(el('summary',{},'Editorial note'));
      // Long inherited notes are not parsed or rendered until explicitly opened.
      note.renderNote = () => {if (!note.dataset.loaded) {const body=prose(s.editorial_note,'en'); body.className='note-body';note.append(body);note.dataset.loaded='true';}};
      note.addEventListener('toggle',() => { if (note.open) note.renderNote(); });
      article.append(note);
    }
    const links = [...(s.concordance_links||[]),...(s.matn_links||[]),...(s.appendix_links||[])].filter(l => byId.has(l.target_id));
    if (links.length) {
      const refs = el('details',{class:'source-crossrefs'});
      refs.append(el('summary',{},(isCommentary(s)?'Related passages in Qūnawī':'Related commentary passages')+' · '+links.length));
      for (const link of links) {
        const target = byId.get(link.target_id);
        const a = el('a',{href:'#'+target.id,'data-crossref':target.id},link.label || target.title);
        a.append(el('small',{},pageLabel(target) + ' · ' + (layerNames[target.edition_layer] || 'Related text')));
        a.addEventListener('click',event => {event.preventDefault();navigate(target.id);});refs.append(a);
      }
      article.append(refs);
    }
    fragment.append(article);elements.set(s.id,article);
  }
  $('reading').append(fragment);
  let activeId = null;
  let visibleEntries = [];
  const visible = s => (state.work === 'all' || (state.work === 'sharh') === isCommentary(s)) && (isCommentary(s) || state.source === 'all' || state.source === s.edition_layer);
  const setActive = id => {
    if (activeId === id) return;
    navElements.get(activeId)?.removeAttribute('aria-current');
    activeId = id;
    navElements.get(id)?.setAttribute('aria-current','true');
    if (id && [...$('jump').options].some(o => o.value === id)) $('jump').value = id;
  };
  const applyView = () => {
    root.dataset.work = state.work;
    $('work-select').value = state.work;
    $('matn-source').value = state.source;
    $('matn-source-field').hidden = state.work === 'sharh' || matnLayers.length < 2;
    const nav = document.createDocumentFragment();
    const options = document.createDocumentFragment();
    navElements.clear();
    visibleEntries = [];
    let lastLayer = null;
    for (const s of readingOrder) {
      const article = elements.get(s.id);
      article.hidden = !visible(s);
      if (article.hidden) continue;
      visibleEntries.push(s);
      if (lastLayer !== s.edition_layer) {nav.append(el('div',{class:'nav-group'},layerNames[s.edition_layer] || 'Text'));lastLayer=s.edition_layer;}
      const a = el('a',{href:'#'+s.id},s.title);a.append(el('small',{},pageLabel(s)));
      a.addEventListener('click',event => {event.preventDefault();navigate(s.id);});nav.append(a);navElements.set(s.id,a);
      options.append(el('option',{value:s.id},pageLabel(s)+' · '+s.title));
    }
    $('nav-items').replaceChildren(nav);$('jump').replaceChildren(options);
    $('reading-count').textContent = visibleEntries.length+' sections';
    $('current-work').textContent = state.work === 'all' ? 'Commentary & original' : state.work === 'sharh' ? 'Al-Mahāʾimī · commentary' : (layerNames[state.source] || 'Qūnawī · all source layers');
    $('contents-help').textContent = state.work === 'sharh' ? 'Continuous reading · headings are editorial' : state.source === 'all' ? 'Source layers may overlap; select one for continuous reading.' : 'One source layer · headings are editorial';
    const keep = visibleEntries.find(s => s.id === activeId);
    const next = keep?.id || visibleEntries[0]?.id;
    activeId = null;setActive(next);schedulePosition();
  };
  let drawerOpen = false;
  let drawerOrigin = null;
  const syncDrawer = () => {
    const isMobile = mobileMedia.matches;
    $('contents-panel').dataset.open = String(isMobile && drawerOpen);
    $('drawer-shade').hidden = !isMobile || !drawerOpen;
    $('contents-panel').inert = isMobile ? !drawerOpen : !state.sidebar;
    $('contents-toggle').setAttribute('aria-expanded',String(isMobile ? drawerOpen : state.sidebar));
  };
  const closeDrawer = () => {drawerOpen=false;syncDrawer();if (drawerOrigin && mobileMedia.matches) drawerOrigin.focus();};
  const toggleDrawer = () => {
    if (mobileMedia.matches) {drawerOpen=!drawerOpen;drawerOrigin=document.activeElement;syncDrawer();if(drawerOpen)$('contents-close').focus();}
    else {state.sidebar=!state.sidebar;applyAppearance();syncDrawer();persist();}
  };
  const navigate = (id, options = {}) => {
    const s = byId.get(id);if (!s) return;
    if (!visible(s)) {
      state.work = isCommentary(s)?'sharh':'matn';
      if (!isCommentary(s)) state.source=s.edition_layer;
      applyView();persist();
    }
    closeDrawer();
    for (const d of document.querySelectorAll('dialog[open]')) d.close();
    if (options.history !== false) history.pushState(null,'','#'+id);
    const article=elements.get(id);
    article.scrollIntoView({behavior:options.instant?'auto':'smooth',block:'start'});
    article.classList.remove('context-highlight');requestAnimationFrame(()=>article.classList.add('context-highlight'));
    setActive(id);$('resume-box').hidden=true;
  };
  const renderBookmarks = () => {
    const fragment = document.createDocumentFragment();
    if (!bookmarks.length) fragment.append(el('p',{class:'empty-message'},'No bookmarks yet. Use the bookmark icon beside a section to save your place.'));
    for (const id of bookmarks) {
      const s=byId.get(id), row=el('div',{class:'bookmark-row'});
      const open=el('button',{type:'button'},s.title);open.append(el('small',{},pageLabel(s)+' · '+(isCommentary(s)?'Al-Mahāʾimī':'Qūnawī')));open.addEventListener('click',()=>navigate(id));
      const remove=el('button',{class:'icon-btn',type:'button','aria-label':'Remove bookmark: '+s.title});remove.append(icon('close'));remove.addEventListener('click',()=>toggleBookmark(id));row.append(open,remove);fragment.append(row);
    }
    $('bookmarks-list').replaceChildren(fragment);
  };
  const openDialog = id => {const d=$(id);if (id==='bookmarks-dialog')renderBookmarks();d.showModal();if(id==='search-dialog'){$('pagefilter').focus();$('pagefilter').select();}};
  const excerpt = (s,q) => {
    const candidates=s.pairs.flatMap(p=>[['en',p.en||''],['ar',p.ar||'']]);
    const chosen=candidates.find(([,t])=>normalize(t).includes(q)) || candidates.find(([,t])=>t) || ['en',s.title];
    const text=chosen[1].replace(/\*|#{1,5}/g,'').replace(/\s+/g,' ').trim();
    const literal=text.toLowerCase().indexOf($('pagefilter').value.trim().toLowerCase());
    const start=Math.max(0,literal-65);const length=chosen[0]==='ar'?160:210;
    return {lang:chosen[0],text:(start?'…':'')+text.slice(start,start+length)+(text.length>start+length?'…':'')};
  };
  const search = () => {
    const q=normalize($('pagefilter').value);const results=$('search-results');results.replaceChildren();
    if(!q){$('search-status').textContent='Enter a word or phrase.';return;}
    const numeric=q.match(/^(?:p\.?\s*)?(\d+)$/);
    const matches=readingOrder.filter(s=>numeric ? s.printed_pages?.[0] > 0 && +numeric[1] >= s.printed_pages[0] && +numeric[1] <= s.printed_pages[1] : searchIndex.get(s.id).includes(q));
    $('search-status').textContent=matches.length ? matches.length+' matching '+(matches.length===1?'section':'sections')+(matches.length>80?' · first 80 shown; refine your search.':'.') : 'No matching passages. Try a shorter word or phrase.';
    const frag=document.createDocumentFragment();
    for(const s of matches.slice(0,80)){
      const b=el('button',{class:'search-result',type:'button'});b.append(el('strong',{},s.title),el('small',{},pageLabel(s)+' · '+(layerNames[s.edition_layer] || 'Text')));const sample=excerpt(s,q);b.append(el('p',{lang:sample.lang,dir:sample.lang==='ar'?'rtl':'ltr'},sample.text));b.addEventListener('click',()=>navigate(s.id));frag.append(b);
    }
    results.append(frag);
  };
  let searchTimer;
  $('pagefilter').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,100);});
  $('search-toggle').addEventListener('click',()=>openDialog('search-dialog'));
  document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.dialog)));
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}}));
  document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>{state.lang=b.dataset.lang;applyAppearance();persist();}));
  $('text-scale').addEventListener('input',event=>{state.scale=+event.target.value;applyAppearance();persist();});
  $('smaller').addEventListener('click',()=>{state.scale=Math.max(85,state.scale-5);applyAppearance();persist();});
  $('larger').addEventListener('click',()=>{state.scale=Math.min(145,state.scale+5);applyAppearance();persist();});
  for(const [id,key] of [['theme-select','theme'],['font-select','font'],['column-order','order']])$(id).addEventListener('change',event=>{state[key]=event.target.value;applyAppearance();persist();});
  for(const [id,key] of [['notes-toggle','notes'],['headings-toggle','headings'],['sources-toggle','sources']])$(id).addEventListener('change',event=>{state[key]=event.target.checked;applyAppearance();persist();});
  $('work-select').addEventListener('change',event=>{state.work=event.target.value;applyView();persist();if(visibleEntries.length)navigate(visibleEntries[0].id);});
  $('matn-source').addEventListener('change',event=>{state.source=event.target.value;applyView();persist();if(visibleEntries.length)navigate(visibleEntries[0].id);});
  $('jump').addEventListener('change',event=>navigate(event.target.value));
  $('contents-toggle').addEventListener('click',toggleDrawer);
  $('contents-close').addEventListener('click',closeDrawer);
  $('drawer-shade').addEventListener('click',closeDrawer);
  $('source-notes-link').addEventListener('click',closeDrawer);
  $('back-top').addEventListener('click',()=>{history.pushState(null,'',location.pathname+location.search);window.scrollTo({top:0,behavior:'smooth'});});
  $('reset-settings').addEventListener('click',()=>{Object.assign(state,defaults);applyAppearance();applyView();syncDrawer();persist();toast('Reading settings reset');});
  themeMedia.addEventListener('change',applyAppearance);mobileMedia.addEventListener('change',syncDrawer);
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openDialog('search-dialog');}
    if(event.key==='Escape'&&drawerOpen)closeDrawer();
    if(drawerOpen&&mobileMedia.matches&&event.key==='Tab'){
      const items=[...$('contents-panel').querySelectorAll('button,a,select,input')].filter(x=>!x.disabled&&x.getClientRects().length);
      const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  const onHash = () => {const id=decodeURIComponent(location.hash.slice(1));if(byId.has(id))navigate(id,{history:false,instant:true});};
  window.addEventListener('hashchange',onHash);window.addEventListener('popstate',onHash);
  let positionTimer;
  let positionReady=false;
  const recordPosition = () => {
    const max=document.documentElement.scrollHeight-innerHeight;
    $('progress-fill').style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';
    if(!positionReady||scrollY<150)return;
    const y=parseFloat(getComputedStyle(root).getPropertyValue('--header'))+30;
    const candidates=visibleEntries.map(s=>({id:s.id,rect:elements.get(s.id).getBoundingClientRect()}));
    const nearest=candidates.find(x=>x.rect.bottom>y)||candidates[candidates.length-1];
    if(nearest){setActive(nearest.id);writeStore(positionKey,{id:nearest.id,offset:Math.max(0,-nearest.rect.top),work:state.work,source:state.source,date:Date.now()});}
  };
  function schedulePosition(){clearTimeout(positionTimer);positionTimer=setTimeout(recordPosition,180);}
  window.addEventListener('scroll',schedulePosition,{passive:true});
  let printStates=[];
  window.addEventListener('beforeprint',()=>{
    printStates=[];
    if(state.notes)for(const d of document.querySelectorAll('.entry:not([hidden]) .entry-note,.entry:not([hidden]) .source-crossrefs')){printStates.push([d,d.open]);d.renderNote?.();d.open=true;}
  });
  window.addEventListener('afterprint',()=>{for(const [d,open] of printStates)d.open=open;printStates=[];});
  $('print-view').addEventListener('click',()=>{$('downloads-dialog').close();window.print();});
  const summary=coverage.summary;
  $('edition-summary-text').textContent='Arabic & English · '+summary.commentary_english_pages+' commentary pages · '+summary.appendix_english_pages+' original-text pages';
  if(summary.ledger_path)$('ledger-link').href=summary.ledger_path;
  const cards=[['Commentary English',summary.commentary_english_pages,summary.commentary_pages,'Working translation'],['Commentary Arabic',summary.commentary_arabic_pages,summary.commentary_pages,'Source text available'],['Qūnawī original',Math.min(summary.appendix_arabic_pages,summary.appendix_english_pages),summary.appendix_total_pages,'Arabic and English']];
  for(const [title,count,total,caption] of cards){const card=el('div',{class:'coverage-card'});card.append(el('strong',{},count+' / '+total),el('span',{},title+' · '+caption));card.append(el('progress',{max:total,value:count,'aria-label':title+': '+count+' of '+total}));$('coverage-cards').append(card);}
  applyAppearance();applyView();syncDrawer();updateBookmarkButtons();renderBookmarks();
  if(savedPosition?.id&&byId.has(savedPosition.id)&&!location.hash){const s=byId.get(savedPosition.id);$('resume-label').textContent='Last read: '+pageLabel(s)+' · '+s.title;$('resume-box').hidden=false;$('resume-button').addEventListener('click',()=>{navigate(s.id,{instant:true});if(savedPosition.offset)window.scrollBy({top:savedPosition.offset,behavior:'auto'});});}
  $('resume-dismiss').addEventListener('click',()=>{$('resume-box').hidden=true;});
  requestAnimationFrame(()=>{onHash();setTimeout(()=>{positionReady=true;recordPosition();},250);});
})();
