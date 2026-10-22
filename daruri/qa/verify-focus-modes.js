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
const data=require('./load-book.js')(html);
assert.equal(data.sections.length,259,'259 section identities must survive unchanged');
assert.equal(data.stats.passages,416,'416 aligned passages must be retained');
assert.equal(data.sections[258].id,'colophon','The final copyist note was lost');
const appScriptStart=html.indexOf("<script>\n(() => {\n'use strict';\nconst BOOK");
assert.ok(appScriptStart>=0,'Embedded Daruri reader script not found');
const appScriptEnd=html.indexOf('</script>',appScriptStart);
assert.ok(appScriptEnd>appScriptStart,'Embedded reader script has no end tag');
const script=html.slice(appScriptStart+'<script>'.length,appScriptEnd);
new vm.Script(script,{filename:'index.html'});
for(const id of ['gn-normal','gn-focus-1','gn-focus-2','gn-focus-3']){
 assert(iconFile.includes('id="'+id+'"'),'Missing '+id+' mode icon');
}
assert(!html.includes('state.focusLevel=(prior+1)%4'),'Obsolete four-mode cycle must be absent');
assert(html.includes('window.GnammaReaderModes={setMode:setReadingMode,currentMode}'),'Three-mode selector must control the actual reader');
assert(html.includes("focusApparatus?1:2"),'Existing Focus 1 after-text apparatus must remain selectable');
assert(html.includes("window.GnammaReadingDock?.attachModes"),'Mode selector must be attached to the dock runtime');
const dockJS=fs.readFileSync(path.resolve(__dirname,'..','reading-mode-controls.js'),'utf8');
const dockCSS=fs.readFileSync(path.resolve(__dirname,'..','reading-mode-controls.css'),'utf8');
new vm.Script(dockJS,{filename:'reading-mode-controls.js'});
for(const choice of ['reading','focus','continuous'])
 assert(dockJS.includes('data-gn-reader-mode="'+choice+'"'),'Missing '+choice+' menu choice');
assert(dockJS.includes("if(!count)continue"),'Zero-count personal marks must be absent');
assert(dockJS.includes("gn-dock-paragraph-ref") && dockJS.includes("place.segment+1"),'Live paragraph locator missing');
assert(dockJS.includes("paragraphBookmarks") && dockJS.includes("bookmarkUI.icon({kind:'paragraph',saved:true})"),'Composite paragraph mark missing from reading dock');
const desk=fs.readFileSync(path.resolve(__dirname,'..','reading-desk.js'),'utf8');
assert(desk.includes("bookmarkUI.icon({kind:'paragraph'})")&&desk.includes("paragraphSaved"),'Save-paragraph control must be a compact bookmark and pilcrow');
assert(fs.readFileSync(path.resolve(__dirname,'..','bookmark-ui.js'),'utf8').includes('M12 8v5.3M9.35 10.65h5.3'),'Shared bookmark plus motif missing');
assert(desk.includes('m11.6 16.9 5.3-5.3'),'Note-with-pen motif missing');
assert(dockJS.includes("getApparatus"),'The optional Focus apparatus setting must survive');
assert(dockCSS.includes('body.reader-enhanced .reader .chapter-nav{display:none!important}'),
 'Redundant enhanced in-text Previous/Next navigation not hidden');
assert(html.includes('reading-mode-controls.js?v=20261022-bookmark-audit1')&&
 html.includes('reading-mode-controls.css?v=20261022-bookmark-audit1'),'Reader missing mode assets');
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
assert(html.includes('data-gn-notes-open aria-haspopup="dialog">Notes (${critical.length})'), 'Keep accessible Notes popup trigger');
assert(html.includes("data-open-jump"),'Central dock jump must remain');
assert(html.includes("readerPreviousNumber") && html.includes("readerNextNumber"),'Normal dock navigation must remain');
console.log('PASS: Reading/Focus/Continuous selector, optional after-text apparatus, quiet dock and unchanged scholarly corpus.');
