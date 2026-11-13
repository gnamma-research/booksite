#!/usr/bin/env python3
"""Qawāʿid reader design and advanced-search browser acceptance.
Isolated Chromium contexts; no real user notes; no changes to canonical corpus.
"""
from pathlib import Path
from urllib.parse import unquote,urlsplit
import json,mimetypes,sys
from playwright.sync_api import sync_playwright

B=Path(__file__).resolve().parent.parent
SITE=B.parents[2]
P='/texts/al-turka/qawaid-al-tawhid/'
OUT=B/'qa/qawaid-immersive-search-browser-report.json'
checks=[]
def check(name,ok):
 if not ok:raise AssertionError(name)
 checks.append(name)
def route(r):
 path=unquote(urlsplit(r.request.url).path)
 if path.startswith(P):f=B/(path[len(P):] or 'index.html')
 elif path.startswith('/assets/'):f=SITE/path[1:]
 else:return r.fulfill(status=404,body='No local file')
 if not f.is_file():return r.fulfill(status=404,body='Not found')
 return r.fulfill(status=200,body=f.read_bytes(),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,reduced_motion='reduce')
 ctx.route('https://gnamma.test/**',route)
 errors=[]
 page=ctx.new_page()
 page.on('pageerror',lambda x:errors.append(str(x)))
 try:
  page.goto('https://gnamma.test'+P,wait_until='networkidle')
  page.wait_for_function('()=>!!window.GnammaQawaidSearch')
  n=page.evaluate('window.GnammaQawaidSearch.sourceUnits()')
  check('canonical source inventory available to research',n=={'matn':61,'commentary':110,'terms':82,'references':18})
  check('distinct emblem and frontispiece image',page.locator('.brand-link img').get_attribute('src')=='qawaid-emblem.svg' and page.locator('.qawaid-frontispiece img').evaluate('(e)=>e.complete && e.naturalWidth > 0'))
  check('source-reading layers present',page.locator('#reading-list .matn-layer').count()>0 and page.locator('#reading-list .sharh-layer').count()>0)
  check('scholarly textual notes not in running reader',page.locator('#reading-list .source-notes:visible').count()==0)
  page.locator('#search-button').click()
  check('new search opens without old dialog',page.locator('#qt-research-dialog').is_visible() and not page.locator('#sheet').evaluate('(e)=>e.open'))
  page.locator('#qt-query').fill('existence')
  page.wait_for_timeout(420)
  check('English text search',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-query').fill('الوجود')
  page.wait_for_timeout(420)
  check('Arabic text search',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-advanced').evaluate('(e)=>e.open=true')
  page.locator('#qt-mode').select_option('root')
  page.locator('#qt-query').fill('وجد')
  page.wait_for_timeout(420)
  check('curated root family search',page.locator('#qt-results .qt-result').count()>0 and 'curated' in page.locator('#qt-help').inner_text().lower())
  page.locator('#qt-mode').select_option('lemma')
  page.locator('#qt-query').fill('wujūd')
  page.wait_for_timeout(420)
  check('glossary lemma search',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-mode').select_option('phrase')
  page.locator('#qt-query').fill('الوجود المطلق')
  page.wait_for_timeout(420)
  check('Arabic phrase search',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-mode').select_option('near')
  page.locator('#qt-query').fill('وجود')
  page.locator('#qt-second').fill('ممكن')
  page.locator('#qt-gap').select_option('20')
  page.wait_for_timeout(420)
  check('within-unit proximity search',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-mode').select_option('words')
  page.locator('#qt-facet').select_option('terms')
  page.locator('#qt-query').fill('quiddity')
  page.wait_for_timeout(420)
  check('dictionary term search',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-facet').select_option('text')
  page.locator('#qt-query').fill('SH-059')
  page.wait_for_timeout(420)
  check('direct commentary IDs searchable',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-close').click()
  for i in range(3):page.locator('#focus-button' if i<2 else '#focus-recover').click()
  check('focus 3 continuous and image hidden',page.locator('body').get_attribute('data-focus')=='3' and page.locator('.qawaid-frontispiece').count()==1 and page.locator('.qawaid-frontispiece').is_hidden())
  check('continuous has 61 authorial units',page.locator('.layered-unit').count()==61)
  page.locator('#focus-recover').click()
  check('four-state focus cycle returns to normal',page.locator('body').get_attribute('data-focus')=='0')
  for width in [320,390,768,1280]:
   page.set_viewport_size({'width':width,'height':844})
   page.wait_for_timeout(100)
   check('integrated no horizontal overflow at '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
  page.set_viewport_size({'width':390,'height':844})
  page.locator('#search-button').click()
  check('search mobile geometry',page.locator('#qt-research-dialog').evaluate('(e)=>e.getBoundingClientRect().width<=innerWidth+1'))
  page.locator('#qt-close').click()
  page.screenshot(path=str(B/'qa/qawaid-immersive-mobile.png'),full_page=False)
  page.goto('https://gnamma.test'+P+'commentary.html',wait_until='networkidle')
  page.wait_for_function('()=>!!window.GnammaQawaidSearch')
  check('standalone commentary has the full source index',page.evaluate('window.GnammaQawaidSearch.sourceUnits().commentary')==110)
  check('standalone distinct icon and art',page.locator('.brand-link img').get_attribute('src')=='qawaid-emblem.svg' and page.locator('.qawaid-frontispiece img').count()==1)
  page.locator('#search-button').click()
  page.locator('#qt-query').fill('SH-INTRO-001')
  page.wait_for_timeout(400)
  check('commentary introduction searchable',page.locator('#qt-results .qt-result').count()>0)
  page.locator('#qt-close').click()
  for width in [320,390,768,1280]:
   page.set_viewport_size({'width':width,'height':844})
   page.wait_for_timeout(100)
   check('commentary no horizontal overflow at '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path=str(B/'qa/qawaid-commentary-mobile.png'),full_page=False)
  check('no JavaScript page exceptions',not errors)
  OUT.write_text(json.dumps({'passed':True,'checks':checks,'jsErrors':errors,'units':n},indent=2))
  print(OUT.read_text())
 except Exception as e:
  OUT.write_text(json.dumps({'passed':False,'checks':checks,'error':str(e),'jsErrors':errors},indent=2))
  page.screenshot(path=str(B/'qa/qawaid-immersive-error.png'),full_page=False)
  print(OUT.read_text(),file=sys.stderr)
  raise
 finally:browser.close()
