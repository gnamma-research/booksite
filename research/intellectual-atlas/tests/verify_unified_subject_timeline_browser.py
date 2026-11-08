"""Current GNAMMA contract: identical timeline grammar for every science;
vertical principal-text synopsis is an OPTIONAL, independently sourced mode.

Test actual page/browser interactions, not merely generated HTML text.
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-unified-timeline-qa")
OUT.mkdir(parents=True,exist_ok=True)

def check(value,msg):
    if not value:raise AssertionError(msg)

async def state(page):
    return await page.evaluate("""() => {
      const r=document.getElementById('kalam-timeline-app-v3');
      const c=window.GNDisciplineAtlas?.debug()||{};
      const a=r?.atlasTest?.state;
      return {view:a?.view,science:a?.sourceScience,tab:a?.sourceTab,school:a?.sourceMadhhab,
        mode:c.mode,from:c.from,to:c.to,genre:c.genre,dated:c.dated,undated:c.unplaced,
        count:c.records,lane:c.lane,page:c.page,svg:c.svg,
        timelineSvg:!!r.querySelector('[data-dn-timeline-svg]'),
        summarySvg:!!r.querySelector('[data-dn-summary-svg]'),
        undatedSvg:!!r.querySelector('[data-dn-undated-svg]'),
        originalSvg:!!r.querySelector('[data-integrated-chart]'),
        originalSummary:!!r.querySelector('[data-canonical-synopsis]'),
        clusterCount:r.querySelectorAll('[data-dn-cluster]').length,
        workCount:r.querySelectorAll('[data-dn-work]').length,
        earlyCount:r.querySelectorAll('[data-dn-scholar]').length,
        laneCount:r.querySelectorAll('[data-dn-lane]').length,
        selected:r.querySelector('.dn-detail')?.textContent||'',
        detailLinks:[...r.querySelectorAll('.dn-detail a')].map(a=>a.href),
        source:c.source,hash:location.hash,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        historical:r.atlasTest?.data?.nodes?.length,
        legend:r.querySelector('.dn-legend')?.textContent||'',
        headings:[...r.querySelectorAll('[data-main] h2')].map(x=>x.textContent)
      };
    }""")

async def wait_subject(page,mode=None):
    try:
        await page.wait_for_function("""() => !!window.GNDisciplineAtlas &&
          !!document.querySelector('.dn-map svg') &&
          !!document.querySelector('.dn-modes [data-dn-mode]')""",timeout=18000)
    except Exception:
        diagnostic=await page.evaluate("""() => ({
          ready:document.readyState,
          atlasReady:!!document.querySelector('#kalam-timeline-app-v3')?.dataset.ready,
          atlasState:document.querySelector('#kalam-timeline-app-v3')?.atlasTest?.state?.view,
          disciplinePresent:!!window.GNDisciplineAtlas,
          bibliographyPresent:!!window.GNAtlasBibliography,
          bibliographyState:window.GNAtlasBibliography?.debug(),
          resources:performance.getEntriesByType("resource").filter(x=>/bibliography|manuscript|registry|booksite|expanded/.test(x.name)).map(x=>({name:x.name.slice(-120),duration:Math.round(x.duration),transfer:x.transferSize})),
          canonicalPresent:!!window.GNCanonicalSynopsis,
          disciplineState:window.GNDisciplineAtlas?.debug(),
          mainText:document.querySelector('[data-main]')?.textContent?.slice(0,1300),
          scripts:[...document.querySelectorAll('script[src]')].map(s=>s.src)
        })""")
        print("SUBJECT-ATLAS DIAGNOSTIC:",json.dumps(diagnostic,ensure_ascii=False),flush=True)
        raise
    result=await state(page)
    check(result["svg"]==1,"Disciplinary view is not rendered as an SVG visual map")
    check(result["overflow"]<=3,"Subject map overflows the document viewport")
    check(result["historical"]==404,"Canonical research atlas was changed")
    check(result["count"]>0,"Subject has no work records")
    if mode:check(result["mode"]==mode,f"Wrong atlas mode: {result}")
    return result

async def choose_science(page,name):
    await page.locator('[data-action="open-explore"]').first.click()
    await page.locator(f'[data-explore-science="{name}"]').click()

async def focus_source(page,source):
    await page.locator('[data-dn-source]').select_option(source)

async def test(page):
    errors=[]
    page.on("pageerror",lambda e:(errors.append(str(e)),print("PAGE_ERROR",str(e),flush=True)))
    page.on("console",lambda m: print("BROWSER_CONSOLE",m.type,m.text[:1200],flush=True) if m.type in ("error","info","warning") and ("GNAMMA" in m.text or m.type=="error") else None)
    page.on("response",lambda r: print("SOURCE_RESPONSE",r.status,r.url[-130:],flush=True) if "manuscript-full" in r.url or "expanded-bibliography.json" in r.url or "registry.json" in r.url else None)
    page.on("requestfailed",lambda r: print("REQUEST_FAILED",r.url[-130:],r.failure,flush=True))
    r=await page.goto(ROOT+"#view=sources&science=fiqh&source_tab=texts&madhhab=all",wait_until="domcontentloaded",timeout=60000)
    check(r.status==200,"GNAMMA site cannot load")
    a=await wait_subject(page,"timeline")
    check(a["genre"]=="fiqh" and a["count"]>1000,"Fiqh did not import broad bibliography")
    check(a["dated"]>50 and a["undated"]>=2000,
          "Dated OpenITI records and unplaced manuscript catalogue not distinguished")
    check(a["timelineSvg"] and a["clusterCount"]>0,"Default Fiqh chart should use main-atlas chronology and era clusters")
    check("historical" in a["headings"][0].lower(),"Wrong diagram title")
    check("Approximate" in a["legend"],"Date evidence legend not displayed")

    # Timeline era selection zooms into book markers without replacing atlas.
    old_span=a["to"]-a["from"]
    await page.locator('[data-dn-cluster]').first.click()
    a=await wait_subject(page,"timeline")
    check(a["to"]-a["from"] < old_span and a["workCount"]>0,
          "Era cluster did not zoom to individual dated book markers")
    await page.locator('[data-dn-work]').first.click()
    b=await state(page)
    print("DATED_WORK_NODE_CLICK",json.dumps(b,ensure_ascii=False),flush=True)
    if not b["selected"]:
        probe=await page.evaluate("""() => {
          const el=document.querySelector('[data-dn-timeline-svg] [data-dn-work]');
          const name=el?.getAttribute('data-dn-work');
          const tag=el?.tagName;
          const rect=el?.getBoundingClientRect();
          const center=rect?document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2):null;
          const centerMatch=center?.closest?.('[data-dn-work],[data-dn-lane]');
          el?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
          return {name,tag,centerTag:center?.tagName,centerMatch:centerMatch?.getAttribute('data-dn-work')||centerMatch?.getAttribute('data-dn-lane'),
             after:window.GNDisciplineAtlas?.debug(),detail:document.querySelector('.dn-detail')?.textContent?.slice(0,240)};
        }""")
        print("DATED_WORK_SYNTHETIC_DIAGNOSTIC",json.dumps(probe,ensure_ascii=False),flush=True)
    check("Bibliographic" in b["selected"] or "Work / source" in b["selected"],
          "Work-marker click must open a source/detail panel")
    check(any(x.startswith("https://github.com/OpenITI/RELEASE/") for x in b["detailLinks"]),
          "Dated individual book lacks source citation")
    check(b["timelineSvg"],"Selecting work removed chronological diagram")

    # Vertical companion shows either the selected school or the whole subject.
    # Clear the zoomed Ḥanafī lane here to inspect the full multi-school synopsis.
    await page.locator('[data-dn-lane=""]').first.click()
    await page.locator('[data-dn-mode="summary"]').click()
    a=await wait_subject(page,"summary")
    check(a["summarySvg"] and a["workCount"]>=15,
          "Principal-text summary should be a vertical SVG of main books")
    check(not await page.locator('.gnbib-card').count(),"Old list-style catalogue remains visible")
    await page.locator('[data-dn-work]').first.click()
    b=await state(page)
    check(b["summarySvg"] and b["detailLinks"],
          "Clicking a key text did not keep the vertical map and reveal a citation")
    await page.reload(wait_until="domcontentloaded")
    a=await wait_subject(page,"summary")
    check(a["summarySvg"] and "sa_mode=summary" in a["hash"],
          "Vertical synopsis is not shareable across reload")
    await page.locator('[data-dn-mode="timeline"]').click()
    a=await wait_subject(page,"timeline")
    check(a["timelineSvg"],"Cannot return to common year-axis map")

    # Four legal schools preserve source-specific catalogue cardinalities.
    await focus_source(page,"alreq")
    counts={"hanafi":1033,"maliki":380,"shafii":782,"hanbali":199}
    for school,n in counts.items():
        await page.locator(f'[data-source-madhhab="{school}"]').first.click()
        a=await wait_subject(page,"timeline")
        check(a["school"]==school and a["count"]==n,
              f"{school}: incomplete mapped manuscript bibliography {a}")
        check(a["dated"]==0 and a["undated"]==n,
              f"{school}: missing manuscript dates were incorrectly inferred")
        await page.locator('[data-dn-undated]').first.click()
        a=await wait_subject(page,"timeline")
        check(a["undatedSvg"] and a["workCount"]>0,
              f"{school}: undated source records cannot be accessed as an interactive diagram")
        await page.locator('[data-dn-work]').first.click()
        d=await state(page)
        check(any("app.alreq.com" in x for x in d["detailLinks"]),
              f"{school}: missing per-work manuscript catalogue citation")
    await page.locator('[data-source-madhhab="all"]').first.click()
    await page.locator('[data-dn-source]').select_option('all')

    # Early personal circles and named non-four schools appear on dated axis.
    for school in ("early","named_other"):
        await page.locator(f'[data-source-madhhab="{school}"]').first.click()
        a=await wait_subject(page,"timeline")
        check(a["earlyCount"]>0 and a["timelineSvg"],
              f"{school}: historic jurist markers not plotted in chronological atlas")
        await page.locator('[data-dn-scholar]').first.click()
        b=await state(page)
        check("Juristic authority" in b["selected"] and b["detailLinks"],
              "Early personal school jurist should have historical evidence, not an invented book")

    # Fiqh -> uṣūl is the same axis diagram with new books.
    await page.locator('[data-source-madhhab="hanafi"]').first.click()
    await page.locator('[data-source-tab="method"]').click()
    a=await wait_subject(page,"timeline")
    check(a["genre"]=="usul" and a["count"]>=30,"Uṣūl chronology not present")
    await page.locator('[data-dn-mode="summary"]').click()
    a=await wait_subject(page,"summary")
    check(a["summarySvg"] and a["workCount"]>0,"Uṣūl lacks vertical condensed tradition map")

    # Every subject must show analogous horizontal and vertical diagrams.
    await choose_science(page,"arabic")
    for tab,genre,minimum in (("nahw","nahw",100),("sarf","sarf",80),("balagha","balagha",150),("lugha","lugha",1)):
        await page.locator(f'[data-source-tab="{tab}"]').click()
        a=await wait_subject(page,"timeline")
        check(a["genre"]==genre and a["count"]>=minimum and a["timelineSvg"],
              f"{tab}: not a same-style chronological atlas")
        await page.locator('[data-dn-mode="summary"]').click()
        a=await wait_subject(page,"summary")
        check(a["summarySvg"] and a["workCount"]>0,
              f"{tab}: no vertical principal-text synopsis")

    for science in ("hadith","tafsir","tasawwuf"):
        await choose_science(page,science)
        a=await wait_subject(page,"timeline")
        check(a["genre"]==science and a["timelineSvg"],f"{science} did not select a chronological atlas")
        await page.locator('[data-dn-mode="summary"]').click()
        a=await wait_subject(page,"summary")
        check(a["summarySvg"] and a["workCount"]>0,
              f"{science} did not select a vertical synopsis")

    # Philosophy retains the ORIGINAL 404-work timeline; principal texts is its
    # optional existing-work second representation, not an alien graph.
    await choose_science(page,"philosophy")
    await page.wait_for_function("""() => document.querySelector('[data-integrated-chart]')""",timeout=30000)
    a=await state(page)
    check(a["view"]=="timeline" and a["originalSvg"],"Original philosophy-kalam atlas was displaced")
    await page.locator('[data-action="canonical-summary"]').click()
    await page.wait_for_function("""() => document.querySelector('[data-canonical-synopsis]')""",timeout=30000)
    a=await state(page)
    check(a["originalSummary"],"Philosophy/kalam should also have a vertical principal texts map")
    await page.locator('[data-action="canonical-timeline"]').first.click()
    await page.wait_for_function("""() => document.querySelector('[data-integrated-chart]')""",timeout=30000)
    check((await state(page))["originalSvg"],"Cannot restore the original chronological atlas")
    check(not errors,"Uncaught browser errors: "+str(errors[:9]))
    return {"result":"PASS","viewport":page.viewport_size,
            "engine":page.context.browser.browser_type.name,
            "fiqh_school_manuscript_counts":counts,
            "modes":["historical chronology","vertical synopsis"],
            "subjects":["fiqh","usul","nahw","sarf","balagha","lugha","hadith","tafsir","tasawwuf","philosophy"],
            "errors":errors}
async def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--browser",choices=["chromium","webkit"],default="chromium")
    parser.add_argument("--width",type=int,default=390)
    parser.add_argument("--height",type=int,default=844)
    args=parser.parse_args()
    async with async_playwright() as p:
        b=await getattr(p,args.browser).launch(headless=True,
                   args=["--no-sandbox"] if args.browser=="chromium" else [])
        mobile=args.width<=500 or args.height<=500
        ctx=await b.new_context(viewport={"width":args.width,"height":args.height},
                                is_mobile=mobile,has_touch=mobile)
        page=await ctx.new_page()
        try:
            result=await test(page)
            print(json.dumps(result,ensure_ascii=False))
            (OUT/("report-"+args.browser+"-"+str(args.width)+".json")).write_text(json.dumps(result,indent=2))
            await page.screenshot(path=str(OUT/("timeline-"+args.browser+"-"+str(args.width)+".png")))
        except Exception:
            await page.screenshot(path=str(OUT/("FAILED-"+args.browser+"-"+str(args.width)+".png")))
            raise
        finally:
            await ctx.close();await b.close()
if __name__=="__main__":
    asyncio.run(main())
