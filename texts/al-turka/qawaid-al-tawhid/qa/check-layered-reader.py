"""Actual Chromium acceptance test for the same-page Matn/Sharh reader.
Install playwright and its Chromium browser, then run this file.
Static requests are intercepted; no remote manuscript or website is fetched.
"""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright
import json,mimetypes
B=Path(__file__).resolve().parent.parent
OUT=B/'qa/layered-browser-results';OUT.mkdir(exist_ok=True)
PREFIX='/texts/al-turka/qawaid-al-tawhid/';URL='https://gnamma.test'+PREFIX
checks=[]
def check(name,value):
    if not value:raise AssertionError(name)
    checks.append(name)
def handler(route):
    path=unquote(urlsplit(route.request.url).path)
    f=B/(path[len(PREFIX):] or 'index.html') if path.startswith(PREFIX) else B.parents[2]/path.lstrip('/')
    if f.is_file():return route.fulfill(status=200,body=f.read_bytes(),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
    return route.fulfill(status=404,body='Not included in test snapshot')
TEXT_CHECK=r"""()=>{
 const norm=s=>s.replace(/\s+/g,' ').trim();
 const get=(selector,lang)=>Array.from(document.querySelectorAll(selector+' .'+lang+' > p'),p=>p.textContent).join('\n\n');
 const bad=[];
 for(const u of window.GNAMMA_QAWAID_MATN.units){
  for(const lang of ['ar','en'])if(norm(get('#'+u.id+' > .matn-layer:not(.bridge-layer)',lang))!==norm(u[lang==='ar'?'arabic':'english']))bad.push(u.id+lang);
 }
 const seen=new Set();
 for(const u of [...window.GNAMMA_TAMHID_SHARH.units,...window.GNAMMA_TAMHID_MAIN,...window.GNAMMA_TAMHID_CONCLUSION]){
  if(seen.has(u.id))continue;seen.add(u.id);
  for(const lang of ['ar','en']){
   const field=lang==='ar'?'arabic':'english';
   if(norm(get('#'+u.id+' > .sharh-content > .text-pair',lang))!==norm(u[field]))bad.push(u.id+lang);
   if(u.precedingMatn&&norm(get('#bridge-'+u.id,lang))!==norm(u.precedingMatn[field]))bad.push('bridge-'+u.id+lang);
  }
 }
 return bad;
}"""
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    ctx=browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce');ctx.route('https://gnamma.test/**',handler)
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(URL,wait_until='networkidle');page.wait_for_selector('#SH-001')
        check('both layers initially on',page.locator('#layer-matn').get_attribute('aria-checked')=='true' and page.locator('#layer-sharh').get_attribute('aria-checked')=='true')
        page.evaluate("window.firstMatn=document.querySelector('#QT-001 .matn-layer')")
        original=page.url;page.locator('#layer-sharh').click()
        check('sharh off without navigation',page.url==original and page.locator('#SH-001').is_hidden())
        check('matn remains and is not re-created',page.locator('.matn-layer').is_visible() and page.evaluate("window.firstMatn===document.querySelector('#QT-001 .matn-layer')"))
        page.locator('#layer-sharh').click();page.locator('#layer-matn').click()
        check('sharh-only view',page.locator('.matn-layer').is_hidden() and page.locator('#SH-001').is_visible())
        page.locator('#layer-sharh').click();check('one layer always remains',page.locator('#SH-001').is_visible())
        page.locator('#layer-matn').click();page.locator('#SH-001>summary').click();page.wait_for_timeout(80)
        page.locator('#next').click();page.locator('#prev').click();page.wait_for_timeout(80)
        check('collapse retained across navigation',page.locator('#SH-001').get_attribute('open') is None)
        page.reload(wait_until='networkidle');check('collapse survives reload',page.locator('#SH-001').get_attribute('open') is None)
        page.locator('#SH-001>summary').click();page.locator('#lang-ar').click()
        check('languages affect both layers',page.locator('.matn-layer .ar').is_hidden() and page.locator('#SH-001 .ar').is_hidden() and page.locator('#SH-001 .en').is_visible())
        page.locator('#lang-en').click();check('one language remains',page.locator('#lang-en').get_attribute('aria-pressed')=='true')
        page.locator('#lang-ar').click();page.locator('#layer-sharh').click();page.locator('#search-button').click();page.locator('#search-field').fill('SH-028');page.locator('[data-result-id="SH-028"]').click();page.wait_for_selector('#SH-028')
        check('search reveals hidden commentary in place',page.url.endswith('#SH-028') and page.locator('#SH-028 .sharh-content').is_visible())
        page.evaluate("s=JSON.parse(localStorage.getItem('gnamma:qawaid:reading:v2'));s.bookmarks=['QT-007'];s.personal={'QT-007':'Retained note'};s.legacyField='retain';localStorage.setItem('gnamma:qawaid:reading:v2',JSON.stringify(s))")
        page.reload(wait_until='networkidle');page.locator('#layer-sharh').click();page.locator('#layer-sharh').click()
        saved=page.evaluate("JSON.parse(localStorage.getItem('gnamma:qawaid:reading:v2'))")
        check('notes bookmarks and unknown settings preserved',saved['bookmarks']==['QT-007'] and saved['personal']['QT-007']=='Retained note' and saved['legacyField']=='retain')
        page.goto(URL+'#QT-035',wait_until='networkidle');page.wait_for_selector('#QT-035')
        check('bridge identified as matn',page.locator('#bridge-SH-035-B').get_attribute('data-text-layer')=='matn')
        page.locator('#layer-sharh').click();check('bridge remains with sharh off',page.locator('#bridge-SH-035-B').is_visible() and page.locator('#SH-035-B').is_hidden());page.locator('#layer-sharh').click()
        for _ in range(3):(page.locator('#focus-recover') if page.locator('body').get_attribute('data-focus')=='2' else page.locator('#focus-button')).click()
        page.wait_for_timeout(150)
        check('all main units rendered in continuous mode',page.locator('.layered-unit').count()==61 and page.locator('.sharh-layer').count()==70 and page.locator('.bridge-layer').count()==4)
        check('immersive switches accessible',page.locator('#dock-layer-sharh').is_visible())
        check('conclusion source order',page.locator('#QT-061 .sharh-layer').evaluate_all('(els)=>els.map(x=>x.id)')==['SH-061-C','SH-061-D','SH-061-E','SH-061-F','SH-061-A','SH-061-B'])
        mismatch=page.evaluate(TEXT_CHECK)
        check('all rendered Arabic/English and bridges match source: '+str(mismatch),not mismatch)
        page.locator('#QT-040>.unit-heading').evaluate('(el)=>el.scrollIntoView({block:"start"})');page.wait_for_timeout(180)
        check('continuous location follows passage','QT-040' in page.locator('#location-title').inner_text())
        page.locator('#dock-layer-sharh').click();page.wait_for_timeout(180)
        check('hiding sharh preserves passage','QT-040' in page.locator('#location-title').inner_text())
        check('all matn quotations retained',page.locator('[data-text-layer="matn"]:visible').count()==65 and page.locator('.sharh-layer:visible').count()==0)
        page.locator('#dock-layer-sharh').click();page.wait_for_timeout(180)
        check('restoring sharh preserves passage','QT-040' in page.locator('#location-title').inner_text())
        page.locator('#focus-recover').click();page.goto(URL+'#SH-061-A',wait_until='networkidle');page.wait_for_selector('#SH-061-A')
        check('SH deep link opens linked passage',page.locator('#QT-061').count()==1 and page.locator('#SH-061-A .sharh-content').is_visible())
        page.goto(URL+'#QT-001',wait_until='networkidle');page.wait_for_selector('#QT-001')
        for width in [1280,768,390,320]:
            page.set_viewport_size({'width':width,'height':900 if width>720 else 844});page.wait_for_timeout(100)
            check('no horizontal overflow '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.locator('#QT-001>.unit-heading').evaluate('(el)=>el.scrollIntoView({block:"start"})');page.wait_for_timeout(100)
            page.screenshot(path=str(OUT/f'layers-{width}.png'))
        page.locator('#layer-sharh').focus();page.keyboard.press('Space');check('keyboard activation',page.locator('#layer-sharh').get_attribute('aria-checked')=='false');page.keyboard.press('Space')
        check('no uncaught browser errors',not errors)
        ctx2=browser.new_context();ctx2.route('https://gnamma.test/**',handler);ctx2.add_init_script("localStorage.setItem('gnamma:qawaid:reading:v2','invalid retained data')")
        bad=ctx2.new_page();bad.goto(URL,wait_until='networkidle');bad.locator('#layer-sharh').click()
        check('corrupted stored data not overwritten',bad.evaluate("localStorage.getItem('gnamma:qawaid:reading:v2')")=='invalid retained data')
        report={'passed':True,'browser':'Chromium, actual browser and persistent origin storage; locally served static assets','checks':checks,'errors':errors,'viewports':[1280,768,390,320],'mainMatnUnits':61,'linkedCommentaryUnits':70,'additionalMatnQuotations':4,'physicalIPhoneTested':False}
        (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,indent=2))
    except Exception as e:
        page.screenshot(path=str(OUT/'failure.png'));(OUT/'report.json').write_text(json.dumps({'passed':False,'passedChecks':checks,'error':str(e),'browserErrors':errors},indent=2));raise
    finally:browser.close()
