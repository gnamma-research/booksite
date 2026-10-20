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
    if (lesson && !window.GnammaLessonPrint) throw new Error('The lesson print component has not loaded.');
    const cleanupLesson = lesson ? window.GnammaLessonPrint.prepare(lesson) : null;
    saved = {details:details.map(detail => [detail, detail.open]), label:null, cleanupLesson};
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
    saved.cleanupLesson?.();
    saved = null;
  }

  window.addEventListener('beforeprint', prepare);
  window.addEventListener('afterprint', restore);
  window.GnammaPrint = {print() {
    try { prepare(); }
    catch (error) { alert('The complete lesson could not be prepared. Please reload this page before printing. ' + error.message); return; }
    const printingView = location.href;
    if (!document.fonts?.load) { window.print(); return; }
    const style = getComputedStyle(document.documentElement);
    const fonts = [
      ['--reader-arabic-font', 'Amiri', 'العربية'],
      ['--reader-english-font', 'Georgia', 'Study lesson']
    ];
    const ready = Promise.allSettled(fonts.map(([property, fallback, sample]) => document.fonts.load('14px ' + (style.getPropertyValue(property).trim() || fallback), sample)));
    // Give a newly used print face a chance to load without trapping printing
    // on a slow or unavailable font request. System fallback remains available.
    Promise.race([ready, new Promise(resolve => setTimeout(resolve, 1800))]).then(() => {
      if (location.href !== printingView) { restore(); return; }
      if (saved) window.print();
    });
  }};
})();
