'use strict';
/* Safari/WebKit-style browser smoke test for static personal PDF generation. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{webkit}=require('playwright');
const {PDFDocument,PDFArray,PDFName}=require('pdf-lib');
const navigationDestination=require('./native-phone/resolve-pdf-link.cjs');
const root=path.resolve(__dirname,'../..');
const host='http://127.0.0.1:8767';
const server=spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function browserCheck(){
 let browser;
 try{
  await sleep(1500);
  browser=await webkit.launch({headless:true});
  const page=await browser.newPage({acceptDownloads:true,viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const errors=[],outside=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(host))outside.push(r.url());});
  await page.addInitScript(()=>{
    localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({
      format:'gnamma-reading-desk',version:1,items:[
        {id:'arabic-linked',kind:'note',target:{kind:'quote',section:'1',segment:0,lang:'ar',
          quote:'بِسْمِ اللَّهِ'},title:'An Arabic-linked reflection',body:'الحق والحقيقة — some English words.',
          created:Date.UTC(2026,9,21),updated:Date.UTC(2026,9,21),modified:0,dateSource:'recorded',deleted:0},
        {id:'standalone',kind:'note',target:null,standalone:true,title:'General note',
          body:'Plain user text <script>alert(1)</script> must not execute.',
          created:0,updated:1,dateSource:'legacy-unknown',deleted:0}
      ]
    }));
  });
  await page.goto(host+'/daruri/personal-export.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('input[name="pe-mode"]:checked').getAttribute('value'),'none');
  const editions=await page.locator('select#pe-edition option').evaluateAll(nodes=>
    nodes.map(n=>n.value));
  const canonical=['daruri.pdf','daruri-study.pdf','daruri-english.pdf',
    'daruri-arabic.pdf','daruri-arabic-vowelled.pdf'];
  assert.equal(editions.length,17,'Stage1 personal exporter selects five canonical and twelve clean sources; generated variants appear only after creation');
  assert(canonical.every(file=>editions.includes(file)),
    'Canonical personal-PDF editions must remain selectable');
  assert.equal(editions.filter(file=>/^editions\/(reading|study)\//.test(file)).length,12,
    'All twelve mapped, exactly published plain A4 editions are selectable on mobile');
  assert.equal(editions.filter(file=>file.startsWith('editions/apparatus/')).length,0,
    'Retired complete apparatus PDFs must not be selectable before local creation');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),
    '390px mobile viewport should not scroll horizontally');
  await page.locator('input[name="pe-mode"][value="all"]').check();
  await page.locator('#pe-edition').selectOption('daruri-english.pdf');
  assert.match(await page.locator('#pe-count').innerText(),/2 qualifying items/);
  const downloadEvent=page.waitForEvent('download',{timeout:240000});
  await page.locator('#pe-generate').click();
  const download=await downloadEvent,file=path.join(os.tmpdir(),'gnamma-webkit-personal-'+Date.now()+'.pdf');
  await download.saveAs(file);
  const pdf=await PDFDocument.load(fs.readFileSync(file));
  const metadata=JSON.parse(fs.readFileSync(path.join(root,'daruri/build/release/daruri-english.pdf.metadata.json'),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'daruri/pdf-editions-manifest.json'),'utf8'));
  assert(pdf.getPageCount()>manifest.files['daruri-english.pdf'].pages,'WebKit export needs printable appendix');
  const section=pdf.getPage(Number(metadata.section_pages['1'])-1);
  const annotations=section.node.lookup(PDFName.of('Annots'),PDFArray);
  assert(annotations?.size()>0,'WebKit generated PDF must retain native annotations');
  const originalPages=manifest.files['daruri-english.pdf'].pages;
  const endnotes=new Set(Array.from({length:pdf.getPageCount()-originalPages},(_,i)=>
    String(pdf.getPage(originalPages+i).ref)));
  let linked=false;
  for(let i=0;i<annotations.size();i++){
    const d=pdf.context.lookup(annotations.get(i));
    const type=String(d.lookup(PDFName.of('Subtype')));
    assert.notEqual(type,'/Text','WebKit personal notes must not create comment boxes');
    if(type==='/Link'){
      const dest=navigationDestination(pdf,d);
      if(dest instanceof PDFArray&&endnotes.has(String(dest.get(0))))linked=true;
    }
  }
  assert(linked,'Mobile WebKit P reference must link into the personal endnotes');
  assert(await page.locator('#pe-result').isVisible(),'WebKit download recovery links should display');
  await page.locator('input[name="pe-mode"][value="none"]').check();
  assert(!await page.locator('#pe-result').isVisible(),'changing to clean PDF must hide previous private download');
  assert.equal(await page.locator('#pe-generate').innerText(),'Open unchanged PDF');
  assert.deepEqual(outside,[],'private note export must not execute third party scripts');
  assert.deepEqual(errors,[],'no WebKit script errors');
  fs.unlinkSync(file);
  console.log('PASS WebKit mobile 390px: clean default, Arabic Unicode note, P link to appendix, zero personal comment popups, no horizontal scroll.');
 }finally{if(browser)await browser.close();server.kill();}
}
browserCheck().catch(e=>{console.error(e);server.kill();process.exitCode=1;});