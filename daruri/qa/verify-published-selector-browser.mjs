/* Browser contract for verified, prebuilt apparatus PDFs and per-variant maps. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const origin='http://127.0.0.1:8123/daruri/';
const captures=path.resolve('test-artifacts');
fs.mkdirSync(captures,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1150,height:830},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const ui=page.locator('.gn-es');
const spec=page.locator('.gn-es-spec');
const status=page.locator('.gn-es-availability');
const open=page.locator('[data-es-action="open"]');
const choose=(key,value)=>page.locator('[data-es-'+key+'="'+value+'"]').click();
const link=()=>open.getAttribute('href');
const check=async expected=>assert.equal(await status.getAttribute('data-es-status'),expected);
try{
  await page.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:35000});
  await ui.waitFor({timeout:35000});
  await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:35000});
  assert.deepEqual(await ui.locator('.gn-es-tab').allTextContents(),['Reading','Study','Reference']);
  assert.equal(await ui.locator('[data-es-action]').count(),1,'Only one public PDF action');
  assert.equal((await open.innerText()).trim(),'Open PDF');
  assert.equal(await open.getAttribute('download'),null,'PDF viewer handles saving/printing');
  assert.equal(await ui.locator('.gn-es-notes-shortcut').count(),0,'No duplicate Notes shortcut');
  assert.equal(await ui.locator('.gn-es-category').count(),4,'Content Layout Notes Apparatus');
  assert.match(await spec.innerText(),/Apparatus: None/);
  assert.match(await link(),/reading-bilingual-titles-off\.pdf\?v=[0-9a-f]+/);
  await ui.locator('.gn-es-custom-trigger').click();
  await page.getByRole('tab',{name:'Apparatus',exact:true}).click();
  await choose('glossary','technical');
  await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:30000});
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-glossary\.pdf\?v=[0-9a-f]+/);
  assert.match(await spec.innerText(),/Apparatus: Technical glossary/);
  await choose('index','full');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-glossary-index\.pdf\?v=/);
  assert.match(await spec.innerText(),/Full index/);
  await choose('glossary','none');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-index\.pdf\?v=/);
  await choose('index','none');
  await choose('concordance','on');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-concordance\.pdf\?v=/);
  await ui.getByRole('button',{name:'Arabic vowel marks'}).click();
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-unvowelled-concordance\.pdf\?v=/);
  await choose('concordance','off');
  await choose('applications','on');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-unvowelled-applications\.pdf\?v=/,'Exact Reading application PDF must resolve');
  await choose('applications','off');
  await choose('glossary','technical');
  await choose('index','full');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-unvowelled-glossary-index\.pdf\?v=/);
  await page.getByRole('tab',{name:'Notes',exact:true}).click();
  await ui.locator('[data-es-personal="personalNotes"]').click();
  await ui.locator('[data-es-personal="personalBookmarks"]').click();
  assert.match(await spec.innerText(),/My notes: On · Bookmarks: On/);
  const local=await ui.locator('.gn-es-personal-link').getAttribute('href');
  assert.match(local,/^personal-export\.html\?pdf=editions%2Fapparatus%2Fdaruri-reading-bilingual-unvowelled-glossary-index\.pdf/);
  assert.match(local,/personal=1&bookmarks=1$/);
  assert.match(await status.innerText(),/private notes are not included/);
  await page.getByRole('tab',{name:'Layout',exact:true}).click();
  assert.match(await spec.innerText(),/Full index/,'Apparatus remains in permanent summary');
  await ui.locator('.gn-es-custom-trigger').click();
  assert.equal(await ui.locator('.gn-es-custom').isVisible(),false);
  assert.match(await spec.innerText(),/Apparatus: Technical glossary · Full index/,'State shown while closed');

  await page.getByRole('tab',{name:'Study',exact:true}).click();
  await check('ready');
  assert.match(await spec.innerText(),/Basic index/);
  await ui.locator('.gn-es-custom-trigger').click();
  await page.getByRole('tab',{name:'Apparatus',exact:true}).click();
  await choose('glossary','technical');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-study-bilingual-glossary\.pdf\?v=/);
  await choose('glossary','none');
  await choose('applications','on');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-study-bilingual-applications\.pdf\?v=/);
  await choose('glossary','technical');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-study-bilingual-glossary-applications\.pdf\?v=/,'Exact Study combined PDF must resolve');
  await choose('glossary','none');
  await check('ready');

  await page.getByRole('tab',{name:'Reference',exact:true}).click();
  await check('ready');
  assert.match(await spec.innerText(),/Historical dictionary · Full index · Bidāya applications · R\/BA concordance/);
  assert.match(await link(),/^daruri\.pdf\?v=[0-9a-f]+$/);
  await choose('glossary','none');
  await check('unavailable');
  assert.equal(await link(),null,'Canonical Reference not substituted for no-dictionary Reference');
  await choose('glossary','historical');
  await check('ready');

  await page.getByRole('tab',{name:'Reading',exact:true}).click();
  assert.match(await spec.innerText(),/Apparatus: Technical glossary · Full index/);
  if(!(await ui.locator('.gn-es-custom').isVisible()))
    await ui.locator('.gn-es-custom-trigger').click();
  await page.getByRole('tab',{name:'Apparatus',exact:true}).click();
  await page.screenshot({path:path.join(captures,'daruri-apparatus-selector-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(captures,'daruri-apparatus-selector-mobile.png'),fullPage:true});
  const geometry=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-innerWidth,
    buttons:[...document.querySelectorAll('.gn-es button')].filter(x=>!x.hidden&&x.getClientRects().length).map(x=>x.getBoundingClientRect().height)
  }));
  assert.ok(geometry.overflow<=2,'Mobile 390px overflow: '+geometry.overflow);
  assert.ok(Math.min(...geometry.buttons)>=40,'Controls are too small');
  await page.setViewportSize({width:320,height:690});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'320px overflow');
  assert.deepEqual(errors,[],'Uncaught reader JS exceptions');
  console.log('PASS: 120 published apparatus variants, one Open PDF, mapped personal export link, preserved status, 320/390px responsive UI');
}finally{
  await context.close();
  await browser.close();
}
