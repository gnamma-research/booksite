/* Real Chromium/mobile browser contract for two-tab Daruri Editions.
   Exports an actual personal PDF using source-matched words without visiting
   a secondary page. The source and personal PDF content stay in the browser. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {chromium} from 'playwright';

const origin='http://127.0.0.1:8123/daruri/';
const captures=path.resolve('test-artifacts');
fs.mkdirSync(captures,{recursive:true});
const apparatus=JSON.parse(fs.readFileSync('daruri/editions/apparatus/manifest.json','utf8'));
const wordmaps=JSON.parse(fs.readFileSync('daruri/editions/maps/manifest.json','utf8'));
assert.equal(apparatus.files.length,120);
assert.equal(wordmaps.files.length,12);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1150,height:830},acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
  localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({
    format:'gnamma-reading-desk',version:1,items:[{
      id:'exact-word-audit',kind:'note',
      target:{kind:'quote',section:'11',segment:2,lang:'en',
        quote:'The argument of the People of the Sunna'},
      title:'Strictly located quotation',body:'Personal comparison of the verified sentence.',
      created:Date.UTC(2026,9,22),updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0
    },{
      id:'bookmark-one',kind:'bookmark',target:{kind:'section',section:'20'},
      title:'A bookmarked ruling',body:'',created:Date.UTC(2026,9,22),
      updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0
    },{
      id:'saved-highlight',kind:'quote',
      target:{kind:'quote',section:'22',segment:0,lang:'en',quote:'A saved personal passage'},
      title:'An independent highlight',body:'',created:Date.UTC(2026,9,22),
      updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0
    }]
  }));
});
const ui=page.locator('.gn-es');
const open=ui.locator('[data-es-action="open"]');
const status=ui.locator('.gn-es-availability');
const link=()=>open.getAttribute('href');
const check=async expected=>assert.equal(await status.getAttribute('data-es-status'),expected);
const pressPreset=value=>ui.locator('[data-es-preset="'+value+'"]').click();
const include=key=>ui.locator('[data-es-include="'+key+'"]').click();
try{
  await page.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:40000});
  await ui.waitFor({timeout:40000});
  await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:35000});
  assert.deepEqual(await ui.locator('.gn-es-tab').allTextContents(),['Reading & Study','Reference']);
  assert.equal(await ui.getByRole('tab').count(),2);
  assert.equal(await ui.locator('.gn-es-preset').count(),3);
  assert.equal(await ui.locator('.gn-es-category').count(),0);
  assert.match(await link(),/reading\/daruri-reading-bilingual-titles-off\.pdf\?v=[a-f0-9]+/);
  assert.equal(await ui.locator('#pe-form').count(),1,'Personal PDF form is embedded directly');
  assert.equal(await ui.locator('.gn-es-personal-link').count(),0,'No separate personal-PDF page link');
  await page.waitForFunction(()=>window.GnammaPersonalExportInline?.ready,{timeout:35000});
  await page.waitForFunction(()=>document.querySelector('#pe-edition')?.value.includes('reading/daruri-reading-bilingual-titles-off.pdf'),
    {timeout:20000});
  assert.equal(await ui.locator('[data-es-action="open"]').isVisible(),true);
  assert.equal(await status.isVisible(),false,'Available PDF needs no redundant success banner');
  assert.equal(await ui.locator('[data-es-study-guide]').count(),0,
    'Separate Study Guide PDF must not be presented as another book edition');
  assert.equal(await ui.locator('[data-daruri-bundle="html"]').count(),1,
    'Offline HTML reader belongs inside Editions');
  assert.equal(await ui.getByRole('heading',{name:'Other downloads'}).count(),1,
    'The separate downloads should sit after the PDF edition action');
  const sourceRelease=JSON.parse(fs.readFileSync('daruri/source-archive-manifest.json','utf8'));
  const sourcePanel=ui.locator('[data-es-source]');
  const sourceLink=ui.locator('[data-es-source-download]');
  if(sourceRelease.status==='published'){
    await sourcePanel.waitFor({state:'visible',timeout:20000});
    assert.match(await sourceLink.getAttribute('href'),/\/source\/Daruri_Portable_Scholarly_Source\.zip\?v=[0-9a-f]{12}$/);
    assert.equal(await sourceLink.getAttribute('download'),'Daruri_Portable_Scholarly_Source.zip');
    assert.equal((await ui.locator('[data-es-source-hash]').textContent()).trim(),sourceRelease.sha256);
    assert.equal(await ui.locator('.gn-es-source-more').count(),1,'Source detail disclosure belongs to research ZIP');
    const received=page.waitForEvent('download',{timeout:30000});
    await sourceLink.click();
    const save=await received;
    assert.equal(save.suggestedFilename(),'Daruri_Portable_Scholarly_Source.zip');
    const payload=fs.readFileSync(await save.path());
    assert.equal(payload.length,sourceRelease.size_bytes,'Downloaded source ZIP must have release size');
    assert.equal(crypto.createHash('sha256').update(payload).digest('hex'),sourceRelease.sha256,
      'Downloaded research archive must match the published ZIP SHA-256');
  }else{
    assert.equal(await sourcePanel.isVisible(),false,
      'Unapproved scholarly ZIP must not display a dead download link');
    assert.equal(await sourceLink.getAttribute('href'),null,
      'Unapproved scholarly ZIP must never have an active URL');
  }
  const alignment=await ui.locator('.gn-es-language-label').evaluateAll(nodes=>
    nodes.map(n=>{const r=n.getBoundingClientRect();return (r.top+r.bottom)/2;}));
  assert.ok(Math.abs(alignment[0]-alignment[1])<=1,
    'Vowelled AR must stay centred on the same baseline as EN: '+alignment);
  await ui.locator('#gn-es-prepare').click();
  await ui.locator('[data-es-action="download"]').waitFor({state:'visible',timeout:50000});
  assert.equal(await ui.locator('#gn-es-prepare').isVisible(),false);
  assert.equal(await ui.locator('#gn-es-prepare-status').isVisible(),false);
  const preparedDownload=page.waitForEvent('download',{timeout:20000});
  await ui.locator('[data-es-action="download"]').click();
  assert.match((await preparedDownload).suggestedFilename(),/daruri-reading-bilingual-titles-off\.pdf/);
  await ui.locator('[data-es-toggle="ar"]').click();
  await check('ready');
  assert.equal(await ui.locator('[data-es-preset="study"]').isDisabled(),true,
    'Study may not silently change an English-only source to bilingual');
  assert.equal((await page.evaluate(()=>window.GnammaEditions.__getPublicationSelection())).settings.ar,false);
  assert.equal(await ui.locator('#gn-es-prepare').isVisible(),true,
    'Changing edition settings invalidates the old prepared download');
  await ui.locator('[data-es-toggle="ar"]').click();
  await check('ready');
  assert.equal((await page.evaluate(()=>window.GnammaEditions.__getPublicationSelection())).settings.vowels,false,
    'Second AR state is plain, without vowel marks');
  assert.equal(await ui.locator('[data-es-preset="study"]').isDisabled(),true);
  assert.equal(await ui.locator('[data-es-toggle="ar"] .gn-es-ar-form').innerText(),'Plain');
  await ui.locator('[data-es-toggle="ar"]').click();
  await check('ready');
  assert.equal((await page.evaluate(()=>window.GnammaEditions.__getPublicationSelection())).settings.vowels,true);
  assert.equal(await ui.locator('[data-es-preset="study"]').isDisabled(),false);
  assert.equal(await ui.locator('[data-es-toggle="vowels"]').count(),0,
    'The redundant vowel-mark control is gone');

  await ui.locator('#pe-personal').check();
  await page.waitForFunction(()=>document.querySelector('input[name="pe-mode"]:checked')?.value==='all');
  assert.equal(await ui.locator('#pe-generate').isVisible(),true);
  assert.equal(await ui.locator('[data-es-action="open"]').isVisible(),false);
  assert.equal(await ui.locator('#pe-generate').isDisabled(),false);
  assert.equal(await ui.locator('#pe-edition').inputValue(),
    'editions/reading/daruri-reading-bilingual-titles-off.pdf');
  assert.equal(await ui.locator('#pe-count').isVisible(),true);
  assert.match(await ui.locator('#pe-count').innerText(),/1 qualifying item/);

  // Generate a P-numbered personal PDF; the user decides when to download.
  await ui.locator('#pe-generate').click();
  await ui.locator('#pe-result').waitFor({state:'visible',timeout:150000});
  const downloading=page.waitForEvent('download',{timeout:20000});
  await ui.locator('#pe-result-link').click();
  const receipt=await downloading;
  assert.match(receipt.suggestedFilename(),/daruri-reading-bilingual-titles-off-personal-\d{4}-\d\d-\d\d\.pdf/);
  assert.match(await ui.locator('#pe-alert').innerText(),/1 personal item included/);
  assert.match(await ui.locator('#pe-alert').innerText(),/1 clickable phrase highlight/,
    'The certified source quotation should become exactly one clickable word-level highlight');
  assert.equal(await ui.locator('#pe-open').getAttribute('href')!==null,true);

  // Switching Study changes the PDF but not the user's private note settings.
  await pressPreset('study');
  await check('ready');
  assert.equal(await ui.locator('#pe-personal').isChecked(),true);
  assert.equal(await ui.locator('#pe-edition').inputValue(),
    'editions/study/daruri-study-bilingual-titles-off.pdf');
  assert.equal(await ui.locator('[data-es-toggle="ar"]').isDisabled(),true);
  assert.match(await ui.locator('.gn-es-spec-notes').textContent(),/Publisher notes: Selected/);
  await pressPreset('reading');
  await check('ready');
  await pressPreset('custom');
  assert.equal(await ui.locator('#gn-es-custom').isVisible(),true);
  await include('glossary');
  await include('index');
  await check('ready');
  assert.match(await ui.locator('#pe-edition').inputValue(),/apparatus\/daruri-reading-bilingual-glossary-index\.pdf/);
  assert.match(await ui.locator('.gn-es-spec-apparatus').textContent(),/Glossary · Full index/);

  // The same personal controls must work inside scholarly Reference.
  await ui.getByRole('tab',{name:'Reference'}).click();
  await check('ready');
  assert.equal(await ui.locator('[data-es-reference-inventory]').isVisible(),true);
  assert.equal(await ui.locator('#pe-edition').inputValue(),'daruri.pdf');
  assert.equal(await ui.locator('#pe-personal').isChecked(),true);
  assert.equal(await ui.locator('[data-daruri-bundle="html"]').isVisible(),true);
  await ui.locator('#pe-bookmarks').check();
  assert.match(await ui.locator('#pe-count').innerText(),/2 qualifying items/);
  await ui.locator('#pe-highlights').check();
  assert.match(await ui.locator('#pe-count').innerText(),/3 qualifying items/,
    'Highlights must be included independently of notes and bookmarks');
  await ui.getByRole('tab',{name:'Reading & Study'}).click();
  await ui.locator('#pe-personal').uncheck();
  await ui.locator('#pe-bookmarks').uncheck();
  await ui.locator('#pe-highlights').uncheck();
  assert.equal(await ui.locator('[data-es-action="open"]').isVisible(),true);
  await page.screenshot({path:path.join(captures,'daruri-two-tabs-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(captures,'daruri-two-tabs-mobile.png'),fullPage:true});
  const measurement=await page.evaluate(()=>{
    const root=document.querySelector('.gn-es'),panel=root.querySelector('#gn-es-panel');
    const action=root.querySelector('#gn-es-prepare');
    const buttons=[...root.querySelectorAll('button')].filter(n=>!n.hidden&&n.getClientRects().length);
    return {overflow:document.documentElement.scrollWidth-innerWidth,
      minButton:Math.min(...buttons.map(n=>n.getBoundingClientRect().height)),
      actionWidth:action.getBoundingClientRect().width,panelWidth:panel.getBoundingClientRect().width};
  });
  assert.ok(measurement.overflow<=2,'Mobile overflow '+JSON.stringify(measurement));
  assert.ok(measurement.minButton>=40,'Touch targets too small '+measurement.minButton);
  assert.ok(Math.abs(measurement.actionWidth-measurement.panelWidth)<25,'Asymmetric PDF action '+JSON.stringify(measurement));
  await page.setViewportSize({width:320,height:690});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'320px overflow');
  assert.deepEqual(errors,[],'Uncaught JavaScript runtime exceptions');
  console.log('PASS: real verified PDF preparation/download, no duplicate Study Guide/status, independent personal export, offline HTML choice and mobile layout');
}finally{
  await context.close();
  await browser.close();
}
