"""GNAMMA books-by-century, geographical atlas and source network browser contract.

Served from repository root:
  python -m http.server 8123
  python research/intellectual-atlas/tests/verify_unified_v3_browser.py
"""
import argparse
import asyncio
import json
import os
import re
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-atlas-v3")
OUT.mkdir(parents=True,exist_ok=True)
CORPORA=Path(__file__).resolve().parents[1]/"corpora"
FIQH=json.loads((CORPORA/"fiqh-research.json").read_text())
FIQH_COUNTS=FIQH["metadata"]["summary"]
BENCHMARK_COUNT=len(json.loads((CORPORA/"hanafi-atlas-benchmark.json").read_text())["works"])

def check(value,message):
    if not value: raise AssertionError(message)

def first_number(text):
    match=re.search(r"\d[\d,\u00a0\u202f]*",text)
    check(match is not None,"Visible count missing: "+text)
    return int(re.sub(r"\D","",match.group()))

async def snap(page):
    return await page.evaluate("""() => ({
      state:window.GNAtlasUnified?.debug()||{},
      geo:window.GNAMMAGeography?.debug()||{},
      viewTabs:[...document.querySelectorAll('.viewtabs [data-view]')].map(x=>x.textContent.trim()),
      controls:document.querySelectorAll('[data-science]').length,
      map:document.querySelectorAll('[data-geo-map]').length,
      coast:document.querySelectorAll('[data-geo-map] .geo-coastline').length,
      mapMarkers:document.querySelectorAll('[data-geo-city]').length,
      timeline:document.querySelectorAll('[data-unified-timeline]').length,
      network:document.querySelectorAll('[data-unified-network]').length,
      principal:document.querySelectorAll('[data-unified-principal]').length,
      selectedCity:document.querySelector('.geo-city-sheet h3')?.textContent||'',
      evidence:document.querySelectorAll('.evidence-inline').length,
      sourceLinks:document.querySelectorAll('.geo-event a[href]').length,
      htmlOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      hash:location.hash
    })""")

async def wait_ready(page):
    await page.wait_for_function("() => window.GNAtlasUnified?.debug().ready && !!window.GNAMMAGeography",timeout=85000)

async def check_subject(page,name):
    await page.locator('[data-science]').select_option(name)
    a=await snap(page)
    check(a["state"]["subject"]==name,"Subject not selected: "+name)
    check(a["map"]==1 and a["coast"]==1,"Subject has a different (or absent) cartographic interface: "+name)
    check(a["state"]["view"]=="geography","Subject switch unexpectedly changed view: "+name)
    check(a["controls"]==1 and len(a["viewTabs"])==6,"Controls diverge across sciences: "+name)
    check(a["htmlOverflow"]<=4,"Document overflows on "+name)
    return a

async def check_fiqh_count(page,school="all"):
    expected=FIQH_COUNTS["distinct_works"] if school=="all" else FIQH_COUNTS["school_counts"][school]
    s=await snap(page)
    check(s["state"]["subject"]=="fiqh" and s["state"]["source"]=="research","Fiqh did not select its research register")
    check(s["state"]["school"]==school and s["state"]["browseMode"]=="all","Fiqh school selection hid works or retained another school")
    check(s["state"]["currentMatches"]==expected and s["state"]["browseLength"]==expected,
          f"{school}: expected {expected} researched works in both results and browse navigation")
    button=page.locator(f'[data-fiqh-school="{school}"]')
    check(await button.get_attribute("aria-pressed")=="true","School count button is not selected: "+school)
    check(first_number(await button.locator('strong').inner_text())==expected,"Visible school total differs from the generated register: "+school)
    status=page.locator('.coverage-status')
    check(await status.is_visible(),"Fiqh result count is hidden")
    check(first_number(await status.inner_text())==expected,"Visible fiqh result count does not follow the school selection")
    check(s["timeline"]==1,"Fiqh scope change lost Books by century")

