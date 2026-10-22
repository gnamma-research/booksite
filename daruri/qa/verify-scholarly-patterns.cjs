/* Gnamma Scholarly Pattern Search browser tests.
 * Run node daruri/qa/verify-scholarly-patterns.cjs
 * Isolated browser, never reads or modifies the user's own private notes.
 */
const {chromium}=(()=>{try{return require('playwright')}catch{return require('/usr/local/lib/node_modules/playwright')}})();
const assert=require('node:assert/strict'),path=require('node:path'),http=require('node:http'),fs=require('node:fs');
const root=path.resolve(__dirname,'../..'),mimes={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.svg':'image/svg+xml','.webp':'image/webp'};
(async()=>{
 let server,base=process.env.BASE_URL;
 if(!base){
  server=http.createServer((req,res)=>{
   try{
    const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if(!f.startsWith(root+path.sep))throw Error('Unsafe path');
    const dest=fs.existsSync(f)&&fs.statSync(f).isDirectory()?path.join(f,'index.html'):f;
    res.setHeader('Content-Type',mimes[path.extname(dest)]||'application/octet-stream');
    fs.createReadStream(dest).on('error',()=>res.writeHead(404).end()).pipe(res);
   }catch{res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  base='http://127.0.0.1:'+server.address().port+'/daruri/';
 }
 const b=await chromium.launch({headless:true,args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1366,height:850}});p.setDefaultTimeout(8000);
 const errors=[],fails=[],passed=[];
 p.on('pageerror',e=>errors.push(e.message));
 const check=async(name,fn)=>{
  try{await fn();passed.push(name);console.log('PASS '+name);}
  catch(e){fails.push({name,error:e.message.slice(0,1200)});console.log('FAIL '+name+': '+e.message.slice(0,800));}
 };
 await p.goto(base+'#section=1',{waitUntil:'load',timeout:45000});
 await p.waitForFunction(()=>window.GnammaScholarly&&window.GnammaUnifiedSearch);
 const query=(s,config={})=>p.evaluate(([text,config])=>window.GnammaUnifiedSearch.query(text,{
   mode:'scholarly',booleanScope:'passage',orthography:'normalized',...config
  }),[s,config]);
 const parse=(s)=>p.evaluate(s=>window.GnammaScholarly.parse(s,window.GnammaUnifiedSearch.fold),s);
 const next=async()=>{if(!(await p.locator('.gns-dialog').count()))await p.locator('#searchBtn').click();
   if(!(await p.locator('.gns-expanded').count()))await p.locator('[data-gns-expand="1"]').first().click();
   if((await p.locator('#gns-mode').inputValue())!=='scholarly')await p.locator('#gns-mode').selectOption('scholarly');};
 const close=async()=>{if(await p.locator('.gns-dialog').count())await p.locator('.gns-dialog [data-gns-close]').click();};

 await check('Boolean AND, OR, NOT and parentheses have explicit meaning',async()=>{
  const [and,implicit,or,not,base,grouped]=await Promise.all([
   query('qiyas AND illa'),query('qiyas illa'),query('qiyas OR illa'),
   query('qiyas NOT taqlid'),query('qiyas'),query('qiyas AND (illa OR sabab)')
  ]);
  assert.ok(and.total>0&&grouped.total>=and.total);
  assert.equal(implicit.total,and.total);
  assert.ok(or.total>=base.total&&not.total<=base.total);
  assert.ok(grouped.plan.explain.includes('AND')&&grouped.plan.explain.includes('OR'));
 });
 await check('quoted phrase, bounded wildcard, question mark and letter class',async()=>{
  const phrase=await query('"legal reasoning"'),prefix=await query('اجته*');
  const any=await query('ق?اس'),whole=await query('قياس');
  assert.ok(phrase.total>0&&prefix.total>0&&any.total>0&&whole.total>0);
  assert.ok(prefix.results.some(x=>x.matched?.kind==='pattern'));
  const test=await parse('مس[ؤئ]ول');
  assert.equal(test.error,null);
 });
 await check('controlled fuzzy edit distance remains visible and bounded',async()=>{
  const one=await query('اجتهاد~1'),two=await query('اجتهاد~2');
  assert.ok(one.total>0&&two.total>=one.total);
  assert.ok(two.results.some(r=>['fuzzy','exact'].includes(r.matched?.kind)));
  const bad=await query('a~2');
  assert.match(bad.error,/4–24 letters/);
  assert.ok((await parse('qiyas~3')).error);
 });
 await check('literal letter-set matching handles both hamza spellings',async()=>{
  await p.evaluate(()=>{
   const now=Date.now();
   const data={format:'gnamma-reading-desk',version:1,items:[
    {id:'hamza-one',kind:'note',title:'Hamza variant 1',body:'مسؤول',target:{kind:'section',section:'1'},created:now,updated:now,deleted:0},
    {id:'hamza-two',kind:'note',title:'Hamza variant 2',body:'مسئول',target:{kind:'section',section:'1'},created:now,updated:now,deleted:0},
    {id:'mixed-fields',kind:'note',title:'qiyas',body:'illa',target:{kind:'section',section:'1'},created:now,updated:now,deleted:0}
   ]};
   localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(data));
  });
  const normal=await query('مس[ؤئ]ول',{facet:'personal'}),
   original=await query('مس[ؤئ]ول',{orthography:'original',facet:'personal'});
  for(const result of [normal,original]){
   const ids=result.results.map(x=>x.id);
   assert.ok(ids.includes('hamza-one')&&ids.includes('hamza-two'),JSON.stringify(ids));
  }
 });
 await check('separate title and note bodies cannot fabricate passage-level AND',async()=>{
  const result=await query('qiyas AND illa',{facet:'personal',booleanScope:'passage'});
  assert.ok(!result.results.some(x=>x.id==='mixed-fields'));
 });
 await check('Arabic and English cannot be combined into a fake one-field match',async()=>{
  const result=await query('ar:اجتهاد AND en:taqlid',{facet:'text'});
  assert.equal(result.total,0);
  const grammatical=await query('ar:اجتهاد AND ar:تقليد',{facet:'text'});
  assert.ok(grammatical.total>0);
 });
 await check('scope section/part/work groups evidence without falsely calling it a literal occurrence',async()=>{
  const passage=await query('qiyas AND illa',{booleanScope:'passage',facet:'text'});
  const section=await query('qiyas AND illa',{booleanScope:'section',facet:'text'});
  const part=await query('qiyas AND illa',{booleanScope:'part',facet:'text'});
  const work=await query('qiyas AND illa',{booleanScope:'work',facet:'text'});
  assert.ok(section.total>=passage.total&&passage.total>0);
  assert.ok(part.total>0&&work.total>0);
  assert.ok(section.results.some(r=>r.matched.locations.length>1));
  assert.ok(section.results.every(r=>r.matched.scope==='section'));
 });
 await check('scholarly near and Boolean with word-order limit',async()=>{
  const around=await query('ijtihad NEAR/5 taqlid');
  const ordered=await query('ijtihad BEFORE/5 taqlid');
  const unbounded=await query('ijtihad OR taqlid');
  assert.ok(around.total>0&&ordered.total<=around.total);
  assert.ok(unbounded.total>=around.total);
 });
 await check('malformed search syntax is a safe visible error, never JavaScript evaluation',async()=>{
  const cases=['NOT taqlid','qiyas AND','qiyas AND (illa OR','qiyas~3','qiyas*?*','(?=qiyas)','.*',
   '[abc','qiyas AND OR illa','(qiyas OR illa))','qiyas NEAR/99 illa','qiyas AND x~2','a'.repeat(400)];
  for(const input of cases){
   const result=await query(input);
   assert.ok(result.error,'Expected error for '+input);
   assert.equal(result.total,0,'Malformed search should have zero results');
  }
 });
 await check('one-word fuzzy results include match type and exact surface wording',async()=>{
  const r=await query('اجتهاد~1');
  assert.ok(r.results.some(x=>x.matched.evidence.some(e=>['exact','fuzzy'].includes(e.kind)&&e.term)));
  assert.match(r.results[0].matched.reason,/Scholarly pattern/);
 });
 await check('Scholarly mode exposes scope, orthography, pattern examples and readable explanation',async()=>{
  await next();await p.locator('#gns-query').fill('qiyas AND (illa OR sabab)');
  await p.waitForTimeout(250);
  assert.equal(await p.locator('#gns-mode').inputValue(),'scholarly');
  assert.ok(await p.locator('.gns-result').count()>0);
  assert.match(await p.locator('.gns-explanation').innerText(),/Your search means/);
  await p.locator('#gns-boolean-scope').selectOption('section');
  assert.equal(await p.locator('#gns-boolean-scope').inputValue(),'section');
  await p.locator('#gns-orthography').selectOption('original');
  assert.match(await p.locator('.gns-explanation').innerText(),/As encoded/);
  await p.locator('#gns-orthography').selectOption('normalized');
  await p.locator('#gns-boolean-scope').selectOption('passage');
 });
 await check('visual condition builder constructs and edits a fully executable Boolean expression',async()=>{
  await p.locator('.gns-builder > summary').click();
  await p.locator('[data-gns-builder-text="0"]').fill('qiyas');
  await p.locator('[data-gns-builder-text="1"]').fill('illa');
  assert.match(await p.locator('#gns-builder-preview').innerText(),/qiyas AND illa/);
  await p.locator('[data-gns-apply-builder]').click();
  assert.equal(await p.locator('#gns-query').inputValue(),'(qiyas AND illa)');
  const andCount=await p.locator('.gns-result').count();
  assert.ok(andCount>0);
  await p.locator('[data-gns-builder-join="1"]').selectOption('OR');
  await p.locator('[data-gns-apply-builder]').click();
  const orCount=await p.locator('.gns-result').count();
  assert.ok(orCount>=andCount);
  await p.locator('[data-gns-add-row]').click();
  await p.locator('[data-gns-builder-join="2"]').selectOption('AND NOT');
  await p.locator('[data-gns-builder-text="2"]').fill('taqlid');
  await p.locator('[data-gns-apply-builder]').click();
  assert.match(await p.locator('#gns-query').inputValue(),/AND NOT taqlid/);
  assert.ok(await p.locator('.gns-result').count()>0);
 });
 await check('builder can apply a word-pattern or fuzzy rule without exposing regex',async()=>{
  await p.locator('[data-gns-builder-kind="0"]').selectOption('prefix');
  await p.locator('[data-gns-builder-text="0"]').fill('اجته');
  await p.locator('[data-gns-remove-row="2"]').click();
  await p.locator('[data-gns-remove-row="1"]').click();
  await p.locator('[data-gns-apply-builder]').click();
  assert.equal(await p.locator('#gns-query').inputValue(),'اجته*');
  assert.ok(await p.locator('.gns-result').count()>0);
  await p.locator('[data-gns-builder-kind="0"]').selectOption('fuzzy1');
  await p.locator('[data-gns-builder-text="0"]').fill('اجتهاد');
  await p.locator('[data-gns-apply-builder]').click();
  assert.equal(await p.locator('#gns-query').inputValue(),'اجتهاد~1');
 });
 await check('saved complex searches persist locally and can be rerun',async()=>{
  await p.locator('.gns-saved > summary').click();
  await p.locator('#gns-save-name').fill('My scholarly search');
  await p.locator('[data-gns-save]').click();
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('gnamma-scholarly-saved-searches-v1')||'[]'));
  assert.ok(saved.some(s=>s.name==='My scholarly search'));
  await p.locator('#gns-query').fill('qiyas');
  await p.locator('[data-gns-load="0"]').click();
  assert.equal(await p.locator('#gns-query').inputValue(),'اجتهاد~1');
  await p.locator('[data-gns-delete="0"]').click();
  const cleared=await p.evaluate(()=>JSON.parse(localStorage.getItem('gnamma-scholarly-saved-searches-v1')||'[]'));
  assert.equal(cleared.length,0);
 });
 await check('search result returns to the exact Boolean expression and scope',async()=>{
  await p.locator('#gns-query').fill('qiyas AND (illa OR sabab)');
  await p.locator('#gns-boolean-scope').selectOption('section');
  await p.waitForTimeout(180);
  const selected=p.locator('.gns-result').filter({hasText:'Authorial text'}).first();
  assert.ok(await selected.count()>0);
  await selected.click();
  await p.locator('#gns-return-bar [data-gns-return]').waitFor();
  await p.locator('#gns-return-bar [data-gns-return]').click();
  await p.locator('#gns-query').waitFor({state:'visible'});
  assert.equal(await p.locator('#gns-query').inputValue(),'qiyas AND (illa OR sabab)');
  assert.equal(await p.locator('#gns-boolean-scope').inputValue(),'section');
  assert.match(await p.locator('.gns-explanation').innerText(),/Your search means/);
  await close();
 });
 await check('public al-Mustasfa Arabic evidence works under library scope',async()=>{
  await next();await p.locator('#gns-query').fill('اجتهاد OR تقليد');
  await p.locator('#gns-scope').selectOption('library');
  await p.waitForFunction(()=>window.GnammaUnifiedSearch.getEntries().other>3000,{timeout:20000});
  const data=await query('اجتهاد OR تقليد',{scope:'library'});
  assert.ok(data.results.some(r=>r.work==='mustasfa'));
  await close();
 });
 await check('broader section matches expose clickable supporting passage locations',async()=>{
  await next();
  await p.locator('#gns-query').fill('qiyas AND (illa OR sabab)');
  await p.locator('#gns-boolean-scope').selectOption('section');
  await p.waitForTimeout(150);
  const grouped=p.locator('.gns-group-result').first();
  assert.ok(await grouped.count()>0,'Expected multiple evidence locations');
  const links=grouped.locator('[data-gns-evidence-result]');
  assert.ok(await links.count()>1,'Individual evidence links were not displayed');
  const label=await links.nth(1).innerText();
  assert.match(label,/§\d+/);
  await links.nth(1).click();
  await p.locator('#gns-return-bar [data-gns-return]').waitFor({state:'visible'});
  await p.locator('#gns-return-bar [data-gns-return]').click();
  assert.equal(await p.locator('#gns-query').inputValue(),'qiyas AND (illa OR sabab)');
  assert.equal(await p.locator('#gns-boolean-scope').inputValue(),'section');
  await close();
 });
 await check('as-encoded spelling distinguishes written vowel marks',async()=>{
  await p.evaluate(()=>{
   const now=Date.now(),data={format:'gnamma-reading-desk',version:1,items:[
    {id:'written-diacritics',kind:'note',title:'Written vowel marks',
     body:'القِيَاس دليل',target:{kind:'section',section:'1'},created:now,updated:now,deleted:0}
   ]};
   localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(data));
  });
  const folded=await query('القياس',{orthography:'normalized',facet:'personal'});
  const written=await query('القياس',{orthography:'original',facet:'personal'});
  assert.ok(folded.results.some(r=>r.id==='written-diacritics'));
  assert.ok(!written.results.some(r=>r.id==='written-diacritics'));
 });
 await check('builder rejects unsafe syntax without quietly losing a condition',async()=>{
  await next();
  const builder=p.locator('.gns-builder');
  if(!(await builder.evaluate(el=>el.open)))await builder.locator('summary').click();
  await p.locator('[data-gns-builder-kind="0"]').selectOption('word');
  await p.locator('[data-gns-builder-text="0"]').fill('qiyas|illa');
  await p.locator('[data-gns-apply-builder]').click();
  assert.match(await p.locator('.gns-builder-error').innerText(),/operators/i);
  assert.notEqual(await p.locator('#gns-query').inputValue(),'qiyas|illa');
  await p.locator('[data-gns-builder-text="0"]').fill('qiyas');
  await p.locator('[data-gns-apply-builder]').click();
  assert.equal(await p.locator('#gns-query').inputValue(),'qiyas');
  await close();
 });
 await check('malformed pattern is explained rather than silently returning nothing',async()=>{
  await next();await p.locator('#gns-query').fill('qiyas AND (');
  await p.waitForTimeout(150);
  assert.match(await p.locator('.gns-explanation').innerText(),/Check query/i);
  await close();
 });
 await check('no unhandled JavaScript exceptions from scholarly search',async()=>{
  assert.deepEqual(errors,[]);
 });
 const small=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await small.goto(base,{waitUntil:'load',timeout:45000});
 await check('390px mobile scholarly controls, builder and results do not overflow',async()=>{
  await small.locator('#searchBtn').click();
  await small.locator('[data-gns-expand="1"]').first().click();
  await small.locator('#gns-mode').selectOption('scholarly');
  await small.locator('#gns-query').fill('qiyas AND illa');
  await small.waitForTimeout(180);
  const measurements=await small.evaluate(()=>({
   viewport:innerWidth,document:document.documentElement.scrollWidth,
   dialog:document.querySelector('.gns-dialog').getBoundingClientRect().toJSON(),
   panel:document.querySelector('.gns-scholarly')?.getBoundingClientRect().toJSON()
  }));
  assert.ok(measurements.document<=measurements.viewport+1,JSON.stringify(measurements));
  assert.ok(measurements.panel&&measurements.panel.right<=measurements.viewport+1);
  await small.locator('.gns-builder > summary').click();
  assert.ok(await small.locator('[data-gns-builder-text="0"]').isVisible());
 });
 const narrow=await b.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 await narrow.goto(base,{waitUntil:'load',timeout:45000});
 await check('320px scholarly builder is usable without document horizontal overflow',async()=>{
  await narrow.locator('#searchBtn').click();
  await narrow.locator('[data-gns-expand="1"]').first().click();
  await narrow.locator('#gns-mode').selectOption('scholarly');
  await narrow.locator('.gns-builder > summary').click();
  await narrow.locator('[data-gns-builder-text="0"]').fill('qiyas');
  await narrow.locator('[data-gns-builder-text="1"]').fill('illa');
  const box=await narrow.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,
    builder:document.querySelector('.gns-builder')?.getBoundingClientRect().toJSON()}));
  assert.ok(box.width<=box.viewport+1,JSON.stringify(box));
  assert.ok(box.builder?.right<=box.viewport+1,JSON.stringify(box));
 });
 await narrow.close();
 await small.close();
 await b.close();if(server)await new Promise(r=>server.close(r));
 console.log(JSON.stringify({passed:passed.length,failed:fails.length,failures:fails},null,2));
 if(fails.length)process.exit(1);
})().catch(e=>{console.error('FATAL',e.stack);process.exit(1)});
