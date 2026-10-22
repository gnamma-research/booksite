'use strict';
/* Personal-note icon and independent PDF personal-item filters. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const iconJs=read('bookmark-ui.js'),desk=read('reading-desk.js'),dict=read('reading-desk-dictionary.js'),
  selector=read('editions-selector.js'),exporter=read('personal-export.js'),html=read('personal-export.html');
const sandbox={window:{}};vm.runInNewContext(iconJs,sandbox);
const glyph=sandbox.window.GnammaBookmarkUI.noteIcon();
assert(glyph.includes('gn-personal-note-icon')&&glyph.includes('<rect')&&glyph.includes('<path'));
assert(desk.includes('note:bookmarkUI.noteIcon()'),'Reader must consume the shared note icon');
assert(desk.includes('RD_ICON.note')&&dict.includes('UI.noteIcon()'),'Every add-note control uses shared glyph');
assert(selector.includes("icon('note')")&&selector.includes('id="pe-highlights"'));
assert(selector.includes("icon('highlight')")&&selector.includes("icon('bookmark')"));
assert(html.includes('id="pe-highlights"')&&html.includes('data-gn-personal-glyph="note"'));
assert(exporter.includes("prefs.highlights===undefined?prefs.bookmarks"),'Legacy export callers remain compatible');
const env={window:{},document:{readyState:'loading',addEventListener(){}},location:{href:'https://example.org/'},
  URL,Intl,Date,Math,Number,String,JSON,Array,RegExp,Map,Set};
vm.runInNewContext(exporter,env);
const m=env.window.GnammaPersonalExportModel;
assert(m,'Personal export model must be exposed for testing');
const rows=[{kind:'note',body:'My note'},{kind:'paragraph',target:{kind:'paragraph',section:'1',segment:0}},
  {kind:'quote',target:{kind:'quote',section:'1',quote:'Marked words'}}];
assert.deepEqual(Array.from(m.available(rows,{personal:true,bookmarks:false,highlights:false}),x=>x.kind),['note']);
assert.deepEqual(Array.from(m.available(rows,{personal:false,bookmarks:true,highlights:false}),x=>x.kind),['paragraph']);
assert.deepEqual(Array.from(m.available(rows,{personal:false,bookmarks:false,highlights:true}),x=>x.kind),['quote']);
assert.deepEqual(Array.from(m.available(rows,{personal:true,bookmarks:true,highlights:true}),x=>x.kind),['note','paragraph','quote']);
assert.deepEqual(Array.from(m.available(rows,{personal:false,bookmarks:true}),x=>x.kind),['paragraph','quote']);
console.log('PASS shared personal-note icon and independent notes/bookmarks/highlights export');
