/* Gnamma al-Daruri: progressive full dictionary articles.
   The concise definition remains visible. Historical source paragraphs are
   loaded only when explicitly expanded, as with Qur'an context. */
(() => {
  'use strict';
  if (window.GnammaFullDictionaryContext) return;
  window.GnammaFullDictionaryContext = {version: '2026-10-25'};
  const thisScript = document.currentScript?.src || new URL('full-dictionary-context.js', document.baseURI).href;
  const dataURL = new URL('full-dictionary-data.js?v=20261025-sinaa1', thisScript).href;
  const indexURL = new URL('full-dictionary-index.js?v=20261025-dossier2', thisScript).href;
  let dataPromise = null, indexPromise = null, queued = false;
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

  function getIndex() {
    if (window.GnammaFullDictionaryIndex) return Promise.resolve(window.GnammaFullDictionaryIndex);
    if (!indexPromise) indexPromise = new Promise((resolve,reject) => {
      const script = el('script');
      script.async = true;
      script.src = indexURL;
      script.onload = () => resolve(window.GnammaFullDictionaryIndex);
      script.onerror = () => reject(Error('Compact dictionary source index unavailable'));
      document.head.append(script);
    }).then(index => {
      if (index?.schema_version !== 1 || Object.keys(index.terms || {}).length !== 153)
        throw Error('Compact dictionary index failed its schema/coverage check');
      return index;
    }).catch(error => { indexPromise = null; throw error; });
    return indexPromise;
  }
  function indexed(term) {
    return window.GnammaFullDictionaryIndex?.terms?.[term] || null;
  }
  function fullLabel(term, open) {
    const record = indexed(term), articles = record?.articles || [];
    if (open) return 'Hide complete historical article' + (articles.length === 1 ? '' : 's');
    if (articles.length === 1)
      return 'Show complete article · ' + articles[0].author +
        ' (s.v. ' + articles[0].headword + ')';
    if (articles.length > 1)
      return 'Show ' + articles.length + ' complete selected historical articles';
    return 'Show complete selected historical dictionary articles';
  }
  function ifTextDiff(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
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
    intro.textContent = 'Complete selected headword articles reproduced from the scholarly edition, with Arabic and working English translations. Short quotations elsewhere on this page were selected independently: these articles may come from different dictionaries and are not necessarily expanded versions of those quotations. Later dictionary authors are comparative witnesses, not Ibn Rushd’s own definitions.';
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
    const summary = el('summary', 'gn-fd-summary', fullLabel(term, false));
    const body = el('div', 'gn-fd-body');
    toggle.append(summary, body);
    toggle.addEventListener('toggle', () => {
      summary.textContent = fullLabel(term, toggle.open);
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
    else if (position === 'after-short' && target.querySelector(':scope > .glossary-primary-evidence'))
      target.querySelector(':scope > .glossary-primary-evidence').insertAdjacentElement('afterend', toggle);
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

  function addIndexedSearch(author, term) {
    if (!author || author.dataset.gnFdMorphChecked) return;
    author.dataset.gnFdMorphChecked = 'pending';
    const row = indexed(term), engine = window.GnammaMorphology;
    const search = window.GnammaUnifiedSearch;
    if (!row?.ar || !engine?.loadLexicon || !engine?.ensure || !search?.query || !search?.openWith) {
      author.dataset.gnFdMorphChecked = 'unavailable';
      return;
    }
    engine.loadLexicon().then(lexicon => {
      const lemma = engine.fold(row.ar);
      if (!lexicon.some(x => x.normalized === lemma)) return null;
      return engine.ensure('daruri').then(() => {
        const result = search.query(row.ar, {mode:'morph-lemma',scope:'work',facet:'all'});
        if (!result?.total) return null;
        const occurrenceCount = result.results.reduce((n, item) =>
          n + (item.matched?.occurrences?.length || 0), 0);
        const distinctSections = new Set(result.results.map(x => x.section).filter(Boolean)).size;
        if (!occurrenceCount || !distinctSections) return null;
        const root = row.root;
        let rootRelatives = false;
        if (root) {
          const rootResults = search.query(root, {mode:'morph-root',scope:'work',facet:'all'});
          rootRelatives = rootResults.results.some(x =>
            engine.fold(x.matched?.lemma || '') !== lemma &&
            !!x.matched?.lemma);
        }
        return {lemma:row.ar,root,occurrenceCount,distinctSections,rootRelatives};
      });
    }).then(info => {
      if (!author.isConnected || author.dataset.gnFdMorphChecked !== 'pending') return;
      if (!info) {author.dataset.gnFdMorphChecked='no-indexed-results';return;}
      const group = el('div','gn-fd-morph-actions');
      appendText(group,'Search attested word forms','h4');
      appendText(group,
        info.occurrenceCount+' indexed occurrences in '+info.distinctSections+
        ' sections · curated morphological grouping, not a complete grammatical analysis.',
        'p','gn-fd-morph-summary');
      const btn=el('button','gn-fd-morph-button','Find indexed forms in the text');
      btn.type='button';
      btn.dataset.gnFdMorph='morph-lemma';
      btn.dataset.gnFdValue=info.lemma;
      group.append(btn);
      if (info.rootRelatives) {
        const relative=el('button','gn-fd-morph-button','Explore attested root relatives');
        relative.type='button';
        relative.dataset.gnFdMorph='morph-root';
        relative.dataset.gnFdValue=info.root;
        group.append(relative);
      }
      author.append(group);
      author.dataset.gnFdMorphChecked='ready';
    }).catch(error => {
      author.dataset.gnFdMorphChecked='unavailable';
      console.warn('Indexed word forms not available for this term:',error);
    });
  }


  // Verified literal orthographic concordance of the author's Arabic text.
  // Not a speculative root-family expansion or a complete morphological parse.
  // Source: edition-r3-20261020.js, Arabic segments, vowel marks stripped.
  const VERIFIED_TEXT_SPELLINGS = {
    'ṣīgha': [[29,1,"صيغة"],[31,1,"صيغة"],[69,2,"صيغة"],[135,1,"صيغ"],[137,1,"الصيغ"],[139,1,"صيغ"],[149,1,"بصيغته"],[153,5,"بصيغها، الصيغ"],[154,1,"بصيغها"],[155,2,"صيغها، الصيغ"],[156,1,"صيغته"],[158,1,"الصيغة"],[159,1,"صيغة"],[162,1,"الصيغة"],[164,1,"الصيغة"],[170,1,"صيغة"],[178,1,"صيغة"],[180,2,"صيغة، بصيغة"],[181,1,"بصيغة"],[183,1,"وصيغ"],[186,2,"بصيغته"],[190,1,"الصيغ"],[191,2,"صيغها، بصيغها"],[192,1,"صيغها"],[197,2,"صيغها، صيغ"],[198,4,"صيغ، صيغا، بصيغها"],[200,6,"صيغة، الصيغ، وصيغته، صيغ"],[201,2,"فصيغ، صيغها"],[203,2,"صيغة"],[205,1,"صيغ"],[206,3,"صيغ، صيغة"],[208,3,"صيغة، الصيغ"],[223,1,"بصيغة"],[224,3,"صيغها، بصيغها، الصيغة"],[226,1,"صيغ"],[229,1,"صيغة"],[239,1,"بصيغته"]]
  };
  function addVerifiedTextForms(author, term) {
    const records = VERIFIED_TEXT_SPELLINGS[term];
    if (!author || !records || author.querySelector(':scope > .gn-fd-verified-forms')) return;
    const count = records.reduce((n,row) => n+row[1],0);
    const section = el('details','gn-fd-verified-forms');
    section.dataset.gnFdVerified = term;
    const summary = el('summary','gn-fd-verified-summary',
      count+' matching Arabic spellings across '+records.length+' sections');
    section.append(summary);
    appendText(section,
      'These are checked literal spelling matches in the Arabic text, including attached particles and pronouns. They are not a complete morphological or root-family analysis.',
      'p','gn-fd-verified-disclaimer');
    const group = el('div','gn-fd-verified-grid');
    for (const [id,n,forms] of records) {
      const btn = el('button','gn-fd-verified-link','§'+id+' · '+n+' · '+forms);
      btn.type='button';
      btn.dataset.section=String(id);
      btn.setAttribute('aria-label','Read section '+id+'; '+n+' matching Arabic spelling'+(n===1?'':'s'));
      group.append(btn);
    }
    section.append(group);
    const passages = author.querySelector(':scope > .dictionary-passages');
    if (passages) author.insertBefore(section,passages);
    else author.append(section);
  }

  function reviseReaderPopup(body, term) {
    const sources = body.querySelector('#lex-sources');
    if (!sources) return;
    // Previous "Historical sources" opened another short-excerpt overlay that
    // repeated the sources already present. The full-page workspace remains
    // available as an accurately named link at the bottom of the card.
    body.querySelector(':scope > .lex-full-link')?.remove();
    const toggle = sources.querySelector(':scope > .gn-fd-toggle');
    const label = toggle?.querySelector(':scope > .gn-fd-summary');
    ifTextDiff(label, fullLabel(term, !!toggle?.open));
    if (!sources.querySelector(':scope > .gn-fd-section-title')) {
      const heading = el('h3', 'gn-fd-section-title', 'Historical dictionary evidence');
      sources.prepend(heading);
    }
    const evidence = sources.querySelector(':scope > .dictionary-source-list');
    const shortCount = evidence?.querySelectorAll(':scope > .dictionary-source').length || 0;
    const record = indexed(term), fullCount = record?.articles.length;
    if (evidence && !sources.querySelector(':scope > .gn-fd-extract-heading')) {
      const label = el('h4', 'gn-fd-extract-heading', 'Other selected dictionary excerpts');
      sources.insertBefore(label, evidence);
    }
    const shortHeading = sources.querySelector(':scope > .gn-fd-extract-heading');
    ifTextDiff(shortHeading, shortCount === 1 ?
      'Selected short quotation' :
      shortCount + ' selected short quotations');
    if (!sources.querySelector(':scope > .gn-fd-scope')) {
      const explain = el('p', 'gn-fd-scope');
      sources.insertBefore(explain, toggle?.nextSibling || evidence || null);
    }
    const scope = sources.querySelector(':scope > .gn-fd-scope');
    ifTextDiff(scope, 'The complete article and short quotations may come from different dictionaries. Expanding an article does not necessarily continue the preceding quotation.');
    if (term === 'ṣīgha' && !sources.querySelector(':scope > .gn-fd-specific')) {
      const p = el('p', 'gn-fd-specific',
        'Source distinction: al-Munāwī’s short extract is from الأمر (command), whereas the complete article is al-Fayyūmī’s صوغ (fashioning / form). The former is related legal evidence, not an abridgement of the latter.');
      sources.insertBefore(p, evidence || null);
    }
    const tab = body.querySelector('.lex-tabbar [data-lexjump="lex-sources"]');
    if (tab) {
      const description = fullCount === undefined ? shortCount + ' short extracts' :
        fullCount + ' complete ' + (fullCount === 1 ? 'article' : 'articles') +
        ' · ' + shortCount + ' short ' + (shortCount === 1 ? 'extract' : 'extracts');
      ifTextDiff(tab, 'Sources · ' + description);
      tab.setAttribute('aria-label', 'Show dictionary evidence: ' + description);
    }
    const author = body.querySelector('#lex-author');
    if (author) {
      const heading = author.querySelector('h3');
      ifTextDiff(heading, 'Selected examples from Ibn Rushd');
      const count = author.querySelectorAll('.lex-authorial').length;
      const tab = body.querySelector('.lex-tabbar [data-lexjump="lex-author"]');
      ifTextDiff(tab, 'In the text · ' + count + ' examples');
      if (!author.querySelector(':scope > .gn-fd-example-scope')) {
        const p = el('p', 'gn-fd-example-scope',
          'These are curated illustrative passages, not a complete count of every inflected occurrence.');
        if (heading) heading.insertAdjacentElement('afterend', p);
      }
      addVerifiedTextForms(author, term);
      addIndexedSearch(author, term);
    }
    const footer = body.querySelector(':scope > .return-reading');
    if (footer && !body.querySelector(':scope > .gn-fd-page-link')) {
      const link = el('a', 'gn-fd-page-link', 'Open as a full-page dictionary entry ↗');
      link.href = 'dictionary.html#term=' + encodeURIComponent(term);
      link.dataset.dictionaryAtlas = term;
      footer.insertAdjacentElement('beforebegin', link);
    }
  }
  function reviseStandalone(article, term) {
    const meta = article.querySelector('.entry-meta');
    const record = indexed(term);
    const toggle = article.querySelector('[data-dict-panel="sources"] > .gn-fd-toggle');
    ifTextDiff(toggle?.querySelector(':scope > .gn-fd-summary'), fullLabel(term, !!toggle?.open));
    if (!meta || !record) return;
    let label = meta.querySelector('[data-gn-fd-full-count]');
    if (!label) {
      label = el('span');
      label.dataset.gnFdFullCount = '1';
      meta.append(label);
    }
    const n = record.articles.length;
    ifTextDiff(label, n + ' complete selected historical ' + (n === 1 ? 'article' : 'articles') +
      ' (additional to short extracts)');
    const firstSpans = [...meta.querySelectorAll(':scope > span')].filter(x => x !== label);
    const shortAuthors = new Set([...article.querySelectorAll('[data-dict-panel="sources"] .hist-source summary strong')]
      .map(x => x.textContent.trim()));
    if (firstSpans.length >= 2)
      ifTextDiff(firstSpans[1], shortAuthors.size + ' ' +
        (shortAuthors.size === 1 ? 'author' : 'authors') + ' of short extracts');
    const sourcePanel = article.querySelector('[data-dict-panel="sources"]');
    if (sourcePanel && !sourcePanel.querySelector(':scope > .gn-fd-standalone-scope')) {
      const note = el('p', 'gn-fd-standalone-scope',
        'The short quotations and complete selected historical articles were compiled separately; a full article may come from a different author or a different headword.');
      sourcePanel.querySelector('h2')?.insertAdjacentElement('afterend',note);
    }
    if (term === 'ṣīgha' && sourcePanel &&
        !sourcePanel.querySelector(':scope > .gn-fd-standalone-specific')) {
      const note = el('p','gn-fd-standalone-specific',
        'For ṣīgha: the brief al-Munāwī quotation is under الأمر (command), whereas the complete article is al-Fayyūmī’s صوغ (form). These are separate works, not a summary and its continuation.');
      sourcePanel.querySelector('.gn-fd-standalone-scope')?.insertAdjacentElement('afterend',note);
    }
  }
  function reviseGlossary(card, term) {
    const toggle = card.querySelector(':scope > .gn-fd-toggle');
    ifTextDiff(toggle?.querySelector(':scope > .gn-fd-summary'), fullLabel(term, !!toggle?.open));
    const record = indexed(term);
    if (!record) return;
    const evidence = card.querySelector(':scope > .glossary-primary-evidence');
    if (toggle && evidence && evidence.nextElementSibling !== toggle) {
      evidence.insertAdjacentElement('afterend', toggle);
    }
    if (toggle && !toggle.dataset.gnFdGlossary) toggle.dataset.gnFdGlossary = '1';
  }

  function sync() {
    const atlas = document.querySelector('.lexicon-mode-nav a[data-dictionary-atlas]');
    ifTextDiff(atlas, 'Browse full-page historical dictionary ↗');
    document.querySelectorAll('#mainContent .glossary-card').forEach(card => {
      const heading = card.querySelector('h2');
      if (!heading) return;
      const term = heading.textContent.trim();
      alignCraftSummary(card, term);
      enhance(card, term, 'after-short');
      reviseGlossary(card, term);
    });
    const article = document.querySelector('#lexArticle .lex-card');
    if (article) {
      const title = article.querySelector('.lex-title')?.textContent?.trim();
      const sources = article.querySelector('[data-dict-panel="sources"]');
      if (title && sources) {
        enhance(sources, title, 'end');
        reviseStandalone(article, title);
      }
    }
    const popup = document.getElementById('infoOverlay');
    const body = document.getElementById('detailContent');
    const eyebrow = document.getElementById('detailEyebrow')?.textContent || '';
    if (popup && !popup.hidden && body && /DICTIONARY|LEXICAL|GLOSSARY/i.test(eyebrow)) {
      const title = document.getElementById('detailTitle')?.textContent?.trim() ||
        body.querySelector('h2')?.textContent?.trim();
      const sources = body.querySelector('#lex-sources');
      if (title && sources) {
        alignCraftSummary(body, title);
        enhance(sources, title, 'first');
        reviseReaderPopup(body, title);
      }
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
      '#mainContent .glossary-card > .gn-fd-toggle{grid-column:1/-1}',
      '.gn-fd-section-title{font:600 18px/1.4 Georgia,serif;margin:10px 0;color:var(--ink,inherit)}',
      '.gn-fd-extract-heading{font:600 15px/1.45 system-ui,sans-serif;margin:16px 0 8px}',
      '.gn-fd-scope,.gn-fd-example-scope{font:12px/1.55 system-ui,sans-serif;opacity:.8;margin:8px 0 14px}',
      '.gn-fd-specific{padding:10px 12px;background:var(--nav,var(--paper,#fafafa));border-inline-start:3px solid var(--accent,#668);font:13px/1.55 system-ui,sans-serif}',
      '.gn-fd-standalone-scope{font:12px/1.55 system-ui,sans-serif;opacity:.85}.gn-fd-standalone-specific{font:13px/1.55 system-ui,sans-serif;padding:9px 12px;border-inline-start:3px solid var(--accent,#668);background:var(--nav,var(--paper,#fafafa))}',
      '.gn-fd-verified-forms{margin:16px 0;padding:10px 12px;border:1px solid var(--line,var(--border,#ccc));border-radius:9px}.gn-fd-verified-summary{cursor:pointer;font:600 13px/1.5 system-ui,sans-serif;color:var(--accent,inherit)}.gn-fd-verified-disclaimer{font:12px/1.6 system-ui,sans-serif;opacity:.82}.gn-fd-verified-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px}.gn-fd-verified-link{text-align:start;padding:8px 10px;border:1px solid var(--line,var(--border,#ccc));border-radius:6px;background:transparent;color:inherit;cursor:pointer;font:13px/1.5 system-ui,sans-serif;min-height:42px}',
      '.gn-fd-page-link{display:inline-flex;align-items:center;min-height:42px;font:600 12px/1.4 system-ui,sans-serif;margin:12px 8px 12px 0;color:var(--accent,inherit)}',
      '#lex-sources .gn-fd-toggle{max-width:100%}',
      '#detailContent #gnw-dictionary-search{display:none!important}',
      '.gn-fd-morph-actions{border-top:1px solid var(--line,var(--border,#ddd));margin-top:14px;padding-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}',
      '.gn-fd-morph-actions h4,.gn-fd-morph-summary{flex-basis:100%;margin:0}',
      '.gn-fd-morph-actions h4{font:600 14px/1.45 system-ui,sans-serif}.gn-fd-morph-summary{font:12px/1.55 system-ui,sans-serif;opacity:.85}',
      '.gn-fd-morph-button{min-height:42px;border:1px solid var(--line,var(--border,#ccc));border-radius:8px;padding:9px 12px;background:var(--paper,transparent);color:var(--accent,inherit);font:600 12px/1.45 system-ui,sans-serif;cursor:pointer}',
      '@media(max-width:660px){.gn-fd-parallel{grid-template-columns:minmax(0,1fr);gap:9px}.gn-fd-ar{font-size:21px!important}.gn-fd-body{padding:10px 12px 14px}}',
      '@media print{.gn-fd-toggle:not([open]){display:none}.gn-fd-toggle{break-inside:auto}.gn-fd-article{break-inside:avoid-page}}'
    ].join('\n');
    document.head.append(st);
  }
  function start() {
    document.addEventListener('click',event => {
      const button=event.target.closest('[data-gn-fd-morph]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const search=window.GnammaUnifiedSearch;
      if (!search?.openWith) return;
      const mode=button.dataset.gnFdMorph, value=button.dataset.gnFdValue;
      if (!value || !['morph-lemma','morph-root'].includes(mode)) return;
      // Close the source card before opening search, preserving its original
      // reader return position and avoiding two stacked modal focus traps.
      document.getElementById('detailClose')?.click();
      search.openWith(value,mode,'text','work');
    },true);
    styles();
    sync();
    getIndex().then(() => schedule()).catch(error => console.warn('Gnamma compact dictionary index:',error));
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