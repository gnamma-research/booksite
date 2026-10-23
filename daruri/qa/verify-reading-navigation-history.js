#!/usr/bin/env node
'use strict';
/* Reading-history data safety, navigation contracts and integration checks. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'reading-navigation-history.js'),'utf8');
const bridge=fs.readFileSync(path.join(root,'reading-navigation-bridge.js'),'utf8');
const css=fs.readFileSync(path.join(root,'reading-navigation-history.css'),'utf8');
const desk=fs.readFileSync(path.join(root,'reading-desk.js'),'utf8');
const transfer=fs.readFileSync(path.join(root,'backup-transfer.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'download-bundle.js'),'utf8');
for(const [name,code]of [['history',source],['bridge',bridge],['desk',desk],['service-worker',sw],['download-bundle',bundle]])new vm.Script(code,{filename:name});
const start=html.indexOf("<script>\n(() => {\n'use strict';\nconst BOOK");
assert.ok(start>=0);
const end=html.indexOf('</script>',start);
assert.ok(end>start);
new vm.Script(html.slice(start+8,end),{filename:'reader-inline.js'});
function store(initial){
 let raw=initial||null;
 return {getItem:()=>raw,setItem:(_k,value)=>{raw=value;},raw:()=>raw};
}
const context={};vm.createContext(context);vm.runInContext(source,context);
const factory=context.GnammaNavigationHistory.create;
const valid=id=>['115','121','138','210','215','colophon'].includes(id);
let checks=0;
function test(label,fn){try{fn();checks++;}catch(err){err.message=label+': '+err.message;throw err;}}
const A={section:'115',y:910,anchor:{segment:'2',top:127}};
const B={section:'121',y:0},C={section:'138',y:0},D={section:'210',y:0};
test('explicit jumps save precise source and Back / Forward',()=>{
 const mem=store(),m=factory({storage:mem,validSection:valid,now:()=>1700000000000});
 assert.equal(m.record(A,B),true);
 assert.equal(m.record({section:'121',y:344,anchor:{segment:'0',top:87}},C),true);
 assert.equal(m.record({section:'138',y:610,anchor:{segment:'1',top:101}},D),true);
 assert.equal(m.status().length,4);
 let p=m.back({section:'210',y:800,anchor:{segment:'3',top:60}});
 assert.equal(p.section,'138');assert.equal(p.anchor.segment,'1');assert.equal(p.y,610);
 p=m.back({section:'138',y:620,anchor:{segment:'1',top:90}});
 assert.equal(p.section,'121');assert.equal(p.anchor.segment,'0');
 p=m.back({section:'121',y:390,anchor:{segment:'0',top:88}});
 assert.equal(p.section,'115');assert.equal(p.anchor.segment,'2');assert.equal(p.y,910);
 p=m.forward(A);assert.equal(p.section,'121');
 p=m.forward({section:'121',y:490,anchor:{segment:'0',top:86}});assert.equal(p.section,'138');
 assert.ok(mem.raw().includes('"cursor":2'),'persisted cursor missing');
});
test('new branch after Back discards forward but keeps past',()=>{
 const m=factory({storage:store(),validSection:valid});
 m.record(A,B);m.record(B,C);m.record(C,D);
 assert.equal(m.back(D).section,'138');
 assert.equal(m.back(C).section,'121');
 m.record({section:'121',y:402,anchor:{segment:'0',top:10}},{section:'215',y:0});
 assert.equal(m.next(),null);assert.equal(m.status().length,3);
});
test('portable JSON imports into RECENT only without moving device',()=>{
 const first=factory({storage:store(),validSection:valid});first.record(A,B);first.record(B,C);const backup=first.exportData();
 const other=factory({storage:store(),validSection:valid});other.record(D,{section:'215',y:0});
 const cursor=other.status().cursor,current=other.current().section;
 const added=other.importData(backup);
 assert.ok(added>=2);assert.equal(other.status().cursor,cursor);assert.equal(other.current().section,current);
 assert.ok(other.recentList().some(x=>x.section==='115'&&x.anchor.segment==='2'));
 assert.equal(other.importData(backup),0,'Repeated import must deduplicate');
 assert.equal(other.importData({format:'wrong',version:1,book:'daruri',entries:[],recent:[]}),0);
});
test('recent selections start navigable chains and remain exportable',()=>{
 const m=factory({storage:store(),validSection:valid});m.record(A,B);
 const i=m.recentList().findIndex(p=>p.section==='115');
 const hit=m.recentVisit(i,{section:'121',y:450,anchor:{segment:'0',top:95}});
 assert.equal(hit.section,'115');
 assert.equal(m.previous().section,'121');
 assert.ok(m.exportData().entries.length>=3);
});
test('unknown sections, corrupted files and storage errors fail safe',()=>{
 const bad=store('{not JSON');
 const m=factory({storage:bad,validSection:valid});
 assert.equal(m.status().malformed,true);
 m.record(A,B);assert.equal(bad.raw(),'{not JSON','Must not overwrite unreadable original history');
 const n=factory({storage:store(),validSection:valid});
 assert.equal(n.record(A,{section:'../../../evil',y:3}),false);
 assert.equal(n.importData({format:'gnamma-reading-navigation',version:1,book:'another',entries:[],recent:[]}),0);
 const broken={getItem:()=>null,setItem:()=>{throw Error('storage full');}};
 assert.doesNotThrow(()=>factory({storage:broken,validSection:valid}).record(A,B));
});
test('bounded history and privacy controls',()=>{
 const mem=store();
 const m=factory({storage:mem,validSection:id=>/^[0-9]+$/.test(id)});
 for(let i=1;i<80;i++)m.record({section:String(i),y:i*10},{section:String(i+1),y:0});
 assert.ok(m.status().length<=50);
 assert.ok(m.recentList().length<=90);
 m.clear();
 assert.equal(m.status().length,0);assert.equal(m.recentList().length,0);
});
test('picker is searchable, recent history is collapsible and dock layout remains unchanged',()=>{
 for(const id of ['jumpSearch','jumpParts','jumpResults','jumpHistoryControls','jumpRecent','jumpRecentList','readerDock','dockTitle','openJump'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes("$('#jumpSearch').addEventListener('input',renderJumpList)"));
 assert.ok(html.includes('function renderJumpList()'));
 assert.ok(html.includes('data-history-nav="back"')&&html.includes('data-history-nav="forward"'));
 assert.ok(bridge.includes('root.GnammaReadingHistory=api'));
 assert.ok(css.includes('position:fixed')&&css.includes('body.focus-mode .gn-history-float'));
 assert.ok(!html.includes('Open section picker</text>'),'Dock should not be given a new visible text line');
 assert.ok(html.includes('const readingHistory=window.GnammaNavigationBridge?.install'));
});
test('home remains the source/method page, Help is a distinct accessible route',()=>{
 assert.ok(html.includes('id="homeEditorialSources"'));
 assert.ok(html.includes("case'help':renderHelp()"));
 assert.ok(html.includes('function renderHelp(){'));
 assert.ok(html.includes('data-route="help"'));
 assert.ok(html.includes('id="help"'));
 assert.ok(!html.includes('<button class="text-btn" data-route="about"'),'No redundant About entry in footer');
});
test('JSON personal backup carries navigation, never as Desk items or auto-sync',()=>{
 assert.ok(desk.includes('readingNavigation:navigation'));
 assert.ok(desk.includes('window.GnammaReadingHistory?.importData?.(parsed.readingNavigation)'));
 assert.ok(desk.includes('current reading place unchanged'));
 assert.ok(transfer.includes('data-transfer-choice="history"'), 'Selective backup restore must include recent history choice');
 assert.ok(bridge.includes('root.GnammaReadingHistory=api'));
 assert.ok(!source.includes('fetch('),'No remote sync');
 assert.ok(sw.includes('reading-navigation-history.js')&&sw.includes('reading-navigation-bridge.js'));
 for(const name of ['reading-navigation-history.js','reading-navigation-bridge.js','reading-navigation-history.css'])assert.ok(bundle.includes('"'+name+'"'),name+' missing offline');
});
console.log('PASS: '+checks+' portable reading-history groups; exact Back/Forward, bounded trail, safe imports, existing picker/dock, Help and offline integration');
