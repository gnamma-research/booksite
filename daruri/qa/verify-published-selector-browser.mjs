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
const pressPreset=value=>ui.locator('[data-es-book-edition="'+value+'"]').click();
const include=key=>ui.locator('[data-es-include="'+key+'"]').click();
try{
  await page.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:40000});
  await ui.waitFor({timeout:40000});
  await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:35000});
  assert.deepEqual(await ui.locator('[data-es-download-type] strong').allTextContents(),
    ['Book PDF','Study Guide','Offline reader','Research files']);
  assert.equal(await ui.locator('[data-es-download-type]').count(),4);
  assert.equal(await ui.getByRole('tab').count(),4,'Only four top-level download destinations');
  assert.equal(await ui.locator('[data-es-book-edition]').count(),3);
  assert.equal(await ui.locator('.gn-es-book-edition-choices button[aria-pressed="true"]').count(),1);
  assert.equal(await ui.locator('.gn-es-personal-disclosure').isVisible(),true);
  assert.equal(await ui.locator('.gn-es-personal-disclosure').getAttribute('open'),null,
    'Personal entry selection should be collapsed by default');
  assert.equal(await ui.locator('#gn-es-custom').isVisible(),false,
    'Rare PDF customization should be collapsed by default');
  assert.match(await link(),/reading\/daruri-reading-bilingual-titles-off\.pdf\?v=[a-f0-9]+/);
  assert.equal(await ui.locator('#pe-form').count(),1,'One inline personal exporter');
  await page.waitForFunction(()=>window.GnammaPersonalExportInline?.ready,{timeout:35000});
  await page.waitForFunction(()=>document.querySelector('#pe-edition')?.value.includes('reading/daruri-reading-bilingual-titles-off.pdf'),
    {timeout:20000});
  assert.equal(await ui.locator('[data-es-action="open"]').isVisible(),true);
  assert.equal(await ui.locator('#gn-es-prepare').isVisible(),false);
  assert.equal(await ui.locator('[data-es-action="download"]').isVisible(),true);
  assert.equal(await ui.locator('[data-es-action="download"]').getAttribute('href'),await link(),
    'Book PDF download and View PDF must refer to the identical published file');
  assert.equal((await ui.locator('[data-es-action="open"] span').textContent()).trim(),
    'View in browser','Desktop preview should say View in browser');
  assert.equal(await ui.locator('[data-es-action="open"]').getAttribute('download'),null,
    'Desktop View in browser is ordinary navigation, not a forced download');
  assert.equal(await ui.locator('[data-es-ios-save-help]').isVisible(),false,
    'iPhone/iPad saving directions must not appear on desktop');
  assert.equal(await status.isVisible(),false,'No success banner when a PDF is ready');
  const desktop=await page.evaluate(()=>{
    const nav=document.querySelector('.gn-es-download-types').getBoundingClientRect();
    const panel=document.querySelector('.gn-es-download-content').getBoundingClientRect();
    return {navRight:nav.right,panelLeft:panel.left,navWidth:nav.width,
      panelWidth:panel.width,overflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert.ok(desktop.panelLeft>=desktop.navRight-2,'Desktop download rail must sit beside, not above, content: '+JSON.stringify(desktop));
  assert.ok(desktop.navWidth<=230&&desktop.panelWidth>=360,'Compact desktop navigation must leave room for documents: '+JSON.stringify(desktop));
  await page.screenshot({path:path.join(captures,'daruri-downloads-desktop-default.png'),fullPage:true});
  await page.screenshot({path:path.join(captures,'daruri-downloads-desktop-viewport.png')});

  // Every other download type must be immediately reachable without the PDF settings.
  await ui.locator('[data-es-download-type="guide"]').click();
  assert.equal(await ui.locator('#gn-es-book-panel').isVisible(),false);
  assert.equal(await ui.locator('#gn-es-guide-panel').isVisible(),true);
  assert.equal(await ui.locator('a[download]:has-text("Download Study Guide (PDF)")').count(),1);
  const guideDownload=page.waitForEvent('download',{timeout:30000});
  await ui.locator('a[download]:has-text("Download Study Guide (PDF)")').click();
  const guideFile=await guideDownload;
  assert.match(guideFile.suggestedFilename(),/daruri-study-guide\.pdf/);
  assert.equal(fs.readFileSync(await guideFile.path()).subarray(0,5).toString('ascii'),'%PDF-');

  await ui.locator('[data-es-download-type="offline"]').click();
  assert.equal(await ui.locator('#gn-es-offline-panel').isVisible(),true);
  assert.equal(await ui.locator('[data-es-download-type="offline"]').isVisible(),true);
  assert.equal(await ui.locator('[data-daruri-bundle="full"]').isVisible(),false,
    'Offline reader and larger PDF-inclusive ZIP must remain separate options');

  await ui.locator('[data-es-download-type="source"]').click();
  const sourceRelease=JSON.parse(fs.readFileSync('daruri/source-archive-manifest.json','utf8'));
  const sourcePanel=ui.locator('[data-es-source]');
  const sourceLink=ui.locator('[data-es-source-download]');
  if(sourceRelease.status==='published'){
    await sourcePanel.waitFor({state:'visible',timeout:20000});
    assert.match(await sourceLink.getAttribute('href'),/\/source\/Daruri_Portable_Scholarly_Source\.zip\?v=[0-9a-f]{12}$/);
    assert.equal(await sourceLink.getAttribute('download'),'Daruri_Portable_Scholarly_Source.zip');
    assert.equal((await ui.locator('[data-es-source-hash]').textContent()).trim(),sourceRelease.sha256);
    const received=page.waitForEvent('download',{timeout:30000});
    await sourceLink.click();
    const zip=await received;
    assert.equal(zip.suggestedFilename(),'Daruri_Portable_Scholarly_Source.zip');
    const payload=fs.readFileSync(await zip.path());
    assert.equal(payload.length,sourceRelease.size_bytes);
    assert.equal(crypto.createHash('sha256').update(payload).digest('hex'),sourceRelease.sha256);
  }else{
    assert.equal(await sourcePanel.isVisible(),false);
    assert.equal(await sourceLink.getAttribute('href'),null);
  }
  await ui.locator('[data-es-download-type="book"]').click();
  assert.equal(await ui.locator('#gn-es-book-panel').isVisible(),true);
  const alignment=await ui.locator('.gn-es-language-label').evaluateAll(nodes=>
    nodes.map(n=>{const r=n.getBoundingClientRect();return (r.top+r.bottom)/2;}));
  assert.ok(Math.abs(alignment[0]-alignment[1])<=1,
    'Vowelled AR must stay centred on the same baseline as EN: '+alignment);
  const published=ui.locator('[data-es-action="download"]');
  const nativeDownload=page.waitForEvent('download',{timeout:25000});
  await published.click();
  assert.match((await nativeDownload).suggestedFilename(),/daruri-reading-bilingual-titles-off\.pdf/);
  await ui.locator('[data-es-toggle="ar"]').click();
  await check('ready');
  await pressPreset('study');
  assert.match(await ui.locator('[data-es-choice-message]').textContent(),/bilingual|English and vowelled Arabic/i,
    'Study may not silently change an English-only source to bilingual');
  assert.equal((await page.evaluate(()=>window.GnammaEditions.__getPublicationSelection())).settings.ar,false);
  assert.match(await ui.locator('[data-es-action="download"]').getAttribute('href'),/reading\/daruri-reading-english-titles-off\.pdf/,
    'Changing language must update the native download to the new PDF');
  await ui.locator('[data-es-toggle="ar"]').click();
  await check('ready');
  assert.equal((await page.evaluate(()=>window.GnammaEditions.__getPublicationSelection())).settings.vowels,false,
    'Second AR state is plain, without vowel marks');
  assert.equal(await ui.locator('[data-es-book-edition="reading"]').getAttribute('aria-pressed'),'true');
  assert.equal(await ui.locator('[data-es-toggle="ar"] .gn-es-ar-form').innerText(),'Plain');
  await ui.locator('[data-es-toggle="ar"]').click();
  await check('ready');
  assert.equal((await page.evaluate(()=>window.GnammaEditions.__getPublicationSelection())).settings.vowels,true);
  assert.equal(await ui.locator('[data-es-choice-message]').textContent(),'');
  assert.equal(await ui.locator('[data-es-toggle="vowels"]').count(),0,
    'The redundant vowel-mark control is gone');

  await ui.locator('.gn-es-personal-disclosure summary').click();
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
  await ui.locator('[data-es-custom]').click();
  assert.equal(await ui.locator('#gn-es-custom').isVisible(),true);
  await include('glossary');
  await include('index');
  await check('ready');
  assert.match(await ui.locator('#pe-edition').inputValue(),/apparatus\/daruri-reading-bilingual-glossary-index\.pdf/);
  assert.match(await ui.locator('.gn-es-spec-apparatus').textContent(),/Glossary · Full index/);

  // The same personal controls must work inside scholarly Reference.
  await pressPreset('reference');
  await check('ready');
  assert.equal(await ui.locator('[data-es-reference-inventory]').isVisible(),true);
  assert.equal(await ui.locator('#pe-edition').inputValue(),'daruri.pdf');
  assert.equal(await ui.locator('#pe-personal').isChecked(),true);
  assert.equal(await ui.locator('[data-es-download-type="offline"]').isVisible(),true);
  await ui.locator('#pe-bookmarks').check();
  assert.match(await ui.locator('#pe-count').innerText(),/2 qualifying items/);
  await ui.locator('#pe-highlights').check();
  assert.match(await ui.locator('#pe-count').innerText(),/3 qualifying items/,
    'Highlights must be included independently of notes and bookmarks');
  await pressPreset('reading');
  await ui.locator('#pe-personal').uncheck();
  await ui.locator('#pe-bookmarks').uncheck();
  await ui.locator('#pe-highlights').uncheck();
  assert.equal(await ui.locator('[data-es-action="open"]').isVisible(),true);
  await page.screenshot({path:path.join(captures,'daruri-two-tabs-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(captures,'daruri-two-tabs-mobile.png'),fullPage:true});
  const measurement=await page.evaluate(()=>{
    const root=document.querySelector('.gn-es'),panel=root.querySelector('#gn-es-panel');
    const action=root.querySelector('[data-es-action="download"]');
    const buttons=[...root.querySelectorAll('button')].filter(n=>!n.hidden&&n.getClientRects().length);
    return {overflow:document.documentElement.scrollWidth-innerWidth,
      minButton:Math.min(...buttons.map(n=>n.getBoundingClientRect().height)),
      actionWidth:action.getBoundingClientRect().width,panelWidth:panel.getBoundingClientRect().width};
  });
  assert.ok(measurement.overflow<=2,'Mobile overflow '+JSON.stringify(measurement));
  assert.ok(measurement.minButton>=40,'Touch targets too small '+measurement.minButton);
  assert.ok(Math.abs(measurement.actionWidth-measurement.panelWidth)<25,'Asymmetric direct PDF action '+JSON.stringify(measurement));
  const choices=await ui.locator('[data-es-download-type]').evaluateAll(items=>
    items.map(item=>{const r=item.getBoundingClientRect();return{x:r.x,y:r.y,height:r.height,width:r.width};}));
  assert.equal(choices.length,4);
  assert.ok(Math.abs(choices[0].y-choices[1].y)<3 && choices[2].y>choices[0].y,
    'On phones the four download purposes must form a compact 2x2 grid: '+JSON.stringify(choices));
  await page.setViewportSize({width:320,height:690});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'320px overflow');
  assert.deepEqual(errors,[],'Uncaught JavaScript runtime exceptions');

  // Emulate an iPhone Safari user agent to verify the page shows only a
  // truthful preview action. Chromium emulation checks our UI branch, not a
  // claim that a physical device was tested.
  const appleContext=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,
    hasTouch:true,acceptDownloads:true,reducedMotion:'reduce',
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'
  });
  try{
    const applePage=await appleContext.newPage();
    await applePage.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:40000});
    const appleUI=applePage.locator('.gn-es');
    await appleUI.waitFor({timeout:40000});
    await applePage.waitForFunction(()=>
      window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',
      {timeout:40000});
    const appleView=appleUI.locator('[data-es-action="open"]');
    assert.equal(await appleView.isVisible(),true,'Apple mobile must offer View PDF');
    assert.equal(await appleUI.locator('[data-es-action="download"]').isVisible(),false,
      'Apple mobile must not display redundant PDF Download');
    assert.equal((await appleView.locator('span').textContent()).trim(),'View PDF');
    assert.ok((await appleView.getAttribute('class')).includes('gn-es-action-primary'),
      'View PDF must be the one prominent iPhone button');
    assert.match(await appleView.getAttribute('href'),/reading\\/daruri-reading-bilingual-titles-off\\.pdf\\?v=[a-f0-9]+/);
    assert.equal(await appleView.getAttribute('download'),null);
    assert.equal(await appleUI.locator('[data-es-ios-save-help]').isVisible(),true);
    assert.match(await appleUI.locator('[data-es-ios-save-help]').textContent(),
      /Share.*Save to Files/);
    assert.ok(await applePage.evaluate(()=>
      document.documentElement.scrollWidth-innerWidth)<=2,'iPhone preview UI must not overflow');
    // The mobile preview-only rule must not interfere with personalized PDFs.
    await appleUI.locator('.gn-es-personal-disclosure summary').click();
    await appleUI.locator('#pe-personal').check();
    assert.equal(await appleView.isVisible(),false);
    assert.equal(await appleUI.locator('[data-es-ios-save-help]').isVisible(),false);
    assert.equal(await appleUI.locator('#pe-generate').isVisible(),true);
    await applePage.screenshot({path:path.join(captures,'daruri-downloads-iphone-preview.png')});
  }finally{
    await appleContext.close();
  }
  console.log('PASS: desktop Download + View in browser, Apple mobile View PDF + Save to Files, personal PDF and source/Study downloads');
}finally{
  await context.close();
  await browser.close();
}
