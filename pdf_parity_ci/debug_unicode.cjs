'use strict';
// Temporary synthetic-only diagnostic: investigate mixed-script Arabic PDF extraction.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {pathToFileURL}=require('node:url');
const {spawn}=require('node:child_process');
const {chromium}=require(path.resolve(__dirname,'../daruri/qa/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),out=path.resolve(__dirname,'debug_evidence');
fs.mkdirSync(out,{recursive:true});
const texts=[
 'CI-PRIVATE-PERSONAL-NOTE: Arabic التحليل · Study reflection on lawful reasoning.',
 'مقدمة العلوم الدقيقة بين الحقيقة والأصول. Des idées françaises.',
 'التحليل والبيان والتفصيل في أصول الفقه',
 'Arabic التحليل والفقه example',
];
const seed={format:'gnamma-reading-desk',version:1,items:texts.map((body,i)=>({
 id:'diag-'+i,kind:'note',title:'Synthetic note '+(i+1),body,
 target:{kind:'section',section:String(i+1)},created:Date.UTC(2026,9,22)+i,
 updated:Date.UTC(2026,9,22)+i,dateSource:'recorded',deleted:0
}))};
const server=spawn('python3',['-m','http.server','8899','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await wait(1100);const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({acceptDownloads:true});let errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(data=>localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(data)),seed);
  await page.goto('http://127.0.0.1:8899/daruri/personal-export.html',{waitUntil:'networkidle'});
  await page.locator('input[name="pe-mode"][value="all"]').check();
  await page.locator('#pe-edition').selectOption('daruri.pdf');
  await page.locator('#pe-annotations').check();await page.locator('#pe-appendix').check();
  const dl=page.waitForEvent('download',{timeout:180000});
  await page.locator('#pe-generate').click();const d=await dl;
  const pdf=path.join(out,'synthetic-mixed-arabic.pdf');await d.saveAs(pdf);
  const pdfjs=await import(pathToFileURL(path.resolve(root,'daruri/qa/node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
  const bytes=new Uint8Array(fs.readFileSync(pdf));
  const doc=await pdfjs.getDocument({data:bytes,disableFontFace:true,useSystemFonts:false}).promise;
  let pageStrs=[];
  for(let n=doc.numPages-2;n<=doc.numPages;n++){
   if(n<1)continue;
   let p=await doc.getPage(n),data=await p.getTextContent({includeMarkedContent:true});
   pageStrs.push({page:n,items:data.items.map(i=>({str:i.str||'',dir:i.dir,fontName:i.fontName,marked:i.type||''})).filter(i=>i.str||i.marked)});
  }
  await doc.destroy();
  fs.writeFileSync(path.join(out,'pdfjs-extracted.json'),JSON.stringify({input:texts,extracted:pageStrs,errors},null,2));
  console.log('INPUTS',texts);for(let t of pageStrs)console.log('PAGE',t.page,JSON.stringify(t.items.map(y=>y.str).filter(Boolean).join(' ')).slice(0,3500));
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1});
