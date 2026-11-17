const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(process.env.BAHR_DIR||path.join(__dirname,'../site'));
require(path.join(root,'core.js'));
const {compileQuery,validateDesk,mergeDesk}=global.BahrCore;
test('English and Arabic search, Boolean precedence, phrases and proximity',()=>{
 assert(compileQuery('"divine mercy" AND NOT anger').test('Divine mercy embraces all things.'));
 assert(!compileQuery('"divine mercy" AND NOT anger').test('Divine mercy and anger'));
 assert(compileQuery('(mercy OR knowledge) AND light').test('Knowledge is a light.'));
 assert(!compileQuery('"divine mercy"').test('Divine and abundant mercy'));
 assert(compileQuery('علم').test('العَلَم عِلْمٌ'));
 assert(compileQuery('mercy NEAR/2 light').test('mercy is a light'));
 assert(!compileQuery('mercy NEAR/1 light').test('mercy is a light'));
 for(const q of ['','a AND','(a OR b','"unfinished','a NEAR/101 b'])assert.throws(()=>compileQuery(q));
});
test('Backup imports preserve two different edits made at the same time',()=>{
 const a={id:'note1',type:'note',r:'preface',anchor:'unit-preface',lang:'en',quote:'',note:'Original',createdAt:'2026-10-27T00:00:00Z',updatedAt:'2026-10-30T00:00:00Z',archived:false};
 const b={...a,note:'First edit'},c={...a,note:'Second edit'};
 const merged=mergeDesk([a],[b,c]);
 assert.equal(merged.items.length,3);assert.equal(merged.conflicts,2);
 assert.equal(new Set(merged.items.map(x=>x.id)).size,3);
 assert.equal(mergeDesk(merged.items,[b,c]).added,0);
 assert(merged.items.every(x=>x.createdAt===a.createdAt));
 assert.throws(()=>validateDesk({format:'gnamma-reading-desk',version:1,work:'another-book',items:[a]}));
 assert.deepEqual(validateDesk({format:'gnamma-reading-desk',version:1,work:'ibn-ajiba-bahr-vol1',items:[a]}),[a]);
});

test('Saved source identity survives export, restore and conflicting edits',()=>{
 const item={id:'source1',type:'bookmark',r:'preface',anchor:'unit-preface',lang:'en',quote:'',note:'',createdAt:'2026-10-27T00:00:00Z',updatedAt:'2026-10-30T00:00:00Z',archived:false,reference:{kind:'dictionary',id:'lex-001',title:'adāʾ · أداء'}};
 const envelope={format:'gnamma-reading-desk',version:1,work:'ibn-ajiba-bahr-vol1',items:[item]};
 const imported=validateDesk(JSON.parse(JSON.stringify(envelope)));
 assert.deepEqual(imported,[item]);
 assert.equal(mergeDesk([item],imported).added,0);
 const changed={...item,reference:{...item.reference,id:'lex-002'}};
 const merged=mergeDesk([item],[changed]);
 assert.equal(merged.conflicts,1);assert.equal(merged.items.length,2);
 assert.deepEqual(merged.items.map(x=>x.reference.id),['lex-001','lex-002']);
 assert.throws(()=>validateDesk({...envelope,items:[{...item,reference:{kind:'script',id:'unsafe'}}]}));
});
