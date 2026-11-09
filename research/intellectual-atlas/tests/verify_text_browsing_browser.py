"""Verify left/right text traversal updates full timeline and complete direct graph.

Serve repo root:
  python -m http.server 8123
  python research/intellectual-atlas/tests/verify_text_browsing_browser.py

The test checks the actual Chromium DOM and source graph, not only templates.
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-text-browse-qa")
OUT.mkdir(parents=True,exist_ok=True)
CANONICAL=json.loads((Path(__file__).resolve().parents[1]/"corpora"/"canonical-atlas.json").read_text())
SHIFA_LINKS=sum(e["source"]=="avicenna_shifa" or e["target"]=="avicenna_shifa" for e in CANONICAL["edges"])

def check(cond,message):
    if not cond:raise AssertionError(message)

async def state(page):
    return await page.evaluate("""() => ({
      d: window.GNAtlasUnified?.debug()||{},
      graphNodes:document.querySelectorAll('[data-unified-network] [data-select]').length,
      networkRecords:document.querySelectorAll('.net-card').length,
      graph:document.querySelectorAll('[data-unified-network]').length,
      timeline:document.querySelectorAll('[data-unified-timeline]').length,
      focusedTimeline:document.querySelectorAll('[data-unified-timeline] .text-timeline-selected').length,
      rail:document.querySelectorAll('[data-text-rail]').length,
      railCards:document.querySelectorAll('[data-browse-work]').length,
      railActive:document.querySelector('[data-browse-work][aria-current="true"]')?.getAttribute('data-browse-work'),
      allLinksMessage:document.querySelector('.text-network-complete')?.textContent||'',
      showMore:document.querySelectorAll('[data-more],.network-more').length,
      viewButtons:document.querySelectorAll('[data-text-mode]').length,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      hash:location.hash
    })""")

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        page=await browser.new_page(viewport={"width":1380,"height":860})
        failures=[]
        page.on("pageerror",lambda e:failures.append(str(e)))
        response=await page.goto(ROOT+"#view=network&subject=intellectual&work_id=c:avicenna_shifa",wait_until="domcontentloaded",timeout=80000)
        check(response.status==200,"Atlas route unavailable")
        await page.wait_for_function("() => window.GNAtlasUnified?.debug().ready",timeout=90000)
        a=await state(page)
        check(a["d"]["selected"]=="c:avicenna_shifa","Original focused work lost")
        check(a["graph"]==1 and a["rail"]==1,"Work rail and source graph do not coexist")
        check(a["networkRecords"]==SHIFA_LINKS,f"Expected all {SHIFA_LINKS} directly recorded relations, found {a['networkRecords']}")
        check(a["graphNodes"]==SHIFA_LINKS+1,"Source SVG did not draw all recorded neighbours and selected work")
        check(a["showMore"]==0,"Documented links are still hidden behind Show more")
        check(f"all {SHIFA_LINKS}" in a["allLinksMessage"].lower(),"Graph does not confirm complete recorded links")
        check(a["railActive"]=="c:avicenna_shifa","Rail selection does not reflect graph")
        check(a["viewButtons"]==2,"Local timeline/graph switch missing")
        check(a["overflow"]<=4,"Desktop text browser causes document overflow")
        await page.screenshot(path=str(OUT/"full-shifa-network.png"),full_page=True)

        # One arrow advances the source graph automatically, without clicking a node.
        await page.locator('[data-browse-step="1"]').click()
        b=await state(page)
        check(b["d"]["selected"]!=a["d"]["selected"],"Next arrow did not advance work")
        check(b["d"]["view"]=="network" and b["graph"]==1,"Graph disappeared on next work")
        check(b["graphNodes"]==b["networkRecords"]+1,"Selected graph is not fully drawn")
        check(b["railActive"]==b["d"]["selected"],"Rail did not keep selected work centered")
        check(b["showMore"]==0,"Next work still requires showing hidden connections")

        # Keyboard repeatedly traverses works without losing focus on re-render.
        old=b["d"]["selected"]
        await page.locator('[data-text-rail]').focus()
        await page.keyboard.press("ArrowRight")
        c=await state(page)
        check(c["d"]["selected"]!=old,"ArrowRight did not advance to next work")
        await page.keyboard.press("ArrowLeft")
        d=await state(page)
        check(d["d"]["selected"]==old,"ArrowLeft did not return to previous work")

        # Change visualization, not text. Original timeline remains selected/highlighted.
        await page.locator('[data-text-mode="timeline"]').click()
        e=await state(page)
        check(e["d"]["view"]=="timeline" and e["timeline"]==1,"Timeline toggle failed")
        check(e["d"]["selected"]==old and e["railActive"]==old,"Timeline lost the selected work")
        check(e["focusedTimeline"]>0,"Historical map does not mark selected work automatically")
        check(await page.locator(".text-browser").count()==1,"Timeline lacks common browse rail")
        await page.locator('[data-browse-step="-1"]').click()
        f=await state(page)
        check(f["d"]["selected"]!=old and f["timeline"]==1,"Timeline did not browse previous work")
        check(f["focusedTimeline"]>0,"Browsing timeline did not highlight focused text")
        await page.locator('[data-text-mode="network"]').click()
        g=await state(page)
        check(g["graph"]==1 and g["d"]["selected"]==f["d"]["selected"],"Returning to graph lost timeline focus")

        # Native scrolling through the horizontal rail must update the graph.
        await page.wait_for_function("() => document.querySelector('[data-text-rail]')?.dataset.ready === '1'",timeout=15000)
        before=g["d"]["selected"]
        await page.locator('[data-text-rail]').evaluate("""rail => {
          rail.scrollLeft += 220;
          rail.dispatchEvent(new Event('scroll'));
        }""")
        await page.wait_for_function("id => window.GNAtlasUnified?.debug().selected !== id",arg=before,timeout=9000)
        h=await state(page)
        check(h["graph"]==1 and h["railActive"]==h["d"]["selected"],"Rail scroll did not redraw and recenter graph")

        # All catalogued works are opt-in, including those with no verified edges.
        await page.locator('[data-browse-mode="all"]').click()
        z=await state(page)
        check(z["d"]["browseMode"]=="all","All catalogued scope failed")
        check(z["d"]["browseLength"]>a["d"]["browseLength"],"Unlinked works inaccessible from navigation")
        check("browse=all" in z["hash"],"Browse scope does not survive permalink")
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_function("() => window.GNAtlasUnified?.debug().ready",timeout=90000)
        check((await state(page))["d"]["browseMode"]=="all","Deep-link reload lost browse scope")

        # Mobile swipe changes focused text without clicking an individual card.
        mobile=await browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
        await mobile.goto(ROOT+"#view=network&subject=intellectual&work_id=c:avicenna_shifa",wait_until="domcontentloaded",timeout=80000)
        await mobile.wait_for_function("() => window.GNAtlasUnified?.debug().ready",timeout=90000)
        before=(await state(mobile))["d"]["selected"]
        await mobile.locator('[data-text-rail]').evaluate("""rail => {
          const touchA=new Touch({identifier:1,target:rail,clientX:288,clientY:330});
          rail.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touchA],changedTouches:[touchA]}));
          const touchB=new Touch({identifier:1,target:rail,clientX:170,clientY:333});
          rail.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[touchB]}));
        }""")
        m=await state(mobile)
        check(m["d"]["selected"]!=before,"Horizontal mobile swipe did not advance")
        check(m["graph"]==1 and m["railActive"]==m["d"]["selected"],"Mobile swipe did not redraw graph")
        check(m["overflow"]<=4,"Mobile text rail overflows the document")
        await mobile.screenshot(path=str(OUT/"mobile-swiped-graph.png"),full_page=True)
        check(not failures,"Uncaught JavaScript errors: "+" | ".join(failures))
        await browser.close()
        print("GNAMMA_TEXT_AUTOBROWSE_PASS")

if __name__=="__main__":
    asyncio.run(main())
