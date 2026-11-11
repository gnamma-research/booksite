/* Shared, escaped text/table and source-diagram rendering for the readers and PDFs.
   Only the markup generated here is trusted; source strings are always escaped. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HikmaRichText = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const text = value => String(value == null ? '' : value);
  const escape = value => text(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // Match the reader's existing non-nested bold/italic syntax, escaping first.
  function inline(value) {
    return text(value).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map(part => {
      if (part.startsWith('**') && part.endsWith('**')) return '<strong>' + escape(part.slice(2, -2)) + '</strong>';
      if (part.startsWith('*') && part.endsWith('*')) return '<em>' + escape(part.slice(1, -1)) + '</em>';
      return escape(part);
    }).join('');
  }

  function tableRow(line) {
    const input = text(line).trim(), cells = [];
    let cell = '', separators = 0, lastSeparator = -1;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === '\\' && input[i + 1] === '|') { cell += '|'; i++; }
      else if (input[i] === '|') { cells.push(cell.trim()); cell = ''; separators++; lastSeparator = i; }
      else cell += input[i];
    }
    if (!separators) return null;
    cells.push(cell.trim());
    if (input[0] === '|') cells.shift();
    if (lastSeparator === input.length - 1) cells.pop();
    return cells;
  }

  function tableAt(lines, index) {
    const headers = tableRow(lines[index]), rules = tableRow(lines[index + 1]);
    if (!headers || headers.length < 2 || !rules || headers.length !== rules.length ||
        !rules.every(rule => /^:?-{3,}:?$/.test(rule))) return null;
    const rows = [];
    let end = index + 2;
    while (end < lines.length && lines[end].trim()) {
      const row = tableRow(lines[end]);
      // A malformed row remains ordinary text; never silently drop its cells.
      if (!row || row.length !== headers.length) break;
      rows.push(row); end++;
    }
    return { headers, rows, end };
  }

  function renderText(value, options = {}) {
    const language = options.language === 'arabic' || options.language === 'ar' ? 'ar' : 'en';
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    const lines = text(value).trim().replace(/\r\n?/g, '\n').split('\n'), output = [];
    const caption = text(options.tableCaption).trim() || (language === 'ar' ? 'جدول' : 'Table');
    let paragraph = [], paragraphNumber = 0;
    function flush() {
      if (!paragraph.length) return;
      const content = inline(paragraph.join('\n'));
      const id = options.paragraphIds?.[paragraphNumber++];
      output.push('<p dir="' + direction + '"' + (id ? ' id="' + escape(id) + '" data-paragraph="true"' : '') + '>' + (options.lineBreaks ? content.replace(/\n/g, '<br>') : content) + '</p>');
      paragraph = [];
    }
    for (let i = 0; i < lines.length;) {
      if (!lines[i].trim()) { flush(); i++; continue; }
      const table = tableAt(lines, i);
      if (table) {
        flush();
        output.push('<div class="hikma-table-scroll" tabindex="0" role="region" aria-label="' + escape(caption) + '" dir="' + direction + '">' +
          '<table class="hikma-text-table"><caption>' + escape(caption) + '</caption><thead><tr>' +
          table.headers.map(cell => '<th scope="col">' + inline(cell) + '</th>').join('') + '</tr></thead><tbody>' +
          table.rows.map(row => '<tr>' + row.map((cell, column) => column === 0 ?
            '<th scope="row">' + inline(cell) + '</th>' : '<td>' + inline(cell) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>');
        i = table.end;
      } else { paragraph.push(lines[i]); i++; }
    }
    flush();
    return output.join('');
  }

  const positions = Object.freeze({
    'upper-left': [120, 55], 'upper-right': [520, 55],
    'lower-left': [120, 415], 'lower-right': [520, 415]
  });
  const positionNames = {
    ar: { 'upper-left': 'أعلى اليسار', 'upper-right': 'أعلى اليمين', 'lower-left': 'أسفل اليسار', 'lower-right': 'أسفل اليمين' },
    en: { 'upper-left': 'Upper left', 'upper-right': 'Upper right', 'lower-left': 'Lower left', 'lower-right': 'Lower right' }
  };

  // This renderer is deliberately limited to the four-corner source square.
  // Unsupported metadata leaves the full prose transcription available.
  function validDiagram(diagram) {
    if (!diagram || !Array.isArray(diagram.nodes) || diagram.nodes.length !== 4 ||
        !Array.isArray(diagram.relations) || diagram.relations.length !== 6) return false;
    const ids = new Set(), places = new Set(), pairs = new Set();
    for (const node of diagram.nodes) {
      if (!node || !/^[AEIO]$/.test(node.id) || ids.has(node.id) ||
          !Object.hasOwn(positions, node.position) || places.has(node.position) ||
          !text(node.arabic).trim() || !text(node.english).trim()) return false;
      ids.add(node.id); places.add(node.position);
    }
    for (const relation of diagram.relations) {
      if (!relation || !ids.has(relation.from) || !ids.has(relation.to) || relation.from === relation.to ||
          !text(relation.arabic).trim() || !text(relation.english).trim()) return false;
      const pair = [relation.from, relation.to].sort().join('-');
      if (pairs.has(pair)) return false;
      pairs.add(pair);
    }
    return true;
  }

  function renderDiagram(diagram, language, unitId) {
    if (!validDiagram(diagram)) return '';
    const arabic = language === 'arabic' || language === 'ar', lang = arabic ? 'ar' : 'en';
    const field = arabic ? 'arabic' : 'english', direction = arabic ? 'rtl' : 'ltr';
    const id = 'hikma-diagram-' + text(unitId).replace(/[^A-Za-z0-9_-]/g, '-') + '-' + lang;
    const title = arabic ? 'مربع التقابل' : 'Square of opposition';
    const page = text(diagram.page).trim();
    const caption = arabic ? title + ' — إعادة رسم للمخطط الوارد في المصدر' + (page ? ' (الصفحة المعروضة ' + page + ')' : '') + '.' :
      title + ' — redrawn from the source diagram' + (page ? ' (displayed p. ' + page + ')' : '') + '.';
    const nodes = new Map(diagram.nodes.map(node => [node.id, node]));
    const description = diagram.nodes.map(node => positionNames[lang][node.position] + ': ' + node[field]).join('; ') + '. ' +
      diagram.relations.map(relation => nodes.get(relation.from)[field] + ' / ' + nodes.get(relation.to)[field] + ': ' + relation[field]).join('; ') + '.';
    const edges = diagram.relations.map(relation => {
      const [x1, y1] = positions[nodes.get(relation.from).position];
      const [x2, y2] = positions[nodes.get(relation.to).position];
      const diagonal = x1 !== x2 && y1 !== y2;
      // Place each diagonal label above the crossing, so neither hides the other.
      const t = diagonal ? (y1 < y2 ? 0.28 : 0.72) : 0.5;
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
      return '<g class="hikma-diagram-relation" data-from="' + escape(relation.from) + '" data-to="' + escape(relation.to) + '">' +
        '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"></line>' +
        '<text x="' + x + '" y="' + y + '" transform="rotate(' + angle.toFixed(3) + ' ' + x + ' ' + y + ')" direction="' + direction + '">' +
        escape(relation[field]) + '</text></g>';
    }).join('');
    const corners = diagram.nodes.map(node => {
      const [x, y] = positions[node.position];
      return '<g class="hikma-diagram-node" data-node="' + escape(node.id) + '" data-position="' + escape(node.position) + '">' +
        '<text x="' + x + '" y="' + y + '" direction="' + direction + '">' + escape(node[field]) + '</text></g>';
    }).join('');
    return '<figure class="hikma-source-diagram" lang="' + lang + '" dir="' + direction + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 470" role="img" aria-labelledby="' + id + '-title ' + id + '-desc" direction="ltr">' +
      '<title id="' + id + '-title">' + escape(title) + '</title><desc id="' + id + '-desc">' + escape(description) + '</desc>' +
      edges + corners + '</svg><figcaption>' + escape(caption) + '</figcaption></figure>';
  }

  function renderFigure(figure, language) {
    if (!figure || figure.kind !== 'classification-tree' || !Array.isArray(figure.branches)) return '';
    const ar = language === 'arabic' || language === 'ar', suffix = ar ? 'Arabic' : 'English';
    const branches = new Map();
    for (const row of figure.branches) {
      const parent = text(row['parent' + suffix]), children = row['children' + suffix];
      if (!parent || !Array.isArray(children) || children.some(c => !text(c))) return '';
      branches.set(parent, children);
    }
    const children = new Set([...branches.values()].flat());
    const roots = [...branches.keys()].filter(k => !children.has(k));
    if (roots.length !== 1) return '';
    function node(label, seen) {
      if (seen.has(label) || seen.size > 12) throw Error('Cyclic figure');
      const next = new Set(seen); next.add(label);
      return '<li><span>' + escape(label) + '</span>' + (branches.has(label) ?
        '<ul>' + branches.get(label).map(c => node(c,next)).join('') + '</ul>' : '') + '</li>';
    }
    let tree; try { tree = node(roots[0], new Set()); } catch (_) { return ''; }
    const caption = ar ? 'خلاصة التقسيم — إعادة رسم من طبعة النجف، ١٩٦٨، ص ٢٣٤؛ تتمة صريحة للرسم المفقود في النص الرقمي.' :
      'Summary of the division — redrawn from the Najaf 1968 edition, p. 234; an explicit supplement to the missing digital figure.';
    return '<figure class="hikma-classification" lang="' + (ar?'ar':'en') + '" dir="' + (ar?'rtl':'ltr') + '"><ul>' + tree + '</ul><figcaption>' + escape(caption) + '</figcaption></figure>';
  }

  function renderUnit(unit, language, options = {}) {
    const arabic = language === 'arabic' || language === 'ar', field = arabic ? 'arabic' : 'english';
    const title = text(arabic ? unit.arabicTitle : unit.title).trim();
    return renderText(arabic && options.plainArabic ? stripVowels(unit[field]) : unit[field], { ...options, language: field,
      tableCaption: options.tableCaption || (title ? (arabic ? 'جدول: ' : 'Table: ') + title : '') }) +
      renderDiagram(unit.sourceDiagram, field, unit.id) + renderFigure(unit.sourceFigure, field);
  }

  function stripVowels(value) {
    // In Muẓaffar's formulas the fatḥa over an isolated term letter marks its
    // complement. Removing it changes the proposition, so retain those tokens.
    return text(value).replace(/[\u0621-\u065f\u0670\u0671]+/g, token => {
      const bare = token.replace(/[\u064b-\u065f\u0670\u0640]/g, '');
      return /^[بحج]$/.test(bare) ? token : token.replace(/[\u064b-\u065f\u0670]/g, '');
    });
  }

  return Object.freeze({ escape, inline, renderText, renderDiagram, renderFigure, renderUnit, validDiagram, stripVowels });
});
