"""Unified GNAMMA historical atlas: actual browser tests for one shell across sciences."""
import os
import argparse
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-atlas-v3")
OUT.mkdir(parents=True,exist_ok=True)

def check(condition,msg):
    if not condition:raise AssertionError(msg)

async def snapshot(page):
    return await page.evaluate("""() => ({
      state:window.GNAtlasUnified?.debug(),
      names:[...document.querySelectorAll('.subjects [data-subject]')].map(x=>x.textContent.trim()),
      controlSearch:document.querySelectorAll('#gn-search').length,
      viewTabs:document.querySelectorAll('.viewtabs [data-view]').length,
      timeline:document.querySelectorAll('[data-unified-timeline]').length,
      network:document.querySelectorAll('[data-unified-network]').length,
      principal:document.querySelectorAll('[data-unified-principal]').length,
      chartNodes:document.querySelectorAll('[data-cluster],[data-select],[data-unplaced]').length,
      scrollWidth:document.documentElement.scrollWidth,
      innerWidth:document.documentElement.clientWidth,
      title:document.querySelector('.plot-head h2')?.textContent||'',
      regionCount:document.querySelectorAll('[data-place]').length,
      hash:location.hash,
      side:document.querySelector('.side-content')?.textContent?.slice(0,500)||''
    })""")

async def ready(page):
    await page.wait_for_function("() => window.GNAtlasUnified?.debug().ready",timeout=90000)

async def check_science(page,subject):
    await page.locator(f'[data-subject="{subject}"]').click()
    a=await snapshot(page)
    check(a["state"]["subject"]==subject, f"Wrong subject after {subject}")
    check(a["timeline"]==1, f"{subject} did not use SAME chronological map")
    check(a["controlSearch"]==1 and a["viewTabs"]==5,
          f"{subject} changed the shared UI/controls")
    check(a["chartNodes"]>0, f"No work/cluster nodes for {subject}")
    check(a["innerWidth"]>=a["scrollWidth"]-4,f"Document overflow for {subject}")
    return a

async def main():
    parser=argparse.ArgumentParser(description="GNAMMA unified atlas E2E")
    parser.add_argument("--browser",choices=("chromium","webkit","firefox"),default="chromium")
    parser.add_argument("--width",type=int,default=1335)
    parser.add_argument("--height",type=int,default=890)
    parser.add_argument("--full",action="store_true")
    args,_=parser.parse_known_args()
    async with async_playwright() as p:
        browser=await getattr(p,args.browser).launch(headless=True)
        desktop=await browser.new_page(viewport={"width":1335,"height":890},accept_downloads=True)
        errors=[]
        desktop.on("pageerror",lambda e:errors.append(str(e)))
        response=await desktop.goto(ROOT,wait_until="domcontentloaded",timeout=90000)
        check(response.status==200,"Unified atlas URL failed")
        await ready(desktop)
        a=await snapshot(desktop)
        check(a["state"]["total"]>6000,f"Broad atlas not loaded: {a}")
        check(a["state"]["counts"]["audited"]==404,"404 audited entries changed")
        check(a["state"]["counts"]["alreq"]>=4000,"Alreq register missing")
        check(a["state"]["counts"]["openiti"]>=1800,"OpenITI metadata missing")
        check(a["state"]["edges"]>=380,"Source-qualified relations missing")
        check(a["timeline"]==1,"Historical map not default")
        check(a["viewTabs"]==5,"New unified view selector absent")
        check("All sciences" in a["names"] and "Fiqh" in a["names"],"Subject strip missing")
        for subject in ["fiqh","usul","nahw","sarf","balagha","lugha","hadith","tafsir","tasawwuf","intellectual"]:
            await check_science(desktop,subject)

        # Book-centred network modeled after Hanafi Atlas: three evidence-aware layers.
        await desktop.goto(ROOT+"#view=network&subject=intellectual&work_id=c:ibnarabi_fusus",wait_until="domcontentloaded")
        await ready(desktop)
        a=await snapshot(desktop)
        check(a["state"]["view"]=="network" and a["network"]==1,"Text network is missing")
        check("Rests on" in (await desktop.locator(".plot").inner_text()),"Sources column missing")
        check("Carried on by" in (await desktop.locator(".plot").inner_text()),"Reception column missing")
        check(await desktop.locator("[data-evidence]").count()>0,"No source-inspection controls")
        await desktop.locator("[data-evidence]").first.click()
        check(await desktop.locator(".evidence-inline").count()==1,"Evidence pane failed")
        check("Type:" in await desktop.locator(".evidence-inline").inner_text(),"Source type absent")
        await desktop.locator("[data-close-evidence]").click()
        check(await desktop.locator(".evidence-inline").count()==0,"Evidence close failed")

        # Same science selectors remain available in network as in historical view.
        await desktop.locator('[data-subject="fiqh"]').click()
        check((await snapshot(desktop))["timeline"]==1,"Changing science must open same map")

        # Search all records in Arabic; choosing a work must open one focused network.
        await desktop.locator("#gn-search").fill("الهداية")
        await desktop.wait_for_selector('[data-search-select]',timeout=18000)
        await desktop.locator("[data-search-select]").first.click()
        a=await snapshot(desktop)
        check(a["state"]["view"]=="network","Search did not lead to work-centered network")
        check(a["state"]["selected"],"Search did not retain a work identity")
        check("work_id=" in a["hash"],"Work link missing persistent ID")

        # Subject-independent principal text map; no switching to a different app.
        await desktop.locator('[data-view="principal"]').first.click()
        a=await snapshot(desktop)
        check(a["principal"]==1 and a["viewTabs"]==5,"Principal works is not unified")
        await desktop.locator('[data-view="geography"]').first.click()
        a=await snapshot(desktop)
        check(a["viewTabs"]==5 and a["state"]["view"]=="geography","Geographic view missing")
        await desktop.locator('[data-view="catalogue"]').first.click()
        check(await desktop.locator(".browse-card").count()>0,"Catalogue works unavailable")
        await desktop.screenshot(path=str(OUT/"desktop.png"),full_page=True)

        # The default science map is again the same SVG after returning.
        await desktop.locator('[data-view="timeline"]').first.click()
        a=await snapshot(desktop)
        check(a["timeline"]==1,"Returning to the historical map failed")
        check(not errors,"Browser JS failures: "+" | ".join(errors))

        mobile=await browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
        await mobile.goto(ROOT+"#view=timeline&subject=fiqh",wait_until="domcontentloaded",timeout=90000)
        await ready(mobile)
        a=await snapshot(mobile)
        check(a["timeline"]==1,"Mobile shared map is absent")
        check(a["innerWidth"]>=a["scrollWidth"]-4,"Mobile page overflows rather than scrollable chart")
        await mobile.screenshot(path=str(OUT/"mobile-fiqh.png"),full_page=True)
        await mobile.locator('[data-subject="nahw"]').click()
        a=await snapshot(mobile)
        check(a["timeline"]==1 and a["state"]["subject"]=="nahw","Mobile subject transition changed map")
        await browser.close()
        print("GNAMMA_UNIFIED_ATLAS_V3_PASS")

if __name__=="__main__":
    asyncio.run(main())
