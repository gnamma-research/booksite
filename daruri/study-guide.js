/* Editorial study lessons. The reader supplies navigation and source data;
   this module never changes the edition, language or appearance settings. */
(() => {
  'use strict';
  const LEVELS = {
    basic: {label: 'Basic', title: 'Foundations', description: 'Start here if legal theory is new to you. Learn the distinction, read a short selection, then explain it in your own words.'},
    intermediate: {label: 'Intermediate', title: 'Close Reading', description: 'Follow the argument, distinguish speakers and objections, and test your explanation against the assigned passages.'},
    advanced: {label: 'Advanced', title: 'Research', description: 'Build a source-based argument. Check Arabic terminology, edition references and counterexamples; identify what a proposed comparison would still need to establish.'}
  };
  const UNITS = [
    'Purpose and method', 'Rulings and responsibility', 'Reports and transmission',
    'Abrogation, consensus and presumption', 'Language and interpretation',
    'Qiyās and legal extension', 'Prophetic action', 'Juristic judgement and authority'
  ];
  const KEY = 'daruri-study-v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs = values => values.map(x => '<p>' + esc(x) + '</p>').join('');
  const list = (values, ordered = false) => '<' + (ordered ? 'ol' : 'ul') + '>' + values.map(x => '<li>' + esc(x) + '</li>').join('') + '</' + (ordered ? 'ol' : 'ul') + '>';
  const levelKey = value => Object.hasOwn(LEVELS, value) ? value : 'basic';
  const lessonURL = (id, level) => '#study?' + (id ? 'topic=' + encodeURIComponent(id) + '&' : '') + 'level=' + levelKey(level);
  const sourceURL = (n, id, level) => '#section=' + n + '&lesson=' + encodeURIComponent(id) + '&level=' + levelKey(level);
  const pageList = values => Array.isArray(values) ? values.join(', ') : String(values || 'not recorded');

  function create(ctx) {
    const lessons = window.DARURI_STUDY_DATA.lessons;
    const byId = new Map(lessons.map(x => [x.id, x]));
    const sources = new Map(ctx.book.sections.map(x => [String(x.id), x]));
    const applications = new Map(ctx.book.apps.map(x => [x.id, x]));
    const main = document.getElementById('mainContent');
    const referencePDF = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).find(h => /^daruri\.pdf(?:\?|$)/.test(h))?.split('#')[0] || 'daruri.pdf';
    let prefs = {}, storageOK = true, activeAssignment = null, lastAssignmentSection = '', focusNextLesson = false, focusNextSource = false, taskAfterReturn = false;
    try { prefs = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { storageOK = false; }
    if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) prefs = {};
    prefs.level = levelKey(prefs.level);
    if (!prefs.done || typeof prefs.done !== 'object' || Array.isArray(prefs.done)) prefs.done = {};
    ctx.state.studyQuery = '';
    ctx.state.studyUnit = '';
    ctx.state.studyLevel = prefs.level;
    ctx.state.studyTopic = '';

    function persist() {
      try { localStorage.setItem(KEY, JSON.stringify(prefs)); storageOK = true; }
      catch (_) { storageOK = false; }
    }
    function route() {
      const raw = location.hash.slice(1);
      if (raw !== 'study' && !raw.startsWith('study?')) return null;
      const params = new URLSearchParams(raw.split('?').slice(1).join('?'));
      const id = params.get('topic') || '';
      return {lesson: byId.get(id), level: levelKey(params.get('level') || prefs.level), invalid: Boolean(id && !byId.has(id))};
    }
    function isStudyRoute() { return Boolean(route()); }
    function completion(id, level) { return prefs.done[id + ':' + level] === true; }
    function completed(level) { return lessons.filter(x => completion(x.id, level)).length; }
    function progress(level) {
      const n = completed(level);
      return '<div class="sg-progress"><label for="sg-progress">' + n + ' of ' + lessons.length + ' questions marked studied at ' + LEVELS[level].label + '</label><progress id="sg-progress" max="' + lessons.length + '" value="' + n + '">' + n + '/' + lessons.length + '</progress><small>' + (storageOK ? 'Your own study record, saved in this browser.' : 'Your study record is available for this visit; browser storage is unavailable.') + '</small></div>';
    }
    function levelsNav(id, level) {
      return '<nav class="sg-levels" aria-label="Study level">' + Object.entries(LEVELS).map(([key, value]) => '<a href="' + lessonURL(id, key) + '" data-sg-nav' + (key === level ? ' aria-current="page"' : '') + '><strong>' + value.label + '</strong><span>' + value.title + '</span></a>').join('') + '</nav><p class="sg-level-help">' + LEVELS[level].description + '</p>';
    }
    function sourceCitation(s) {
      const b = s.bouAkl;
      let text = 'Reader §' + s.id + '; al-ʿAlawī (1994), printed page' + (s.pages?.length > 1 ? 's ' : ' ') + pageList(s.pages) + '.';
      if (b?.start) text += ' Bou Akl (2015), §' + b.start + (b.end && b.end !== b.start ? '–' + b.end : '') + '; Arabic printed page ' + b.arabicPrintedStart + ', French printed page ' + b.frenchPrintedStart + ' (start of passage).';
      return text;
    }
    function readings(lesson, level) {
      return '<ol class="sg-readings">' + lesson.levels[level].sections.map(n => {
        const s = sources.get(String(n));
        return '<li><a href="' + sourceURL(n, lesson.id, level) + '" data-sg-source><strong>§' + n + '</strong><span>' + esc(s.title) + '</span></a><details class="sg-citation"><summary>Edition references</summary><p>' + esc(sourceCitation(s)) + '</p><a href="' + esc(referencePDF) + '#page=' + s.pdfPage + '" target="_blank" rel="noopener">Reference PDF · physical page ' + s.pdfPage + '</a></details></li>';
      }).join('') + '</ol>';
    }
    function terms(lesson, level) {
      return '<details class="sg-terms"' + (level === 'basic' ? ' open' : '') + '><summary>Key terms for this question</summary><dl>' + lesson.terms.map(x => '<dt>' + esc(x.term) + '</dt><dd>' + esc(x.definition) + '</dd>').join('') + '</dl></details>';
    }
    function parallels(lesson) {
      const items = lesson.applications.map(id => applications.get(id)).filter(Boolean);
      if (!items.length) return '';
      return '<section class="sg-block sg-parallels"><h2>Related cases in the Bidāya</h2><p>These are editorial comparisons. Check the cited case before treating it as evidence for the argument in al-Ḍarūrī.</p>' + items.map(a => '<details><summary>' + esc(a.id + ' · ' + a.title) + '</summary><p class="sg-meta">' + esc(a.relation || 'Editorial parallel') + ' · ' + esc(a.book) + '</p><p>' + esc(a.text) + '</p><p>' + esc(a.locator) + '</p><a href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">Read the cited Arabic source</a> <button type="button" data-app="' + esc(a.id) + '" class="sg-link-button">Open reference details</button></details>').join('') + '</section>';
    }
    function footer() {
      return '<footer class="sg-editorial"><p>This guide is an editorial teaching companion to Ibn Rushd’s al-Ḍarūrī. Lesson titles, examples, tasks and feedback are teaching material; the numbered passages are the source text. Advanced comparisons are research assignments, with criteria for evaluating the result.</p><p>Reader § numbers, printed edition pages and PDF page numbers identify different things. Use the edition references beside each reading when citing a passage.</p><a href="daruri-study-guide.pdf?v=20261020-study1">Download the complete three-level study guide (PDF)</a></footer>';
    }
    function overview(level, invalid) {
      const last = prefs.last && byId.get(prefs.last.id);
      main.innerHTML = '<div class="sg-guide"><header class="sg-hero"><p class="sg-eyebrow">AL-ḌARŪRĪ · STUDY GUIDE</p><h1 id="sg-title" tabindex="-1">One text. Three depths of study.</h1><p class="sg-intro">Explore 28 questions in eight units, from the purpose of legal theory to juristic judgement. Start with Foundations, or choose the level that fits your preparation. You can change level within any question.</p><p class="sg-meta">28 questions · 8 units · explanations, readings, tasks and feedback</p></header>' + (invalid ? '<p class="sg-notice" role="status">That lesson link was not found. Choose a question below.</p>' : '') + levelsNav('', level) + '<div class="sg-start"><a class="sg-button sg-primary" data-sg-nav href="' + lessonURL('purpose', level) + '">Start with question 1 →</a>' + (last ? '<a class="sg-button" data-sg-nav href="' + lessonURL(last.id, prefs.last.level) + '">Continue question ' + last.number + ' · ' + LEVELS[levelKey(prefs.last.level)].label + '</a>' : '') + '</div>' + progress(level) + '<div class="sg-filters"><label>Find a question<input id="sg-filter" type="search" autocomplete="off" placeholder="Try qiyās, reports, authority…" value="' + esc(ctx.state.studyQuery) + '"></label><label>Teaching unit<select id="sg-unit"><option value="">All eight units</option>' + UNITS.map((u, i) => '<option value="' + (i + 1) + '"' + (String(ctx.state.studyUnit) === String(i + 1) ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(u) + '</option>').join('') + '</select></label></div><p class="sg-meta" id="sg-result-count" role="status" aria-live="polite"></p><div id="sg-question-list"></div>' + footer() + '</div>';
      updateOverview(level);
    }
    function updateOverview(level) {
      const out = document.getElementById('sg-question-list');
      if (!out) return;
      const q = ctx.fold(ctx.state.studyQuery || '');
      const selected = lessons.filter(l => (!ctx.state.studyUnit || String(l.unit) === String(ctx.state.studyUnit)) && (!q || ctx.fold([l.number, l.title, l.summary, ...l.terms.flatMap(t => [t.term, t.definition]), l.levels[level].objective].join(' ')).includes(q)));
      document.getElementById('sg-result-count').textContent = selected.length + ' of 28 questions shown';
      out.innerHTML = selected.length ? UNITS.map((unit, i) => {
        const items = selected.filter(l => l.unit === i + 1);
        if (!items.length) return '';
        return '<section class="sg-unit"><h2><span>Unit ' + (i + 1) + '</span>' + esc(unit) + '</h2><div class="sg-cards">' + items.map(l => '<article class="sg-card"><p class="sg-meta">Question ' + String(l.number).padStart(2, '0') + (completion(l.id, level) ? ' · Studied ✓' : '') + '</p><h3><a data-sg-nav href="' + lessonURL(l.id, level) + '">' + esc(l.title) + '</a></h3><p>' + esc(l.summary) + '</p><p class="sg-card-go">' + LEVELS[level].title + ' →</p></article>').join('') + '</div></section>';
      }).join('') : '<div class="sg-notice"><p>No questions match that search and unit.</p><button class="sg-button" data-sg-clear type="button">Show all questions</button></div>';
    }
    function lessonPage(lesson, level) {
      const l = lesson.levels[level], previous = lessons[lesson.number - 2], next = lessons[lesson.number];
      prefs.last = {id:lesson.id, level}; persist();
      const done = completion(lesson.id, level);
      main.innerHTML = '<article class="sg-guide sg-lesson"><nav class="sg-breadcrumb" aria-label="Lesson location"><a href="' + lessonURL('', level) + '" data-sg-nav>← All 28 questions</a><span>Unit ' + lesson.unit + ' · ' + esc(UNITS[lesson.unit - 1]) + '</span></nav><header class="sg-hero"><p class="sg-eyebrow">QUESTION ' + String(lesson.number).padStart(2, '0') + ' OF 28</p><h1 id="sg-title" tabindex="-1">' + esc(lesson.title) + '</h1><p class="sg-intro">' + esc(lesson.summary) + '</p></header>' + levelsNav(lesson.id, level) + '<div class="sg-lesson-tools"><button type="button" class="sg-button" data-sg-copy>Copy lesson link</button><button type="button" class="sg-button" data-sg-print>Print this lesson</button></div><section class="sg-objective"><h2>What you will learn</h2><p>' + esc(l.objective) + '</p></section><details class="sg-prerequisites"><summary>Before you begin</summary>' + list(lesson.prerequisites) + '<p>' + (level === 'basic' ? 'Read the definitions below first. Use the English, Arabic or parallel reader view that helps you follow the source.' : level === 'intermediate' ? 'If a distinction is unfamiliar, open this question at Basic first. Keep track of who is speaking in the source.' : 'Use the Basic and Intermediate versions to check your conceptual preparation. Arabic terminology and precise source citation matter at this level; a comparison requires reading the proposed source.') + '</p></details>' + terms(lesson, level) + '<section class="sg-block"><h2>1. Understand the question</h2>' + paragraphs(l.explanation) + '<aside class="sg-example"><h3>' + esc(l.example.title) + '</h3><p>' + esc(l.example.text) + '</p></aside></section><section class="sg-block"><h2>2. Read the assigned passages</h2><p>Read these in the order shown. The reader’s lesson bar takes you to the next assigned passage and back to this question.</p>' + readings(lesson, level) + '</section><section class="sg-block" id="sg-task" tabindex="-1"><h2>3. ' + (level === 'advanced' ? 'Develop an argument' : 'Try it yourself') + '</h2><p>Write a short answer before opening the feedback. Support your answer with the numbered passages.</p>' + list(l.tasks, true) + '<details class="sg-feedback"><summary>' + (level === 'advanced' ? 'Research criteria and guidance' : 'Reasoned feedback') + '</summary>' + list(l.feedback, true) + '</details></section>' + parallels(lesson) + '<section class="sg-completion"><h2>Reflect and continue</h2><p>Have you answered the tasks, checked the feedback, and identified anything you still need to revisit? Marking a question studied records your own judgement.</p><button type="button" class="sg-button sg-primary" data-sg-complete="' + esc(lesson.id) + '" data-sg-level="' + level + '" aria-pressed="' + done + '">' + (done ? 'Studied ✓ · Mark for review' : 'Mark this level studied') + '</button><p id="sg-completion-status" class="sg-meta" role="status">' + (done ? 'You have marked this question studied at ' + LEVELS[level].label + '.' : 'This question has not been marked studied at ' + LEVELS[level].label + '.') + '</p></section><nav class="sg-sequence" aria-label="Previous and next question">' + (previous ? '<a class="sg-button" data-sg-nav href="' + lessonURL(previous.id, level) + '"><small>← Previous question</small>' + esc(previous.title) + '</a>' : '<a class="sg-button" data-sg-nav href="' + lessonURL('', level) + '">All questions</a>') + (next ? '<a class="sg-button" data-sg-nav href="' + lessonURL(next.id, level) + '"><small>Next question →</small>' + esc(next.title) + '</a>' : '<a class="sg-button" data-sg-nav href="' + lessonURL('', level) + '">Review your progress →</a>') + '</nav>' + footer() + '</article>';
    }
    function render() {
      const view = route() || {level:prefs.level};
      if (view.invalid) {ctx.state.studyQuery = ''; ctx.state.studyUnit = '';}
      ctx.state.studyLevel = view.level;
      ctx.state.studyTopic = view.lesson?.id || '';
      prefs.level = view.level; persist();
      main.dataset.sgViewHash = location.hash;
      if (view.lesson) lessonPage(view.lesson, view.level); else overview(view.level, view.invalid);
    }
    function setAssignment() {
      const p = new URLSearchParams(location.hash.slice(1));
      const lesson = byId.get(p.get('lesson'));
      if (lesson) activeAssignment = {lesson, level:levelKey(p.get('level'))};
      else if (!location.hash.startsWith('#section=')) activeAssignment = null;
      else if (!ctx.hasStudyOrigin()) activeAssignment = null;
    }
    function assignmentURL(n) {
      return activeAssignment ? sourceURL(n, activeAssignment.lesson.id, activeAssignment.level) : null;
    }
    function renderAssignment() {
      const previousBar = document.getElementById('sg-assignment');
      const previousRect = previousBar?.getBoundingClientRect();
      previousBar?.remove();
      if (ctx.state.route !== 'reader' || !activeAssignment) return;
      const {lesson, level} = activeAssignment, sequence = lesson.levels[level].sections;
      const index = sequence.map(String).indexOf(String(ctx.state.n));
      lastAssignmentSection = String(ctx.state.n);
      const bar = document.createElement('nav');
      bar.id = 'sg-assignment'; bar.className = 'sg-assignment'; bar.setAttribute('aria-label', 'Assigned study readings');
      bar.innerHTML = '<div><strong>Question ' + lesson.number + ' · ' + LEVELS[level].title + '</strong><span>' + esc(lesson.title) + '</span><small>' + (index >= 0 ? 'Assigned reading ' + (index + 1) + ' of ' + sequence.length : 'Related reading · §' + esc(ctx.state.n)) + '</small></div><div class="sg-assignment-actions"><a class="sg-button" data-sg-back href="' + lessonURL(lesson.id, level) + '">← Back to lesson</a>' + (index > 0 ? '<a class="sg-button" data-sg-source data-sg-previous href="' + sourceURL(sequence[index - 1], lesson.id, level) + '">← Previous assigned passage</a>' : '') + (index >= 0 && index < sequence.length - 1 ? '<a class="sg-button sg-primary" data-sg-source href="' + sourceURL(sequence[index + 1], lesson.id, level) + '">Next assigned passage · §' + sequence[index + 1] + ' →</a>' : index < 0 ? '<a class="sg-button" data-sg-source href="' + sourceURL(sequence[0], lesson.id, level) + '">Start assigned readings · §' + sequence[0] + '</a>' : '<a class="sg-button sg-primary" data-sg-back data-sg-task href="' + lessonURL(lesson.id, level) + '">Return to the task →</a>') + '</div>';
      if (ctx.hasStudyOrigin()) main.querySelector('.gn-source-return')?.remove();
      main.prepend(bar);
      const toolbarHeight = document.getElementById('readingControls')?.getBoundingClientRect().height || 0;
      main.style.setProperty('--sg-assignment-offset', (toolbarHeight + 8) + 'px');
      main.style.setProperty('--sg-source-scroll-margin', (toolbarHeight + bar.getBoundingClientRect().height + 20) + 'px');
      if (ctx.state.focusLevel === 3 && previousRect && window.scrollY > previousRect.height && previousRect.top <= toolbarHeight + 9) {
        const difference = bar.getBoundingClientRect().height - previousRect.height;
        if (difference) window.scrollBy({top:difference, behavior:'instant'});
      }
    }
    function afterRender(routeName) {
      if (routeName === 'study') {
        const view = route();
        if (focusNextLesson) {focusNextLesson = false; requestAnimationFrame(() => document.getElementById('sg-title')?.focus({preventScroll:true}));}
        document.title = (view?.lesson ? 'Q' + view.lesson.number + ' · ' + LEVELS[view.level].title + ' · ' + view.lesson.title : 'Three-level study guide') + ' | al-Ḍarūrī';
      } else delete main.dataset.sgViewHash;
      setAssignment(); renderAssignment();
      if (routeName === 'reader' && focusNextSource) {focusNextSource = false; main.setAttribute('tabindex','-1'); requestAnimationFrame(() => main.focus({preventScroll:true}));}
      if (routeName === 'study' && taskAfterReturn) {taskAfterReturn = false; requestAnimationFrame(() => requestAnimationFrame(() => {const task = document.getElementById('sg-task'); task?.focus({preventScroll:true}); task?.scrollIntoView({block:'start'});}));}
    }
    function go(href, mode) {
      focusNextLesson = mode === 'lesson' || (mode === 'back' && !ctx.hasStudyOrigin());
      focusNextSource = mode === 'source';
      ctx.beforeNavigate(mode, href);
      if (location.hash === href) ctx.syncRoute(); else location.hash = href;
    }
    document.addEventListener('click', event => {
      const el = event.target.closest('[data-sg-nav],[data-sg-source],[data-sg-back],[data-sg-open],[data-sg-complete],[data-sg-copy],[data-sg-print],[data-sg-clear]');
      if (!el || event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (el.hasAttribute('data-sg-open')) {
        const lesson = byId.get(el.dataset.sgOpen);
        if (lesson) go(lessonURL(lesson.id, prefs.level), 'lesson');
      } else if (el.hasAttribute('data-sg-nav')) go(el.getAttribute('href'), 'lesson');
      else if (el.hasAttribute('data-sg-source')) go(el.getAttribute('href'), 'source');
      else if (el.hasAttribute('data-sg-back')) {
        taskAfterReturn = el.hasAttribute('data-sg-task');
        go(el.getAttribute('href'), 'back');
      } else if (el.hasAttribute('data-sg-complete')) {
        const id = el.dataset.sgComplete, level = levelKey(el.dataset.sgLevel);
        prefs.done[id + ':' + level] = !completion(id, level); persist();
        el.setAttribute('aria-pressed', completion(id, level));
        el.textContent = completion(id, level) ? 'Studied ✓ · Mark for review' : 'Mark this level studied';
        document.getElementById('sg-completion-status').textContent = completion(id, level) ? 'Marked studied at ' + LEVELS[level].label + '.' : 'Marked for review at ' + LEVELS[level].label + '.';
        if (!storageOK) ctx.notify('Progress is kept for this visit; browser storage is unavailable.');
      } else if (el.hasAttribute('data-sg-clear')) {
        ctx.state.studyQuery = ''; ctx.state.studyUnit = ''; render();
        document.getElementById('sg-filter')?.focus();
      } else if (el.hasAttribute('data-sg-print')) {
        const details = [...main.querySelectorAll('details')], opened = details.map(x => x.open);
        details.forEach(x => {x.open = true;});
        const restore = () => {details.forEach((x,i) => {x.open = opened[i];});};
        window.addEventListener('afterprint', restore, {once:true}); window.print();
      } else if (el.hasAttribute('data-sg-copy')) {
        const view = route();
        const url = new URL(lessonURL(view?.lesson?.id, view?.level), location.href).href;
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => ctx.notify('Lesson link copied.')).catch(() => showCopy(url));
        else showCopy(url);
      }
    });
    function showCopy(url) {
      let box = document.getElementById('sg-copy-link');
      if (!box) { box = document.createElement('input'); box.id = 'sg-copy-link'; box.className = 'sg-copy-link'; box.readOnly = true; box.setAttribute('aria-label', 'Lesson link to copy'); main.querySelector('.sg-lesson-tools')?.append(box); }
      box.value = url; box.focus(); box.select(); ctx.notify('Select and copy this lesson link.');
    }
    document.addEventListener('input', e => {
      if (e.target.id === 'sg-filter') {ctx.state.studyQuery = e.target.value; updateOverview(ctx.state.studyLevel);}
    });
    document.addEventListener('change', e => {
      if (e.target.id === 'sg-unit') {ctx.state.studyUnit = e.target.value; updateOverview(ctx.state.studyLevel);}
    });
    let scrollQueued = false;
    window.addEventListener('scroll', () => {
      if (scrollQueued || !activeAssignment || ctx.state.route !== 'reader') return;
      scrollQueued = true;
      requestAnimationFrame(() => {scrollQueued = false; if (String(ctx.state.n) !== lastAssignmentSection) renderAssignment();});
    }, {passive:true});
    window.addEventListener('resize', () => {if (activeAssignment && ctx.state.route === 'reader') renderAssignment();});
    const searchRecords = lessons.map(l => ({type:'study', id:l.id, title:'Q' + l.number + ' · ' + l.title, display:l.summary, hay:ctx.fold(JSON.stringify(l))}));
    return {render, afterRender, renderAssignment, isStudyRoute, assignmentURL, searchRecords};
  }
  window.GnammaStudyGuide = {create};
})();
