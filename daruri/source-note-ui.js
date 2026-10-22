/* Gnamma Daruri — source-note presentation, independent of the reader router.
   Links stay ordinary real anchors: keyboard access, native long-press, copy link,
   and no-JavaScript fallback work without private APIs or a database. */
(() => {
  'use strict';
  if (window.__gnSourceNoteUIInstalled) return;
  window.__gnSourceNoteUIInstalled = true;

  const REVISION = '20261021-qinline4';
  const ARROW = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  const NOTE_LINKS = '.source-note-links a[href], .gn-note-entry a[href], .gn-app-source-notes a[href], .fb-note a[href], .gn-unified-notes a[href]';
  // Qurʾānic wording is displayed separately from Ibn Rushd's own words.
  // Two proposed verbal echoes in §1 are explicitly marked POSSIBLE allusions,
  // NOT authorial quotations. §38 is an actual quotation. Never infer intent
  // merely from brief word matches; three other weak candidates stay withheld.
  const VERIFIED_SOURCE_EXCERPTS = Object.freeze({
    'QUR-R001-Q049': {
      text: 'عَلَّمَهُ ٱلْبَيَانَ',
      label: 'al-Raḥmān 55:4 · Qurʾānic comparison, possible verbal allusion (not a quotation)',
      translation: 'He taught him expression.',
      explanation: 'These are the Qurʾānic words, not Ibn Rushd’s exact words. The verbal resemblance does not establish that he intended to cite the verse.'
    },
    'QUR-R001-Q050': {
      text: 'فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ',
      label: 'al-Anʿām 6:149 · Qurʾānic comparison, possible verbal allusion (not a quotation)',
      translation: 'With God rests the conclusive argument.',
      explanation: 'The Qurʾānic expression is singular; Ibn Rushd’s corresponding expression is plural. A deliberate allusion remains uncertain.'
    },
    'QUR-R038-Q001': {
      text: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَقْرَبُوا۟ ٱلصَّلَوٰةَ وَأَنتُمْ سُكَـٰرَىٰ حَتَّىٰ تَعْلَمُوا۟ مَا تَقُولُونَ',
      label: 'al-Nisāʾ 4:43 · verified quotation (verse excerpt)',
      translation: 'O believers, do not approach prayer while intoxicated, until you know what you are saying.',
      explanation: 'Ibn Rushd quotes this prohibition directly. This is the relevant opening of a longer verse.'
    }
  });
  // Web-reader-only editorial clarification: canonical data and PDF source
  // records are unchanged. Never typeset an authorial *parallel* as Qurʾānic
  // quotation. The Qurʾān appears only in the separate ﴿…﴾ verse figure.
  // This removes the confusing duplicate verse in ordinary parentheses from
  // §1 Notes and gives Ibn Rushd's actual words ordinary quotation marks.
  const SECTION1_SOURCE_CLARITY = Object.freeze({
    'QUR-R001-Q049': {
      author: 'معلّم البيان',
      lead: 'Ibn Rushd’s wording ',
      tail: ' may echo Qurʾān, al-Raḥmān 55:4. This is a possible verbal allusion, not a quotation; deliberate allusion is uncertain.',
      leadAr: 'عبارة ابن رشد ',
      tailAr: ' قد تذكّر بآية الرحمن 55:4؛ وهذا تشابه لفظي محتمل لا اقتباس، ولا يُجزم بقصده.'
    },
    'QUR-R001-Q050': {
      author: 'الحجج البالغة',
      lead: 'Ibn Rushd’s plural wording ',
      tail: ' may echo Qurʾān, al-Anʿām 6:149, which uses the singular. This is a possible verbal allusion, not a quotation or proven citation.',
      leadAr: 'عبارة ابن رشد بالجمع ',
      tailAr: ' قد تذكّر بآية الأنعام 6:149 التي جاء لفظها مفردًا؛ وهذا تشابه لفظي محتمل لا اقتباس.'
    }
  });
  function clarifySection1Source(card, id) {
    const info = SECTION1_SOURCE_CLARITY[id];
    if (!info) return;
    const prose = [...card.children].find(node => node.tagName === 'P' && !node.classList.contains('gn-note-scope'));
    if (!prose || prose.dataset.gnAuthorCitationClarified === '1') return;
    const arabic = /قارن القرآن|عبارة ابن رشد/.test(prose.textContent) || prose.getAttribute('lang') === 'ar';
    const sourceLinks = prose.querySelector('.source-note-links');
    if (sourceLinks) sourceLinks.remove(); // Move, do not clone: retain native links, listeners and accessibility.
    // Keep ordinary typographic quotes in LTR order, while isolating the
    // Arabic phrase itself. Never split the paired marks at narrow widths.
    const author = document.createElement('span');
    author.className = 'gn-ibn-rushd-words';
    author.setAttribute('dir', 'ltr');
    author.style.whiteSpace = 'nowrap';
    const phrase = document.createElement('bdi');
    phrase.setAttribute('dir', 'rtl');
    phrase.setAttribute('lang', 'ar');
    phrase.textContent = info.author;
    author.append(document.createTextNode('“'), phrase, document.createTextNode('”'));
    prose.replaceChildren(
      document.createTextNode(arabic ? info.leadAr : info.lead),
      author,
      document.createTextNode(arabic ? info.tailAr : info.tail)
    );
    if (sourceLinks) prose.append(sourceLinks);
    prose.dataset.gnAuthorCitationClarified = '1';
  }
  let tooltip;
  let activeLink;
  // Distinguish keyboard navigation from a touchscreen tap: a tap must not
  // leave the desktop URL tooltip covering Safari's native link preview.
  let lastInput = 'unknown';
  function tooltipNode() {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'gn-source-url-tooltip';
      tooltip.className = 'gn-source-url-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.hidden = true;
      document.body.append(tooltip);
    }
    return tooltip;
  }
  function hideTooltip() {
    if (activeLink) activeLink.removeAttribute('aria-describedby');
    activeLink = null;
    if (tooltip) tooltip.hidden = true;
  }
  function showTooltip(link) {
    if (!link.isConnected || !link.href) return;
    hideTooltip();
    activeLink = link;
    const el = tooltipNode();
    el.textContent = link.href;
    el.hidden = false;
    link.setAttribute('aria-describedby', el.id);
    const anchor = link.getBoundingClientRect();
    const maxLeft = Math.max(10, document.documentElement.clientWidth - el.offsetWidth - 10);
    el.style.left = Math.max(10, Math.min(anchor.left + anchor.width / 2 - el.offsetWidth / 2, maxLeft)) + 'px';
    let top = anchor.bottom + 7;
    if (top + el.offsetHeight > window.innerHeight - 8) top = Math.max(8, anchor.top - el.offsetHeight - 7);
    el.style.top = top + 'px';
  }
  function validHttp(link) {
    try { return new URL(link.href, document.baseURI).protocol === 'https:'; }
    catch { return false; }
  }
  function enhanceLink(link) {
    if (link.dataset.gnSourceIcon === '1' || !validHttp(link)) return;
    // A text-labelled citation does not need a second boxed arrow next to Q/H.
    // Keep the original text as a real external link (long-press/copy still work).
    if (link.closest('.gn-note-entry[data-note-id^="QUR-"], .gn-note-entry[data-note-id^="HAD-"]') &&
        link.closest('.source-note-links')) {
      link.dataset.gnSourceIcon='1';
      link.classList.add('gn-source-plain-link');
      link.target='_blank'; link.rel='noopener noreferrer';
      return;
    }
    const existing = link.textContent.trim();
    let label = existing;
    try {
      if (!label || /^https?:\/\//i.test(label)) {
        const url = new URL(link.href);
        const quran = url.hostname.replace(/^www\./, '') === 'quran.com' && url.pathname.match(/^\/(\d+)\/(\d+)(?:\/|$)/);
        const hadith = url.hostname.replace(/^www\./, '') === 'sunnah.com' && url.pathname.match(/^\/([^/]+?):([0-9]+[a-z]?)(?:\/|$)/i);
        label = quran ? `Qurʾān ${quran[1]}:${quran[2]}` :
          hadith ? `${hadith[1].replace(/^./, c => c.toUpperCase())} ${hadith[2]}` : url.hostname.replace(/^www\./, '');
      }
    } catch { return; }
    // An inline label is needed for offline printing and non-hover devices.
    // Preserve the identifiable source, not its full URL.
    const wrapper = document.createElement('span');
    wrapper.className = 'gn-source-citation';
    const name = document.createElement('span');
    name.className = 'gn-source-label';
    name.textContent = label;
    link.parentNode.insertBefore(wrapper, link);
    wrapper.append(name, link);
    link.dataset.gnSourceIcon = '1';
    link.classList.add('gn-source-icon-link');
    link.innerHTML = ARROW;
    link.setAttribute('aria-label', `Open external source: ${label}. ${link.href}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') showTooltip(link); });
    link.addEventListener('pointerleave', () => { if (activeLink === link) hideTooltip(); });
    link.addEventListener('focus', () => {
      if (lastInput === 'keyboard' ||
          (lastInput !== 'touch' && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) {
        showTooltip(link);
      }
    });
    link.addEventListener('blur', () => { if (activeLink === link) hideTooltip(); });
  }
  function addVerifiedExcerpt(card) {
    if (!card || card.dataset.gnVerseEnhanced === '1') return;
    const id = card.getAttribute('data-note-id');
    const info = VERIFIED_SOURCE_EXCERPTS[id];
    if (!info) return;
    // The reader now renders the two §1 comparisons in its own HTML.
    // Never create a second verse panel or override its carefully distinguished
    // authorial wording, even when the optional enhancement script loads later.
    if (card.querySelector('.gn-verse-source-excerpt')) {
      card.dataset.gnVerseEnhanced = '1';
      return;
    }
    clarifySection1Source(card, id);
    card.dataset.gnVerseEnhanced = '1';
    const quote = document.createElement('figure');
    quote.className = 'gn-verse-source-excerpt';
    const body = document.createElement('blockquote');
    body.className = 'gn-quran-quotation';
    body.setAttribute('lang', 'ar');
    body.setAttribute('dir', 'rtl');
    const opener = document.createElement('span'); opener.className = 'gn-quran-bracket'; opener.textContent = '﴿';
    const verse = document.createElement('span'); verse.className = 'gn-quran-words'; verse.textContent = info.text;
    const closer = document.createElement('span'); closer.className = 'gn-quran-bracket'; closer.textContent = '﴾';
    body.append(opener, document.createTextNode(' '), verse, document.createTextNode(' '), closer);
    const caption = document.createElement('figcaption');
    caption.textContent = info.label;
    quote.append(body, caption);
    if (info.translation) {
      const translation = document.createElement('p');
      translation.className = 'gn-verse-source-translation';
      translation.textContent = info.translation;
      quote.append(translation);
    }
    if (info.explanation) {
      const detail = document.createElement('p');
      detail.className = 'gn-verse-source-explanation';
      detail.textContent = info.explanation;
      quote.append(detail);
    }
    const prose = card.querySelector('p');
    if (prose) prose.after(quote); else card.append(quote);
  }
  function enhance(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element && root.matches(NOTE_LINKS)) enhanceLink(root);
    root.querySelectorAll(NOTE_LINKS).forEach(enhanceLink);
    if (root instanceof Element && root.matches('.gn-note-entry[data-note-id]')) addVerifiedExcerpt(root);
    root.querySelectorAll('.gn-note-entry[data-note-id]').forEach(addVerifiedExcerpt);
  }
  function start() {
    enhance(document);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const added of record.addedNodes) if (added.nodeType === Node.ELEMENT_NODE) enhance(added);
      }
    });
    observer.observe(document.body, {subtree: true, childList: true});
    document.addEventListener('pointerdown', event => {
      lastInput = event.pointerType || 'mouse';
      if (lastInput === 'touch') hideTooltip();
    }, true);
    document.addEventListener('touchstart', () => {
      lastInput = 'touch'; hideTooltip();
    }, {capture: true, passive: true});
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {hideTooltip(); return;}
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) lastInput = 'keyboard';
    });
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip);
    document.documentElement.dataset.gnSourceNotesRevision = REVISION;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();