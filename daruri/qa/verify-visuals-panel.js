#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'compact-menu.css'),'utf8');
const fonts=fs.readFileSync(path.join(root,'english-fonts.css'),'utf8');
const faces=fs.readFileSync(path.join(root,'fonts/english-font-faces.css'),'utf8');
const controls=fs.readFileSync(path.join(root,'visuals-controls.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'download-bundle.js'),'utf8');

const a=html.indexOf('<div class="overlay" hidden="" id="settingsOverlay"');
const b=html.indexOf('<div id="hiddenHeaderRecovery"',a);
assert(a>0&&b>a,'Visuals overlay bounds');
const panel=html.slice(a,b);

assert.match(panel,/id="settingsTitle">Visuals</);
assert.match(panel,/id="visualsInfo"/);
assert.equal((panel.match(/data-page-style-choice=/g)||[]).length,3);
assert.equal((panel.match(/data-arabic-font-choice=/g)||[]).length,3);
assert.equal((panel.match(/data-english-font-choice=/g)||[]).length,3);
assert.match(panel,/aria-label="Colour palette"/);
assert.match(panel,/aria-label="Page style"/);
assert.match(panel,/aria-label="Page layout"/);
assert.match(panel,/A−/);
assert.match(panel,/id="fontSizeLabel"[^>]*>100%/);
assert.match(panel,/A\+/);
assert.match(panel,/Source Sans 3/);
assert.match(panel,/Lexend/);
assert.doesNotMatch(panel,/>Type &amp; appearance</);
assert.doesNotMatch(panel,/<legend>Colours<\/legend>/);
assert.match(panel,/id="settingsTheme" hidden/);

for(const attr of ['data-page-style-choice','data-arabic-font-choice','data-english-font-choice']){
  const re=new RegExp('<button[^>]*'+attr+'[^>]*>','g');
  for(const match of panel.matchAll(re))assert.doesNotMatch(match[0],/\btitle=/,'Direct options do not expose hover tooltips');
}
for(const token of ['gn-visuals-panel','gn-font-amiri','gn-font-scheherazade','gn-font-noto','gn-font-source-sans','gn-font-lexend'])assert(css.includes(token),token);
assert.match(fonts,/Source Sans 3/);
assert.match(fonts,/Lexend/);
assert.doesNotMatch(fonts,/Source Serif 4|Literata/);
assert.match(faces,/source-sans-3-normal\.ttf/);
assert.match(faces,/source-sans-3-italic\.ttf/);
assert.match(faces,/lexend-normal\.ttf/);
new vm.Script(controls,{filename:'visuals-controls.js'});
new vm.Script(html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>')),{filename:'index.html'});

for(const asset of ['visuals-controls.js?v=20261020-visuals1','fonts/source-sans-3-normal.ttf','fonts/source-sans-3-italic.ttf','fonts/lexend-normal.ttf']){
  assert(sw.includes(asset),'service worker '+asset);
  const bundlePath=asset.split('?')[0];
  assert(bundle.includes(bundlePath),'offline package '+bundlePath);
}
assert.match(sw,/20261020-visuals1/);
assert.match(html,/english-fonts\.css\?v=20261020-fonts3/);
assert.match(html,/compact-menu\.css\?v=20261020-visuals1/);
assert.match(html,/visuals-controls\.js\?v=20261020-visuals1/);
assert.match(html,/sw\.js\?v=20261020-visuals1/);

console.log('PASS: icon-led Visuals panel, direct page/font/palette controls, fixed language markers, A−/percentage/A+, proper layout/palette icons, distinct English families, no visible duplicate theme row, syntax and offline assets.');
