#!/usr/bin/env python3
"""Cite exact Arabic spans: source-graded coverage, one real browser passage at a time.
Missing anchors are reported as *not inserted*, never filled automatically.
"""
from pathlib import Path
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright
import json,mimetypes

ROOT=Path(__file__).resolve().parent.parent
PREFIX='/texts/al-turka/qawaid-al-tawhid/'
REPO=ROOT.parents[2]
OUT=ROOT/'qa/linked-citation-coverage.json'
def serve(route):
 path=unquote(urlsplit(route.request.url).path)
 if path.startswith(PREFIX):file=ROOT/(path[len(PREFIX):] or 'index.html')
 elif path.startswith('/assets/'):file=REPO/path[1:]
 else:return route.fulfill(status=404,body='Not present')
 if not file.is_file():return route.fulfill(status=404,body='Missing')
 route.fulfill(status=200,body=file.read_bytes(),content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':390,'height':850},reduced_motion='reduce')
 context.route('https://gnamma.test/**',serve)
 page=context.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('https://gnamma.test'+PREFIX,wait_until='networkidle')
 records=page.evaluate("""() => {
  const p=window.GNAMMA_QAWAID_CITATION_POLICY;
  return window.GNAMMA_QAWAID_REFERENCES.items
   .filter(r=>p.grades[p.records[r.id]].group==='direct')
   .map(r=>({id:r.id,type:r.type,units:r.units||[],anchors:r.inlineAnchors||[],quoteFrom:r.quoteFrom||null}));
 }""")
 for r in records:
  rows=[]
  for id in r['units']:
   dest='commentary.html' if id.startswith('SH-INTRO-') else 'index.html'
   page.goto('https://gnamma.test'+PREFIX+dest+'#'+id,wait_until='domcontentloaded')
   page.wait_for_function("()=>!!window.GnammaQawaidCitations",timeout=20000)
   page.wait_for_timeout(130)
   marker_count=page.locator(f'[id="{id}"] .gn-source-inline[data-open-source="{r["id"]}"]').count()
   rows.append({'unit':id,'inserted':marker_count==1,'markerCount':marker_count})
  results.append({'id':r['id'],'type':r['type'],'quoteFrom':r['quoteFrom'],
    'sourceUnits':rows,'oneOrMoreAnchorsInserted':any(z['inserted'] for z in rows)})
 browser.close()
summary={'totalEligibleCards':len(results),'cardsWithAtLeastOneAttestedMarker':sum(x['oneOrMoreAnchorsInserted'] for x in results),
         'cardsWithoutAnyInsertedMarker':[x['id'] for x in results if not x['oneOrMoreAnchorsInserted']],
         'sourceUnitRelationsAttempted':sum(len(x['sourceUnits']) for x in results),
         'sourceUnitRelationsMarked':sum(sum(z['inserted'] for z in x['sourceUnits']) for x in results),
         'browserErrors':errors}
OUT.write_text(json.dumps({'summary':summary,'cards':results},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False))
assert not errors,errors
