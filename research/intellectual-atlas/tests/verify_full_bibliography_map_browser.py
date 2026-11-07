"""Browser QA: thousands of cited works MUST be in GNAMMA's actual source map.

Chromium/WebKit, portrait/landscape; checks evidence URLs, school/period bubbles,
individual-work inspection and stable shareable state. Does not claim manuscript
texts were acquired or historical source-to-source dependency edges were verified.
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

BASE=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-full-bibmap-qa");OUT.mkdir(parents=True,exist_ok=True)

def check(v,why):
    if not v:raise AssertionError(why)

async def snap(page):
    return await page.evaluate("""() => {
      const root=document.getElementById('kalam-timeline-app-v3');
      const app=root?.atlasTest?.state, bib=window.GNAtlasBibliography?.debug();
      return {view:app?.view,science:app?.sourceScience,tab:app?.sourceTab,
        school:app?.sourceMadhhab,loaded:bib?.ready,records:bib?.count,
        activeGenre:bib?.activeGenre,tier:bib?.tier,band:bib?.band,period:bib?.period,
        heading:root.querySelector('[data-main] h2')?.textContent||'',
        counts:root.querySelector('[data-counts]')?.textContent||'',
        mapCells:root.querySelectorAll('[data-gnbib-cluster]').length,
        cards:root.querySelectorAll('.gnbib-card').length,
        firstTitle:root.querySelector('.gnbib-card .gnbib-book span')?.textContent||'',
        sourceURLs:[...root.querySelectorAll('.gnbib-card a')].map(a=>a.href),
        detail:root.querySelector('.gnbib-detail')?.textContent||'',
        hash:location.hash,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        historical:root.atlasTest?.data.nodes.length};
    }""")

async def wait_bib(page,kind=None):
    await page.wait_for_function("""() => window.GNAtlasBibliography?.debug()?.ready &&
      document.querySelector('.gnbib-map') && document.querySelectorAll('.gnbib-card').length > 0""",timeout=60000)
    s=await snap(page)
    if kind:check(s['activeGenre']==kind,f"Expected {kind} source genre: {s}")
    check(s['overflow']<=3,"Map overflows the document viewport")
    check(s['mapCells']>0,"The main map did not render clickable category/period cells")
    check(s['cards']==32,"Expected 32 actual source records on first map page")
    return s

async def source_tier(page,tier):
    await page.locator('select[data-gnbib-tier]').select_option(tier)
    await page.wait_for_timeout(50)

async def science(page,name):
    await page.locator('[data-action="open-explore"]').first.click()
    await page.locator(f'[data-explore-science="{name}"]').click()

async def test(page):
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'favicon' not in m.text.lower() else None)
    response=await page.goto(BASE+'#view=sources&science=fiqh&source_tab=texts&madhhab=all',wait_until='domcontentloaded')
    check(response and response.status==200,"Main atlas did not load")
    s=await wait_bib(page,'fiqh')
    check(s['view']=='sources' and s['historical']==404,"Canonical atlas changed")
    check(s['records']>5500,"Full OpenITI and manuscript registers not in actual map")
    check('Bibliographic map' in s['heading'] and 'cited' in s['counts'],"Bibliographic map heading/counters missing")
    check(not await page.locator('[data-main] .ia-source-expansion-grid').count(),
      "App still shows only old shortlist preview instead of full bibliographic map")

    # Every four madhhab's entire fiqh manuscript source category is mapped.
    await source_tier(page,"alreq")
    expected={"hanafi":1033,"maliki":380,"shafii":782,"hanbali":199}
    for school,count in expected.items():
        await page.locator(f'.gnbib-schools [data-source-madhhab="{school}"]').click()
        snap1=await wait_bib(page,'fiqh')
        check(snap1['school']==school,school+" selection did not update atlas state")
        check(f"{count} cited source records" in await page.locator('[data-main]').inner_text(),
              school+" full manuscript fiqh category missing")
        check(all(url.startswith('https://app.alreq.com/ar/') for url in snap1['sourceURLs']),
              school+" cards lack exact original bibliographic citations")
    await page.locator('[data-source-madhhab="hanafi"]').first.click()
    await page.locator('[data-gnbib-cluster="hanafi|undated"]').click()
    focused=await snap(page)
    check(focused['band']=='hanafi' and focused['period']=='undated',
          "Undated school cluster cannot be selected")
    await page.locator('.gnbib-card [data-gnbib-book]').first.click()
    detail=await snap(page)
    check('Bibliographic citation' in detail['detail'] and 'Undated catalogue record' in detail['detail'],
          "Map card did not show source citation or undated qualification")
    check('bib_work=' in detail['hash'] and 'bib_period=undated' in detail['hash'],
          "Selected book/period not shareable")
    await page.reload(wait_until='domcontentloaded')
    snap1=await wait_bib(page,'fiqh')
    check('Bibliographic citation' in snap1['detail'],"Book citation lost on reload")

    # Uṣūl map is not a tiny 4-book placeholder: all published catalogue
    # citations and provisional school attribution are visible.
    await page.locator('[data-source-tab="method"]').click()
    s=await wait_bib(page,'usul')
    check(s['school']=='hanafi' and s['cards']==32,"Cannot switch to Hanafi usul")
    check('101 cited source records' in await page.locator('[data-main]').inner_text(),
          "Full Hanafi usul bibliography not displayed")
    for school,count in (('maliki',30),('shafii',119),('hanbali',39)):
        await page.locator(f'.gnbib-schools [data-source-madhhab="{school}"]').click()
        ss=await wait_bib(page,'usul')
        check(f"{count} cited source records" in await page.locator('[data-main]').inner_text(),
              school+" uṣūl school association missing")
        if count>=32:check(ss['cards']==32,school+" pagination missing")

    # Grammar and balagha are real atlas layers with all corpus-linked entries.
    await science(page,'arabic')
    s=await wait_bib(page,'nahw')
    check(s['records']>5500 and 'Grammar' not in s['heading'] or s['activeGenre']=='nahw',
          "Grammar view did not display")
    await source_tier(page,'alreq')
    text=await page.locator('[data-main]').inner_text()
    check('892 cited source records' in text,"Full nahw manuscript bibliography not in map")
    await page.locator('[data-source-tab="sarf"]').click()
    s=await wait_bib(page,'sarf')
    check('109 cited source records' in await page.locator('[data-main]').inner_text(),
          "Morphology source category incomplete")
    await page.locator('[data-source-tab="balagha"]').click()
    s=await wait_bib(page,'balagha')
    check('261 cited source records' in await page.locator('[data-main]').inner_text(),
          "Balagha full corpus missing")
    check(await page.locator('select[data-gnbib-line]').count()==1,
          "Overlapping rhetorical research routes unavailable")

    # Metadata-only OpenITI candidate records have directly cited version links.
    await source_tier(page,'openiti')
    ss=await wait_bib(page,'balagha')
    check('OpenITI' in await page.locator('[data-main]').inner_text(),"OpenITI provenance not visible")
    check(all(url.startswith('https://github.com/OpenITI/RELEASE/') for url in ss['sourceURLs']),
          "OpenITI source links not pinned")
    await page.locator('#ia-search-v3').fill('البيان')
    await page.wait_for_timeout(90)
    check((await snap(page))['cards']>0,"Arabic title search failed in main atlas")
    await page.locator('#ia-search-v3').fill('')
    check((await snap(page))['cards']==32,"Clearing search failed")

    # Historical atlas remains separate and intact.
    await page.locator('[data-main] [data-action="show-all-mapped"]').click()
    s=await snap(page)
    check(s['view']=='timeline' and s['historical']==404,"Historical atlas view damaged by bibliography")
    check(not errors,"Unhandled browser JS failures: "+str(errors[:8]))
    return {"result":"PASS","viewport":page.viewport_size,"browser":page.context.browser.browser_type.name,
            "bibliographic_records_loaded":detail['records'],
            "complete_fiqh_school_categories":expected,
            "complete_usul_school_categories":{"hanafi":101,"maliki":30,"shafii":119,"hanbali":39},
            "full_nahw":892,"full_sarf":109,"full_balagha":261,
            "errors":errors}

async def main():
    p=argparse.ArgumentParser()
    p.add_argument('--browser',choices=['chromium','webkit'],default='chromium')
    p.add_argument('--width',type=int,default=390)
    p.add_argument('--height',type=int,default=844)
    args=p.parse_args()
    async with async_playwright() as a:
        browser=await getattr(a,args.browser).launch(headless=True,
          args=['--no-sandbox'] if args.browser=='chromium' else [])
        mobile=args.width<=500 or args.height<=500
        ctx=await browser.new_context(viewport={'width':args.width,'height':args.height},
                                       device_scale_factor=1,is_mobile=mobile,has_touch=mobile)
        page=await ctx.new_page()
        try:
            info=await test(page)
            print(json.dumps(info,ensure_ascii=False))
            (OUT/('report-'+args.browser+'-'+str(args.width)+'.json')).write_text(json.dumps(info,ensure_ascii=False,indent=2))
            await page.screenshot(path=str(OUT/('map-'+args.browser+'-'+str(args.width)+'.png')))
        except Exception:
            await page.screenshot(path=str(OUT/('FAILED-'+args.browser+'-'+str(args.width)+'.png')))
            raise
        finally:
            await ctx.close()
            await browser.close()
if __name__=='__main__':
    asyncio.run(main())
