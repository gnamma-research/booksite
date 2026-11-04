/* The Hikma reading room: a dependency-free Arabic–English reader. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const bookId = document.body.dataset.book;
  const prefix = `gnamma-hikma:${bookId}:`;
  const text = value => value == null ? '' : String(value);
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = text(value);
    return node;
  };
  const state = { book: null, units: [], groups: [], stages: new Map(), byUnit: new Map(), byHash: new Map(), query: '', savedOnly: false, active: null, noteUnit: null, observer: null, sidebarOpen: false };
  let toastTimer;
  let storageWarned = false;
  function notify(message) {
    clearTimeout(toastTimer);
    $('reader-toast').textContent = message;
    $('reader-toast').hidden = false;
    toastTimer = setTimeout(() => { $('reader-toast').hidden = true; }, 3200);
  }
  function readStorage(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) {
      if (!storageWarned) notify('This browser cannot save your reading preferences or notes. They will last for this visit only.');
      storageWarned = true;
      return false;
    }
  }
  const initialBookmarks = readStorage(prefix + 'bookmarks', []);
  state.bookmarks = new Set(Array.isArray(initialBookmarks) ? initialBookmarks.filter(v => typeof v === 'string') : []);
  const initialNotes = readStorage(prefix + 'notes', {});
  state.notes = initialNotes && typeof initialNotes === 'object' && !Array.isArray(initialNotes) ? initialNotes : {};
  const initialPreferences = readStorage('gnamma-hikma:preferences', {});
  const p = initialPreferences && typeof initialPreferences === 'object' ? initialPreferences : {};
  state.preferences = {
    language: ['bilingual', 'arabic', 'english'].includes(p.language) ? p.language : 'bilingual',
    order: p.order === 'arabic-first' ? p.order : 'english-first',
    view: ['focus', 'continuous'].includes(p.view) ? p.view : 'focus',
    size: Number.isFinite(p.size) ? Math.max(16, Math.min(26, p.size)) : 19,
    theme: ['dark', 'light'].includes(p.theme) ? p.theme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  };
  function applyPreferences(save = false) {
    const pref = state.preferences;
    root.dataset.language = pref.language;
    root.dataset.order = pref.order;
    root.dataset.theme = pref.theme;
    root.style.setProperty('--reading-size', pref.size + 'px');
    document.querySelectorAll('button[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === pref.language)));
    $('reading-view').value = pref.view;
    $('font-decrease').disabled = pref.size <= 16;
    $('font-increase').disabled = pref.size >= 26;
    const themeLabel = `Use ${pref.theme === 'light' ? 'dark' : 'light'} appearance`;
    $('theme-toggle').setAttribute('aria-label', themeLabel);
    $('theme-toggle').title = themeLabel;
    $('theme-toggle').setAttribute('aria-pressed', String(pref.theme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = pref.theme === 'dark' ? '#242720' : '#f5f1e8';
    const orderLabel = `Place ${pref.order === 'english-first' ? 'Arabic' : 'English'} first`;
    $('order-toggle').setAttribute('aria-label', orderLabel);
    $('order-toggle').title = orderLabel;
    if (save) writeStorage('gnamma-hikma:preferences', pref);
  }
  applyPreferences();

  const iconPaths = {
    bookmark: ['M6 3h12v18l-6-4-6 4Z'],
    note: ['M14 4 20 10M4 20l5-1L20 8a2.1 2.1 0 0 0-3-3L6 16Z'],
    link: ['m10 13 4-4M8 16l-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0M16 8l2-2a3 3 0 0 0-4-4l-5 5a3 3 0 0 0 0 4'],
    external: ['M13 4h7v7M20 4 10 14M10 4H4v16h16v-6']
  };
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '16'); svg.setAttribute('height', '16'); svg.setAttribute('aria-hidden', 'true');
    for (const d of iconPaths[name] || []) { const path = document.createElementNS(svg.namespaceURI, 'path'); path.setAttribute('d', d); svg.append(path); }
    return svg;
  }
  function safeUrl(value) {
    try { const url = new URL(text(value), location.href); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch (_) { return null; }
  }
  function link(label, url, className) {
    const href = safeUrl(url);
    if (!href) return make('span', className, label);
    const a = make('a', className, label); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function addLinkedText(node, value) {
    const parts = text(value).split(/(https?:\/\/[^\s<>]+)/g);
    for (const part of parts) {
      if (/^https?:\/\//.test(part)) {
        const cleaned = part.replace(/[.,;:)\]]+$/, '');
        let label = cleaned;
        try { label = new URL(cleaned).hostname.replace(/^www\./, ''); } catch (_) { /* Plain text remains readable. */ }
        node.append(link(label, cleaned), document.createTextNode(part.slice(cleaned.length)));
      } else node.append(document.createTextNode(part));
    }
  }
  function normalise(value) {
    return text(value).normalize('NFD').replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').toLowerCase();
  }
  const isGuide = unit => /editorial|guide|outline/.test(unit.status.toLowerCase());
  const hasEnglish = unit => !!unit.english.trim() && !isGuide(unit);
  function statusLabel(unit) {
    if (isGuide(unit)) return 'Editorial reading guide';
    if (!unit.english.trim()) return 'English translation forthcoming';
    if (/draft|working|provisional|unreviewed/.test(unit.status.toLowerCase())) return 'Working translation';
    if (/reviewed|verified/.test(unit.status.toLowerCase())) return 'Reviewed translation';
    return 'English translation';
  }
  function slug(value) { return text(value).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'intro'; }
  function chapterNumber(value) { return value == null || value === '' || value === 0 || value === '0' ? '' : text(value); }
  function setData(book) {
    if (!book || !Array.isArray(book.units) || !Array.isArray(book.stages)) throw new Error('Invalid reading edition');
    state.book = book;
    state.stages = new Map(book.stages.map(stage => [text(stage.id), stage]));
    const groups = new Map();
    const usedIds = new Set();
    state.units = book.units.map((raw, index) => {
      const id = text(raw.id || 'passage-' + (index + 1));
      let domId = 'passage-' + slug(id);
      while (usedIds.has(domId)) domId += '-' + (index + 1);
      usedIds.add(domId);
      const unit = { ...raw, id, domId, stage: text(raw.stage == null ? '0' : raw.stage), chapter: chapterNumber(raw.chapter), title: text(raw.title), arabicTitle: text(raw.arabicTitle), arabic: text(raw.arabic), english: text(raw.english), status: text(raw.status || book.status || ''), notes: Array.isArray(raw.notes) ? raw.notes : [] };
      unit.searchText = normalise([unit.title, unit.arabicTitle, unit.arabic, unit.english].join(' '));
      const groupKey = unit.stage + '::' + unit.chapter;
      let group = groups.get(groupKey);
      if (!group) {
        group = { key: groupKey, id: `chapter-${slug(unit.stage)}-${slug(unit.chapter || 'introduction')}`, stage: unit.stage, chapter: unit.chapter, title: unit.title || (unit.chapter ? `Chapter ${unit.chapter}` : 'Introduction'), arabicTitle: unit.arabicTitle, units: [] };
        groups.set(groupKey, group);
      }
      unit.group = group;
      group.units.push(unit);
      return unit;
    });
    state.groups = [...groups.values()];
    state.byUnit = new Map(state.units.map(unit => [unit.id, unit]));
    state.byHash.clear();
    for (const group of state.groups) state.byHash.set(group.id, { group });
    for (const unit of state.units) {
      state.byHash.set(unit.domId, { group: unit.group, unit });
      if (!state.byHash.has(unit.id)) state.byHash.set(unit.id, { group: unit.group, unit });
    }
    state.active = state.groups[0] || null;
    for (const [id, value] of Object.entries(state.notes)) if (typeof value !== 'string') delete state.notes[id];
    updateMetadata();
    renderSources();
    renderGlossary();
    render();
    const target = resolveHash();
    if (target) navigate(target, false);
  }
  function updateMetadata() {
    const book = state.book;
    const translated = state.units.filter(hasEnglish).length;
    const originals = state.units.filter(unit => unit.arabic.trim() && !isGuide(unit)).length;
    const guides = state.units.filter(isGuide).length;
    const author = typeof book.author === 'object' ? (book.author.name || book.author.english || '') : book.author;
    for (const id of ['cover-title', 'sidebar-book-title']) if (book.title) $(id).textContent = book.title;
    for (const id of ['cover-arabic', 'sidebar-arabic']) if (book.arabicTitle) $(id).textContent = book.arabicTitle;
    if (author) $('cover-author').textContent = text(author);
    if (book.description) $('cover-description').textContent = text(book.description);
    document.title = `${text(book.title)} — al-Ṭabāṭabāʾī · gnamma`;
    const authorUnits = state.units.length - guides;
    let coverage;
    if (!authorUnits && guides) coverage = `Reading guide · ${guides} editorial ${guides === 1 ? 'section' : 'sections'} · bilingual text not yet available`;
    else if (!state.units.length) coverage = 'The reading edition is being prepared';
    else coverage = `${originals} Arabic ${originals === 1 ? 'section' : 'sections'} · ${translated} of ${authorUnits} ${authorUnits === 1 ? 'section' : 'sections'} with English${state.units.some(unit => /draft|working|provisional|unreviewed/.test(unit.status.toLowerCase())) ? ' · working translation' : ''}`;
    $('coverage-text').textContent = coverage;
    if (!authorUnits && guides) {
      document.querySelector('.edition-badge').textContent = 'READING GUIDE';
      $('begin-reading').textContent = 'Open the reading guide ↓';
    }
    $('begin-reading').disabled = !state.units.length;
  }
  function matchingUnits() {
    const terms = normalise(state.query).trim().split(/\s+/).filter(Boolean);
    return state.units.filter(unit => (!state.savedOnly || state.bookmarks.has(unit.id)) && terms.every(term => unit.searchText.includes(term)));
  }
  function currentGroups(units) { const ids = new Set(units.map(unit => unit.group.key)); return state.groups.filter(group => ids.has(group.key)); }
  function stageTitle(id) {
    const stage = state.stages.get(id);
    return stage ? text(stage.title) : (id === '0' ? 'Introduction' : `Stage ${id}`);
  }
  function renderToc(units) {
    const openStages = new Set([...$('toc').querySelectorAll('details[open]')].map(node => node.dataset.stage));
    $('toc').replaceChildren();
    const groups = currentGroups(units);
    const byStage = new Map();
    for (const group of groups) {
      let stageNode = byStage.get(group.stage);
      if (!stageNode) {
        stageNode = make('details', 'toc-stage'); stageNode.dataset.stage = group.stage;
        stageNode.open = !!state.query || state.savedOnly || openStages.has(group.stage) || (state.active && state.active.stage === group.stage) || group.stage === '0';
        const summary = make('summary'); summary.append(make('span', 'stage-roman', group.stage === '0' ? '—' : group.stage), make('span', '', stageTitle(group.stage)));
        const list = make('ul', 'toc-chapters'); stageNode.append(summary, list); $('toc').append(stageNode); byStage.set(group.stage, stageNode);
      }
      const item = make('li'); const anchor = make('a'); anchor.href = '#' + group.id; anchor.dataset.group = group.key;
      if (state.active === group) anchor.setAttribute('aria-current', 'true');
      anchor.append(make('span', 'toc-chapter-number', group.chapter || '·'), make('span', 'toc-chapter-title', group.title));
      if (group.units.some(unit => state.bookmarks.has(unit.id))) { const dot = make('span', 'saved-dot', '•'); dot.setAttribute('aria-label', 'Contains a bookmark'); anchor.append(dot); }
      anchor.addEventListener('click', event => { event.preventDefault(); navigate({ group }, true); });
      item.append(anchor); stageNode.querySelector('ul').append(item);
    }
    if (!groups.length) $('toc').append(make('p', 'toc-empty', state.savedOnly ? 'Saved passages will appear here.' : 'No chapters match this search.'));
    const count = state.units.filter(unit => state.bookmarks.has(unit.id)).length;
    $('saved-count').textContent = count;
    $('all-tab').setAttribute('aria-pressed', String(!state.savedOnly));
    $('saved-tab').setAttribute('aria-pressed', String(state.savedOnly));
    $('search-summary').textContent = state.query ? `${units.length} matching ${units.length === 1 ? 'passage' : 'passages'}` : state.savedOnly ? `${units.length} saved ${units.length === 1 ? 'passage' : 'passages'}` : `${state.groups.length} ${state.groups.length === 1 ? 'section' : 'sections'} to explore`;
  }
  function render() {
    if (!state.book) return;
    if (state.observer) state.observer.disconnect();
    const matched = matchingUnits();
    const groups = currentGroups(matched);
    if (!groups.includes(state.active)) state.active = groups[0] || state.groups[0] || null;
    renderToc(matched);
    $('title-page').hidden = !!state.query || state.savedOnly;
    $('filter-notice').hidden = !state.query && !state.savedOnly;
    $('filter-message').textContent = state.query ? `Search results for “${state.query}”${state.savedOnly ? ' in your saved passages' : ''}.` : 'Your saved passages.';
    const shown = state.preferences.view === 'focus' ? matched.filter(unit => unit.group === state.active) : matched;
    const content = $('reading-content'); content.replaceChildren();
    if (!shown.length) {
      const empty = make('div', 'empty-state');
      empty.append(make('span', 'loading-mark', '✦'), make('h2', '', state.savedOnly ? 'A place for passages to return to' : state.query ? 'No passages found' : 'The text is being prepared'), make('p', '', state.savedOnly ? 'Use the bookmark beside any passage to keep it in your saved collection.' : state.query ? 'Try a shorter phrase, an Arabic term without vowel marks, or its English equivalent.' : 'Consult the sources and study guide while the reading text is prepared.'));
      content.append(empty);
    } else {
      const fragment = document.createDocumentFragment(); let lastStage = null; let section = null; let lastGroup = null;
      for (const unit of shown) {
        if (unit.stage !== lastStage) {
          const stage = state.stages.get(unit.stage) || {};
          const heading = make('header', 'stage-heading');
          heading.append(make('span', 'stage-number', unit.stage === '0' ? 'BEFORE READING' : `STAGE ${unit.stage}`), make('h2', '', stageTitle(unit.stage)));
          if (stage.arabicTitle) { const arabic = make('p', 'stage-arabic', stage.arabicTitle); arabic.lang = 'ar'; arabic.dir = 'rtl'; heading.append(arabic); }
          fragment.append(heading); lastStage = unit.stage;
        }
        if (unit.group !== lastGroup) {
          section = make('section', 'chapter-section'); section.id = unit.group.id; section.dataset.group = unit.group.key;
          const heading = make('header', 'chapter-heading'); const titles = make('div', 'chapter-heading-text');
          titles.append(make('span', 'chapter-label', unit.chapter ? `CHAPTER ${unit.chapter}` : isGuide(unit) ? 'READING GUIDE' : 'INTRODUCTION'), make('h3', '', unit.group.title));
          if (unit.group.arabicTitle) { const arabic = make('p', 'chapter-title-arabic', unit.group.arabicTitle); arabic.lang = 'ar'; arabic.dir = 'rtl'; titles.append(arabic); }
          const permalink = make('a', 'chapter-permalink', '§'); permalink.href = '#' + unit.group.id; permalink.setAttribute('aria-label', 'Link to ' + unit.group.title);
          permalink.addEventListener('click', event => { event.preventDefault(); navigate({ group: unit.group }, true); });
          heading.append(titles, permalink); section.append(heading); fragment.append(section); lastGroup = unit.group;
        }
        section.append(renderPassage(unit));
      }
      content.append(fragment);
    }
    $('reading-count').textContent = state.preferences.view === 'focus' && state.active && groups.length ? `${groups.indexOf(state.active) + 1} / ${groups.length}` : `${shown.length} ${shown.length === 1 ? 'section' : 'sections'}`;
    updateLocation(); renderNavigation(groups); observeSections();
  }
  function renderPassage(unit) {
    const article = make('article', 'passage'); article.id = unit.domId; article.dataset.unit = unit.id;
    const top = make('div', 'passage-topline');
    const controls = make('div', 'passage-controls');
    const bookmark = make('button'); bookmark.type = 'button'; bookmark.dataset.bookmark = unit.id; bookmark.setAttribute('aria-pressed', String(state.bookmarks.has(unit.id))); bookmark.setAttribute('aria-label', state.bookmarks.has(unit.id) ? 'Remove bookmark' : 'Bookmark this passage'); bookmark.title = bookmark.getAttribute('aria-label'); bookmark.append(icon('bookmark')); bookmark.addEventListener('click', () => toggleBookmark(unit));
    const personal = make('button', state.notes[unit.id] ? 'has-note' : ''); personal.type = 'button'; personal.dataset.note = unit.id; personal.setAttribute('aria-label', state.notes[unit.id] ? 'Edit your note' : 'Add a personal note'); personal.title = personal.getAttribute('aria-label'); personal.append(icon('note')); personal.addEventListener('click', () => openNote(unit, personal));
    const permalink = make('a'); permalink.href = '#' + unit.domId; permalink.setAttribute('aria-label', 'Link to this passage'); permalink.title = 'Link to this passage'; permalink.append(icon('link')); permalink.addEventListener('click', event => { event.preventDefault(); navigate({ group: unit.group, unit }, true); });
    controls.append(bookmark, personal, permalink); top.append(controls); article.append(top);

    const entries = [];
    for (const raw of unit.notes) {
      const n = typeof raw === 'string' ? { text: raw } : raw;
      if (!n || !text(n.text).trim()) continue;
      const t = text(n.type).toLowerCase(), v = text(n.text);
      if (/lecture note · source|source note|editorial guide|translation status|source locator|coverage|to be translated/.test(t)) continue;
      if (/^Lecture-note locator:|Source locator supplied;|translation not yet available|full translation remains/i.test(v)) continue;
      entries.push({ text:v, url:n.url || '' });
    }
    if (unit.source && typeof unit.source === 'object') {
      const source = unit.source;
      const label = [text(source.edition || 'Arabic source'), source.page != null && source.page !== '' ? 'p. ' + text(source.page) : ''].filter(Boolean).join(' · ');
      if (label || source.url) entries.push({text:label || 'Arabic source',url:source.url || ''});
    }

    const columns = make('div', 'parallel-text');
    const arabicOnly = !unit.english.trim() && !!unit.arabic.trim();
    if (arabicOnly) columns.classList.add('is-arabic-only');
    let lastParagraph = null;
    for (const language of ['english', 'arabic']) {
      if (!text(unit[language]).trim()) continue;
      const panel = make('div', 'text-panel ' + language + '-panel');
      panel.lang = language === 'arabic' ? 'ar' : 'en';
      panel.dir = language === 'arabic' ? 'rtl' : 'ltr';
      const subtitle = language === 'arabic' ? unit.arabicTitle : unit.title;
      if (unit.group.units.length > 1 && subtitle && subtitle !== (language === 'arabic' ? unit.group.arabicTitle : unit.group.title)) panel.append(make('h4', 'unit-subheading', subtitle));
      const body = make('div', 'text-body');
      for (const paragraph of unit[language].trim().split(/\n\s*\n/)) {
        const p = make('p');
        for (const part of paragraph.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)) {
          if (part.startsWith('**') && part.endsWith('**')) p.append(make('strong', '', part.slice(2, -2)));
          else if (part.startsWith('*') && part.endsWith('*')) p.append(make('em', '', part.slice(1, -1)));
          else p.append(document.createTextNode(part));
        }
        body.append(p); lastParagraph = language === 'english' ? (lastParagraph || p) : p;
      }
      panel.append(body); columns.append(panel);
    }
    article.append(columns);

    if (entries.length) {
      const footnotes = make('details', 'footnote-details');
      const summary = make('summary', 'footnote-summary', entries.length === 1 ? '1 footnote' : entries.length + ' footnotes');
      const items = make('ol', 'footnote-list');
      entries.forEach((entry, i) => {
        const li = make('li', 'footnote'); li.id = unit.domId + '-footnote-' + (i + 1);
        addLinkedText(li, entry.text);
        if (entry.url) li.append(document.createTextNode(' '), link('Source', entry.url));
        items.append(li);
      });
      footnotes.append(summary, items); article.append(footnotes);
      const preferred = article.querySelector('.english-panel .text-body p:last-child') || article.querySelector('.arabic-panel .text-body p:last-child');
      if (preferred) {
        const sup = make('sup', 'footnote-references');
        for (let i = 0; i < entries.length; i++) {
          const a = make('a', 'footnote-reference', String(i + 1));
          a.href = '#' + unit.domId + '-footnote-' + (i + 1);
          a.setAttribute('aria-label', 'Footnote ' + (i + 1));
          a.addEventListener('click', event => {
            event.preventDefault(); footnotes.open = true;
            requestAnimationFrame(() => document.getElementById(unit.domId + '-footnote-' + (i + 1))?.scrollIntoView({block:'nearest'}));
          });
          sup.append(a);
        }
        preferred.append(document.createTextNode(' '), sup);
      }
    }
    appendPersonalNote(article, unit);
    return article;
  }
  function appendPersonalNote(article, unit) {
    // Personal notes are accessible through the note icon, never rendered in the reading text.
    article.querySelector('.personal-note-preview')?.remove();
  }
  function toggleBookmark(unit) {
    const added = !state.bookmarks.has(unit.id);
    if (added) state.bookmarks.add(unit.id); else state.bookmarks.delete(unit.id);
    writeStorage(prefix + 'bookmarks', [...state.bookmarks]);
    if (state.savedOnly) render();
    else {
      const article = $(unit.domId); const button = article?.querySelector('[data-bookmark]');
      if (button) { button.setAttribute('aria-pressed', String(added)); button.setAttribute('aria-label', added ? 'Remove bookmark' : 'Bookmark this passage'); button.title = button.getAttribute('aria-label'); }
      renderToc(matchingUnits());
    }
    notify(added ? 'Passage saved to your bookmarks.' : 'Bookmark removed.');
  }
  function openNote(unit, opener) {
    state.noteUnit = unit;
    $('note-passage').textContent = `${stageTitle(unit.stage)} · ${unit.title || unit.group.title}`;
    $('note-text').value = state.notes[unit.id] || '';
    $('delete-note').hidden = !state.notes[unit.id];
    openDialog($('note-dialog'), opener);
    $('note-text').focus();
  }
  function saveNote(remove = false) {
    if (!state.noteUnit) return;
    const unit = state.noteUnit; const value = remove ? '' : $('note-text').value.trim();
    if (value) state.notes[unit.id] = value; else delete state.notes[unit.id];
    const persisted = writeStorage(prefix + 'notes', state.notes);
    const article = $(unit.domId);
    if (article) { appendPersonalNote(article, unit); const button = article.querySelector('[data-note]'); button.classList.toggle('has-note', !!value); button.setAttribute('aria-label', value ? 'Edit your note' : 'Add a personal note'); button.title = button.getAttribute('aria-label'); }
    $('note-dialog').close();
    if (persisted) notify(value ? 'Your note is saved in this browser.' : 'Your note was removed.');
  }
  function renderNavigation(groups) {
    const nav = $('chapter-navigation');
    nav.hidden = state.preferences.view !== 'focus' || groups.length < 2;
    if (nav.hidden) return;
    const index = groups.indexOf(state.active); const previous = groups[index - 1]; const next = groups[index + 1];
    $('previous-chapter').disabled = !previous; $('next-chapter').disabled = !next;
    $('previous-title').textContent = previous ? previous.title : 'Beginning of the book';
    $('next-title').textContent = next ? next.title : 'End of the book';
    $('previous-chapter').onclick = () => { if (previous) navigate({ group: previous }, true); };
    $('next-chapter').onclick = () => { if (next) navigate({ group: next }, true); };
  }
  function updateLocation() {
    if (!state.active) return;
    $('current-location').textContent = `${state.active.stage === '0' ? '' : 'Stage ' + state.active.stage + ' · '}${state.active.title}`;
    document.querySelectorAll('#toc a[data-group]').forEach(anchor => {
      if (anchor.dataset.group === state.active.key) anchor.setAttribute('aria-current', 'true'); else anchor.removeAttribute('aria-current');
    });
  }
  function observeSections() {
    if (state.preferences.view === 'focus' || !('IntersectionObserver' in window)) return;
    state.observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        const group = state.groups.find(g => g.key === visible[0].target.dataset.group);
        if (group) { state.active = group; updateLocation(); }
      }
    }, { rootMargin: '-140px 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('.chapter-section').forEach(section => state.observer.observe(section));
  }
  function resolveHash() {
    try { return state.byHash.get(decodeURIComponent(location.hash.slice(1))); } catch (_) { return null; }
  }
  function navigate(target, writeHash) {
    if (!target || !target.group) return;
    state.active = target.group;
    const matching = matchingUnits();
    if (!matching.some(unit => unit.group === target.group)) { state.query = ''; $('book-search').value = ''; state.savedOnly = false; }
    if (state.preferences.view === 'focus' || !$(target.unit ? target.unit.domId : target.group.id)) render();
    else { renderToc(matchingUnits()); updateLocation(); }
    closeSidebar(false);
    const id = target.unit ? target.unit.domId : target.group.id;
    if (writeHash) history.pushState(null, '', '#' + encodeURIComponent(id));
    requestAnimationFrame(() => { const element = $(id); if (element) { element.scrollIntoView({ block: 'start', behavior: 'instant' }); element.setAttribute('tabindex', '-1'); element.focus({ preventScroll: true }); } });
  }
  function renderGlossary() {
    if (!state.book) return;
    const query = normalise($('glossary-search').value).trim();
    const list = $('glossary-list'); list.replaceChildren();
    const glossary = Array.isArray(state.book.glossary) ? state.book.glossary : [];
    const entries = glossary.filter(entry => normalise([entry.term, entry.arabic, entry.english, entry.definition].join(' ')).includes(query));
    for (const entry of entries) {
      const article = make('article', 'glossary-entry'); const heading = make('h3', '', entry.english || entry.term);
      if (entry.arabic) { const arabic = make('span', '', entry.arabic); arabic.lang = 'ar'; arabic.dir = 'rtl'; heading.append(arabic); }
      article.append(heading);
      if (entry.term && entry.term !== entry.english) article.append(make('p', 'glossary-romanization', entry.term));
      article.append(make('p', '', entry.definition));
      if (entry.sourceUrl) article.append(link('Further reading ↗', entry.sourceUrl, 'glossary-source'));
      list.append(article);
    }
    if (!entries.length) list.append(make('p', 'dialog-intro', query ? 'No glossary terms match this search.' : 'A glossary for this edition is being prepared.'));
  }
  function renderSources() {
    const book = state.book; const node = $('sources-content'); node.replaceChildren();
    node.append(make('p', 'dialog-intro', book.description || 'Read the Arabic text alongside the English rendering and consult the cited sources for each passage.'));
    const statistics = make('div', 'edition-statistics');
    const data = [[state.stages.size - (state.stages.has('0') ? 1 : 0), 'stages'], [state.units.filter(unit => unit.arabic.trim() && !isGuide(unit)).length, 'Arabic sections'], [state.units.filter(hasEnglish).length, 'English translations']];
    for (const [value, label] of data) { const stat = make('div'); stat.append(make('span', 'stat-value', value), make('span', 'stat-label', label)); statistics.append(stat); }
    node.append(statistics, make('h3', '', 'Reading this edition'));
    const guideCount = state.units.filter(isGuide).length;
    const editorialText = guideCount === state.units.length && guideCount ? 'This edition currently provides editorial reading guidance. These guide sections are not translations of the author’s text. The Arabic original and an English translation will be identified separately when available.' : 'Arabic and English are aligned by chapter or passage. The label beneath each passage identifies its translation status; the source citation opens the underlying edition. Notes labelled as editorial explain choices or offer reading guidance.';
    node.append(make('p', '', editorialText), make('p', '', 'Bookmarks and personal notes are stored in this browser only. They do not alter the public edition.'));
    if (book.status) node.append(make('p', '', 'Edition status: ' + text(book.status).replace(/[-_]/g, ' ') + '.'));
    if (book.editorialStatus && typeof book.editorialStatus === 'object') {
      const editorial = book.editorialStatus;
      for (const key of ['translationMethod', 'collation', 'pagination']) if (editorial[key]) node.append(make('p', '', editorial[key]));
    }
    if (book.downloads && Array.isArray(book.downloads)) {
      for (const item of book.downloads) {
        const download = link(item.title || 'Download text', item.url, 'quiet-link');
        if (download.tagName === 'A') { download.removeAttribute('target'); download.setAttribute('download', item.filename || ''); }
        node.append(make('p', '', ''), download);
      }
    }
    node.append(make('h3', '', 'Sources and comparison editions'));
    const sources = Array.isArray(book.sources) ? book.sources : [];
    const list = make('ul', 'source-list');
    for (const source of sources) {
      const item = make('li'); item.append(link(source.title || source.id || 'Source', source.url));
      if (source.description) item.append(make('p', '', source.description));
      if (source.url) { try { item.append(make('span', 'source-domain', new URL(source.url).hostname.replace(/^www\./, ''))); } catch (_) { /* No domain label needed. */ } }
      list.append(item);
    }
    if (!sources.length) list.append(make('li', '', 'Source information will be added with the reading text.'));
    node.append(list);
    node.append(make('h3', '', 'Continue studying'));
    const guide = make('a', '', 'A guide to studying the two Hikma texts ↗'); guide.href = '../study-guide.html'; node.append(guide);
    node.append(make('p', '', ''));
    const audit = make('a', '', 'Editorial scope and recorded source readings ↗'); audit.href = '../editorial-status.html'; node.append(audit);
  }
  function openDialog(dialog, opener) {
    closeSidebar(false);
    dialog._opener = opener || document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { const opener = dialog._opener; if (opener && opener.isConnected) opener.focus(); });
  }
  function isMobile() { return matchMedia('(max-width: 900px)').matches; }
  function openSidebar() {
    if (!isMobile()) { $('book-search').focus(); return; }
    state.sidebarOpen = true;
    $('contents-panel').inert = false;
    document.body.classList.add('contents-open');
    $('sidebar-backdrop').hidden = false;
    $('contents-toggle').setAttribute('aria-expanded', 'true');
    $('reader-main').inert = true;
    document.querySelector('.site-header').inert = true;
    $('contents-close').focus();
  }
  function closeSidebar(focus = true) {
    const wasOpen = state.sidebarOpen;
    state.sidebarOpen = false;
    document.body.classList.remove('contents-open');
    $('sidebar-backdrop').hidden = true;
    $('contents-toggle').setAttribute('aria-expanded', 'false');
    $('reader-main').inert = false;
    document.querySelector('.site-header').inert = false;
    $('contents-panel').inert = isMobile();
    if (focus && wasOpen) $('contents-toggle').focus();
  }
  $('contents-panel').inert = isMobile();
  $('contents-toggle').addEventListener('click', openSidebar);
  $('contents-close').addEventListener('click', () => closeSidebar());
  $('sidebar-backdrop').addEventListener('click', () => closeSidebar());
  matchMedia('(max-width: 900px)').addEventListener('change', () => closeSidebar(false));
  document.addEventListener('keydown', event => {
    const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (event.key === 'Escape' && state.sidebarOpen) { event.preventDefault(); closeSidebar(); }
    if (event.key === '/' && !editing && !document.querySelector('dialog[open]') && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); if (isMobile()) openSidebar(); $('book-search').focus(); }
    if (event.key === 'Tab' && state.sidebarOpen) {
      const focusable = [...$('contents-panel').querySelectorAll('a[href],button,input,summary')].filter(node => !node.disabled && node.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.querySelectorAll('button[data-language]').forEach(button => button.addEventListener('click', () => { state.preferences.language = button.dataset.language; applyPreferences(true); }));
  $('theme-toggle').addEventListener('click', () => { state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light'; applyPreferences(true); });
  $('order-toggle').addEventListener('click', () => { state.preferences.order = state.preferences.order === 'english-first' ? 'arabic-first' : 'english-first'; applyPreferences(true); });
  $('font-decrease').addEventListener('click', () => { state.preferences.size = Math.max(16, state.preferences.size - 1); applyPreferences(true); });
  $('font-increase').addEventListener('click', () => { state.preferences.size = Math.min(26, state.preferences.size + 1); applyPreferences(true); });
  $('reading-view').addEventListener('change', () => { state.preferences.view = $('reading-view').value; applyPreferences(true); render(); if (state.active) navigate({ group: state.active }, true); });
  $('glossary-open').addEventListener('click', event => openDialog($('glossary-dialog'), event.currentTarget));
  for (const id of ['sources-open', 'edition-open']) $(id).addEventListener('click', event => openDialog($('sources-dialog'), event.currentTarget));
  $('glossary-search').addEventListener('input', renderGlossary);
  $('note-form').addEventListener('submit', event => { event.preventDefault(); saveNote(); });
  $('delete-note').addEventListener('click', () => saveNote(true));
  $('begin-reading').addEventListener('click', () => { if (state.groups.length) navigate({ group: state.groups[0] }, true); });
  $('all-tab').addEventListener('click', () => { state.savedOnly = false; render(); });
  $('saved-tab').addEventListener('click', () => { state.savedOnly = true; render(); });
  let searchTimer;
  $('book-search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.query = $('book-search').value.trim(); render(); }, 140); });
  $('clear-filters').addEventListener('click', () => { state.query = ''; state.savedOnly = false; $('book-search').value = ''; render(); });
  document.querySelectorAll('a[href="#title-page"]').forEach(anchor => anchor.addEventListener('click', event => {
    event.preventDefault(); state.query = ''; state.savedOnly = false; $('book-search').value = ''; render(); closeSidebar(false); history.pushState(null, '', '#title-page'); $('title-page').scrollIntoView({ behavior: 'instant' });
  }));
  window.addEventListener('hashchange', () => { if (location.hash === '#title-page') { state.query = ''; state.savedOnly = false; $('book-search').value = ''; render(); $('title-page').scrollIntoView(); } else navigate(resolveHash(), false); });
  window.addEventListener('storage', event => {
    if (event.key === prefix + 'bookmarks') { const stored = readStorage(event.key, []); if (Array.isArray(stored)) state.bookmarks = new Set(stored); render(); }
    if (event.key === prefix + 'notes') { const stored = readStorage(event.key, {}); if (stored && typeof stored === 'object' && !Array.isArray(stored)) state.notes = stored; render(); }
  });
  async function loadBook() {
    $('begin-reading').disabled = true;
    try {
      const response = await fetch('./data/book.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('Edition unavailable');
      setData(await response.json());
    } catch (error) {
      const box = make('div', 'loading-state error-state');
      box.append(make('span', 'loading-mark', '✦'), make('h2', '', 'The reading text is unavailable'), make('p', '', 'The edition could not be opened. Please try again in a moment.'));
      const retry = make('button', 'primary-button', 'Try again'); retry.type = 'button'; retry.addEventListener('click', loadBook); box.append(retry);
      $('reading-content').replaceChildren(box);
      $('toc').replaceChildren(make('p', 'toc-empty', 'The contents will appear when the edition opens.'));
      $('coverage-text').textContent = 'The reading text could not be loaded';
      $('sources-content').replaceChildren(make('p', 'dialog-intro', 'Source details will appear when the edition opens.'));
      $('glossary-list').replaceChildren(make('p', 'dialog-intro', 'The glossary will appear when the edition opens.'));
    }
  }
  loadBook();
})();
