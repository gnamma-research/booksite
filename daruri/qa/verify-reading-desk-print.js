/* Reading Desk regression: print scope and toolbar.
   Run: node daruri/qa/verify-reading-desk-print.js
   Built-in Node only; visual/device QA is separate. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('reading-desk.js'),css=read('reading-desk.css');
const first=js.indexOf('function closePrintPreview(){');
const last=js.indexOf(' function detailsForPrint(r){',first);
assert(first>=0&&last>first,'Print preview functions must exist');
const scope=js.slice(first,last);
const records=[
 {id:'book-a',title:'Other passage',target:{kind:'section',section:'1'}},
 {id:'book-b',title:'Selected quotation',target:{kind:'quote',section:'217'}},
 {id:'book-c',title:'Study lesson',target:{kind:'lesson',lesson:'purpose'}}
];
const classes=new Set(),els=[];
const originalFocus={isConnected:true,focus(){this.focused=true}};
const document={
 activeElement:originalFocus,
 body:{
  classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)},
  append(node){els.push(node)}
 },
 createElement(tag){
  assert.equal(tag,'div');
  return {innerHTML:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},
    querySelector(){return {focus(){}}},
    remove(){this.removed=true}};
 }
};
const factorySource=
 'let printRoot=null,printFocus=null;\n'+
 "const ctx={notify:()=>{}},matching=()=>rows,titleOf=t=>t.kind,\n"+
 "subOf=t=>t.section||t.lesson,detailsForPrint=r=>'<p>Content '+r.id+'</p>',\n"+
 "canonicalURL=t=>'https://example.test/#section='+t.section,\n"+
 "esc=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');\n"+
 scope+"\nreturn {preparePrint,closePrintPreview,get:()=>printRoot};";
const build=new Function('document','rows',factorySource);
const reader=build(document,records);
reader.preparePrint([records[1]]);
const one=reader.get();
assert(one,'The item preview must be present');
assert.equal((one.innerHTML.match(/data-rd-print-id=/g)||[]).length,1);
assert(one.innerHTML.includes('data-rd-print-id="book-b"'));
assert(!one.innerHTML.includes('data-rd-print-id="book-a"'));
assert(!one.innerHTML.includes('data-rd-print-id="book-c"'));
assert(one.innerHTML.includes('1 selected entry'));
assert(one.innerHTML.includes('data-rd="print-now"'));
assert(classes.has('gn-rd-print'));
reader.closePrintPreview();
assert(!classes.has('gn-rd-print'));
assert.equal(reader.get(),null);
assert(originalFocus.focused,'Closing print preview should restore focus');
reader.preparePrint();
assert.equal((reader.get().innerHTML.match(/data-rd-print-id=/g)||[]).length,3);
assert(reader.get().innerHTML.includes('3 visible entries'));
assert(!scope.includes("addEventListener('afterprint'"),'No early afterprint cleanup');
assert(!scope.includes('setTimeout('),'Preview must remain until explicit close');
assert(js.includes("if(action==='print-now')")&&js.includes("if(action==='close-print')"),
 'Explicit Print and Close handlers must remain connected');
assert(css.includes('.gn-rd-toolbar-main,.gn-rd-toolbar-utilities{display:flex'),
 'Toolbar actions must be grouped');
assert(css.includes('.gn-rd-toolbar-utilities{margin-top:7px}'),
 'Narrow viewports must keep Print and Bin together');
assert(css.includes('html:root body.gn-rd-print > :not(#gn-rd-print-root){display:none!important}'));
assert(css.includes('html:root body.gn-rd-print #gn-rd-print-root .gn-rd-print-actions{display:none!important}'));
assert(js.includes('data-rd="print-list"')&&js.includes('class="gn-rd-bin"'));
console.log('PASS Reading Desk: single-item print, visible-items print, scope isolation, persistent preview, close/focus, and toolbar contract.');
