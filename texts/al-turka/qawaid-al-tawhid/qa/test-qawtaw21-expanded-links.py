#!/usr/bin/env python3
"""Qawtaw21: browser acceptance of supplementary source cards & cross-book passage anchors.
No textual amendments, no network reliance, no user private state.
"""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright
import json,mimetypes

ROOT=Path(__file__).resolve().parent.parent
SITE=ROOT.parents[2]
PREFIX="/texts/al-turka/qawaid-al-tawhid/"
OUT=ROOT/"qa/qawtaw21-expanded-links-browser-report.json"
checks=[];errors=[]
def check(label,value):
 if not value:raise AssertionError(label)
 checks.append(label)
def serve(route):
 url=urlsplit(route.request.url);p=unquote(url.path)
 f=SITE/p.lstrip("/")
 if p.endswith("/"):f=f/"index.html"
 if not f.is_file():return route.fulfill(status=404,body="Missing local source file "+str(p))
 return route.fulfill(status=200,body=f.read_bytes(),content_type=mimetypes.guess_type(str(f))[0] or "application/octet-stream")
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(headless=True)
 context=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
 context.route("https://gnamma.test/**",serve)
 page=context.new_page()
 page.on("pageerror",lambda e:errors.append(str(e)))
 try:
  page.goto("https://gnamma.test"+PREFIX+"#QT-041",wait_until="networkidle")
  page.wait_for_function("()=>!!window.GnammaQawaidCitations")
  info=page.evaluate("""()=>{
   const p=window.GNAMMA_QAWAID_CITATION_POLICY,rs=window.GNAMMA_QAWAID_REFERENCES.items;
   return {n:rs.length,ids:new Set(rs.map(r=>r.id)).size,
     oldSourceCount:window.GNAMMA_QAWAID_QAWTAW21_EXTENSION?.originalSourceCards,
     added:window.GNAMMA_QAWAID_QAWTAW21_EXTENSION?.supplementarySourceCards,
     direct:rs.filter(r=>p.grades[p.records[r.id]].group==='direct').length,
     comparison:rs.filter(r=>p.grades[p.records[r.id]].group==='comparison').length,
     cross:window.GNAMMA_QAWAID_CROSSREADER_LINKS.items.length,
     units:window.GNAMMA_QAWAID_MATN.units.length+window.GNAMMA_TAMHID_CORPUS.units.length
   }}""")
  check("reviewed runtime source registry 18+11, graded 20+9",info=={"n":29,"ids":29,"oldSourceCount":18,"added":11,"direct":20,"comparison":9,"cross":7,"units":171})
  check("original matn plus sharh still render",page.locator("#QT-041 .matn-layer").count()==1)
  check("Fuṣūṣ mirror passage exact citation is marked",page.locator('#QT-041 .gn-source-inline[data-open-source="ibn-arabi-fusus-mirror-qt041"]').count()==1)
  check("marks are glyph-only, preserving source text",page.locator('#QT-041 .gn-source-inline[data-open-source="ibn-arabi-fusus-mirror-qt041"]').evaluate("(e)=>e.textContent.length===0"))
  page.locator('#QT-041 .gn-source-inline[data-open-source="ibn-arabi-fusus-mirror-qt041"]').click()
  check("mirror quotation card gives named original",page.locator('#gn-study-dialog').is_visible() and 'Fuṣūṣ' in page.locator('#gn-study-title').inner_text())
  check("independently identified Fuṣūṣ source URL visible",page.locator('#gn-study-content a[href^="https://www.ibnalarabi.com/fusus/"]').count()==1)
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#menu-button').click()
  page.locator('[data-open-study="crossreader"]').click()
  check("reviewed internal parallel menu visible",page.locator('.gn-crossreader-item').count()==7)
  all_links=page.locator(".gn-crossreader-item a").evaluate_all("(els)=>els.map(a=>a.href)")
  check("exact target IDs in every Qūnawī link",len(all_links)==7 and sum('passage=QUN-NU-' in x for x in all_links)==5 and sum('#matn/' in x for x in all_links)==2)
  check("parallel labelled non-quotation",all('not a direct quotation' in x.lower() for x in page.locator('.gn-crossreader-item small').all_inner_texts()))
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#focus-button').click()
  check("Focus 1 hides all inline marks",page.locator('body').get_attribute('data-focus')=='1' and page.locator('.gn-inline-source-marker:visible').count()==0)
  page.locator('#focus-button').click()
  check("Focus 2 hides all inline marks",page.locator('body').get_attribute('data-focus')=='2' and page.locator('.gn-inline-source-marker:visible').count()==0)
  page.locator('#focus-recover').click()
  check("Continuous retains all 61 units and hides marks",page.locator('body').get_attribute('data-focus')=='3' and page.locator('.layered-unit').count()==61 and page.locator('.gn-inline-source-marker:visible').count()==0)
  page.locator('#focus-recover').click()
  page.goto("https://gnamma.test"+PREFIX+"#QT-020",wait_until="networkidle")
  check("new Qurʾān 24:40 SH-020 relationship marked",page.locator('#SH-020 .gn-source-inline[data-open-source="q-24-40"]').count()==1)
  page.goto("https://gnamma.test"+PREFIX+"#QT-029",wait_until="networkidle")
  check("new Qurʾān 42:11 reference exact",page.locator('#SH-029 .gn-source-inline[data-open-source="q-42-11"]').count()==1)
  page.goto("https://gnamma.test"+PREFIX+"#QT-051",wait_until="networkidle")
  check("new time-related hadith quote matched",page.locator('#SH-051 .gn-source-inline[data-open-source="hadith-time-3197"]').count()==1)
  page.locator('#SH-051 .gn-source-inline[data-open-source="hadith-time-3197"]').click()
  check("hadith textual variant is disclosed", "variants" in page.locator('#gn-study-content').inner_text().lower() or "variant" in page.locator('#gn-study-content').inner_text().lower())
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.goto("https://gnamma.test"+PREFIX+"#QT-053",wait_until="networkidle")
  check("SH-053 attributed qarin report not a fabricated direct marker",page.locator('#SH-053 .gn-source-inline[data-open-source="hadith-qarin-muslim2814"]').count()==0)
  page.goto("https://gnamma.test"+PREFIX+"commentary.html#SH-039",wait_until="networkidle")
  page.wait_for_function("()=>!!window.GnammaQawaidCitations")
  check("standalone has expanded 29 source references",page.evaluate("window.GNAMMA_QAWAID_REFERENCES.items.length")==29)
  check("standalone SH-039 direct Inshāʾ quotation marked",page.locator('#SH-039 .gn-source-inline[data-open-source="ibn-arabi-dawair-human-sh039"]').count()==1)
  page.locator("#gn-open-citation-index").click()
  check("standalone cross-reader parallels visible, not mixed with direct references",page.locator(".gn-source-index-group>a").count()==7)
  page.locator('[data-citation-return]').click()
  for width in (320,390,768,1280):
   page.set_viewport_size({"width":width,"height":844})
   page.wait_for_timeout(80)
   check("standalone no overflow "+str(width),page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"))
  # Resolve a REAL source-located Qūnawī target through the GNAMMA reader.
  target="QUN-NU-001-A"
  page.goto("https://gnamma.test/texts/sadr-al-din-al-qunawi/al-nusus/#work=QUN-NU&passage="+target,wait_until="networkidle")
  page.wait_for_selector("#"+target,timeout=20000)
  check("GNAMMA Qūnawī opens exact target paragraph",page.locator("#"+target).count()==1)
  check("Qūnawī deep-link address is not erased by initialization", "passage="+target in page.url)
  check("Qūnawī target preserves Arabic source words", "الإطلاق" in page.locator("#"+target+" .ar").inner_text())
  page.goto("https://gnamma.test/research/tajrid/#matn/38",wait_until="networkidle")
  page.wait_for_selector("#p-38",timeout=20000)
  check("Tajrīd exact matn/38 route opens source lemma",page.locator("#p-38").count()==1)
  check("Tajrīd Arabic explicitly mentions tashkīk", "التشكيك" in page.locator("#p-38").inner_text())
  check("No browser JS errors in crossreader suite",not errors)
  report={"passed":True,"checks":checks,"runtime":info,"errors":errors}
 except Exception as exc:
  report={"passed":False,"checks":checks,"error":str(exc),"errors":errors}
  page.screenshot(path=str(ROOT/"qa/qawtaw21-expanded-links-error.png"),full_page=False)
  raise
 finally:
  OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
  print(json.dumps(report,ensure_ascii=False))
  browser.close()
