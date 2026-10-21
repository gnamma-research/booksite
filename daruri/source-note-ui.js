/* Gnamma Daruri — source-note presentation, independent of the reader router.
   Links stay ordinary real anchors: keyboard access, native long-press, copy link,
   and no-JavaScript fallback work without private APIs or a database. */
(() => {
  'use strict';
  if (window.__gnSourceNoteUIInstalled) return;
  window.__gnSourceNoteUIInstalled = true;

  const REVISION = '20261021-source-notes1';
  const ARROW = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  const NOTE_LINKS = '.source-note-links a[href], .gn-note-entry a[href], .gn-app-source-notes a[href], .fb-note a[href], .gn-unified-notes a[href]';
  // Excerpts transcribed from Quran.com Uthmani text, solely to distinguish the
  // verse wording from the author's allusive expressions in these three notes.
  // Do NOT add reading variants, paraphrases, or unverified quotations here.
  const VERIFIED_SOURCE_EXCERPTS = Object.freeze({
    'QUR-R001-Q049': { text: 'عَلَّمَهُ ٱلۡبَيَانَ', label: 'Verse wording (al-Raḥmān 55:4)' },
    'QUR-R001-Q050': { text: 'فَلِلَّهِ ٱلۡحُجَّةُ ٱلۡبَٰلِغَةُ', label: 'Verse wording (al-Anʿām 6:149)' },
    'QUR-R001-Q051': { text: 'وَخَاتَمَ ٱلنَّبِيِّـۧنَ', label: 'Verse wording (al-Aḥzāb 33:40)' }
  });
  let tooltip;
  let activeLink;
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
    link.addEventListener('focus', () => showTooltip(link));
    link.addEventListener('blur', () => { if (activeLink === link) hideTooltip(); });
  }
  function addVerifiedExcerpt(card) {
    if (!card || card.dataset.gnVerseEnhanced === '1') return;
    const id = card.getAttribute('data-note-id');
    const info = VERIFIED_SOURCE_EXCERPTS[id];
    if (!info) return;
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
    document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTooltip(); });
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip);
    document.documentElement.dataset.gnSourceNotesRevision = REVISION;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();