/* Diagnostic geometry, not a replacement for the strict browser checks. */
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:900},serviceWorkers:'block'});
 for(const file of ['.applications-matrix-baseline.html','']){
  await page.goto('http://127.0.0.1:8765/daruri/'+file+'#applications',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#applicationList article');
  if(!file)await page.waitForSelector('#gn-app-matrix tbody tr');
  const geometry=await page.evaluate(()=>{
   const bounds=el=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {tag:el.tagName,id:el.id,cls:String(el.className).slice(0,90),x:b.x,width:b.width,right:b.right,display:s.display,minWidth:s.minWidth,overflowX:s.overflowX};};
   return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,main:bounds(document.getElementById('mainContent')),matrix:document.getElementById('gn-app-matrix')&&bounds(document.getElementById('gn-app-matrix')),overflowing:[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.right>innerWidth+2&&!e.closest('.am-scroll')}).slice(0,20).map(bounds)};
  });
  console.log('MATRIX_LAYOUT_PROBE',file||'patched',JSON.stringify(geometry));
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
