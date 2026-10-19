#!/usr/bin/env node
/**
 * Reader focus modes, apparatus presentation and corpus-preservation checks.
 * Run: node daruri/qa/verify-focus-modes.js
 * Source checks only; visual mobile/browser testing remains separate.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8');
const iconFile=fs.readFileSync(path.resolve(__dirname,'..','..','assets','gnamma-reading-modes.svg'),'utf8');
const match=html.match(/<script id="editionData" type="application\/json">([\s\S]*?)<\/script>/);
assert(match,'No embedded edition data');
const data=JSON.parse(match[1]);
assert.equal(data.sections.length,259,'259 section identities must survive unchanged');
assert.equal(data.stats.passages,416,'416 aligned passages must be retained');
assert.equal(data.sections[258].id,'colophon','The final copyist note was lost');
const script=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
new vm.Script(script,{filename:'index.html'});
for(const id of ['gn-normal','gn-focus-1','gn-focus-2','gn-focus-3']){
 assert(iconFile.includes('id="'+id+'"'),'Missing '+id+' mode icon');
}
assert(html.includes('state.focusLevel=(prior+1)%4'),'Focus button must cycle through four states');
assert(html.includes("state.focusLevel===3"),'Continuous reading mode not wired');
assert(html.includes("for(const sec of all)"),'Continuous reader must traverse every section');
assert(html.includes("data-reading-section="),'Section boundaries not present for scroll tracking');
assert(html.includes("setActiveReadingSection(sec.dataset.readingSection,true)"),'Dock must track scrolling location');
assert(html.includes("document.getElementById('gn-continuous-'+id)?.scrollIntoView"),'Section picker must jump inside continuous reader');
assert(html.includes("gn-unified-notes"),'Unified notes popup missing');
assert(html.includes("gn-layer-note gn-unified-notes"),'Notes must use one enclosing card');
assert(html.includes('<ul class="gn-concepts-plain">'),'Accessible concept list missing');
assert(html.includes("gn-concept-link"),'Concept links removed');
assert(html.includes("body.focus-level-1 .reader .gn-reading-aftertext"),'Focus 1 apparatus missing');
assert(html.includes("body.focus-level-2 .reader .gn-reading-aftertext"),'Focus 2 apparatus rule missing');
assert(html.includes("body.focus-level-3 .reader .gn-reading-aftertext"),'Focus 3 apparatus rule missing');
assert(html.includes("#readerDock .reader-step{display:none!important}"),'Focus 3 dock arrows must be hidden');
assert(html.includes('data-gn-notes-open aria-haspopup="dialog"'), 'Notes trigger missing');
assert(html.includes('Notes (${critical.length}) <sup aria-hidden="true">↗</sup>'),'Keep Notes arrow');
assert(html.includes("data-open-jump"),'Central dock jump must remain');
assert(html.includes("readerPreviousNumber") && html.includes("readerNextNumber"),'Normal dock navigation must remain');
console.log('PASS: focus 0–3 structural checks, apparatus, continuous headings/dock, concepts, notes, corpus, inline JS syntax.');
