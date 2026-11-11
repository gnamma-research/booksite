/* Chromium end-to-end generated PDF contract for Pango-verified Arabic
   authorial words in both Study and canonical scholarly Reference. */
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
      id:'arabic-study-reference',kind:'note',title:'ألفاظ الحكم',
      body:'تعليق شخصي على اصطلاح الحكم عند ابن رشد.',
      target:{kind:'quote',section:'11',segment:0,lang:'ar',
        quote:'أما حد الحكم عند أهل السنة فهو عبارة عن خطاب الشرع'},
      created:Date.UTC(2026,9,22),updated:Date.UTC(2026,9,22),
      dateSource:'recorded',deleted:0
    }]
  }));
});
async function pdfTest(name,source,baseCount){
  const ui=page.locator('.gn-es');
  await page.waitForFunction(expected=>
     document.querySelector('#pe-edition')?.value===expected,source,{timeout:35000});
  assert.equal(await ui.locator('#pe-generate').isDisabled(),false,'Local personal export should be ready');
  const received=page.waitForEvent('download',{timeout:180000});
  await ui.locator('#pe-generate').click();
  const d=await received;
  const dest=path.join(os.tmpdir(),name+'-'+Date.now()+'.pdf');
  await d.saveAs(dest);
  await ui.locator('#pe-result').waitFor({state:'visible',timeout:90000});
  const report=await ui.locator('#pe-alert').innerText();
  assert.match(report,/1 clickable phrase highlight/,
    'Arabic authorial text must be precisely linked, not a section-only fallback: '+report);
  const pdf=await PDFDocument.load(fs.readFileSync(dest));
  assert(pdf.getPageCount()>baseCount);
  let forward=0,returning=0;
  for(let index=0;index<pdf.getPageCount();index++){
    const annots=pdf.getPage(index).node.lookupMaybe(PDFName.of('Annots'),PDFArray);
    if(!annots)continue;
    for(let i=0;i<annots.size();i++){
      const obj=pdf.context.lookup(annots.get(i));
      if(String(obj.lookup(PDFName.of('Subtype')))!=='/Link')continue;
      const action=obj.lookup(PDFName.of('A'));
      if(!action)continue;
      const target=pdf.context.lookup(action.lookup(PDFName.of('D')));
      if(!(target instanceof PDFArray))continue;
      const ref=String(target.get(0));
      const destination=pdf.getPages().findIndex(p=>String(p.ref)===ref);
      if(destination>=baseCount&&index<baseCount)forward++;
      if(destination>=0&&destination<baseCount&&index>=baseCount)returning++;
    }
  }
  assert(forward>=2,'Missing source P marker or precise Arabic quotation link '+forward);
  assert(returning>=1,'Missing source return from personal notes');
  fs.unlinkSync(dest);
  console.log('PASS '+name+': Arabic Pango highlight,',forward,'forward and',returning,'return PDF links; pages',pdf.getPageCount());
}
try{
 await page.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:40000});
 const ui=page.locator('.gn-es');await ui.waitFor({timeout:35000});
 await page.waitForFunction(()=>window.GnammaPersonalExportInline?.ready,{timeout:35000});
 await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:35000});
 await ui.locator('[data-es-preset="study"]').click();
 await ui.locator('#pe-personal').check();
 await pdfTest('study-arabic-Pango','editions/study/daruri-study-bilingual-titles-off.pdf',131);
 await ui.getByRole('tab',{name:'Reference'}).click();
 await pdfTest('reference-arabic-Pango','daruri.pdf',243);
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
