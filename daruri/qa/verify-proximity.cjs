/* Proximity and plain-romanization QA. No external services or real user data. */
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),http=require('node:http');
const {chromium}=(()=>{try{return require('playwright')}catch{return require('/usr/local/lib/node_modules/playwright')}})();
const root=path.resolve(__dirname,'../..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
(async()=>{
 let server,base=process.env.BASE_URL;
 if(!base){
  server=http.createServer((req,res)=>{
   try{
    const pathname=decodeURIComponent(new URL(req.url,'http://local.test').pathname);
    const file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep))throw Error('unsafe path');
    const f=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
    res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');
    fs.createReadStream(f).on('error',()=>{res.writeHead(404).end()}).pipe(res);
   }catch{res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  base='http://127.0.0.1:'+server.address().port+'/daruri/';
 }
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:820}});
 page.setDefaultTimeout(8000);
 const errors=[],failed=[],passed=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'load',timeout:45000});
 await page.waitForFunction(()=>window.GnammaUnifiedSearch&&window.GnammaProximity);
 async function test(name,fn){
  try{await fn();passed.push(name);console.log('PASS '+name);}
  catch(e){failed.push({name,error:e.message.slice(0,800)});console.log('FAIL '+name+': '+e.message.slice(0,700));}
 }
 await test('plain spellings match academically transliterated concepts',async()=>{
  const data=await page.evaluate(()=>{
   const names=['ijtihad','ijtehad','ijtehaad','ijtahad','ijtihaad','qiyas','qeyas','kiyas','qiyaas',
    'al-qiyas','al qiyas','ijma','ijmaa','ejma','usul','usool','osool','hadeeth','hadees','hadith',
    'maslaha','maslahah','sharia','shariah','taqlid','takleed','tawatur','tawaatur'];
   return Object.fromEntries(names.map(q=>[q,window.GnammaUnifiedSearch.query(q,{mode:'terms'}).total]));
  });
  for(const [variant,canonical] of [['ijtehad','ijtihad'],['ijtehaad','ijtihad'],['qeyas','qiyas'],['al-qiyas','qiyas'],['al qiyas','qiyas'],
    ['ijmaa','ijma'],['ejma','ijma'],['usool','usul'],['osool','usul'],['hadees','hadith'],['shariah','sharia'],['takleed','taqlid'],['tawaatur','tawatur']]){
   assert.ok(data[canonical]>0,canonical+' returned zero');
   assert.equal(data[variant],data[canonical],variant+' should match '+canonical);
  }
 });
 await test('positional engine counts actual intervening words',async()=>{
  const d=await page.evaluate(()=>{
   const p=window.GnammaProximity,f=window.GnammaUnifiedSearch.fold;
   const near=(text,a,b,gap,ordered=false)=>p.find(text,[a],[b],{normalize:f,maxGap:gap,ordered});
   return {
    adjacent:near('qiyas illa','qiyas','illa',0),
    twoWords:near('qiyas the effective illa','qiyas','illa',2),
    tooShort:near('qiyas the effective illa','qiyas','illa',1),
    reversed:near('illa determines qiyas','qiyas','illa',1),
    reversedOrdered:near('illa determines qiyas','qiyas','illa',1,true),
    inOrder:near('qiyas determines illa','qiyas','illa',1,true),
    arabic:near('والقياس هو في تحقيق العلة','قياس','علة',3),
    arabicShort:near('والقياس هو في تحقيق العلة','قياس','علة',2),
    duplicate:near('qiyas qiyas illa','qiyas','illa',0)
   };
  });
  assert.equal(d.adjacent.gap,0);assert.equal(d.twoWords.gap,2);
  assert.equal(d.tooShort,null);assert.equal(d.reversed.gap,1);
  assert.equal(d.reversedOrdered,null);assert.equal(d.inOrder.gap,1);
  assert.equal(d.arabic.gap,3);assert.equal(d.arabicShort,null);
  assert.equal(d.duplicate.gap,0);
 });
 await test('intervening-word limit is monotonic and never crosses separate authorial passages',async()=>{
  const s=await page.evaluate(()=>{
   const query=(gap,ordered=false)=>window.GnammaUnifiedSearch.query('ijtihad',{
    mode:'proximity',nearTerm:'taqlid',nearGap:gap,nearOrdered:ordered});
   const low=query(0),mid=query(5),wide=query(20),ordered=query(20,true);
   const none=window.GnammaUnifiedSearch.query('qiyas',{mode:'proximity',nearTerm:'illa',nearGap:5});
   const larger=window.GnammaUnifiedSearch.query('qiyas',{mode:'proximity',nearTerm:'illa',nearGap:20});
   return {low:low.total,mid:mid.total,wide:wide.total,ordered:ordered.total,
    none:none.total,larger:larger.total,
    matches:wide.results.filter(r=>r.type==='text').map(r=>({id:r.id,subtype:r.subtype,
       field:r.matched?.field,gap:r.matched?.gap,raw:r.matched?.raw}))};
  });
  assert.ok(s.low<=s.mid&&s.mid<=s.wide);
  assert.ok(s.ordered<=s.wide);
  assert.ok(s.mid>=2,'Expected §§230/248 nearby passages');
  assert.ok(s.none<=s.larger&&s.larger>=2);
  assert.ok(s.matches.every(x=>x.subtype==='Authorial text'&&['ar','en'].includes(x.field)));
  assert.ok(s.matches.every(x=>x.gap<=20));
 });
 await test('readable inline NEAR and BEFORE operators work',async()=>{
  const d=await page.evaluate(()=>{
   const s=window.GnammaUnifiedSearch;
   return {
    equivalent:s.query('ijtihad NEAR/5 taqlid',{mode:'terms'}).total,
    guided:s.query('ijtihad',{mode:'proximity',nearTerm:'taqlid',nearGap:5}).total,
    ordered:s.query('ijtihad BEFORE/5 taqlid',{mode:'terms'}).total,
    broad:s.query('ijtihad NEAR/50 taqlid',{mode:'terms'}).total
   };
  });
  assert.equal(d.equivalent,d.guided);
  assert.ok(d.guided>0&&d.ordered<=d.guided&&d.broad>=d.guided);
 });
 await test('proximity search does not combine different personal note fields',async()=>{
  await page.evaluate(()=>{
   const now=Date.now();
   const rows=[{id:'split-field',kind:'note',title:'qiyas',body:'The other discussion is illa.',
     target:{kind:'section',section:'1'},created:now,updated:now,deleted:0},
     {id:'within-note',kind:'note',title:'My juristic note',
      body:'In this passage qiyas approaches the relevant illa directly.',
      target:{kind:'section',section:'1'},created:now,updated:now,deleted:0}];
   localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items:rows}));
  });
  const matches=await page.evaluate(()=>window.GnammaUnifiedSearch.query('qiyas',{
   mode:'proximity',nearTerm:'illa',nearGap:6,facet:'personal'}).results.map(r=>r.id));
  assert.ok(matches.includes('within-note'));
  assert.ok(!matches.includes('split-field'),'Title+body must not be counted as one passage');
 });
 await test('research proximity UI offers second term, distance and order controls',async()=>{
  await page.locator('#searchBtn').click();
  await page.locator('[data-gns-expand="1"]').first().click();
  await page.locator('#gns-mode').selectOption('proximity');
  assert.equal(await page.locator('#gns-near-term').count(),1);
  assert.equal(await page.locator('#gns-near-gap').count(),1);
  assert.equal(await page.locator('#gns-near-order').count(),1);
  await page.locator('#gns-query').fill('ijtihad');
  await page.locator('#gns-near-term').fill('taqlid');
  await page.waitForTimeout(250);
  const count=await page.locator('.gns-result').count();
  assert.ok(count>=2,'Expected results, got '+count);
  const pair=page.locator('.gns-result').filter({hasText:'Authorial text · §230'}).first();
  assert.ok(await pair.count()>0,'§230 missing from results');
  assert.equal(await pair.locator('mark.gns-near-one').count(),1);
  assert.equal(await pair.locator('mark.gns-near-two').count(),1);
  await page.locator('#gns-near-gap').selectOption('0');
  assert.equal(await page.locator('.gns-result').count(),0);
  await page.locator('#gns-near-gap').selectOption('5');
  await page.waitForTimeout(120);
  assert.ok(await page.locator('.gns-result').count()>=2);
 });
 await test('authorial destination highlights both words and returns to proximity settings',async()=>{
  const p=page.locator('.gns-result').filter({hasText:'Authorial text · §230'}).first();
  await p.click();await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>location.hash),'#section=230');
  const marks=await page.evaluate(()=>({
   a:!!CSS.highlights?.has('gns-proximity-a'),
   b:!!CSS.highlights?.has('gns-proximity-b'),
   ordinary:document.querySelectorAll('mark.search-hit').length,
   return:document.querySelector('#gns-return-bar')?.innerText.slice(0,110)
  }));
  assert.ok(marks.a&&marks.b,JSON.stringify(marks));
  await page.locator('#gns-return-bar [data-gns-return]').click();
  await page.locator('#gns-query').waitFor({state:'visible'});
  assert.equal(await page.locator('#gns-query').inputValue(),'ijtihad');
  assert.equal(await page.locator('#gns-near-term').inputValue(),'taqlid');
  assert.equal(await page.locator('#gns-near-gap').inputValue(),'5');
  assert.equal(await page.locator('#gns-mode').inputValue(),'proximity');
  await page.locator('#gns-near-order').check();
  assert.ok(await page.locator('#gns-near-order').isChecked());
  await page.locator('.gns-dialog [data-gns-close]').click();
 });
 await test('library-wide proximity is passage-scoped and loads the published corpus',async()=>{
  await page.locator('#searchBtn').click();
  await page.locator('[data-gns-expand="1"]').first().click();
  await page.locator('#gns-mode').selectOption('proximity');
  await page.locator('#gns-query').fill('ijtihad');
  await page.locator('#gns-near-term').fill('taqlid');
  await page.locator('#gns-scope').selectOption('library');
  await page.waitForFunction(()=>window.GnammaUnifiedSearch.getEntries().other>3000,{timeout:20000});
  const data=await page.evaluate(()=>{
   const start=performance.now();
   const r=window.GnammaUnifiedSearch.query('ijtihad',{
    mode:'proximity',nearTerm:'taqlid',nearGap:20,scope:'library'});
   return {elapsed:performance.now()-start,total:r.total,other:r.results.filter(x=>x.work==='mustasfa').length,
    broken:r.results.filter(x=>x.matched?.gap>20||!['ar','en','body','title'].includes(x.matched?.field)).length};
  });
  assert.ok(data.total>=2,JSON.stringify(data));
  assert.equal(data.broken,0);
  assert.ok(data.elapsed<2500,'Unusually slow library proximity query '+data.elapsed+'ms');
  await page.locator('.gns-dialog [data-gns-close]').click();
 });
 await test('inline proximity syntax switches the UI to Proximity mode',async()=>{
  await page.locator('#searchBtn').click();
  await page.locator('#gns-query').fill('ijtihad NEAR/5 taqlid');
  await page.waitForTimeout(170);
  assert.equal(await page.locator('#gns-mode').inputValue(),'proximity');
  assert.equal(await page.locator('#gns-query').inputValue(),'ijtihad');
  assert.equal(await page.locator('#gns-near-term').inputValue(),'taqlid');
  assert.equal(await page.locator('#gns-near-gap').inputValue(),'5');
  assert.ok(await page.locator('.gns-result').count()>0);
  await page.locator('.gns-dialog [data-gns-close]').click();
 });
 await test('no fatal JavaScript errors',async()=>assert.deepEqual(errors,[]));
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto(base,{waitUntil:'load',timeout:45000});
 await test('390px mobile proximity controls fit screen without horizontal overflow',async()=>{
  await mobile.locator('#searchBtn').click();
  await mobile.locator('[data-gns-expand="1"]').first().click();
  await mobile.locator('#gns-mode').selectOption('proximity');
  await mobile.locator('#gns-query').fill('ijtihad');
  await mobile.locator('#gns-near-term').fill('taqlid');
  await mobile.waitForTimeout(250);
  const geometry=await mobile.evaluate(()=>({
   window:innerWidth,document:document.documentElement.scrollWidth,
   near:document.querySelector('.gns-near-options')?.getBoundingClientRect().toJSON(),
   count:document.querySelectorAll('.gns-result').length
  }));
  assert.ok(geometry.document<=geometry.window+1,JSON.stringify(geometry));
  assert.ok(geometry.near&&geometry.near.right<=geometry.window+1,JSON.stringify(geometry));
  assert.ok(geometry.count>0);
 });
 const narrow=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 await narrow.goto(base,{waitUntil:'load',timeout:45000});
 await test('320px phone proximity controls retain usable results without horizontal overflow',async()=>{
  await narrow.locator('#searchBtn').click();
  await narrow.locator('[data-gns-expand="1"]').first().click();
  await narrow.locator('#gns-mode').selectOption('proximity');
  await narrow.locator('#gns-query').fill('ijtihad');
  await narrow.locator('#gns-near-term').fill('taqlid');
  await narrow.waitForTimeout(220);
  const details=await narrow.evaluate(()=>({
   viewport:innerWidth,scroll:document.documentElement.scrollWidth,
   options:document.querySelector('.gns-near-options')?.getBoundingClientRect().toJSON(),
   results:document.querySelectorAll('.gns-result').length
  }));
  assert.ok(details.scroll<=details.viewport+1,JSON.stringify(details));
  assert.ok(details.options?.right<=details.viewport+1,JSON.stringify(details));
  assert.ok(details.results>0);
 });
 await narrow.close();
 await browser.close();
 if(server)await new Promise(ok=>server.close(ok));
 console.log(JSON.stringify({passed:passed.length,failed:failed.length,failures:failed},null,2));
 if(failed.length)process.exit(1);
})().catch(e=>{console.error(e.stack);process.exit(1)});
