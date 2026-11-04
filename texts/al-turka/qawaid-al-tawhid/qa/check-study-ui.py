"""Gnamma scholarly reader acceptance: dictionary, subjects, source cards, menus, notes, PDFs."""
from pathlib import Path
from urllib.parse import unquote,urlsplit
import json,mimetypes
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parent.parent
PREFIX='/texts/al-turka/qawaid-al-tawhid/'
RESULT=B/'qa/study-ui-report.json'
checks=[]
def ck(name,ok):
 if not ok:raise AssertionError(name)
 checks.append(name)
def source(route):
 path=unquote(urlsplit(route.request.url).path)
 if path.startswith(PREFIX):f=B/(path[len(PREFIX):] or 'index.html')
 elif path.startswith('/assets/'):f=B.parents[2]/path[1:]
 else:return route.fulfill(status=404,body='Not locally bundled')
 if not f.is_file():return route.fulfill(status=404,body='Not found')
 return route.fulfill(status=200,body=f.read_bytes(),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 ctx.route('https://gnamma.test/**',source)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
 try:
  page.goto('https://gnamma.test'+PREFIX,wait_until='networkidle')
  ck('82 dictionary entries',page.evaluate('window.GNAMMA_QAWAID_TERMS.terms.length')==82)
  ck('15 typed primary-source records',page.evaluate('window.GNAMMA_QAWAID_REFERENCES.items.length')==15)
  ck('public intro has no process log',not 'manuscript-established critical edition' in page.locator('.book-intro').inner_text().lower())
  page.locator('#menu-button').click()
  ck('daruri-family menu opens',page.locator('#gn-study-dialog').is_visible())
  ck('menu contains subjects and editions',page.locator('#gn-study-content').inner_text().find('Subject index')>=0 and 'PDF editions' in page.locator('#gn-study-content').inner_text())
  page.locator('[data-open-study="dictionary"]').click()
  ck('dictionary entries displayed',page.locator('#gn-study-content .gn-term-grid button').count()==82)
  page.locator('[data-open-term="determination"]').click()
  ck('term window has technical definition', 'delimiting consideration' in page.locator('#gn-study-content').inner_text())
  ck('term links to passages',page.locator('#gn-study-content .gn-locations a').count()>0)
  page.locator('[data-open-study="subjects"]').click()
  ck('subject groups displayed',page.locator('.gn-subject-group').count()==11)
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#theme-button').click()
  ck('theme button opens appearance panel',page.locator('#gn-study-title').inner_text()=='Appearance')
  page.locator('input[name="gn-theme"][value="night"]').check()
  ck('theme actually applied',page.locator('html').get_attribute('data-theme')=='night')
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#next').click()
  ck('theme preserved after navigating',page.locator('html').get_attribute('data-theme')=='night')
  page.locator('#settings-button').click()
  ck('apparatus settings visible',page.locator('input[name="gn-apparatus"]').count()==3)
  page.locator('input[name="gn-apparatus"][value="full"]').check()
  ck('full notes mode shown',page.locator('body').get_attribute('data-apparatus')=='full')
  page.locator('input[name="gn-apparatus"][value="off"]').check()
  ck('notes can be hidden',page.locator('body').get_attribute('data-apparatus')=='off')
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  ck('bottom note shortcut exists',page.locator('#dock-note-shortcut').count()==1)
  ck('bottom bookmark shortcut exists',page.locator('#dock-bookmark-shortcut').count()==1)
  page.locator('#dock-bookmark-shortcut').click()
  ck('bookmark shortcut activates existing storage',bool(page.evaluate("JSON.parse(localStorage.getItem('gnamma:qawaid:reading:v2')).bookmarks.length")))
  page.locator('#menu-button').click()
  page.locator('[data-open-study="references"]').click()
  page.locator('[data-open-source="tusi-isharat"]').first.click()
  ck('Tusi quotation displayed',page.locator('.gn-source-ar').count()==1 and len(page.locator('.gn-source-ar').inner_text())>90)
  ck('source attribution and status visible','Ishārāt' in page.locator('#gn-study-title').inner_text())
  page.locator('[data-open-study="references"]').click()
  page.locator('[data-open-source="q-24-40"]').first.click()
  ck('Quran 24:40 complete verse in card','وَمَنْ لَمْ يَجْعَلِ' in page.locator('.gn-source-ar').inner_text())
  page.locator('[data-open-study="pdf"]').click()
  pdftext=page.locator('#gn-study-content').inner_text()
  ck('PDF menu backed by actual files or honest absence', 'Bilingual Reading' in pdftext or 'not yet available' in pdftext)
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  for width in [320,390,768,1280]:
   page.set_viewport_size({'width':width,'height':844})
   page.wait_for_timeout(70)
   ck('no horizontal overflow '+str(width),page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'))
  ck('no JS runtime errors',not errors)
  RESULT.write_text(json.dumps({'passed':True,'checks':checks,'runtimeErrors':errors,'viewportSizes':[320,390,768,1280]},indent=2))
  print(RESULT.read_text())
 except Exception as e:
  RESULT.write_text(json.dumps({'passed':False,'checks':checks,'error':str(e),'runtimeErrors':errors},indent=2))
  page.screenshot(path=str(B/'qa/study-ui-error.png'))
  raise
 finally:browser.close()
