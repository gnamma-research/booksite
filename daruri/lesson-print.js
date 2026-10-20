/* Complete bilingual lesson packets, assembled from the current reader data.
   No source text is fetched during printing or added to the normal lesson. */
(() => {
  'use strict';
  const KIND = {grammar:'Grammar', textual:'Textual note', lexical:'Vocabulary', translation:'Translation', crux:'Textual difficulty', quotation:'Quotation', scholarship:'Scholarly context', interpretive:'Interpretation', 'quran-source':'Qur’an source', 'hadith-source':'Hadith source'};
  // These explicit print adaptations keep the research lessons workable with
  // the supplied text. They do not claim the case summaries are primary texts.
  const OFFLINE = {
    transmission: {
      tasks:{1:'Using §§64 and 75–82 printed here, compare two claims: how wording is established as Qurʾānic, and when a report warrants action. Cite the section numbers, and state one question the B10 summary cannot settle without its original source.'},
      feedback:{1:'Assess the comparison by accurate attribution, exact reader-section references, and a clear separation of transmission, authority and action. Agreement on one proposition does not establish agreement on all three. Identify the limit of the editorial B10 summary without claiming to have checked its original source.'}
    },
    narrators: {
      tasks:{1:'Compare §233 with §96 printed here: what is delegated to expertise, and what must the recipient still understand?'},
      feedback:{1:'Identify the judgement entrusted to an expert, what the recipient must still understand, and where the two printed passages address different questions. Support each distinction with the wording of §§96 and 233.'}
    },
    consensus: {tasks:{0:'Prepare a 300–400-word consensus dossier for one claim in the printed Darūrī passages. Identify the proposition, participants and stated evidence, with exact section references.'}},
    presumption: {tasks:{1:'Analyse §247’s recipient-relative conflict and identify the precise missing evidence.'}},
    meaning: {tasks:{1:'Using the printed B12 and B13 summaries with the assigned Darūrī passages, distinguish selecting a meaning from determining its scope or the time clarification is required. Cite the passages and identify one claim that still needs verification in the original Bidāya.'}},
    interpretation: {tasks:{0:'Using the printed B14 or B15 editorial summary and the assigned passages, write a 350-word provisional assessment with a table separating evidence reported in the summary from evidence visible in the printed Darūrī text. State where judgement must remain suspended.'}},
    'general-specific': {tasks:{0:'Using the printed Darūrī passages and the editorial B12 and B22 summaries, write a 300–400-word comparison classifying each disputed step. Quote or translate the supporting Darūrī wording, and distinguish this evidence from the summaries.'}},
    'conflicting-proofs': {tasks:{0:'Using the disagreement examined in §§246–247 printed here, write a short case analysis identifying the exact evidential operation and the conclusion it supports.'}}
  };
  const arabicRuns = /([\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]+(?:[ \t«»()]*[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]+)*)/g;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function mixedText(node, text) {
    String(text || '').split(arabicRuns).forEach((part, i) => {
      if (i % 2) {
        const ar = element('span', 'sg-print-inline-ar', part);
        ar.lang = 'ar'; ar.dir = 'rtl'; node.append(ar);
      } else node.append(document.createTextNode(part));
    });
    return node;
  }
  function sectionReferences(text) {
    const result = [];
    const pattern = /(?:§{1,2}|\bsections?)\s*(\d{1,3}(?:\s*(?:[–—-]\s*\d{1,3}|(?:,|and|&)\s*§?\s*\d{1,3}))*)/gi;
    for (const match of String(text || '').matchAll(pattern)) {
      for (const part of match[1].matchAll(/(\d{1,3})(?:\s*[–—-]\s*(\d{1,3}))?/g)) {
        const first = Number(part[1]), last = Number(part[2] || part[1]);
        if (first < 1 || last > 258 || last < first) continue;
        for (let n = first; n <= last; n++) result.push(n);
      }
    }
    return result;
  }
  function citation(section) {
    const pages = (section.pages || []).join(', '), b = section.bouAkl;
    let text = 'Reader §' + section.id + ' · al-ʿAlawī (1994), printed page' + (section.pages?.length > 1 ? 's ' : ' ') + pages + '.';
    if (b?.start) text += ' Bou Akl (2015), §' + b.start + (b.end && b.end !== b.start ? '–' + b.end : '') + '; Arabic p. ' + b.arabicPrintedStart + ', French p. ' + b.frenchPrintedStart + ' (passage begins).';
    return text;
  }

  function prepare(article) {
    if (!article || article.querySelector('[data-lesson-print]')) return null;
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const lesson = window.DARURI_STUDY_DATA?.lessons.find(item => item.id === params.get('topic'));
    const selected = article.querySelector('.sg-levels [aria-current="page"]');
    const level = new URLSearchParams(selected?.getAttribute('href').split('?')[1] || '').get('level') || params.get('level') || 'basic';
    const version = lesson?.levels[level];
    if (!version) return null;
    const book = JSON.parse(document.getElementById('editionData').textContent);
    const sections = new Map(book.sections.map(item => [Number(item.id), item]));
    const notes = new Map(book.notes.map(item => [item.id, item]));
    const apps = lesson.applications.map(id => book.apps.find(app => app.id === id)).filter(Boolean);
    const assigned = [...new Set(version.sections.map(Number))];
    const adaptation = level === 'advanced' ? OFFLINE[lesson.id] : null;
    const mentioned = [version.explanation, version.example.title, version.example.text, version.tasks, version.feedback, Object.values(adaptation?.tasks || {}), ...apps.map(app => app.text)].flat(Infinity).join('\n');
    const supplementary = [...new Set(sectionReferences(mentioned))].filter(n => !assigned.includes(n) && sections.has(n));
    const ordered = [...assigned, ...supplementary];
    // Validate before changing the DOM: a partial packet must never be printed.
    for (const id of ordered) {
      const section = sections.get(id);
      if (!section?.segments?.length || section.segments.some(segment => !(segment.vocalized || segment.ar) || !segment.en)) throw new Error('The complete bilingual reading for §' + id + ' is unavailable.');
      for (const noteId of section.noteIds || []) if (!notes.has(noteId)) throw new Error('Reading note ' + noteId + ' is unavailable.');
    }

    const roots = [], changed = [], entries = [], byNote = new Map();
    function printOnly(node) {
      node.classList.add('sg-print-only'); node.style.display = 'none';
      node.dataset.lessonPrint = 'true'; roots.push(node); return node;
    }
    function hideOnPaper(node) {
      if (!node) return;
      changed.push([node, node.getAttribute('class')]); node.classList.add('sg-screen-only');
    }
    function replaceOnPaper(node, text, className = '') {
      if (!node) return;
      hideOnPaper(node);
      const replacement = printOnly(mixedText(element(node.tagName.toLowerCase(), className), text));
      node.after(replacement); return replacement;
    }
    function register(note, scope) {
      let entry = byNote.get(note.id);
      if (!entry) {
        entry = {note, number:entries.length + 1, scopes:[], anchor:'sg-print-note-' + (entries.length + 1)};
        byNote.set(note.id, entry); entries.push(entry);
      }
      if (scope && !entry.scopes.includes(scope)) entry.scopes.push(scope);
      return entry;
    }
    function calls(noteList, scope, label) {
      const line = element('p', 'sg-print-note-calls');
      line.append(document.createTextNode(label || 'Endnotes: '));
      noteList.forEach((note, i) => {
        if (i) line.append(document.createTextNode(', '));
        const entry = register(note, scope);
        const a = element('a', '', '[' + entry.number + ']');
        a.href = '#' + entry.anchor; a.dataset.printNoteRef = note.id;
        a.setAttribute('role', 'doc-noteref'); line.append(a);
      });
      return line;
    }
    function excerpt(section, title) {
      const out = element('section', 'sg-print-excerpt'); out.dataset.printSection = section.id;
      if (title) out.append(mixedText(element('h3'), '§' + section.id + ' · ' + section.title));
      out.append(element('p', 'sg-print-citation', citation(section)));
      if (section.headingAr) {
        const ar = element('p', 'sg-print-ar sg-print-source-heading', section.headingVocalized || section.headingAr);
        ar.lang = 'ar'; ar.dir = 'rtl'; out.append(ar);
        if (section.headingEn) out.append(mixedText(element('p', 'sg-print-en sg-print-source-heading'), section.headingEn));
      }
      const relevant = (section.noteIds || []).map(id => notes.get(id));
      // Keep note numbering stable in source order, even when calls follow a passage.
      relevant.forEach(note => register(note, '§' + section.id));
      const positioned = new Set();
      section.segments.forEach((segment, index) => {
        const pair = element('div', 'sg-print-pair'); pair.dataset.printSegment = index;
        const ar = element('p', 'sg-print-ar', segment.vocalized || segment.ar); ar.lang = 'ar'; ar.dir = 'rtl';
        const en = mixedText(element('p', 'sg-print-en'), segment.en); en.lang = 'en'; en.dir = 'ltr';
        pair.append(ar, en);
        const local = relevant.filter(note => note.passageIndex === index || note.source_anchors?.some(anchor => anchor.segment_index === index));
        local.forEach(note => positioned.add(note.id));
        if (local.length) pair.append(calls(local, '§' + section.id, 'Notes for passage ' + (index + 1) + ': '));
        out.append(pair);
      });
      const general = relevant.filter(note => !positioned.has(note.id));
      if (general.length) out.append(calls(general, '§' + section.id, 'Notes for §' + section.id + ': '));
      return out;
    }

    try {
      const intro = printOnly(element('p', 'sg-print-intro', 'Complete bilingual lesson. Each Arabic passage is followed by its English translation. Arabic vowel marks are editorial. Numbered notes at the end explain grammar, vocabulary, translation and sources.'));
      article.querySelector('.sg-hero').append(intro);
      if (level === 'advanced') article.querySelector('.sg-hero').append(printOnly(element('p', 'sg-print-intro', 'Offline study. Complete the tasks using the passages, case summaries and endnotes included here. Suggestions to consult another work are optional further research; the printed tasks do not require them. Tasks adapted for this handout are labelled “Offline adaptation”.')));
      const readingList = article.querySelector('.sg-readings');
      replaceOnPaper(readingList.previousElementSibling, 'Read the passages below in the order shown. The complete readings and their notes are included in this handout.');
      for (const item of readingList.children) {
        const href = item.querySelector('[data-sg-source]')?.getAttribute('href') || '';
        const id = Number(new URLSearchParams(href.slice(1)).get('section'));
        if (!sections.has(id)) throw new Error('The assigned reading could not be identified.');
        hideOnPaper(item.querySelector('.sg-citation'));
        item.append(printOnly(excerpt(sections.get(id), false)));
      }
      if (supplementary.length) {
        const extra = printOnly(element('section', 'sg-print-supplement'));
        extra.append(element('h3', '', 'Supplementary passages mentioned in this lesson'));
        extra.append(element('p', '', 'These passages supply the additional section references used in the explanation, tasks or related cases.'));
        supplementary.forEach(id => extra.append(excerpt(sections.get(id), true)));
        readingList.after(extra);
      }
      replaceOnPaper(article.querySelector('.sg-prerequisites > p'), 'Use the key terms and bilingual readings in this handout. If you are working in English, the full translation is included; use the Arabic to examine the wording.');
      replaceOnPaper(article.querySelector('#sg-task > p'), 'Write your answer before consulting the feedback below. Cite the numbered passages printed in this handout.');
      for (const [group, selector] of [['tasks', '#sg-task > ol > li'], ['feedback', '.sg-feedback > ol > li']]) {
        const items = [...article.querySelectorAll(selector)];
        for (const [index, text] of Object.entries(adaptation?.[group] || {})) {
          const replacement = replaceOnPaper(items[Number(index)], 'Offline adaptation. ' + text, 'sg-print-task');
          if (replacement) replacement.dataset.printAdaptation = group + '-' + index;
        }
      }
      replaceOnPaper(article.querySelector('.sg-parallels > p'), 'The following editorial summaries provide related cases for this lesson. Distinguish each summary from Ibn Rushd’s own argument in the passages above. Book and chapter references identify the original cases.');
      for (const control of article.querySelectorAll('.sg-parallels a, .sg-parallels button')) hideOnPaper(control);
      for (const [index, detail] of [...article.querySelectorAll('.sg-parallels > details')].entries()) {
        const app = apps[index]; if (!app) continue;
        const sourceNotes = window.DARURI_SOURCE_REFERENCES?.applications?.[app.id] || [];
        if (sourceNotes.length) detail.append(printOnly(calls(sourceNotes, app.id + ' · ' + app.title, 'Case source notes: ')));
      }
      // Lesson-example sources use the same continuous endnote sequence.
      for (const source of version.example.quran_sources || []) {
        const old = document.getElementById('sg-source-' + source.id);
        const call = article.querySelector('[data-sg-note="sg-source-' + source.id + '"]')?.parentElement;
        hideOnPaper(old); hideOnPaper(call);
        article.querySelector('.sg-example').append(printOnly(calls([{...source, kind:'quran-source'}], 'Teaching example', 'Example source: ')));
      }
      // Resolve explicitly named apparatus notes; do not expand edition-specific
      // section references in notes into unrelated reader passages.
      for (let i = 0; i < entries.length; i++) {
        for (const match of String(entries[i].note.text).matchAll(/\b(?:N\d{3}|BA\d{3}|BA15-[A-Z]\d{3}|G-B2-\d{4})\b/g)) {
          if (match[0] !== entries[i].note.id && notes.has(match[0])) register(notes.get(match[0]), 'Referenced by note ' + entries[i].number);
        }
      }
      if (entries.length) {
        const end = printOnly(element('section', 'sg-print-endnotes'));
        end.setAttribute('role', 'doc-endnotes');
        end.append(element('h2', '', 'Reading notes and sources'));
        end.append(element('p', '', 'The bracketed numbers beside the readings refer to these notes. Each note identifies its section or teaching example. Notes retain the current edition’s wording and source qualifications.'));
        const list = element('ol', 'sg-print-note-list');
        entries.forEach(({note, number, scopes, anchor}) => {
          const item = element('li'); item.id = anchor; item.dataset.printNote = note.id; item.setAttribute('role', 'doc-endnote');
          item.append(mixedText(element('strong', 'sg-print-note-label'), number + '. ' + scopes.join('; ') + ' · ' + (note.kindLabel || KIND[note.kind] || 'Source note') + ' · ' + note.id));
          item.append(mixedText(element('p', 'sg-print-note-text'), note.text));
          const references = note.source_type === 'quran' ? (note.references || []).map(r => r.label_en) : (note.source_references || []).map(r => r.reference);
          const additional = references.filter(ref => ref && !note.text.includes(ref));
          if (additional.length) item.append(mixedText(element('p', 'sg-print-note-text'), 'Source: ' + additional.join('; ') + '.'));
          list.append(item);
        });
        end.append(list); article.append(end);
      }
      const cleanup = () => {
        roots.forEach(node => node.remove());
        changed.forEach(([node, original]) => original === null ? node.removeAttribute('class') : node.setAttribute('class', original));
      };
      return cleanup;
    } catch (error) {
      roots.forEach(node => node.remove());
      changed.forEach(([node, original]) => original === null ? node.removeAttribute('class') : node.setAttribute('class', original));
      throw error;
    }
  }
  window.GnammaLessonPrint = {prepare};
})();
