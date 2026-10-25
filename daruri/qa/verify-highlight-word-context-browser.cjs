'use strict';
/* Real-browser acceptance for persistent passage highlighting and explicit
   Word Context. Run with Playwright installed in daruri/qa. */
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {spawn}=require('node:child_process');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const URL='http://127.0.0.1:8896/daruri/#section=1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function selectWord(page,language){
 return page.evaluate(lang=>{
  const side=document.querySelector('#reader .passage-grid[data-segment="0"] .passage-'+lang);
  if(!side)throw Error('Missing '+lang+' passage');
  const walker=document.createTreeWalker(side,NodeFilter.SHOW_TEXT);
  let node=null,match=null;
  const pattern=lang==='ar'?/[\u0621-\u064a][\u0621-\u065f\u0670]*[\u0621-\u064a]/u:/[A-Za-z]{4,}/;
  while(walker.nextNode()){
   const candidate=walker.currentNode;
   if(candidate.parentElement?.closest('sup,[aria-hidden="true"]'))continue;
   const found=pattern.exec(candidate.textContent||'');
   if(found){node=candidate;match=found;break;}
  }
  if(!node)throw Error('No '+lang+' word text node');
  const range=document.createRange();
  range.setStart(node,match.index);
  range.setEnd(node,match.index+match[0].length);
  const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
  document.dispatchEvent(new Event('selectionchange'));
  const rect=range.getBoundingClientRect();
  return {text:match[0],x:rect.left+rect.width/2,y:rect.top+rect.height/2};
 },language);
}
async function exercise(engine,{mobile=false}={}){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({
  viewport:{width:mobile?390:1220,height:870},
  isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const tag=(engine===webkit?'WebKit':'Chromium')+(mobile?' mobile':' desktop');
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  const en=page.locator('#reader .passage-grid[data-segment="0"] .passage-en').first();
  const ar=page.locator('#reader .passage-grid[data-segment="0"] .passage-ar').first();
  await en.waitFor({state:'visible',timeout:50000});
  await page.evaluate(()=>document.fonts.ready);
  await en.scrollIntoViewIfNeeded();
  await page.evaluate(()=>window.getSelection()?.removeAllRanges());
  const before=await en.screenshot({animations:'disabled'});
  await selectWord(page,'en');
  const tool=page.locator('#gn-rd-selection-bar [data-rd="selection-bookmark"]');
  await tool.waitFor({state:'visible',timeout:18000});
  await tool.click();
  await page.waitForFunction(()=>{
   try{return JSON.parse(localStorage.getItem('gnamma-reading-desk-v1')||'{}').items
     ?.some(x=>x.kind==='quote'&&x.target?.section==='1'&&x.target?.lang==='en');}
   catch(_){return false;}
  },null,{timeout:15000});
  const paint=await page.evaluate(()=>{
   const n=window.CSS?.highlights?.get('gn-rd-bookmark')?.size||0;
   const fallback=document.querySelectorAll('#reader mark.gn-rd-saved-highlight').length;
   return {custom:n,fallback};
  });
  assert.ok(paint.custom>0||paint.fallback>0,
   tag+': saved highlight has no painted text range: '+JSON.stringify(paint));
  await page.evaluate(()=>window.getSelection()?.removeAllRanges());
  await page.waitForTimeout(170);
  const after=await en.screenshot({animations:'disabled'});
  assert.notDeepEqual(after,before,
   tag+': highlighting left the actual passage pixels unchanged');
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await en.waitFor({state:'visible',timeout:50000});
  await page.waitForFunction(()=>{
   return (window.CSS?.highlights?.get('gn-rd-bookmark')?.size||0)>0||
    document.querySelectorAll('#reader mark.gn-rd-saved-highlight').length>0;
  },null,{timeout:18000});
  // Phones can start English-only. Enable Arabic through the reader's real
  // language control, rather than treating a hidden column as a selection bug.
  if(mobile&&!(await ar.isVisible())){
   await page.evaluate(()=>{
    const button=document.querySelector('[data-language-toggle="arabic"]');
    if(!button)throw Error('Arabic language toggle not mounted on mobile');
    button.click();
   });
   await ar.waitFor({state:'visible',timeout:18000});
  }
  // Neither ordinary tap nor native text selection should auto-launch modal.
  await ar.scrollIntoViewIfNeeded();
  const loc=await selectWord(page,'ar');
  const ctx=page.locator('#gn-rd-selection-bar [data-rd="selection-word-context"]');
  await ctx.waitFor({state:'visible',timeout:18000});
  assert.match(await ctx.innerText(),/Word Context/,
   tag+': selected-word action lacks a visible label');
  assert.equal(await page.locator('#gnamma-word-context:not([hidden])').count(),0,
   tag+': Word Context auto-opened on selection');
  if(!mobile){
   await page.mouse.click(loc.x,loc.y,{button:'right'});
   const menu=page.locator('.gnw-reader-menu');
   await menu.waitFor({state:'visible',timeout:7000});
   assert.equal(await menu.locator('[data-gnw-copy-menu]').count(),1,
    tag+': selected-word menu lost Copy');
   await menu.locator('[data-gnw-open-menu]').click();
  }else await ctx.click();
  await page.locator('#gnamma-word-context:not([hidden])').waitFor({state:'visible',timeout:10000});
  assert.match(await page.locator('#gnw-title').innerText(),/[\u0621-\u064a]/,
   tag+': Word Context did not open for the selected Arabic word');
  await page.keyboard.press('Escape');
  await page.locator('#gnamma-word-context').waitFor({state:'hidden',timeout:6000});
  // Focus modes must show both section and paragraph IN the reading flow,
  // not merely in the dock or the hover-only paragraph permalink.
  for(const level of [1,2,3]){
   await page.evaluate(n=>{
    const prefs=JSON.parse(localStorage.getItem('daruri-reader-v2')||'{}');
    prefs.focusLevel=n;prefs.focusMode=true;prefs.focusApparatus=n===1;prefs.n='2';
    localStorage.setItem('daruri-reader-v2',JSON.stringify(prefs));
    history.replaceState(null,'','#section=2');
   },level);
   await page.reload({waitUntil:'domcontentloaded',timeout:90000});
   await page.locator('body.focus-level-'+level).waitFor({state:'attached',timeout:35000});
   const root=level===3?'#gn-continuous-2':'#reader';
   const passage=page.locator(root+' .passage-grid[data-segment="1"]').first();
   await passage.waitFor({state:'visible',timeout:30000});
   const locator=passage.locator(':scope > .gn-focus-reading-locus');
   await locator.waitFor({state:'visible',timeout:22000});
   const inText=await locator.evaluate(node=>{
    const grid=node.closest('.passage-grid'),rect=node.getBoundingClientRect();
    const box=grid.getBoundingClientRect();
    return {text:node.textContent,aria:node.getAttribute('aria-label'),
     within:rect.left>=box.left-2&&rect.right<=box.right+2,
     outsideSource:!node.closest('.passage-ar,.passage-en'),
     size:rect.width>50&&rect.height>=15};
   });
   assert.match(inText.text,/§2\s*·\s*¶2/,tag+' Focus '+level+': incorrect inline locator');
   assert.match(inText.aria,/Section 2, paragraph 2/,tag+' Focus '+level+': locator inaccessible');
   assert.ok(inText.within&&inText.size&&inText.outsideSource,
    tag+' Focus '+level+': locator hidden, off-column or inserted into source text: '+JSON.stringify(inText));
   if(level===2){
    // Select an entire Arabic passage, not precisely one word. The previous
    // exact-one-word condition made Word Context disappear for real selections.
    const arabic=passage.locator('.passage-ar');
    if(!(await arabic.isVisible())){
     await page.evaluate(()=>{
      const toggle=document.querySelector('[data-language-toggle="arabic"]');
      if(!toggle)throw Error('No Arabic toggle during Focus');
      toggle.click();
     });
     await arabic.waitFor({state:'visible',timeout:18000});
    }
    await arabic.scrollIntoViewIfNeeded();
    await arabic.evaluate(side=>{
     const range=document.createRange();range.selectNodeContents(side);
     const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
     document.dispatchEvent(new Event('selectionchange'));
    });
    const action=page.locator('#gn-rd-selection-bar [data-rd="selection-word-context"]');
    await action.waitFor({state:'visible',timeout:18000});
    assert.match(await action.innerText(),/Word Context/,tag+' Focus: missing context action for an Arabic phrase');
    await action.click();
    await page.locator('#gnamma-word-context:not([hidden])').waitFor({state:'visible',timeout:12000});
    await page.keyboard.press('Escape');
    await page.locator('#gnamma-word-context').waitFor({state:'hidden',timeout:12000});
   }
  }
  assert.ok(!errors.some(e=>/reading-desk|gnamma-word-context|find is not a function|surroundContents/i.test(e)),
   tag+': page errors '+JSON.stringify(errors));
  console.log('PASS '+tag+' persistent visible highlight and explicit Word Context');
 }finally{await context.close();await browser.close();}
}
(async()=>{
 const server=spawn('python3',['-m','http.server','8896','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 try{
  await sleep(1400);
  await exercise(chromium);
  await exercise(webkit);
  await exercise(webkit,{mobile:true});
 }finally{server.kill();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
