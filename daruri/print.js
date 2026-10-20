/* Prepare the current reading view for either the browser's Print command or
   the lesson button. Screen disclosure states are restored after print/cancel. */
(() => {
  'use strict';
  let saved = null;

  function prepare() {
    if (saved) return;
    const lesson = document.querySelector('#mainContent .sg-lesson');
    const dictionary = document.getElementById('lexArticle');
    let details = [];
    if (lesson) details = [...lesson.querySelectorAll('details')];
    else if (dictionary) {
      details = [...dictionary.querySelectorAll('details')].filter(detail => {
        const panel = detail.closest('.dict-view-panel');
        return !panel || getComputedStyle(panel).display !== 'none';
      });
    } else {
      details = [...document.querySelectorAll('#mainContent .contents-parts .part-block, #mainContent .reader .note-item')];
    }
    saved = {details:details.map(detail => [detail, detail.open]), label:null};
    details.forEach(detail => { detail.open = true; });

    if (lesson) {
      const level = lesson.querySelector('.sg-levels [aria-current="page"]');
      if (level) {
        const label = document.createElement('p');
        label.className = 'gn-print-context';
        label.textContent = [...level.children].map(el => el.textContent.trim()).join(' · ');
        lesson.querySelector('.sg-hero')?.append(label);
        saved.label = label;
      }
    }
  }

  function restore() {
    if (!saved) return;
    saved.details.forEach(([detail, opened]) => { if (detail.isConnected) detail.open = opened; });
    saved.label?.remove();
    saved = null;
  }

  window.addEventListener('beforeprint', prepare);
  window.addEventListener('afterprint', restore);
  window.GnammaPrint = {print() { prepare(); window.print(); }};
})();
