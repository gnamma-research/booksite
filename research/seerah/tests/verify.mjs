import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const data = JSON.parse(read('data/chapters.json'));
const baseline = JSON.parse(read('editorial/release-1.8.0-restored-chapters.json'));
const original = JSON.parse(read('editorial/archive-20261112-preintegrated-chapters-1.4.1.json'));
const archived = JSON.parse(read('editorial/archived-1.7.0-pre-restoration-chapters.json'));
const reader = read('read.html');
const clarity = JSON.parse(read('editorial/READING_CLARITY_EDITS.json')).changes;
const proposal = Object.assign({}, ...['I_III','IV_VII'].map(b => JSON.parse(read('editorial/RECOMPOSED_MATN_BOOKS_' + b + '.json')).matn));
const landing = read('index.html');
const manuscript = read('editorial/current-edition-1.9.2-principial-narrative.md');
const critical = JSON.parse(read('data/dossiers.json'));
const atlas = read('atlas.html');
const bridges = Object.assign({},
  ...['I_III','IV_V','VI_VII'].map(b =>
    JSON.parse(read('editorial/HORIZONTAL_DERIVATIONS_BOOKS_'+b+'.json')).insertions
  )
);

function tokens(value, isHTML) {
  if (isHTML) value = value
    .replace(/<\/(?:p|li|h[1-6]|blockquote)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
  else value = value.replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g, '$1')
    .replace(/[*_`]/g, '');
  return (value.match(/[\p{L}\p{M}\p{N}]+/gu) || []).map(w => w.toLowerCase());
}

assert.equal(data.edition, '1.9.2-principial-narrative-integrated');
assert.equal(baseline.edition, '1.8.0-metaphysical-restoration');
assert.equal(original.edition, '1.4.1');
assert.equal(archived.edition, '1.7.0-generative-muhammadan-framework');
assert.equal(data.chapters.length, 46);
assert.equal(Object.keys(bridges).length, 46);
assert.equal(critical.dossiers.length, 9);
assert.equal((reader.match(/<article class="chapter"/g) || []).length, 46);
assert.equal((reader.match(/class="matn"/g) || []).length, 46);
assert.equal((reader.match(/class="sharh"/g) || []).length, 46);
assert.equal((reader.match(/id="s\d\d-v\d\d"/g) || []).length, 51);
assert.equal((reader.match(/id="s\d\d-r\d\d"/g) || []).length, 89);
assert.ok(reader.includes('data-mode="matn"') && reader.includes('data-mode="both"'));
assert.ok(reader.includes('data-bookmark=') && reader.includes('assets/site.js'));
assert.ok(reader.includes('assets/reader-context.js'));
assert.ok(reader.includes('principles.html'));
assert.doesNotMatch(reader, /Research edition|Editorial and source notes|Editorial status|Previous 1\.7 experimental reader|restored narrative/i);
assert.doesNotMatch(landing, /Research edition 1\.8\.0|Editorial status|Research progress|remaining chapters retain/i);
for (let i = 0; i < 46; i++) {
  const ch = data.chapters[i], prev = baseline.chapters[i];
  const id = 'ch-' + String(i + 1).padStart(2, '0');
  const bridge = bridges[i + 1];
  assert.equal(ch.id, i + 1, 'Chapter order');
  assert.equal(ch.title, prev.title, 'Chapter title');
  const expectedParagraphs = prev.sharh.split('\n\n');
  expectedParagraphs.splice(2, 0, bridge);
  const expected = {matn: prev.matn, sharh: expectedParagraphs.join('\n\n')};
  for (const [layer, pairs] of Object.entries(clarity[i + 1] || {})) {
    for (const [from, to] of pairs) {
      assert.ok(expected[layer].includes(from), 'Expected glossary change ' + id + '/' + layer);
      expected[layer] = expected[layer].replace(from, to);
    }
  }
  if (i + 1 >= 3) {
    const candidate = proposal[i + 1].split('\n\n');
    assert.equal(candidate.length, 4, 'Narrative passage count ' + id);
    const additions = i + 1 === 44 ? candidate.slice(1)
      : i + 1 === 16 ? [candidate[1], candidate[3]] : candidate.slice(2);
    expected.matn += '\n\n' + additions.join('\n\n');
    assert.ok(reader.includes('id="s' + id.slice(-2) + '-r01"'), 'New historical paragraph ' + id);
  }
  assert.equal(ch.matn, expected.matn, 'Narrative/source fidelity ' + id);
  assert.equal(ch.sharh, expected.sharh, 'Integrated commentary ' + id);
  const start = reader.indexOf('<article class="chapter" id="' + id + '"');
  const end = reader.indexOf('</article>', start);
  assert.ok(start >= 0 && end > start, 'Missing ' + id);
  const article = reader.slice(start, end);
  const matn = article.match(/<section class="matn"[^>]*>([\s\S]*?)<\/section>/);
  const sharh = article.match(/<div class="sharh-body">([\s\S]*?)<\/div>/);
  assert.ok(matn && sharh, 'Missing reading layer ' + id);
  assert.deepEqual(tokens(ch.matn, false), tokens(matn[1], true), 'Matn mismatch ' + id);
  assert.deepEqual(tokens(ch.sharh, false), tokens(sharh[1], true), 'Sharḥ mismatch ' + id);
  assert.ok(article.includes('id="s' + String(i + 1).padStart(2,'0') + '-v01"'), 'No added anchor ' + id);
  assert.ok(manuscript.includes(ch.matn) && manuscript.includes(ch.sharh), 'Manuscript mismatch ' + id);
}
assert.ok(data.chapters[0].sharh.includes('al-wahm al-kullī'));
assert.ok(data.chapters[12].sharh.includes('bukhari:709'));
assert.ok(data.chapters[43].sharh.includes('Privy Council'));
assert.ok(data.chapters[32].sharh.includes('takhalluq') || data.chapters[31].sharh.includes('Takhalluq'));
for (const figure of ['timeline','arabia','community','authority','law','spiritual','monsoon'])
  assert.ok(atlas.includes('id="figure-' + figure + '"'));
console.log('PASS Sīrah: 46 source/reader/manuscript pairs, 89 narrative and 51 explanatory paragraphs, context-index fidelity and distraction-free reading.');