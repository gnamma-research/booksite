/* Gnamma al-Daruri: progressive full dictionary articles.
   The concise definition remains visible. Historical source paragraphs are
   loaded only when explicitly expanded, as with Qur'an context. */
(() => {
  'use strict';
  if (window.GnammaFullDictionaryContext) return;
  window.GnammaFullDictionaryContext = {version: '2026-10-25'};
  const thisScript = document.currentScript?.src || new URL('full-dictionary-context.js', document.baseURI).href;
  const dataURL = new URL('full-dictionary-data.js?v=20261025-sinaa1', thisScript).href;
  let dataPromise = null, queued = false;
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };
  const appendText = (parent, text, tag='p', className='') => {
    const node = el(tag, className, text);
    parent.append(node);
    return node;
  };
  const safeLink = (parent, label, url) => {
    if (!/^https:\/\//i.test(String(url || ''))) return;
    const anchor = el('a', '', label);
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    parent.append(anchor);
  };
  function load() {
    if (window.GnammaFullDictionaryData) return Promise.resolve(window.GnammaFullDictionaryData);
    if (!dataPromise) {
      dataPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.async = true;
        s.src = dataURL;
        s.onload = () => resolve(window.GnammaFullDictionaryData);
        s.onerror = () => reject(Error('Full dictionary source data could not be loaded'));
        document.head.append(s);
      }).then(data => {
        if (data?.schema_version !== 1 ||
            data.terms?.length !== 153 || data.articles?.length !== 157 ||
            data.sourceNoteCount !== 13)
          throw Error('Historical dictionary dataset failed its completeness check');
        return data;
      }).catch(error => { dataPromise = null; throw error; });
    }
    return dataPromise;
  }
  function sourceBlock(article, source, dossier, noteMap) {
    const card = el('section', 'gn-fd-article');
    card.dataset.fullArticleId = article.id;
    const title = el('h4', 'gn-fd-heading');
    title.append(document.createTextNode((source?.author || 'Dictionary source') + ' · '));
    const headword = el('bdi', 'gn-fd-ar-title', article.headword);
    headword.lang = 'ar';
    headword.dir = 'rtl';
    title.append(headword);
    card.append(title);
    appendText(card, (source?.work || '') + ' · ' + (source?.date || '') +
      (article.pages ? ' · ' + article.pages : '') +
      (source?.chronology === 'L' ? ' · Later historical source' : ''),
      'p', 'gn-fd-citation');
    if (dossier.relation && dossier.relation !== 'exact headword')
      appendText(card, 'Relationship to this term: ' + dossier.relation, 'p', 'gn-fd-relation');
    for (const pair of article.paragraphs || []) {
      const parallel = el('div', 'gn-fd-parallel');
      const arabic = el('blockquote', 'gn-fd-ar', pair.ar);
      arabic.lang = 'ar'; arabic.dir = 'rtl';
      const english = el('p', 'gn-fd-en', pair.en);
      english.lang = 'en'; english.dir = 'ltr';
      parallel.append(arabic, english);
      card.append(parallel);
    }
    if (article.note) {
      const note = el('aside', 'gn-fd-editorial');
      appendText(note, 'Editorial explanation — not part of the historical dictionary:', 'strong');
      appendText(note, article.note);
      card.append(note);
    }
    const notes = noteMap?.[article.id] || [];
    if (notes.length) {
      const group = el('section', 'gn-fd-source-notes');
      appendText(group, 'Scholarly source notes (' + notes.length + ')', 'h5');
      for (const note of notes) {
        const row = el('div', 'gn-fd-source-note');
        appendText(row, note.id + (note.anchor_en ? ' · ' + note.anchor_en : ''), 'strong');
        appendText(row, note.text);
        for (const reference of note.source_references || []) {
          if (reference.url) {
            const p = el('p', 'gn-fd-reference');
            safeLink(p, reference.reference || 'Read source', reference.url);
            row.append(p);
          }
        }
        group.append(row);
      }
      card.append(group);
    }
    const foot = el('p', 'gn-fd-links');
    safeLink(foot, 'Original dictionary witness ↗', article.url);
    if (source?.url && source.url !== article.url) {
      foot.append(document.createTextNode(' · '));
      safeLink(foot, 'Dictionary source record ↗', source.url);
    }
    card.append(foot);
    if (source?.bibliography || source?.source_status) {
      const provenance = el('details', 'gn-fd-provenance');
      provenance.append(el('summary', '', 'Edition and provenance'));
      if (source.bibliography) appendText(provenance, source.bibliography);
      if (source.source_status) appendText(provenance, source.source_status);
      card.append(provenance);
    }
    return card;
  }
  function render(container, data, term) {
    container.replaceChildren();
    const row = data.terms.find(t => t.term === term || t.ar === term);
    if (!row) {
      appendText(container, 'No complete selected historical headword article is linked to this entry in the scholarly corpus. The concise dictionary entry above remains available.', 'p', 'gn-fd-status');
      return;
    }
    const articles = new Map(data.articles.map(a => [a.id, a]));
    const intro = el('p', 'gn-fd-intro');
    intro.textContent = 'Complete selected headword articles from the scholarly edition, with full Arabic text and working English translations. Later dictionaries are comparative witnesses and should not be treated as Ibn Rushd’s own definitions.';
    container.append(intro);
    let shown = 0;
    for (const association of row.articles || []) {
      const article = articles.get(association.id);
      if (!article || !data.sources[article.source]) continue;
      container.append(sourceBlock(article, data.sources[article.source], association, data.notesByArticle));
      shown++;
    }
    if (!shown) appendText(container, 'The referenced source article is unavailable. No source text has been substituted.', 'p', 'gn-fd-error');
    else appendText(container, shown + (shown === 1 ? ' complete source article' : ' complete source articles') +
      ' for ' + row.term + ' · ' + (row.sections || []).map(x => '§' + x).join(', ') +
      '. The source paragraphs have not been shortened for the web display.', 'p', 'gn-fd-endnote');
  }
  function enhance(target, term, position) {
    if (!target || !term || target.querySelector(':scope > .gn-fd-toggle')) return;
    const toggle = el('details', 'gn-fd-toggle');
    toggle.dataset.dictionaryTerm = term;
    const summary = el('summary', 'gn-fd-summary', 'Show full historical dictionary articles');
    const body = el('div', 'gn-fd-body');
    toggle.append(summary, body);
    toggle.addEventListener('toggle', () => {
      summary.textContent = toggle.open ? 'Hide full historical dictionary articles' : 'Show full historical dictionary articles';
      if (!toggle.open || toggle.dataset.gnFdReady === '1' || toggle.dataset.gnFdBusy === '1') return;
      toggle.dataset.gnFdBusy = '1';
      body.replaceChildren(el('p', 'gn-fd-status', 'Loading the complete Arabic and English dictionary articles…'));
      load().then(data => {
        if (!toggle.isConnected) return;
        render(body, data, term);
        toggle.dataset.gnFdReady = '1';
      }).catch(error => {
        if (toggle.isConnected) {
          body.replaceChildren(el('p', 'gn-fd-error', 'Full entries could not be loaded. The summary above is unaffected; retry by closing and opening this section.'));
          console.warn('Gnamma full dictionary:', error);
        }
      }).finally(() => { delete toggle.dataset.gnFdBusy; });
    });
    if (position === 'first') target.prepend(toggle);
    else target.append(toggle);
  }
  function alignCraftSummary(host, term) {
    // Repair only the pre-existing compact gloss, without changing its
    // surrounding links, annotations, note controls or original source text.
    if (term !== 'ṣināʿa') return;
    const before = 'Craft or disciplined art: an organized competence governed by methods and standards, not modern industrial production.';
    const after = "An intellectual art or disciplined expertise: mastery of reasoned operations according to their proper standards. In the Ḍarūrī, especially the canons and conditions governing valid inference from legal sources (§§2–6), not the manufacture of divine law. Fiqh is directed to action; uṣūl regulates how legal determinations are reached.";
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.includes(before))
        node.nodeValue = node.nodeValue.replace(before, after);
    }
  }
  function sync() {
    document.querySelectorAll('#mainContent .glossary-card').forEach(card => {
      const heading = card.querySelector('h2');
      if (heading) { const term = heading.textContent.trim(); alignCraftSummary(card, term); enhance(card, term, 'end'); }
    });
    const article = document.querySelector('#lexArticle .lex-card');
    if (article) {
      const title = article.querySelector('.lex-title')?.textContent?.trim();
      const meaning = article.querySelector('[data-dict-panel="meaning"]');
      const sources = article.querySelector('[data-dict-panel="sources"]');
      if (title && meaning) enhance(meaning, title, 'end');
      if (title && sources) enhance(sources, title, 'end');
    }
    const popup = document.getElementById('infoOverlay');
    const body = document.getElementById('detailContent');
    const eyebrow = document.getElementById('detailEyebrow')?.textContent || '';
    if (popup && !popup.hidden && body && /DICTIONARY|LEXICAL|GLOSSARY/i.test(eyebrow)) {
      const title = document.getElementById('detailTitle')?.textContent?.trim() ||
        body.querySelector('h2')?.textContent?.trim();
      if (title) { alignCraftSummary(body, title); enhance(body, title, 'end'); }
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; sync(); });
  }
  function styles() {
    if (document.getElementById('gnamma-full-dictionary-css')) return;
    const st = el('style');
    st.id = 'gnamma-full-dictionary-css';
    st.textContent = [
      '.gn-fd-toggle{margin:14px 0;border:1px solid var(--line,var(--border,#bdbdbd));border-radius:10px;background:var(--paper,var(--card,transparent));color:var(--ink,inherit);min-width:0;overflow:hidden}',
      '.gn-fd-summary{cursor:pointer;list-style:none;padding:12px 15px;font:600 13px/1.45 system-ui,sans-serif;color:var(--accent,inherit);min-height:45px;display:flex;align-items:center;gap:9px}',
      '.gn-fd-summary::-webkit-details-marker{display:none}.gn-fd-summary::before{content:"›";font-size:19px;transition:transform .2s}.gn-fd-toggle[open]>.gn-fd-summary::before{transform:rotate(90deg)}',
      '.gn-fd-toggle[open]>.gn-fd-summary{border-bottom:1px solid var(--line,var(--border,#bdbdbd))}',
      '.gn-fd-body{padding:12px 15px 17px;min-width:0}.gn-fd-intro,.gn-fd-endnote{font:12px/1.55 system-ui,sans-serif;opacity:.86}',
      '.gn-fd-article{padding:14px 0 17px;border-top:1px solid var(--line,var(--border,#bdbdbd));max-width:100%}.gn-fd-heading{margin:0 0 6px;font:600 16px/1.55 Georgia,serif}',
      '.gn-fd-ar-title{font:23px/1.7 var(--arabic,"Noto Naskh Arabic",serif)}.gn-fd-citation,.gn-fd-relation,.gn-fd-links{font:12px/1.5 system-ui,sans-serif;opacity:.88;overflow-wrap:anywhere}',
      '.gn-fd-parallel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:17px;padding:12px 0;border-top:1px dotted var(--line,var(--border,#bdbdbd))}',
      '.gn-fd-ar{font:21px/1.9 var(--arabic,"Noto Naskh Arabic",serif)!important;margin:0;text-align:right;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text}',
      '.gn-fd-en{font:15px/1.7 Georgia,serif!important;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text}',
      '.gn-fd-editorial,.gn-fd-source-notes{padding:11px 13px;margin:12px 0;border-left:3px solid var(--accent,#668);background:var(--nav,var(--paper,transparent));font:13px/1.55 system-ui,sans-serif}',
      '.gn-fd-editorial p{margin:6px 0}.gn-fd-source-note{margin:10px 0;border-top:1px dotted var(--line,#ccc);padding-top:10px}',
      '.gn-fd-provenance{font:12px/1.55 system-ui,sans-serif}.gn-fd-provenance summary{cursor:pointer;color:var(--accent,inherit);padding:7px 0}',
      '.gn-fd-body a{color:var(--accent,inherit);text-decoration:underline;text-underline-offset:2px}',
      '.gn-fd-error{color:#a44939;font:13px/1.5 system-ui,sans-serif}.gn-fd-status{font:13px/1.5 system-ui,sans-serif}',
      '#lexArticle[data-dict-view="all"] [data-dict-panel="sources"]>.gn-fd-toggle{display:none}',
      '@media(max-width:660px){.gn-fd-parallel{grid-template-columns:minmax(0,1fr);gap:9px}.gn-fd-ar{font-size:21px!important}.gn-fd-body{padding:10px 12px 14px}}',
      '@media print{.gn-fd-toggle:not([open]){display:none}.gn-fd-toggle{break-inside:auto}.gn-fd-article{break-inside:avoid-page}}'
    ].join('\n');
    document.head.append(st);
  }
  function start() {
    styles();
    sync();
    const observer = new MutationObserver(schedule);
    // The reader changes its glossary and modal content dynamically; the
    // standalone dictionary replaces its article on each headword selection.
    for (const selector of ['#mainContent', '#lexArticle', '#detailContent']) {
      const target = document.querySelector(selector);
      if (target) observer.observe(target, {subtree:true, childList:true});
    }
    // The detail overlay may switch from hidden to visible without changing
    // its content. Its attributes therefore require a separate observation.
    const overlay = document.getElementById('infoOverlay');
    if (overlay) observer.observe(overlay, {attributes:true, attributeFilter:['hidden','style','class']});
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();