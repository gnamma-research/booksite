/* Daruri six-stage study content and cache checks.
   Run: node daruri/qa/verify-study-checks.js
   Checks source parity and answer/reference structure; physical-device visual QA remains separate. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p), 'utf8');
const original = ['01-09','10-18','19-28'].flatMap(x =>
  JSON.parse(read('study/lessons-'+x+'.json')));
const checks = JSON.parse(read('study/foundation-checks.json')).topics;
const context = {window:{}};
vm.runInNewContext(read('study-guide-data.js'),context);
const compiled = context.window.DARURI_STUDY_DATA;
const html = read('index.html'), js = read('study-guide.js'), sw = read('sw.js');
assert.equal(compiled.version,'20261021-study-path1');
assert.equal(original.length,28);
assert.equal(checks.length,28);
assert.equal(compiled.lessons.length,28);
assert.equal((html.match(/class="sg-fallback-checks"/g)||[]).length,28);
assert.equal((html.match(/class="sg-fallback-level"/g)||[]).length,84);
assert.equal((html.match(/<strong>Answer: [ABCD] · /g)||[]).length,64);
for(let i=0;i<original.length;i++) {
  const l=original[i],c=compiled.lessons[i],bank=checks[i];
  assert.equal(l.id,c.id);
  assert.equal(l.id,bank.id);
  const stripped=JSON.parse(JSON.stringify(c));delete stripped.checks;
  assert.deepEqual(stripped,l,'Browser lesson matches authoritative source: '+l.id);
  assert.deepEqual(c.checks,bank.questions,'Compiled question bank matches authoritative source: '+l.id);
  assert.equal(bank.questions.length,l.id==='purpose'?10:2);
  const assigned=new Set(l.levels.basic.sections.map(String));
  const from=html.indexOf('id="study-'+l.id+'-basic"');
  const to=html.indexOf('id="study-'+l.id+'-intermediate"',from);
  assert.ok(from>=0&&to>from);
  const fallback=html.slice(from,to);
  assert.equal((fallback.match(/<strong>Answer: [ABCD] · /g)||[]).length,bank.questions.length);
  for(const n of assigned)assert.ok(fallback.includes('href="#section='+n+'"'),'Assigned fallback §'+n);
  for(const q of bank.questions) {
    assert.ok(q.question&&q.explanation);
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    assert.ok(q.sections.length>0);
    for(const n of q.sections)assert.ok(assigned.has(String(n)),'Unassigned check §'+n+'/'+l.id);
  }
  for(const level of ['basic','intermediate','advanced']) {
    assert.ok(l.levels[level].tasks.length>=2);
    assert.equal(l.levels[level].tasks.length,l.levels[level].feedback.length);
  }
}
for(const asset of ['study-guide.js','study-guide-data.js','study-guide.css']) {
  const route=asset+'?v=20261021-study-path1';
  assert.ok(html.includes(route),'HTML new version '+asset);
  assert.ok(sw.includes(route),'offline new version '+asset);
}
for(const name of ['study-guide.js','sw.js'])new vm.Script(read(name),{filename:name});
for(const needle of ['function quickChecks(', 'function pathway(', 'data-sg-grade','aria-current="step"'])
  assert.ok(js.includes(needle),'Interactive study module retains '+needle);
console.log('PASS: 28 topics · 64 source-linked checks · 84 levels · all source/fallback/data/cache references aligned.');
