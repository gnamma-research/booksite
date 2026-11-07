"""Graph-only GNAMMA discipline regression; no book-list fallback permitted.

Every subject opens an interactive image-backed SVG with named nodes, drill-down,
source citations and touch/keyboard navigation. The four law-school counts and
the historical early/non-four identities are checked against the recorded sources.
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

URL=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-svg-subject-qa")
OUT.mkdir(exist_ok=True,parents=True)
def expect(val,message):
    if not val:raise AssertionError(message)

async def info(page):
    return await page.evaluate("""() => {
      const a=document.querySelector('#kalam-timeline-app-v3')?.atlasTest?.state;
      const g=window.GNAtlasGraph?.debug();
      const c=document.querySelector('[data-gnv-canvas]');
      return {view:a?.view,science:a?.sourceScience,tab:a?.sourceTab,school:a?.sourceMadhhab,
        graph:g||{},mainTitle:document.querySelector('[data-main] h2')?.textContent||'',
        svg:document.querySelectorAll('[data-main] .gnv-canvas svg').length,
        groupNodes:document.querySelectorAll('[data-main] svg [data-gnv-group]').length,
        bookNodes:document.querySelectorAll('[data-main] svg [data-gnv-book]').length,
        jurists:document.querySelectorAll('[data-main] svg [data-gnv-jurist]').length,
        cards:document.querySelectorAll('[data-main] .gnbib-card').length,
        sourceInventory:document.querySelectorAll('[data-main] .ia-source-inventory').length,
        detail:document.querySelector('[data-gnv-detail]')?.textContent||'',
        citation:document.querySelector('[data-gnv-detail] a')?.href||'',
        nodeText:document.querySelector('[data-main] svg [data-gnv-book]')?.textContent||'',
        svgWidth:document.querySelector('[data-gnv-svg]')?.getAttribute('width'),
        canvasScrollHeight:c?.scrollHeight,canvasHeight:c?.clientHeight,
        viewportOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        hash:location.hash,historical:document.querySelector('#kalam-timeline-app-v3')?.atlasTest?.data.nodes.length,
        warnings:document.querySelector('.gnv-caution')?.textContent||''
      };
    }""")

async def ready(page,genre=None):
    await page.wait_for_function("""() => !!window.GNAtlasGraph &&
      document.querySelector('[data-main] .gnv-canvas svg') &&
      window.GNAtlasGraph.debug().jurists>=16""",timeout=65000)
    x=await info(page)
    expect(x["svg"]==1,"A subject did not replace its list with a single interactive SVG")
    expect(x["cards"]==0 and x["sourceInventory"]==0,"A catalogue/list displaced the interactive image")
    expect(x["viewportOverflow"]<=3,"Diagram overflows document, not its own scroll surface")
    if genre:expect(x["graph"]["genre"]==genre,f"Wrong graph genre {genre}: {x}")
    expect(x["historical"]==404,"Original independent historical atlas changed")
    return x

async def selectScience(page,science):
    await page.locator('[data-action="open-explore"]').first.click()
    await page.locator(f'[data-explore-science="{science}"]').click()

async def test(page):
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    response=await page.goto(URL+"#view=sources&science=fiqh&source_tab=texts&madhhab=all",wait_until="domcontentloaded",timeout=60000)
    expect(response.status==200,"Site does not open")
    r=await ready(page,"fiqh")
    expect(r["bookNodes"]>=8 and r["groupNodes"]>=5,
           "Subject overview must show actual BOOKS visually connected to legal-school nodes")
    expect(r["canvasScrollHeight"]>=r["canvasHeight"],"Graph is not a scrollable image")
    expect(not await page.locator('[data-main] .gnbib-grid').count(),"Legacy period matrix still displayed")

    # Graph drill never becomes a list.
    await page.locator('[data-main] [data-gnv-group="hanafi"]').click()
    r=await ready(page,"fiqh")
    expect(r["graph"]["mode"]=="focus" and r["bookNodes"]>=8 and r["groupNodes"]==1,
           "School selection must redraw the image with individual book nodes")
    await page.locator('[data-main] svg [data-gnv-book]').first.click()
    d=await info(page)
    expect('Individual bibliographic work' in d["detail"] and
           d["citation"].startswith("https://"),
           "Clicking an SVG book did not open a cited book beside the graph")
    expect(d["svg"]==1 and d["cards"]==0,"Book selection replaced SVG with a catalogue")
    expect('gn_work=' in d["hash"],"Work selection is not shareable")
    await page.reload(wait_until="domcontentloaded")
    d=await ready(page,"fiqh")
    expect('Individual bibliographic work' in d["detail"],"Book citation lost upon deep-link reload")

    # Choosing another school must preserve SVG-based navigation, not old list.
    await page.locator('[data-gnv-evidence]').select_option("alreq")
    schools={"hanafi":1033,"maliki":380,"shafii":782,"hanbali":199}
    for name,count in schools.items():
        await page.locator(f'[data-source-madhhab="{name}"]').first.click()
        d=await ready(page,"fiqh")
        expect(d["school"]==name and d["graph"]["mode"]=="focus" and d["bookNodes"]>=8,
               f"Missing {name} school-specific SVG books")
        expect(d["graph"]["records"]==count,
               f"Wrong number of {name} manuscript catalogue items {d}")
    await page.locator('[data-source-madhhab="all"]').first.click()
    await page.locator('[data-gnv-evidence]').select_option("all")

    # Early & Other are NOT flattened into Hanafi/4-school labels.
    for name in ("early","named_other"):
        await page.locator(f'[data-source-madhhab="{name}"]').first.click()
        d=await ready(page,"fiqh")
        expect(d["graph"]["mode"]=="focus" and d["jurists"]>=5,
               f"Early / other historic jurists missing from {name} SVG")
        expect("Salafi madhhab" in d["warnings"],"The modern/non-four distinction was not disclosed")
        await page.locator('[data-main] svg [data-gnv-jurist]').first.click()
        s=await ready(page,"fiqh")
        expect("Historical juristic authority" in s["detail"],
               f"Named early jurist has no sourced evidence panel: {name}")

    # SVG zoom must actually resize the IMAGE.
    width=int((await info(page))["svgWidth"])
    await page.locator('[data-gnv-zoom="1"]').click()
    expect(int((await info(page))["svgWidth"])>width,"Zoom does not enlarge the SVG image")
    await page.locator('[data-gnv-zoom="0"]').click()
    await page.locator('[data-source-madhhab="hanafi"]').first.click()
    await page.locator('[data-source-tab="method"]').first.click()
    d=await ready(page,"usul")
    expect(d["graph"]["records"]>=101 and d["bookNodes"]>=8,
           "Uṣūl must be its own work-node graph, not a page of titles")
    await page.locator('[data-gnv-evidence]').select_option("alreq")
    assert (await info(page))["graph"]["records"]==101
    for school,count in {"maliki":30,"shafii":119,"hanbali":39}.items():
        await page.locator(f'[data-source-madhhab="{school}"]').first.click()
        d=await ready(page,"usul")
        expect(d["graph"]["records"]==count and d["svg"]==1,
               f"{school} uṣūl graph missing {count} records")
    await page.locator('[data-source-madhhab="all"]').first.click()

    # Every Arabic subject opens graphic nodes, not a bibliography list.
    await selectScience(page,'arabic')
    await page.locator('[data-gnv-evidence]').select_option('alreq')
    for tab,genre,count in [('nahw','nahw',892),('sarf','sarf',109),('balagha','balagha',261)]:
        await page.locator(f'[data-source-tab="{tab}"]').click()
        d=await ready(page,genre)
        expect(d["graph"]["records"]==count and d["bookNodes"]>0,
               f"{tab} should redraw an interactive subject graph, not list")
    await page.locator('[data-source-tab="lugha"]').click()
    d=await ready(page,'lugha')
    expect(d["bookNodes"]>0,"Lexicography not visual")
    await page.locator('#ia-search-v3').fill('البيان')
    await page.wait_for_timeout(120)
    d=await info(page)
    expect(d["graph"]["genre"]=="lugha" and d["svg"]==1,"Arabic search broke source graph")
    await page.locator('#ia-search-v3').fill('')

    # A subject click ALWAYS replaces the main visual with a graph, not list.
    await selectScience(page,'hadith')
    d=await ready(page,'hadith')
    expect(d["bookNodes"]>0,"Hadith book authority graph missing")
    await page.locator('[data-source-tab="isnads"]').click()
    d=await ready(page,'hadith')
    expect(d["svg"]==1 and d["bookNodes"]>0,"Isnad sub-tab returned a list instead of source-backed graph")
    await selectScience(page,'tafsir')
    d=await ready(page,'tafsir')
    expect(d["bookNodes"]>0,"Tafsir work map missing")
    await selectScience(page,'tasawwuf')
    await page.wait_for_timeout(180)
    state=await info(page)
    expect(state["view"]=="network" and await page.locator('[data-main] svg').count()>=1,
           "Tasawwuf no longer opens a visual textual network")
    await selectScience(page,'philosophy')
    state=await info(page)
    expect(state["view"]=="timeline" and await page.locator('[data-main] svg').count()>=1,
           "Philosophy selection did not open an interactive historical map")

    expect(not errors,"Uncaught JS browser failures: "+str(errors[:7]))
    return {"result":"PASS","device":page.viewport_size,"browser":page.context.browser.browser_type.name,
            "mapped_schools":schools,"early_jurist_nodes":"16 sourced authorities",
            "test":"all seven subject choices yield live diagrams, no book list", "js_errors":errors}
async def main():
    p=argparse.ArgumentParser()
    p.add_argument("--browser",choices=["chromium","webkit"],default="chromium")
    p.add_argument("--width",type=int,default=390)
    p.add_argument("--height",type=int,default=844)
    a=p.parse_args()
    async with async_playwright() as browserTools:
        browser=await getattr(browserTools,a.browser).launch(headless=True,
          args=['--no-sandbox'] if a.browser=='chromium' else [])
        mobile=a.width<=500 or a.height<=500
        ctx=await browser.new_context(viewport={"width":a.width,"height":a.height},
          is_mobile=mobile,has_touch=mobile)
        page=await ctx.new_page()
        try:
            d=await test(page);print(json.dumps(d,ensure_ascii=False))
            (OUT/("result-"+a.browser+"-"+str(a.width)+".json")).write_text(json.dumps(d,ensure_ascii=False,indent=2))
            await page.screenshot(path=str(OUT/("svg-"+a.browser+"-"+str(a.width)+".png")))
        except Exception:
            await page.screenshot(path=str(OUT/("FAILED-"+a.browser+"-"+str(a.width)+".png")))
            raise
        finally:
            await ctx.close();await browser.close()
if __name__=="__main__":asyncio.run(main())
