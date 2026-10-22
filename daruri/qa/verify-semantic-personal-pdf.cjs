'use strict';
/* End-to-end generated-PDF checks: semantic text extraction, real highlights,
   RTL + English, mobile delivery, clean default and cross-engine resilience. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium,webkit,firefox}=require('playwright');
const {PDFDocument,PDFName,PDFArray}=require('pdf-lib');
const navigationDestination=require('./native-phone/resolve-pdf-link.cjs');
const loadBook=require('./load-book.js');
const root=path.resolve(__dirname,'../..'),url='http://127.0.0.1:8771';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'daruri/pdf-editions-manifest.json'),'utf8'));
const book=loadBook(fs.readFileSync(path.join(root,'daruri/index.html'),'utf8'));
const seg=book.sections.find(s=>Number(s.id)===1).segments[0];
const eq=seg.en.trim().split(/\s+/).slice(0,6).join(' ');
const aq=seg.ar.trim().split(/\s+/).slice(0,5).join(' ');
const DATA={
 format:'gnamma-reading-desk',version:1,items:[
 {id:'search-en',kind:'note',title:'Searchable English note',body:'SearchableTermGamma: the author distinguishes legal demonstration.',
  target:{kind:'quote',section:'1',segment:0,lang:'en',quote:eq,prefix:'',suffix:''},
  created:Date.UTC(2026,9,21),updated:Date.UTC(2026,9,21),dateSource:'recorded',deleted:0},
 {id:'search-ar',kind:'note',title:'Arabic note and French',body:'مقدمة العلوم الدقيقة بين الحقيقة والأصول؛ والتحليل. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. Des idées françaises.',
  target:{kind:'quote',section:'1',segment:0,lang:'ar',quote:aq,prefix:'',suffix:''},
  created:Date.UTC(2026,9,21),updated:Date.UTC(2026,9,21),dateSource:'recorded',deleted:0},
 {id:'search-free',kind:'note',title:'Unattached discussion',body:'UnattachedSearchablePhi includes <script>not executable</script>.',
  target:null,standalone:true,created:0,updated:1,dateSource:'legacy-unknown',deleted:0}
 ]};
const strip=s=>String(s).normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
const server=spawn('python3',['-m','http.server','8771','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const delay=n=>new Promise(r=>setTimeout(r,n));
async function checkedPdf(file,engine,contextSettings){
 const b=await engine.launch({headless:true});
 let filename='';
 try{
  const page=await b.newPage({acceptDownloads:true,...contextSettings});
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(url))requests.push(r.url());});
  await page.addInitScript(data=>{localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(data));},DATA);
  await page.goto(url+'/daruri/personal-export.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('input[name=pe-mode]:checked').getAttribute('value'),'none');
  assert.match(await page.locator('#pe-generate').innerText(),/Open unchanged PDF/);
  if(contextSettings?.viewport)assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),
     'Mobile export screen must not overflow horizontally');
  await page.locator('input[name=pe-mode][value=all]').check();
  await page.locator('#pe-edition').selectOption('daruri.pdf');
  const download=page.waitForEvent('download',{timeout:240000});
  await page.locator('#pe-generate').click();
  const got=await download;filename=path.join(os.tmpdir(),'gnamma-semantic-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.pdf');
  await got.saveAs(filename);
  const status=await page.locator('#pe-alert').innerText();
  assert(!/export failed/i.test(status),status);
  assert(/searchable appendix/.test(status),'UI must identify searchable appendix');
  assert.equal(errors.length,0,'Browser JS errors: '+errors.join(' / '));
  assert.deepEqual(requests,[],'No user data or scripts may be sent to third-party hosts');
  if(engine.name()==='chromium'&&!contextSettings?.viewport&&process.env.GNAMMA_QA_VISUAL_PATH){
    // Keep a synthetic diagnostic PDF even when subsequent text/search tests
    // fail; it never contains real Reading Desk data.
    const target=path.resolve(root,process.env.GNAMMA_QA_VISUAL_PATH);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.copyFileSync(filename,target);
  }
  const bytes=fs.readFileSync(filename),pdf=await PDFDocument.load(bytes),originalPages=manifest.files['daruri.pdf'].pages;
  assert(pdf.getPageCount()>originalPages,'Personal notes must append printable pages');
  // A personal note is no longer a PDF /Text or /Highlight comment.
  // The visually painted P marker and highlighted words both link to
  // a specific appended heading; publisher annotations are not modified.
  const appendixRefs=new Set(Array.from({length:pdf.getPageCount()-originalPages},(_,i)=>
    String(pdf.getPage(originalPages+i).ref)));
  const originalPdf=await PDFDocument.load(fs.readFileSync(path.join(root,'daruri/daruri.pdf')));
  let forwards=0,popupAdds=0;
  for(let i=0;i<originalPages;i++){
    const sourcePage=pdf.getPage(i),baselinePage=originalPdf.getPage(i);
    const getAnnots=(doc,page)=>page.node.get(PDFName.of('Annots'))?
      page.node.lookup(PDFName.of('Annots'),PDFArray):null;
    const baseAnnots=getAnnots(originalPdf,baselinePage);
    const countPopup=(doc,annotations)=>{
      let n=0;
      if(annotations)for(let j=0;j<annotations.size();j++){
        const a=doc.context.lookup(annotations.get(j));
        if(['/Text','/Highlight'].includes(String(a.lookup(PDFName.of('Subtype')))))n++;
      }
      return n;
    };
    const annots=getAnnots(pdf,sourcePage);
    popupAdds+=countPopup(pdf,annots)-countPopup(originalPdf,baseAnnots);
    if(!annots)continue;
    for(let j=0;j<annots.size();j++){
      const obj=pdf.context.lookup(annots.get(j));
      if(String(obj.lookup(PDFName.of('Subtype')))!=='/Link')continue;
      const dest=navigationDestination(pdf,obj);
      if(!(dest instanceof PDFArray)||dest.size()<2||!appendixRefs.has(String(dest.get(0))))continue;
      assert.equal(String(dest.get(1)),'/XYZ','P link must arrive near a note heading');
      forwards++;
    }
  }
  assert.equal(popupAdds,0,'Personal PDF export must not add any sidebar comment annotations');
  assert(forwards>=4,'Each of two source quotes needs a P marker and direct phrase link; found '+forwards);
  const sourceRefs=new Set(Array.from({length:originalPages},(_,i)=>String(pdf.getPage(i).ref)));
  let returns=0;
  for(let i=originalPages;i<pdf.getPageCount();i++){
    const pg=pdf.getPage(i);
    if(!pg.node.get(PDFName.of('Annots')))continue;
    const arr=pg.node.lookup(PDFName.of('Annots'),PDFArray);
    for(let j=0;j<arr.size();j++){
      const a=pdf.context.lookup(arr.get(j));
      if(String(a.lookup(PDFName.of('Subtype')))!=='/Link')continue;
      const dest=navigationDestination(pdf,a);
      if(dest instanceof PDFArray&&sourceRefs.has(String(dest.get(0)))){
        assert.equal(String(dest.get(1)),'/XYZ','Back links should return near the source passage');
        returns++;
      }
    }
  }
  assert(returns>=2,'Every source-linked personal endnote requires a visible return link');
  const exactSectionRef=String(pdf.getPage(7).ref);
  let exactReturnCount=0;
  for(let i=originalPages;i<pdf.getPageCount();i++){
    const pg=pdf.getPage(i),arr=pg.node.get(PDFName.of('Annots'))?pg.node.lookup(PDFName.of('Annots'),PDFArray):null;
    if(!arr)continue;
    for(let j=0;j<arr.size();j++){
      const a=pdf.context.lookup(arr.get(j));
      if(String(a.lookup(PDFName.of('Subtype')))!=='/Link')continue;
      const dest=navigationDestination(pdf,a);
      if(dest&&String(dest.get(0))===exactSectionRef)exactReturnCount++;
    }
  }
  assert(exactReturnCount>=2,'Both endnotes must return to exact §1 page 8, not adjacent pages');
  // Test text extraction before checking map-dependent highlights, so failures
  // identify independently whether the appendix text or geometry is broken.
  const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loaded=await pdfjs.getDocument({data:new Uint8Array(bytes),disableFontFace:true,useSystemFonts:false}).promise;
  let str='';
  for(let i=originalPages+1;i<=loaded.numPages;i++){
    const p=await loaded.getPage(i),content=await p.getTextContent();
    str+=content.items.map(x=>x.str||'').join(' ')+'\n';
  }
  assert(strip(str).includes(strip('SearchableTermGamma')),'English personal text missing from extractable PDF layer');
  assert(strip(str).includes(strip('مقدمة العلوم الدقيقة')),'Arabic personal text missing from extractable PDF layer');
  assert(strip(str).includes(strip('التحليل')),'Mixed Arabic/English personal note is not searchable');
  assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(str),'Invisible Arabic search layer contains corrupt control characters');
  assert(strip(str).includes(strip('Des idées françaises')),'Accented French text missing from Unicode layer');
  assert(strip(str).includes(strip('UnattachedSearchablePhi')),'Unattached notes must remain searchable');
  await loaded.destroy();
  if(engine.name()==='chromium'&&!contextSettings?.viewport&&process.env.GNAMMA_QA_VISUAL_PATH){
    const destination=path.resolve(root,process.env.GNAMMA_QA_VISUAL_PATH);
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.writeFileSync(destination,bytes);
  }
  assert(/P1/.test(str)&&/P2/.test(str),'Personal appendix must distinguish P1/P2 from publisher notes');
  await page.locator('input[name=pe-mode][value=none]').check();
  assert(!(await page.locator('#pe-result').isVisible()),'Private download link must clear on no-notes');
  console.log('PASS',engine.name(),contextSettings?.viewport?'mobile':'desktop',
    'P links',forwards,'return links',returns,'new comment boxes',popupAdds,'pages',pdf.getPageCount(),'searchable English/Arabic/French notes',bytes.length);
  fs.unlinkSync(filename);
 }finally{
  if(filename&&fs.existsSync(filename))fs.unlinkSync(filename);
  await b.close();
 }
}
(async()=>{
 try{
  await delay(1500);
  await checkedPdf('daruri.pdf',chromium,null);
  if(process.env.GNAMMA_PHONE_FIXTURE_ONLY==='1')return;
  await checkedPdf('daruri.pdf',webkit,{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await checkedPdf('daruri.pdf',chromium,{viewport:{width:393,height:852},isMobile:true,hasTouch:true,
    userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'});
 }finally{server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});