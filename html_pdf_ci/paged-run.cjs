// CI-only Paged.js renderer. No changes to published reader.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const fixture=path.resolve(process.argv[2]), dest=path.resolve(process.argv[3]);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  await page.addInitScript({content:'window.PagedConfig={auto:false};'});
  await page.goto('file://'+fixture,{waitUntil:'domcontentloaded',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.addScriptTag({path:require.resolve('pagedjs/dist/paged.polyfill.js')});
  const t=Date.now();
  await page.evaluate(async()=>await window.PagedPolyfill.preview());
  console.log('PAGED_PAGINATION_SECONDS='+((Date.now()-t)/1000).toFixed(2));
  console.log('PAGED_PREVIEW_PAGES='+await page.locator('.pagedjs_page').count());
  await page.pdf({path:dest,printBackground:true,preferCSSPageSize:true,margin:{top:'0',bottom:'0',left:'0',right:'0'},timeout:120000});
  console.log('PAGED_PDF_BYTES='+fs.statSync(dest).size);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