async def check_corpus_scopes(page):
    # Research defaults must expose every work, independent of links or locations.
    await page.locator('[data-science]').select_option('fiqh')
    await check_fiqh_count(page)
    check(first_number(await page.locator('.corpus-coverage h2').inner_text())==FIQH_COUNTS["distinct_works"],
          "Visible research coverage total differs from the generated register")
    for school in ['hanafi','shafii']:
        await page.locator(f'[data-fiqh-school="{school}"]').click()
        await check_fiqh_count(page,school)
    await page.locator('[data-fiqh-school="all"]').click()
    await check_fiqh_count(page)

    # An explicit all-source scope must survive reload despite the research default.
    await page.locator('[data-corpus="all"]').click()
    imported=await snap(page)
    imported_visible=first_number(await page.locator('.coverage-status').inner_text())
    check(imported["state"]["source"]=="all" and imported["state"]["currentMatches"]>FIQH_COUNTS["distinct_works"],
          "Include imported records did not expand the fiqh register")
    check(imported_visible>FIQH_COUNTS["distinct_works"],"Visible result count did not include imported works")
    check(await page.locator('[data-corpus="all"]').get_attribute('aria-pressed')=='true',"Imported scope button is not selected")
    check('source_tier=all' in imported['hash'],"Explicit all-source scope is missing from the permalink")
    await page.reload(wait_until="domcontentloaded")
    await wait_ready(page)
    reloaded=await snap(page)
    check(reloaded["state"]["source"]=="all" and reloaded["state"]["currentMatches"]==imported["state"]["currentMatches"],
          "Reload replaced imported fiqh records with the research default")
    check(first_number(await page.locator('.coverage-status').inner_text())==imported_visible,"Reload changed the visible imported-record total")

    # Historical biography is a separate subject and cannot inflate fiqh totals.
    await page.locator('[data-subject="biography"]').click()
    s=await snap(page)
    check(s["state"]["subject"]=="biography" and s["state"]["source"]=="benchmark","Biography did not open its attributed benchmark")
    check(s["state"]["currentMatches"]==BENCHMARK_COUNT and s["state"]["browseLength"]==BENCHMARK_COUNT,
          "The complete Hanafi benchmark is not browsable")
    check(first_number(await page.locator('.corpus-coverage h2').inner_text())==BENCHMARK_COUNT,"Visible benchmark total is incorrect")
    check(await page.locator('.corpus-coverage a[href="https://www.hanafiatlas.com/catalogue"]').is_visible(),
          "Benchmark attribution is not visible")
    await page.locator('[data-science]').select_option('fiqh')
    await check_fiqh_count(page)

    # Research records without dates remain accessible within the same fiqh scope.
    await page.locator('[data-open-unplaced-all]').click()
    shelf=page.locator('[data-time-workbench]')
    check(await shelf.is_visible(),"Undated researched works did not open a visible workbench")
    check(first_number(await shelf.locator('h3 small').inner_text())==FIQH_COUNTS["undated_works"],
          "Undated research workbench total differs from the generated register")
    cards=page.locator('[data-cluster-work]')
    check(await cards.count()>0,"Undated research workbench has no accessible books")
    check(await cards.evaluate_all("cards => cards.every(c => c.dataset.clusterWork.startsWith('fq:'))"),
          "Undated fiqh workbench leaked a different source register")
    await cards.first.click()
    check(await page.locator('[data-shelf-inspector]').is_visible(),"An undated researched book cannot be inspected")
    await page.locator('[data-close-shelf]').click()
    await page.locator('[data-science]').select_option('all')

