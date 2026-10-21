/* Browser QA for the compact-row, verified Daruri PDF selector. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const origin='http://127.0.0.1:8123/daruri/';
const captures=path.resolve('test-artifacts');
fs.mkdirSync(captures,{recursive:true});
const apparatus=JSON.parse(fs.readFileSync('daruri/editions/apparatus/manifest.json','utf8'));
const expanded=apparatus.files.length===120;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1150,height:830},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const ui=page.locator('.gn-es');
const status=ui.locator('.gn-es-availability');
const open=ui.locator('[data-es-action="open"]');
const link=()=>open.getAttribute('href');
const check=async expected=>assert.equal(await status.getAttribute('data-es-status'),expected);
const include=key=>ui.locator('[data-es-include="'+key+'"]').click();
const tab=name=>ui.getByRole('tab',{name,exact:true}).click();
try{
  await page.goto(origin+'#editions',{waitUntil:'domcontentloaded',timeout:35000});
  await ui.waitFor({timeout:35000});
  await page.waitForFunction(()=>window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',{timeout:35000});
  assert.deepEqual(await ui.locator('.gn-es-tab').allTextContents(),['Reading','Study','Reference']);
  assert.equal(await ui.locator('.gn-es-category').count(),0,'No nested setting tabs');
  assert.equal(await ui.locator('.gn-es-setting').count(),4,'Text, Headings, Include, My copy');
  assert.equal(await ui.locator('.gn-es-include').count(),4,'Four concise apparatus controls');
  assert.equal(await ui.locator('.gn-es-personal-choice').count(),2,'Notes and bookmarks');
  assert.equal(await ui.locator('[data-es-action]').count(),1,'One public PDF action');
  assert.equal((await open.innerText()).trim(),'Open PDF');
  assert.equal(await open.getAttribute('download'),null,'Browser PDF viewer handles saving and printing');
  assert.match(await link(),/reading-bilingual-titles-off\.pdf\?v=[a-f0-9]+/);
  assert.equal(await ui.locator('[data-es-custom] svg.gn-es-custom-arrow').count(),1,'Chevron is vector geometry');
  assert.equal(await ui.locator('.gn-es-personal-link').isVisible(),false);

  await include('glossary');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-glossary\.pdf\?v=/);
  await include('index');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-reading-bilingual-glossary-index\.pdf\?v=/);
  await include('applications');
  await check(expanded?'ready':'unavailable');
  if(expanded)assert.match(await link(),/apparatus\/daruri-reading-bilingual-glossary-index-applications\.pdf\?v=/);
  else assert.equal(await link(),null,'No unmatched PDF may open');
  await include('applications');
  await check('ready');
  await ui.locator('[data-es-personal="personalNotes"]').click();
  await ui.locator('[data-es-personal="personalBookmarks"]').click();
  assert.equal(await ui.locator('.gn-es-personal-link').isVisible(),true);
  const href=await ui.locator('.gn-es-personal-link').getAttribute('href');
  assert.match(href,/personal-export\.html\?pdf=editions%2Fapparatus%2Fdaruri-reading-bilingual-glossary-index\.pdf/);
  assert.match(href,/personal=1&bookmarks=1$/);
  assert.match(await ui.locator('.gn-es-spec').innerText(),/My notes: On · Bookmarks: On/);
  await ui.locator('[data-es-custom]').click();
  assert.equal(await ui.locator('#gn-es-custom').isVisible(),true);
  await ui.locator('[data-es-custom]').click();
  assert.equal(await ui.locator('#gn-es-custom').isVisible(),false);

  await tab('Study');
  await check('ready');
  assert.equal(await ui.locator('[data-es-toggle="en"]').isDisabled(),true);
  assert.equal(await ui.locator('[data-es-toggle="vowels"]').isDisabled(),true);
  assert.match(await ui.locator('.gn-es-spec').innerText(),/Basic index/);
  await include('applications');
  await check('ready');
  assert.match(await link(),/apparatus\/daruri-study-bilingual-applications\.pdf\?v=/);
  await include('glossary');
  await check(expanded?'ready':'unavailable');
  if(expanded)assert.match(await link(),/apparatus\/daruri-study-bilingual-glossary-applications\.pdf\?v=/);
  else assert.equal(await link(),null,'New Study combination cannot resolve before publication');

  await tab('Reference');
  await check('ready');
  assert.match(await link(),/^daruri\.pdf\?v=[a-f0-9]+$/);
  assert.equal(await ui.locator('[data-es-include-buttons]').isVisible(),false);
  assert.equal(await ui.locator('[data-es-ref-inventory]').isVisible(),true);
  assert.equal(await ui.locator('[data-es-heading-buttons]').isVisible(),false);
  assert.equal(await ui.locator('[data-es-heading-fixed]').isVisible(),true);
  assert.match(await ui.locator('.gn-es-spec').innerText(),/Historical dictionary/);

  await tab('Reading');
  await page.screenshot({path:path.join(captures,'daruri-compact-editions-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(captures,'daruri-compact-editions-mobile.png'),fullPage:true});
  const sizes=await page.evaluate(()=>{
    const a=document.querySelector('.gn-es-action').getBoundingClientRect();
    const p=document.querySelector('#gn-es-panel').getBoundingClientRect();
    const c=document.querySelector('.gn-es-custom-arrow').getBoundingClientRect();
    const buttons=[...document.querySelectorAll('.gn-es button')].filter(n=>!n.hidden&&n.getClientRects().length);
    return {overflow:document.documentElement.scrollWidth-innerWidth,
      buttonMin:Math.min(...buttons.map(n=>n.getBoundingClientRect().height)),
      actionWidth:a.width,panelWidth:p.width,chevronWidth:c.width};
  });
  assert.ok(sizes.overflow<=2,'390px overflow '+sizes.overflow);
  assert.ok(sizes.buttonMin>=40,'Touch targets must be at least 40px '+sizes.buttonMin);
  assert.ok(Math.abs(sizes.actionWidth-sizes.panelWidth)<26,'Primary PDF action should be symmetric '+JSON.stringify(sizes));
  assert.ok(sizes.chevronWidth>=14&&sizes.chevronWidth<=19,'Chevron alignment geometry '+sizes.chevronWidth);
  await page.setViewportSize({width:320,height:690});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'320px overflow');
  assert.deepEqual(errors,[],'Uncaught JS exceptions');
  console.log('PASS: compact Daruri editions, '+apparatus.files.length+' catalogued apparatus PDFs, responsive centered action and safe personal maps.');
}finally{
  await context.close();
  await browser.close();
}
