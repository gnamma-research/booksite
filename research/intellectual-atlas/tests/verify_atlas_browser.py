"""Browser regression checks for the Gnamma Intellectual Atlas (revision 6).

Run on a local HTTP server from repository root at port 8123, with playwright and
Chromium installed. CI captures the outcomes and screenshots under /tmp.
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

URL = os.environ.get("GN_ATLAS_URL", "http://127.0.0.1:8123/research/intellectual-atlas/")
OUT = Path(os.environ.get("GN_ATLAS_QA_OUT", "/tmp/gnamma-atlas-browser"))
OUT.mkdir(parents=True, exist_ok=True)
report = []

def assert_that(condition, message):
    if not condition:
        raise AssertionError(message)

async def read(page):
    return await page.evaluate("""() => {
      const root = document.querySelector('#kalam-timeline-app-v3');
      const chart = document.querySelector('[data-chart]');
      const sheet = document.querySelector('[data-sheet]');
      const a=root?.atlasTest;
      return {ready:!!a, view:a?.state.view, from:a?.state.from, to:a?.state.to,
        selected:a?.state.selected, region:a?.state.regionNetwork, family:a?.state.textFamily,
        chartHeight:chart?.clientHeight, chartScroll:chart?.scrollHeight,
        scrollTop:chart?.scrollTop, overflow:chart?getComputedStyle(chart).overflowY:null,
        sheetHeight:sheet?.clientHeight, sheetScroll:sheet?.scrollHeight,
        svgWidth:chart?.querySelector('svg')?.getBoundingClientRect()?.width,
        activeCount:a?.filteredNodes(false)?.length, errors:[]};
    }""")

async def visit(browser, width, height, mobile=False):
    context=await browser.new_context(
        viewport={"width":width,"height":height},device_scale_factor=1,
        is_mobile=mobile,has_touch=mobile,
    )
    page=await context.new_page()
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    response=await page.goto(URL, wait_until="domcontentloaded",timeout=60000)
    assert_that(response and response.status==200, "Atlas HTTP 200")
    await page.locator('[data-chart]').wait_for(timeout=40000)
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest",timeout=40000)
    initial=await read(page)
    assert_that(initial["ready"],"Initialized atlas")
    assert_that(initial["chartScroll"]>initial["chartHeight"]+100,"Chart needs independent vertical scroll")
    assert_that(initial["overflow"] in ["auto","scroll"],"Chart vertical overflow must be scrollable")
    assert_that(initial["chartHeight"]<=height+3,"Chart has bounded height")
    await page.locator('[data-chart]').scroll_into_view_if_needed()
    await page.locator('[data-chart]').hover(position={"x":30,"y":min(70,initial["chartHeight"]-10)},force=True)
    if mobile and browser.browser_type.name=='webkit':
        # Mobile WebKit deliberately rejects mouse.wheel in Playwright. Check the
        # actual scrollable region and the wheel intent handler without pretending
        # a synthetic event verifies real finger-swipe momentum.
        await page.locator('[data-chart]').evaluate('(e)=>e.scrollTop=390')
        vertical=await read(page)
        assert_that(vertical["scrollTop"]>0,"Mobile WebKit must expose a scrollable chart")
        prevented=await page.locator('[data-chart]').evaluate("""(e)=>{
            const w=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:220});
            e.dispatchEvent(w);return w.defaultPrevented;
        }""")
        assert_that(not prevented,"Vertical wheel intent must not be trapped by WebKit handler")
        await page.locator('[data-chart]').evaluate('(e)=>e.scrollTop=Math.max(0,e.scrollTop-170)')
        scroll_back=await read(page)
        assert_that(scroll_back["scrollTop"]<vertical["scrollTop"],"Mobile WebKit scroll region moves up")
        await page.locator('[data-chart]').evaluate("""(e)=>{
            e.dispatchEvent(new WheelEvent('wheel',
               {bubbles:true,cancelable:true,deltaX:420,deltaY:0}));
        }""")
        await page.wait_for_timeout(250)
        horizontal=await read(page)
    else:
        await page.mouse.wheel(0,390)
        await page.wait_for_timeout(180)
        vertical=await read(page)
        assert_that(vertical["scrollTop"]>0,"Ordinary vertical wheel must scroll the diagram")
        await page.mouse.wheel(0,-170)
        await page.wait_for_timeout(140)
        scroll_back=await read(page)
        assert_that(scroll_back["scrollTop"]<vertical["scrollTop"],
                    "The same long panel must scroll back UP, not just down")
        await page.mouse.wheel(0,170)
        await page.wait_for_timeout(140)
        await page.mouse.wheel(420,0)
        await page.wait_for_timeout(240)
        horizontal=await read(page)
    assert_that(vertical["from"]==initial["from"],"Vertical scrolling must NOT pan centuries")
    assert_that(horizontal["from"]!=initial["from"],"Horizontal gesture must pan chronology")
    # The selected text panel must retain an independent scroll region on desktop.
    await page.evaluate("""() => document.querySelector('#kalam-timeline-app-v3')
        .atlasTest.selectNode('jurjani_mawaqif',true)""")
    panel=await read(page)
    if width>=900:
        assert_that(panel["sheetHeight"]<=height+5,"Desktop details panel must fit the viewport")
        assert_that((await page.locator('[data-sheet]').evaluate('(e)=>getComputedStyle(e).overflowY')) in ['auto','scroll'],
                    "Desktop detail panel should scroll when content grows")
    assert_that(await page.locator('[data-sheet] button[data-text-route="mawaqif"]').count()>0,
                "A Jurjani work should link to its Mawāqif route")
    assert_that(await page.locator('[data-sheet] button[data-text-route="tajrid"]').count()>0,
                "Jurjani should have a cross-work route to Tajrīd")
    await page.locator('[data-action="close-detail"]').click()
    # Region and textual family are independent dimensions.
    await page.locator('[data-region-network]').select_option('southasia')
    southasia=await read(page)
    assert_that(southasia["region"]=='southasia' and southasia["activeCount"]>0,
                "South Asia must be a usable regional subset")
    await page.locator('[data-text-family]').select_option('tahdhib')
    combined=await read(page)
    assert_that(combined["region"]=='southasia' and combined["family"]=='tahdhib',
                "Regional and textual family dimensions must intersect rather than replace one another")
    await page.locator('[data-region-network]').select_option('')
    await page.locator('[data-text-family]').select_option('')
    # The broad three-level hierarchy is discoverable without forcing one taxonomy.
    assert_that(await page.locator('.ia-tradition-explorer [data-tradition-route]').count()==14,
                "Tradition summary explorer lists all primary catalogue colours")
    assert_that(await page.locator('.ia-region-explorer [data-region-route]').count()==10,
                "Regional summary explorer lists ten contextual routes")
    await page.locator('.ia-tradition-explorer summary').click()
    await page.locator('.ia-tradition-explorer [data-tradition-route="sunni"]').click()
    await page.locator('[data-region-network]').select_option('southasia')
    await page.locator('[data-text-family]').select_option('tahdhib')
    independent=await page.evaluate("""() => {
      const s=document.querySelector('#kalam-timeline-app-v3').atlasTest.state;
      return {traditions:[...s.families],region:s.regionNetwork,family:s.textFamily};
    }""")
    assert_that(independent['traditions']==['sunni'] and independent['region']=='southasia' and independent['family']=='tahdhib',
                "All three classification filters survive selection and can intersect")
    await page.locator('[data-action="whole-atlas"]').click()
    await page.locator('.ia-region-explorer summary').click()
    await page.locator('.ia-region-explorer [data-region-route="khurasan"]').click()
    assert_that((await read(page))['region']=='khurasan',"Regional summary buttons apply context filters")
    await page.locator('[data-action="whole-atlas"]').click()
    await page.locator('.ia-route-explorer:has([data-text-route]) > summary').click()
    assert_that(await page.locator('.ia-route-explorer [data-text-route]').count()==12,
                "12 peer-level commentary family buttons available")
    await page.locator('.ia-route-explorer [data-text-route="tajrid"]').click()
    family=await read(page)
    assert_that(family["family"]=='tajrid',"Textual family button selects Tajrid")
    await page.locator('[data-text-family]').select_option('')
    # Sourced ancient bridge and political context, without spurious influence edges.
    await page.evaluate("""() => {
        const a=document.querySelector('#kalam-timeline-app-v3').atlasTest;
        a.setRange(-550,-250);
    }""")
    await page.wait_for_timeout(120)
    ancient=await page.evaluate("""() => {
      const a=document.querySelector('#kalam-timeline-app-v3').atlasTest;
      return {ids:a.getVisible().nodes,events:[...document.querySelectorAll('[data-polity]')]
        .map(e=>e.getAttribute('data-history'))};
    }""")
    assert_that('parmenides_poem' in ancient['ids'] and 'heraclitus_fragments' in ancient['ids'],
                "Ancient bridge nodes show between Pythagoras and Plato")
    assert_that('GNA-P01' in ancient['events'] and 'GNA-P02' in ancient['events'],
                "Achaemenid and Hellenistic background periods plot")
    # Suri interregnum in Mughal historical band must be legible, not blank missing data.
    await page.evaluate("""() => document.querySelector('#kalam-timeline-app-v3')
        .atlasTest.setRange(1490,1600)""")
    gaps=await page.locator('a[data-history="HL_P13"] .ia-polity-gap').count()
    assert_that(gaps>=1,"Dashed Mughal Suri interruption visible")
    await page.locator('[data-chart]').focus()
    before=await read(page)
    await page.keyboard.press('ArrowRight')
    after=await read(page)
    assert_that(before["from"]!=after["from"],"Keyboard arrow navigates chronology")
    await page.emulate_media(color_scheme='dark')
    dark=await page.locator('[data-chart]').evaluate('(e)=>getComputedStyle(e).backgroundColor')
    assert_that(dark not in ['', 'transparent','rgba(0, 0, 0, 0)'],"Dark theme uses visible canvas background")
    await page.screenshot(path=str(OUT/f"atlas_{browser.browser_type.name}_{width}x{height}.png"),full_page=False)
    assert_that(not errors, "JavaScript page errors: "+str(errors[:3]))
    report.append({"browser":browser.browser_type.name,"viewport":f"{width}x{height}","scroll_px":vertical["scrollTop"],
        "start_initial":initial["from"],"start_after_horizontal":horizontal["from"],
        "ancient_nodes":len(ancient["ids"]),"mughal_gaps":gaps,"script_errors":errors})
    await context.close()

async def main():
    async with async_playwright() as p:
        for engine,device_sizes in [
            (p.chromium,[(1440,900,False),(1024,768,False),(390,844,True),(844,390,True)]),
            (p.webkit,[(1440,900,False),(390,844,True)])
        ]:
            browser=await engine.launch(headless=True,args=["--no-sandbox"] if engine.name=='chromium' else [])
            for width,height,mobile in device_sizes:
                try:
                    await visit(browser,width,height,mobile)
                    print("PASS",engine.name,width,height)
                except Exception as error:
                    print("FAIL",engine.name,width,height,repr(error))
                    raise
            await browser.close()
    (OUT/"report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report,indent=2))

if __name__=="__main__":
    asyncio.run(main())
