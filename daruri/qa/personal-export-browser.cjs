'use strict';
/* True browser -> generated PDF smoke (run from qa/ with Playwright + pdf-lib installed).
   Serves this exact branch and verifies pop-up annotation dictionaries and appended pages. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const {PDFDocument,PDFArray,PDFName}=require('pdf-lib');
const root=path.resolve(__dirname,'../..');
const host='http://127.0.0.1:8765';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const file='daruri.pdf';
(async()=>{
 let browser=null;
 try{
  await sleep(1500);
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({acceptDownloads:true});
  const thirdParty=[];
  page.on('request',req=>{if(/^https?:\/\//.test(req.url())&&!req.url().startsWith(host))thirdParty.push(req.url());});
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.route('https://unpkg.com/**',route=>route.abort());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
   localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({
    format:'gnamma-reading-desk',version:1,items:[
     {id:'smoke-linked',kind:'note',title:'A personal reflection',body:'This is a private reading note. العربية مثال.',
      target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'knowledge'},
      created:Date.UTC(2026,9,21),modified:0,updated:Date.UTC(2026,9,21),dateSource:'recorded',deleted:0},
     {id:'smoke-free',kind:'note',title:'Free standing',body:'Second observation <script>text</script>.',
      target:null,standalone:true,created:0,updated:Date.UTC(2026,9,21),dateSource:'legacy-unknown',deleted:0},
     {id:'smoke-bookmark',kind:'section',target:{kind:'section',section:'62'},
      created:Date.UTC(2026,9,21),updated:Date.UTC(2026,9,21),dateSource:'recorded',deleted:0}
    ]
   }));
  });
  await page.goto(host+'/daruri/personal-export.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('input[name=pe-mode]:checked').getAttribute('value'),'none');
  assert.match(await page.locator('#pe-description').innerText(),/No Reading Desk items/i);
  assert.equal(await page.locator('#pe-generate').innerText(),'Open unchanged PDF');
  await page.locator('input[name=pe-mode][value=all]').check();
  assert.match(await page.locator('#pe-count').innerText(),/2 qualifying items/);
  await page.locator('#pe-bookmarks').check();
  assert.match(await page.locator('#pe-count').innerText(),/3 qualifying items/);
  await page.locator('#pe-bookmarks').uncheck();
  await page.locator('#pe-annotations').check();
  await page.locator('#pe-appendix').check();
  const downloadPromise=page.waitForEvent('download',{timeout:180000});
  await page.locator('#pe-generate').click();
  const download=await downloadPromise,output=path.join(os.tmpdir(),'gnamma-personal-qa-'+Date.now()+'.pdf');
  await download.saveAs(output);
  const err=await page.locator('#pe-alert').innerText();
  assert(!/export failed/i.test(err),err);
  const pdf=await PDFDocument.load(fs.readFileSync(output));
  const metadata=JSON.parse(fs.readFileSync(path.join(root,'daruri/build/release/'+file+'.metadata.json'),'utf8'));
  const base=JSON.parse(fs.readFileSync(path.join(root,'daruri/pdf-editions-manifest.json'),'utf8')).files[file].pages;
  assert(pdf.getPageCount()>base,'appendix must add printable pages');
  const sectionOne=Number(metadata.section_pages['1'])-1;
  const annotations=pdf.getPage(sectionOne).node.lookup(PDFName.of('Annots'),PDFArray);
  assert(annotations&&annotations.size()>0,'PDF must contain real source-linked annotations');
  const refSet=new Set(Array.from({length:pdf.getPageCount()-base},(_,i)=>String(pdf.getPage(base+i).ref)));
  let hasPersonalLink=false;
  for(let i=0;i<annotations.size();i++){
   const a=pdf.context.lookup(annotations.get(i));
   const type=a.lookup(PDFName.of('Subtype'));
   if(String(type)==='/Text')throw Error('Personal PDF exports must not create comment boxes');
   if(String(type)==='/Link'){
     const dest=a.lookup(PDFName.of('Dest'),PDFArray);
     if(dest&&refSet.has(String(dest.get(0))))hasPersonalLink=true;
   }
  }
  assert(hasPersonalLink,'section must have a clickable P reference pointing to the endnotes');
  const end=pdf.getPage(pdf.getPageCount()-1);
  assert(end.node.Resources(), 'printable appendix should have embedded image resources');
  assert.equal(errors.length,0,'no uncaught browser errors: '+errors.join('; '));
  assert.equal(thirdParty.length,0,'private PDF export must not require remote third-party scripts');
  // Appendix headings link back to their original numbered source pages.
  const appendixAnnotations=end.node.lookup(PDFName.of('Annots'),PDFArray);
  assert(appendixAnnotations&&appendixAnnotations.size()>0,'appended notes should have return navigation');
  let hasReturn=false;
  for(let i=0;i<appendixAnnotations.size();i++){
    const item=pdf.context.lookup(appendixAnnotations.get(i));
    if(String(item.lookup(PDFName.of('Subtype')))==='/Link')hasReturn=true;
  }
  assert(hasReturn,'appendix should offer native PDF links back to text');
  fs.unlinkSync(output);
  // Every fixed language edition needs an independent matching map.
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'daruri/pdf-editions-manifest.json'),'utf8'));
  for(const chosen of ['daruri-english.pdf','daruri-arabic.pdf']){
    await page.locator('#pe-edition').selectOption(chosen);
    const nextDownload=page.waitForEvent('download',{timeout:180000});
    await page.locator('#pe-generate').click();
    const dl=await nextDownload, nextFile=path.join(os.tmpdir(),chosen.replace('.pdf','-smoke.pdf'));
    await dl.saveAs(nextFile);
    const nextPdf=await PDFDocument.load(fs.readFileSync(nextFile));
    assert(nextPdf.getPageCount()>manifest.files[chosen].pages,chosen+' should include appendix');
    const md=JSON.parse(fs.readFileSync(path.join(root,'daruri/build/release/'+chosen+'.metadata.json'),'utf8'));
    const pp=nextPdf.getPage(Number(md.section_pages['1'])-1);
    assert(pp.node.lookup(PDFName.of('Annots'),PDFArray)?.size()>0,chosen+' should preserve source anchors');
    fs.unlinkSync(nextFile);
  }
  // Selecting one note must not silently include other private notes.
  await page.locator('input[name=pe-mode][value=choose]').check();
  await page.locator('#pe-check-none').click();
  await page.locator('#pe-items input[type=checkbox]').first().check();
  assert.match(await page.locator('#pe-count').innerText(),/1 qualifying item/);
  await page.locator('#pe-appendix').uncheck();
  assert(await page.locator('#pe-generate').isDisabled(),'P references require their appendix destination');
  assert.match(await page.locator('#pe-count').innerText(),/Include the personal appendix/);
  await page.locator('#pe-appendix').check();
  const singleNote=page.waitForEvent('download',{timeout:180000});
  await page.locator('#pe-generate').click();
  const dlOnly=await singleNote,onlyFile=path.join(os.tmpdir(),'gnamma-single-note-smoke.pdf');
  await dlOnly.saveAs(onlyFile);
  const onlyPdf=await PDFDocument.load(fs.readFileSync(onlyFile));
  assert(onlyPdf.getPageCount()>manifest.files['daruri-arabic.pdf'].pages,'selected note should have its endnote destination');
  fs.unlinkSync(onlyFile);
  // Free-standing notes are unanchored: refuse to drop them when appendix is off.
  await page.locator('#pe-check-none').click();
  await page.locator('#pe-items input[type=checkbox]').nth(1).check();
  await page.locator('#pe-generate').click();
  assert(await page.locator('#pe-generate').isDisabled(),'No appendix means no valid two-way destination');
  await page.locator('#pe-appendix').check();
  const unattached=page.waitForEvent('download',{timeout:180000});
  await page.locator('#pe-generate').click();
  const unattachedFile=path.join(os.tmpdir(),'gnamma-unattached-note-smoke.pdf');
  await (await unattached).saveAs(unattachedFile);
  const unattachedPdf=await PDFDocument.load(fs.readFileSync(unattachedFile));
  assert(unattachedPdf.getPageCount()>manifest.files['daruri-arabic.pdf'].pages,'unattached notes must remain in the appendix');
  fs.unlinkSync(unattachedFile);
  // The existing A4 builder must also keep personal notes opt-in and printable.
  await page.goto(host+'/daruri/index.html#editions',{waitUntil:'networkidle'});
  await page.locator('.gn-editions').waitFor({timeout:30000});
  const reading=page.locator('[data-ep-tier=reading]');
  assert.equal(await reading.locator('select[data-ep-control=personal]').inputValue(),'none');
  await reading.locator('[data-ep-action=prepare]').click();
  assert(!await page.locator('#gnEpPacket').innerText().then(s=>s.includes('My Reading Desk · personal observations')));
  await reading.locator('select[data-ep-control=personal]').selectOption('notes');
  await reading.locator('[data-ep-action=prepare]').click();
  const printText=await page.locator('#gnEpPacket').innerText();
  assert(printText.includes('My Reading Desk · personal observations'),'personal appendix should appear only after opting in');
  assert(printText.includes('A personal reflection'),'personal note title should appear in print packet');
  await page.evaluate(()=>document.body.classList.add('gn-ed-print-ready'));
  const a4bytes=await page.pdf({format:'A4',preferCSSPageSize:true,printBackground:false});
  const a4=await PDFDocument.load(a4bytes);
  assert(a4.getPageCount()>0&&a4.getPageCount()<600,'print-to-PDF must be nonempty and paginate sensibly');
  assert.equal(errors.length,0,'no uncaught browser errors: '+errors.join('; '));
  assert.equal(thirdParty.length,0,'private PDF export must not require remote third-party scripts');
  console.log('PASS bilingual/English/Arabic P-link PDFs, no pop-up boxes, two-way appendices, selective mode and A4 printing.');
 } finally {
  if(browser)await browser.close();
  server.kill();
 }
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});