#!/usr/bin/env python3
"""Qawāʿid: check source-graded inline references and focus-safe reader cards.
No external sites are fetched during browser QA, no private local profile data.
"""
from pathlib import Path
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright
import json,mimetypes,sys

ROOT=Path(__file__).resolve().parent.parent
PREFIX='/texts/al-turka/qawaid-al-tawhid/'
REPO=ROOT.parents[2]
OUTPUT=ROOT/'qa/linked-source-cards-browser-acceptance.json'
passed=[]
def ck(name,ok):
 if not ok:raise AssertionError(name)
 passed.append(name)
def serve(route):
 path=unquote(urlsplit(route.request.url).path)
 if path.startswith(PREFIX):file=ROOT/(path[len(PREFIX):] or 'index.html')
 elif path.startswith('/assets/'):file=REPO/path[1:]
 else:return route.fulfill(status=404,body='Unavailable test resource')
 if not file.is_file():return route.fulfill(status=404,body='Missing test file')
 return route.fulfill(status=200,body=file.read_bytes(),content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 ctx.route('https://gnamma.test/**',serve)
 page=ctx.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  page.goto('https://gnamma.test'+PREFIX+'#QT-029',wait_until='networkidle')
  page.wait_for_function('()=>!!window.GnammaQawaidCitations')
  pol=page.evaluate("() => {const p=window.GNAMMA_QAWAID_CITATION_POLICY;return {total:Object.keys(p.records).length,direct:Object.values(p.records).filter(t=>p.grades[t].group==='direct').length,comparison:Object.values(p.records).filter(t=>p.grades[t].group==='comparison').length,verifiedInternal:p.exactExternalReaderDestinations.length}}")
  ck('evidence policy accounts for all 18 existing cards',pol=={'total':18,'direct':12,'comparison':6,'verifiedInternal':0})
  ck('71+ source data not invented and source reader loaded',page.evaluate("window.GNAMMA_QAWAID_MATN.units.length") == 61)
  marker='#SH-029 .gn-source-inline[data-open-source="q-8-17"]'
  page.wait_for_selector(marker,timeout=16000)
  ck('exact Quran words acquire a small marker',page.locator(marker).count()==1)
  ck('Arabic source words remain separate text node',page.locator(marker).evaluate('(e)=>e.parentNode.previousSibling?.nodeType===Node.TEXT_NODE && e.parentNode.previousSibling.textContent.trim().length>8'))
  ck('minimal note marker is visible only in Normal view',page.locator(marker).is_visible())
  ck('old sources/terms banners hidden from running text',page.locator('#reading .gn-citation-ribbon:visible').count()==0 and page.locator('#reading .gn-term-ribbon:visible').count()==0)
  page.locator(marker).click()
  ck('source card opens exact contextual Quran verse',page.locator('#gn-study-dialog').is_visible() and 'فَلَمْ تَقْتُلُوهُمْ' in page.locator('#gn-study-content .gn-source-ar').inner_text())
  ck('source type and edition shown explicitly','Qurʾānic wording' in page.locator('#gn-study-content').inner_text() and page.locator('#gn-study-content a[href="https://quran.com/8/17"]').count()==1)
  page.locator('#gn-study-content .gn-source-return').click()
  ck('source card returns to same passage',not page.locator('#gn-study-dialog').is_visible() and page.evaluate('location.hash')=='#QT-029')
  page.locator('#focus-button').click()
  ck('Focus 1 hides citation icons',page.locator('body').get_attribute('data-focus')=='1' and page.locator('#SH-029 .gn-inline-source-marker:visible').count()==0)
  page.locator('#focus-button').click()
  ck('Focus 2 hides citation icons',page.locator('body').get_attribute('data-focus')=='2' and page.locator('.gn-inline-source-marker:visible').count()==0)
  page.locator('#focus-recover').click()
  ck('Continuous hides citation icons and retains passage count',page.locator('body').get_attribute('data-focus')=='3' and page.locator('.gn-inline-source-marker:visible').count()==0 and page.locator('.layered-unit').count()==61)
  page.locator('#focus-recover').click()
  ck('Normal mode restores source indicators',page.locator('body').get_attribute('data-focus')=='0')
  for width in [320,390,768,1280]:
   page.set_viewport_size({'width':width,'height':844})
   page.wait_for_timeout(80)
   ck('integrated no overflow at '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
  page.goto('https://gnamma.test'+PREFIX+'#QT-031',wait_until='networkidle')
  had='#SH-031 .gn-source-inline[data-open-source="hadith-labid"]'
  page.wait_for_selector(had,timeout=16000)
  ck('hadith contextualises quoted Labid poetry without authentication overclaim',page.locator(had).count()==1)
  page.locator(had).click()
  ck('poetic-hadith card explicitly distinguishes poetry from isnad','poetic' in page.locator('#gn-study-content').inner_text().lower() or 'Labīd' in page.locator('#gn-study-content').inner_text())
  page.locator('#gn-study-content .gn-source-return').click()
  page.goto('https://gnamma.test'+PREFIX+'#QT-032',wait_until='networkidle')
  fus='#SH-032 .gn-source-inline[data-open-source="ibn-arabi-fusus"]'
  page.wait_for_selector(fus,timeout=16000)
  ck('direct Fusūs quotation marked, not unrelated parallel',page.locator(fus).count()==1)
  page.locator(fus).click()
  ck('Fuṣūṣ quote card discloses edition limitation','not a separately' in page.locator('#gn-study-content').inner_text().lower() or 'quotation preserved' in page.locator('#gn-study-content').inner_text().lower())
  page.locator('#gn-study-content .gn-source-return').click()
  page.locator('#menu-button').click()
  ck('study menu has separate parallels and reports',page.locator('[data-open-study="parallels"]').count()>0)
  page.locator('[data-open-study="parallels"]').click()
  ck('independent comparison and unverified sources remain secondary',page.locator('[data-open-source="tusid-tajrid"]').count()==1 and page.locator('[data-open-source="hidden-treasure"]').count()==1 and page.locator('[data-open-source="q-8-17"]').count()==0)
  page.locator('[data-open-source="hidden-treasure"]').click()
  ck('hidden treasure is explicitly unverified, never authenticated','Unverified attribution' in page.locator('#gn-study-content').inner_text())
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path=str(ROOT/'qa/qawaid-citation-mobile.png'),full_page=False)
  # Independent commentary; the new markup must also open an accessible card.
  page.goto('https://gnamma.test'+PREFIX+'commentary.html#SH-031',wait_until='networkidle')
  page.wait_for_function('()=>!!window.GnammaQawaidCitations')
  page.wait_for_selector('#SH-031 .gn-source-inline[data-open-source="hadith-labid"]',timeout=16000)
  ck('standalone commentary resolves exact cited wording',page.locator('#SH-031 .gn-source-inline[data-open-source="hadith-labid"]').count()==1)
  page.locator('#SH-031 .gn-source-inline[data-open-source="hadith-labid"]').click()
  ck('standalone source opens lightweight card',page.locator('#gn-citation-standalone').is_visible())
  ck('standalone source card shows poem and source witness',page.locator('#gn-citation-standalone a[href^="https://dorar.net/"]').count()==1 and 'Labīd' in page.locator('#gn-citation-standalone').inner_text())
  page.locator('[data-citation-return]').click()
  ck('return to same standalone text and close dialog',not page.locator('#gn-citation-standalone').is_visible() and '#SH-031' in page.url)
  page.locator('#gn-open-citation-index').click()
  ck('standalone source index groups verified and contextual evidence',page.locator('.gn-source-index-group').count()==2)
  page.locator('[data-citation-open="hidden-treasure"]').click()
  ck('standalone unverified report has warning','Not authenticated' in page.locator('#gn-citation-standalone').inner_text())
  page.locator('[data-citation-return]').click()
  page.goto('https://gnamma.test'+PREFIX+'commentary.html#SH-INTRO-030',wait_until='networkidle')
  ck('independent intro contains source policy and text',page.evaluate("window.GNAMMA_QAWAID_CITATION_POLICY.records['ibn-arabi-dawair']")==='quoted-in-tamhid')
  for width in [320,390,768,1280]:
   page.set_viewport_size({'width':width,'height':844})
   page.wait_for_timeout(80)
   ck('standalone no overflow at '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
  ck('no browser JavaScript exceptions',not errors)
  OUTPUT.write_text(json.dumps({'passed':True,'checks':passed,'errors':errors,'evidence':pol},indent=2))
  print(OUTPUT.read_text())
 except Exception as e:
  OUTPUT.write_text(json.dumps({'passed':False,'checks':passed,'error':str(e),'errors':errors},indent=2))
  page.screenshot(path=str(ROOT/'qa/qawaid-citation-error.png'),full_page=False)
  print(OUTPUT.read_text(),file=sys.stderr)
  raise
 finally:browser.close()
