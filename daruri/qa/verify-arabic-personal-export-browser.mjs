/* Browser-only end-to-end native Arabic precise-word PDF export smoke test. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {chromium} from 'playwright';
import {PDFDocument,PDFName,PDFArray} from 'pdf-lib';

const origin='http://127.0.0.1:8123/daruri/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({
  format:'gnamma-reading-desk',version:1,items:[{
   id:'arabic-precise-fixture',kind:'note',
   target:{kind:'quote',section:'11',segment:0,lang:'ar',
     quote:'أما حد الحكم عند أهل السنة فهو عبارة عن خطاب الشرع'},
   title:'دقة موضع العبارة',body:'هذه ملاحظة تجريبية مرتبطة بعبارة عربية.',
   created:Date.UTC(2026,9,22),updated:Date.UTC(2026,9,22),
   dateSource:'recorded',deleted:0
  }]
 }));
});
try{
 await page.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:35000});
 const ui=page.locator('.gn-es');
 await ui.waitFor({timeout:30000});
 await page.waitForFunction(()=>window.GnammaPersonalExportInline?.ready,{timeout:30000});
 await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:30000});
 const en=ui.locator('[data-es-toggle="en"]');
 await en.click();
 const first='editions/reading/daruri-reading-arabic-vowelled-titles-off.pdf';
 await page.waitForFunction(expected=>
   document.querySelector('#pe-edition')?.value===expected,first,{timeout:30000});
 await ui.locator('#pe-personal').check();
 assert.equal(await ui.locator('#pe-generate').isDisabled(),false);
 const done=page.waitForEvent('download',{timeout:180000});
 await ui.locator('#pe-generate').click();
 const downloaded=await done;
 assert.match(downloaded.suggestedFilename(),/daruri-reading-arabic-vowelled-titles-off-personal/);
 const out=path.join(os.tmpdir(),'daruri-arabic-precise-'+Date.now()+'.pdf');
 await downloaded.saveAs(out);
 await ui.locator('#pe-result').waitFor({state:'visible',timeout:180000});
 const alert=await ui.locator('#pe-alert').innerText();
 assert.match(alert,/1 clickable phrase highlight/,'A saved Arabic quote must gain a verified word-level highlight: '+alert);
 const pdf=await PDFDocument.load(fs.readFileSync(out));
 assert(pdf.getPageCount()>37,'P-numbered endnote appendix must be appended');
 let links=0;
 for(let i=0;i<pdf.getPageCount();i++){
  const annots=pdf.getPage(i).node.lookupMaybe(PDFName.of('Annots'),PDFArray);
  if(!annots)continue;
  for(let k=0;k<annots.size();k++){
   const annot=pdf.context.lookup(annots.get(k));
   if(String(annot.lookup(PDFName.of('Subtype')))==='/Link')links++;
  }
 }
 assert(links>=2,'The Arabic personal PDF must retain source and return links');

 if(process.env.GNAMMA_ARABIC_PHONE_FIXTURE==='1'){
  const dir=path.join('daruri','qa','phone-output');
  fs.mkdirSync(dir,{recursive:true});
  fs.copyFileSync(out,path.join(dir,'personal-pdf-sample.pdf'));
  const maps=JSON.parse(fs.readFileSync('daruri/editions/maps/daruri-reading-arabic-vowelled-titles-off.pdf.json','utf8'));
  const first=maps.segments['11:0:vocalized']?.[0];
  assert(first&&Number.isInteger(first[1])&&first[1]>=1&&first[1]<=37);
  fs.writeFileSync(path.join(dir,'arabic-source.json'),
   JSON.stringify({basePages:37,sourcePage:first[1]-1,
     notePage:37,pdf:'personal-pdf-sample.pdf',quote:'أما حد الحكم عند أهل السنة فهو عبارة عن خطاب الشرع'},null,2));
  console.log('EXPORTED ARABIC NATIVE PHONE FIXTURE',first[1]-1,'base pages 37');
 }
 assert.deepEqual(errors,[]);
 fs.unlinkSync(out);
 console.log('PASS real Arabic vowelled PDF: one P-numbered note and one precise linked phrase highlight; native annotations',links);
}finally{
 await browser.close();
}
