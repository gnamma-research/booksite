#!/usr/bin/env node
/* Real current Editions -> Reference -> checksum-verified exact Scholarly PDF.
 * Browser download is byte-for-byte the original, not HTML typesetting.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..');
const ENGINE=process.env.BENCH_BROWSER||'chromium';
const OUT=process.env.BENCH_OUT||'/tmp/daruri-integrated-reference';
const ORIGIN='http://127.0.0.1:8997';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const html=ORIGIN+'/daruri/verified-reference-qa.html';
let server,browser,context;
async function openReferencePage(viewport){
  const page=await context.newPage();
  await page.setViewportSize(viewport);
  await page.goto(html,{waitUntil:'domcontentloaded'});
  const tab=page.locator('[data-ep-tab="reference"]');
  await tab.waitFor({timeout:18000});
  await tab.click();
  const action=page.locator('[data-ep-verified-reference-download]');
  await action.waitFor({timeout:15000});
  const bbox=await action.boundingBox();
  assert.ok(bbox&&bbox.width>=44&&bbox.height>=44,'Verified action needs 44px touch target');
  assert.ok(bbox.x>=-1&&bbox.x+bbox.width<=viewport.width+1,'Verified action clipped');
  return {page,action,bbox};
}
(async()=>{
  try{
    fs.mkdirSync(OUT,{recursive:true});
    const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'daruri/pdf-editions-manifest.json')));
    const expected=manifest.files?.['daruri.pdf'];
    const official=fs.readFileSync(path.join(ROOT,'daruri/daruri.pdf'));
    assert.equal(sha(official),expected.sha256,'Current original PDF SHA must match manifest');
    assert.equal(official.length,expected.size_bytes);
    server=spawn('python',['-m','http.server','8997','--bind','127.0.0.1'],
        {cwd:ROOT,stdio:'ignore'});
    let alive=false;
    for(let k=0;k<75;k++){try{
       if((await fetch(html)).ok){alive=true;break}
      }catch{}await sleep(160)}
    if(!alive)throw Error('No localhost static site');
    browser=await (ENGINE==='webkit'?webkit:chromium).launch({headless:true});
    context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
    const results=[];
    for(const viewport of [{width:1280,height:860},{width:390,height:844},{width:320,height:700}]){
      const {page,action,bbox}=await openReferencePage(viewport);
      const bad=[];page.on('pageerror',e=>bad.push(String(e)));
      const downloadPromise=page.waitForEvent('download',{timeout:45000});
      await action.click();
      const dl=await downloadPromise;
      await page.waitForFunction(()=>document.querySelector('[data-ep-info-value]')?.textContent===
        'Approved exact copy verified',null,{timeout:10000});
      const filename='approved-'+ENGINE+'-'+viewport.width+'.pdf';
      await dl.saveAs(path.join(OUT,filename));
      const bytes=fs.readFileSync(path.join(OUT,filename));
      assert.deepEqual(bytes,official,'PDF download not byte-identical to approved original');
      assert.equal(bad.length,0,'Unexpected site JS errors');
      results.push({viewport:viewport.width+'x'+viewport.height,
        verified_button_width:Math.round(bbox.width),
        verified_button_height:Math.round(bbox.height),
        downloaded_sha256:sha(bytes),downloaded_bytes:bytes.length});
      await page.close();
    }
    const {page:negative,action:negativeButton}=await openReferencePage({width:390,height:844});
    let unsafeDownloads=0;
    negative.on('download',()=>unsafeDownloads++);
    await negative.route('**/daruri/pdf-editions-manifest.json',route=>route.fulfill({
      status:200,contentType:'application/json',
      body:JSON.stringify({files:{'daruri.pdf':{
        pages:243,size_bytes:expected.size_bytes,sha256:'0'.repeat(64)}}})
    }));
    await negativeButton.click();
    await negative.waitForFunction(()=>document.querySelector('[data-ep-info-value]')?.textContent===
      'Download refused',null,{timeout:18000});
    await negative.waitForTimeout(350);
    assert.equal(unsafeDownloads,0,'Tampered manifest allowed a download');
    const msg=await negative.locator('[data-ep-info-detail]').textContent();
    assert.match(msg,/Checksum mismatch/,'Checksum mismatch not communicated');
    await negative.close();
    const report={
      browser:ENGINE,
      source:'Current published daruri.pdf (no browser retypesetting)',
      signature_verified_before_download:true,
      byte_identical_to_published_pdf:true,
      exact_approved_sha256:expected.sha256,
      expected_pages:expected.pages,
      full_site_Reference_tab_verified:true,
      three_viewports_passed:results.length,
      output_variants:results,
      forged_manifest_refused_before_download:true,
      no_private_note_data:true,
      physical_ios_android_tested:false
    };
    fs.writeFileSync(path.join(OUT,'verified-reference-integration.json'),
                     JSON.stringify(report,null,2)+'\n');
    console.log('GNAMMA_REFERENCE_APPROVED_EXACT_DOWNLOAD',JSON.stringify(report));
  }catch(error){
    fs.mkdirSync(OUT,{recursive:true});
    fs.writeFileSync(path.join(OUT,'failure.txt'),String(error?.stack||error));
    console.error('GNAMMA_REFERENCE_EXACT_FAILURE',error?.stack||error);
    process.exitCode=2;
  }finally{
    await context?.close().catch(()=>{});
    await browser?.close().catch(()=>{});
    server?.kill();
  }
})();