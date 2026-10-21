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
assert.match(html,/compact-menu\.css\?v=20261021-visualswidth2/);
assert.match(html,/visuals-controls\.js\?v=20261020-visuals1/);
assert.match(html,/sw\.js\?v=20261021-visualswidth2/);

console.log('PASS: icon-led Visuals panel, direct page/font/palette controls, fixed language markers, A−/percentage/A+, proper layout/palette icons, distinct English families, no visible duplicate theme row, syntax and offline assets.');

assert(css.includes('grid-template-columns: repeat(3, minmax(0, 1fr)) !important'),'Size controls fill three equal columns');
assert(css.includes('touch-action: manipulation !important'),'Visuals controls suppress double-tap zoom without disabling pinch');
assert(css.includes('#readingControls:not([hidden]) .gn-reader-global-leading #menuBtn'),'Contents opener has dedicated touch area');
assert(css.includes('width: 44px !important')&&css.includes('height: 44px !important'),'Contents opener receives 44px touch target');
assert(html.includes('download-bundle.js?v=20261021-visualswidth2'),'Package version updated');
assert(sw.includes('compact-menu.css?v=20261021-visualswidth2'),'Offline CSS uses the same version');
assert(sw.includes('download-bundle.js?v=20261021-visualswidth2'),'Offline package uses the same version');
assert(bundle.includes('compact-menu.css?v=20261021-visualswidth2'),'ZIP uses updated Visuals CSS');
console.log('PASS: fixed-width Safari tap targets, equal size cells and coherent cache/offline versions');


// The four enhanced layout buttons use bounded, font-independent Arabic glyphs
// rather than raw Amiri letters that straddled the divider on iOS.
const glyphTags=[...panel.matchAll(/<svg class="gn-layout-arabic-icon" viewBox="([^"]+)"[^>]*>/g)];
assert.equal(glyphTags.length,4,'All four side/stack diagrams have bounded Arabic glyphs');
for(const tag of glyphTags)assert.equal(tag[1],'6.2 8.1 11.6 14.5');
assert(!panel.includes('<bdi lang="ar" dir="rtl">ع</bdi>'),'Enhanced layout buttons no longer use baseline-dependent text glyphs');
for(const id of ['settingsParallelSide','settingsStackedOrder']){
 const re=new RegExp('id="'+id+'"[\\s\\S]*?</div>');
 assert(re.test(panel),'Retain both responsive reading orders: '+id);
}
assert(css.includes('width: min(460px, calc(100vw - 44px)) !important;'),'Slightly narrower default panel');
assert(css.includes('width: calc(100vw - 32px) !important;'),'Small phones retain useful width');
assert(css.includes('.gn-visuals-panel .gn-layout-glyph.gn-layout-stack'),'Stacked glyphs use dedicated geometry');
assert(css.includes('.gn-visuals-panel .gn-layout-arabic-icon'),'Arabic outline uses a fixed, centered box');
assert(css.includes('height: 16px !important;'),'Arabic glyph keeps fixed height');
assert(css.includes('height: 48px !important;'),'Existing 48px touch-target fix is preserved');
assert(css.includes('touch-action: manipulation !important'),'Existing mobile double-tap mitigation is preserved');
assert(sw.includes('daruri-reader-20261021-readingdesk2-visualscompact1'),'Reading Desk cache retained');
assert(bundle.includes("['daruri/reading-desk.js'"),'Reading Desk survives the bundle change');
assert(bundle.includes('sw.js?v=20261021-visualswidth2'),'Offline bundle contains current service worker');
console.log('PASS: narrower Visuals frame, centered font-independent Arabic order glyphs, preserved 48px tap targets and current Reading Desk cache.');

assert(css.includes('height: 36px !important;'),'Stack diagrams fit a 48px touch target');
assert(css.includes('padding-block: 4px !important;'),'Selected layout touch target keeps 48px total height');


// Compact Visuals spacing retains button geometry and the iOS touch fix.
assert(css.includes('Compact Visuals spacing:'));
assert(css.includes('padding: 14px 16px !important'));
assert(css.includes('padding-block: 5px !important'));
assert(css.includes('padding-bottom: 8px !important'));
assert(css.includes('padding-inline: 11px !important'));
assert(css.includes('height: 48px !important;'),'48px tap targets remain');
assert(css.includes('touch-action: manipulation !important'),'Safari touch handling remains');
assert(css.includes('width: min(460px, calc(100vw - 44px)) !important;'),'Modest modal width remains');
assert(sw.includes('daruri-reader-20261021-readingdesk2-visualscompact1'),'Updated offline cache');
console.log('PASS: reduced Visuals whitespace while retaining font samples, 48px targets, iOS tap handling and Reading Desk');

// Narrow-window regression: the final CSS override, rather than its earlier
// baseline rule, governs the actual Visuals width.
assert(css.includes('VISUALS RESPONSIVE WIDTH 20261021-visualswidth2'));
assert(css.includes('width: min(390px, max(286px, calc(100vw - 88px))) !important;'));
assert(css.includes('max-width: calc(100vw - 24px) !important;'));
assert(css.includes('grid-template-columns: 42px minmax(0, 1fr) !important;'));
for(const viewport of [360,375,390,393,430,450,500,768]){
 const before=viewport<=360?viewport-32:Math.min(460,viewport-44);
 const after=Math.min(390,Math.max(286,viewport-88),viewport-24);
 const decrease=(before-after)/before;
 assert(decrease>=.10, 'Visuals width decreases by at least 10% at '+viewport);
 assert(after>=286 && after<=viewport-24, 'Safe width at '+viewport);
 const padding=viewport<=380?22:32;
 const fontChoice=(after-padding-42-7-14)/3;
 assert(fontChoice>=60, 'Arabic/English specimens retain usable width at '+viewport);
}
assert(css.includes('height: 48px !important;'),'48px font/size controls retained');
assert(css.includes('touch-action: manipulation !important'),'Safari double-tap mitigation retained');
assert(css.includes('.gn-layout-arabic-icon'),'Fixed Arabic letter alignment retained');
assert(sw.includes('daruri-reader-20261021-readingdesk2-visualswidth2'),'Newest Reading Desk cache retained');
console.log('PASS: approximately 10–15% narrower Visuals panel across phone/desktop sizes, safe small-screen floor, 48px taps and aligned Arabic layout icon.');