async def main():
    p=argparse.ArgumentParser()
    p.add_argument("--browser",choices=["chromium","webkit","firefox"],default="chromium")
    p.add_argument("--width",type=int,default=1400)
    p.add_argument("--height",type=int,default=900)
    p.add_argument("--full",action="store_true")
    args,_=p.parse_known_args()
    async with async_playwright() as pw:
        browser=await getattr(pw,args.browser).launch(headless=True)
        page=await browser.new_page(viewport={"width":args.width,"height":args.height},accept_downloads=True)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        resp=await page.goto(ROOT,wait_until="domcontentloaded",timeout=85000)
        check(resp.status==200,"Atlas failed HTTP request")
        await wait_ready(page)
        s=await snap(page)
        check(s["state"]["counts"]["audited"]==404,"Audited historical 404 entries missing")
        check(s["state"]["counts"]["alreq"]==4157,"Complete Alreq bibliography missing")
        check(s["state"]["counts"]["openiti"]>=1800,"OpenITI bibliography missing")
        check(s["state"]["edges"]>=380,"Source graph relationships missing")
        check(s["state"]["view"]=="timeline" and s["timeline"]==1,"Books by century is not the opening view")
        check(s["state"]["browseMode"]=="all","Opening browse scope hides works without recorded relationships")
        check("Books by century" in s["viewTabs"] and "By region" in s["viewTabs"] and "Source network" in s["viewTabs"],
              "Common historical-source view selector missing")

        await check_corpus_scopes(page)

        # Geography remains an explicit view with its own sourced place evidence.
        await page.locator('[data-view="geography"]').click()
        s=await snap(page)
        check(s["state"]["view"]=="geography" and s["map"]==1,"Explicit geographical view did not open")
        check(s["coast"]==1,"Geo map lacks actual geographical coastlines")
        check(s["geo"]["events"]>=38 and s["mapMarkers"]>=18,"Curated map points did not load")
        await page.screenshot(path=str(OUT/f"map-{args.browser}-{args.width}.png"),full_page=True)

        # Historical geography: independently sourced work/author events at Damascus.
        await page.locator('[data-geo-city="damascus"]').first.click()
        s=await snap(page)
        check(s["geo"]["city"]=="damascus" and s["sourceLinks"]>0,
              "Damascus location dossier lacks primary/scholarly citations")
        check("Fuṣūṣ" in await page.locator('.geo-city-sheet').inner_text() or "Futūḥāt" in await page.locator('.geo-city-sheet').inner_text(),
              "Place dossier should distinguish one or more actual textual events")
        check("geo_city=damascus" in s["hash"],"Geographical city permalink not preserved")

        await page.locator('[data-geo-layer="work"]').click()
        s=await snap(page)
        check(s["geo"]["layer"]=="work" and s["mapMarkers"]>0,"Text composition layer failed")
        check("TEXT" in await page.locator('.geo-layout').inner_text(),"Text/event distinction missing")
        await page.locator('[data-geo-layer="author"]').click()
        s=await snap(page)
        check(s["geo"]["layer"]=="author" and s["mapMarkers"]>0,"Author biography layer failed")
        await page.locator('[data-geo-layer="both"]').click()
        # On narrow screens the century chips are correctly replaced by a visible select.
        if args.width<=530:
            await page.locator('[data-geo-century-select]').select_option('7')
        else:
            await page.locator('[data-geo-century="7"]').first.click()
        s=await snap(page)
        check(s["geo"]["century"]=="7" and s["map"]==1 and s["mapMarkers"]>0,"Chronological AH century filter failed")
        if args.width<=530:
            await page.locator('[data-geo-century-select]').select_option('all')
        else:
            await page.locator('[data-geo-century="all"]').first.click()

        # Same map and controls across law, language, theology, Sufism, Qur'anic and hadith subjects.
        for subject in ["fiqh","usul","nahw","sarf","balagha","lugha","hadith","tafsir","tasawwuf","biography","intellectual"]:
            await check_subject(page,subject)

        # A region is a geographical chapter, not a completely different UI.
        await page.locator('[data-view="regions"]').click()
        s=await snap(page)
        check(s["state"]["view"]=="regions" and s["map"]==1,"By region did not retain same geographical map")
        check(await page.locator('.geo-region-card').count()>0,"Region-level evidence chapters missing")
        await page.locator('[data-geo-region="Khurasan"]').first.click()
        s=await snap(page)
        check(s["geo"]["region"]=="Khurasan" and s["mapMarkers"]>0,"Region filter did not select actual locations")
        await page.locator('[data-geo-region="all"]').first.click()

        # Hanafi-style source genealogy with explicit upstream/downstream evidence.
        await page.goto(ROOT+"#view=network&subject=intellectual&work_id=c:ibnarabi_fusus",wait_until="domcontentloaded")
        await wait_ready(page)
        s=await snap(page)
        check(s["network"]==1,"Source network SVG missing")
        check("Rests on" in await page.locator('.plot').inner_text(),"Antecedent section missing")
        check("Carried on by" in await page.locator('.plot').inner_text(),"Reception section missing")
        check(await page.locator('[data-evidence]').count()>0,"No evidence inspection")
        await page.locator('[data-evidence]').first.click()
        check((await snap(page))["evidence"]==1,"Selecting relation failed")
        check("Type:" in await page.locator('.evidence-inline').inner_text(),"Evidence type not shown")

        # New work searches must remain possible with Latin/Arabic scripts and not replace controls.
        await page.locator('#gn-search').fill('الهداية')
        await page.wait_for_selector('[data-search-select]',timeout=20000)
        await page.locator('[data-search-select]').first.click()
        s=await snap(page)
        check(s["state"]["selected"] and s["state"]["view"]=="network","Arabic work-centred search failed")
        check("work_id=" in s["hash"],"Work permalink missing")

        await page.locator('[data-view="timeline"]').click()
        s=await snap(page)
        check(s["timeline"]==1 and s["controls"]==1,"Historical work timeline unavailable")
        await page.locator('[data-view="principal"]').click()
        check((await snap(page))["principal"]==1,"Principal-text vertical map missing")
        await page.locator('[data-view="catalogue"]').click()
        check(await page.locator('.browse-card').count()>0,"Bibliographic catalogue inaccessible")
        check(not errors,"Uncaught JS errors: "+"; ".join(errors))

        # Mobile retains one map and has no document-wide horizontal overflow.
        mobile=await browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
        await mobile.goto(ROOT+"#view=geography&subject=fiqh",wait_until="domcontentloaded")
        await wait_ready(mobile)
        s=await snap(mobile)
        check(s["map"]==1 and s["coast"]==1,"Mobile real geographic map missing")
        check(s["htmlOverflow"]<=4,"Mobile map overflows document")
        await mobile.screenshot(path=str(OUT/f"mobile-fiqh-{args.browser}.png"),full_page=True)
        await mobile.locator('[data-science]').select_option('nahw')
        s=await snap(mobile)
        check(s["map"]==1 and s["state"]["subject"]=="nahw","Mobile changed map between sciences")
        await browser.close()
        print("GNAMMA_HANAFI_GEOGRAPHY_ATLAS_PASS")

if __name__=="__main__":
    asyncio.run(main())
