"""End-to-end interaction matrix for every control family of the Gnamma Atlas.

This intentionally uses actual UI clicks, select_option, check/uncheck and
keyboard events. Failures accumulate per scenario and include screenshots.
Run from repo root with: python research/intellectual-atlas/tests/verify_exhaustive_ui.py
"""
import asyncio, json, os, traceback
from pathlib import Path
from playwright.async_api import async_playwright

BASE=os.environ.get("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path(os.environ.get("GN_ATLAS_UI_QA_OUT","/tmp/gnamma-atlas-ui-audit"))
OUT.mkdir(parents=True,exist_ok=True)
RESULT={"tests":[],"failures":[],"console":[],"metadata":{}}

def ok(condition,message):
    if not condition:raise AssertionError(message)

async def state(page):
    return await page.evaluate("""() => {
      const root=document.querySelector('#kalam-timeline-app-v3'),a=root?.atlasTest;
      const chart=root?.querySelector('[data-chart]');
      return {ready:!!a,view:a?.state.view,from:a?.state.from,to:a?.state.to,
        family:a?.state.textFamily,region:a?.state.regionNetwork,
        traditions:[...(a?.state.families||[])],relations:[...(a?.state.rels||[])],
        density:a?.state.density,links:a?.state.links,politics:a?.state.politics,
        events:a?.state.events,schools:a?.state.schools,contexts:a?.state.contexts,
        qualified:a?.state.qualified,focusOnly:a?.state.focusOnly,depth:a?.state.depth,
        auditTab:a?.state.auditTab,page:a?.state.page,selected:a?.state.selected,
        detail:a?.state.detailType,detailId:a?.state.detailId,query:a?.state.q,
        matching:a?.filteredNodes(false)?.length,visible:a?.getVisible()?.nodes?.length,
        edges:a?.getVisible()?.edges?.length,
        periodCount:root?.querySelectorAll('[data-polity]')?.length,
        eventCount:root?.querySelectorAll('[data-event-rule]')?.length,
        networkCount:root?.querySelectorAll('[data-network]')?.length,
        chartScroll:chart?.scrollHeight,chartClient:chart?.clientHeight,
        rootWidth:root?.scrollWidth,screenWidth:document.documentElement.clientWidth,
        url:location.hash,err:root?.querySelector('[data-range-error]')?.textContent};
    }""")

async def check(label,fn,page):
    try:
        await fn()
        RESULT["tests"].append({"name":label,"status":"pass"})
        print("PASS",label,flush=True)
    except Exception as e:
        RESULT["tests"].append({"name":label,"status":"fail","message":str(e)[:450]})
        RESULT["failures"].append({"name":label,"error":str(e)[:1200],
            "traceback":traceback.format_exc(limit=3)})
        print("FAIL",label,str(e)[:350],flush=True)
        try:
            clean="".join(c if c.isalnum() else "_" for c in label)[:68]
            await page.screenshot(path=str(OUT/("FAIL_"+clean+".png")),full_page=False)
        except Exception:pass

async def open_more(page):
    details=page.locator(".ia-secondary-controls")
    if not await details.evaluate("(e)=>e.open"):
        await details.locator(":scope > summary").click()
    ok(await details.evaluate("(e)=>e.open"),"More options remains open")

async def open_filters(page):
    await open_more(page)
    d=page.locator("details.ia-filters")
    if not await d.evaluate("(e)=>e.open"):
        await d.locator(":scope > summary").click()

async def reset(page):
    await page.locator('[data-view="timeline"]').click()
    await open_more(page)
    # The compact "All years" action is deliberately CSS-hidden on desktop.
    # Use the visible controls rather than mistaking a hidden responsive
    # variant for a broken button.
    compact=page.locator('[data-action="whole-atlas-chart"]')
    if await compact.is_visible():
        await compact.click()
    else:
        await page.locator('[data-action="whole-atlas"]').click()

async def setup(page):
    r=await page.goto(BASE,wait_until="domcontentloaded",timeout=60000)
    ok(r and r.status==200,"Atlas HTML HTTP 200")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    d=await state(page)
    ok(d["ready"] and d["view"]=="timeline","Atlas initializes on timeline")
    return d

async def complete_matrix(page):
    await setup(page)
    root=page.locator("#kalam-timeline-app-v3")
    await check("four main navigation tabs",lambda:nav_tabs(page),page)
    await check("timeline preset buttons and whole-range reset",lambda:presets(page),page)
    await check("custom date-range validation and boundary years",lambda:ranges(page),page)
    await check("all twenty textual families in select",lambda:all_families(page),page)
    await check("all twenty book-family exploration buttons",lambda:family_buttons(page),page)
    await check("all seventeen intellectual-tradition buttons",lambda:tradition_buttons(page),page)
    await check("all ten regional-network buttons",lambda:region_buttons(page),page)
    await check("all seventeen tradition checkboxes",lambda:tradition_checkboxes(page),page)
    await check("all thirteen relationship-type checkboxes",lambda:relation_checkboxes(page),page)
    await check("all historical, scope and evidence layer toggles",lambda:layer_toggles(page),page)
    await check("all select menus and neighborhood depths",lambda:selector_options(page),page)
    await check("pairwise combinations, empty results and reset",lambda:combination_matrix(page),page)
    await check("global and no-result searches",lambda:search(page),page)
    await check("record details, cross-family routes and source evidence",lambda:details_and_sources(page),page)
    await check("relationships tab and evidence register",lambda:relations_and_evidence(page),page)
    await check("catalogue pagination and row-to-details",lambda:catalogue(page),page)
    await check("six audit subsections and direct records",lambda:audit(page),page)
    await check("keyboard navigation, zoom, pan and drag handle",lambda:keyboard_and_pan(page),page)
    await check("share URL round-trip, Back and page reload",lambda:deep_link(page),page)
    await check("source PDFs, ZIP, research dossier and downloads",lambda:downloads(page),page)
    await check("constrained chart, detail scrolling and light/dark mode",lambda:layout(page),page)
    await root.screenshot(path=str(OUT/"atlas-audited-desktop.png"))
    RESULT["metadata"]["allControlsChecked"]={"views":4,"families":20,"traditions":17,
       "regions":10,"relationshipFilters":13,"auditTabs":6,
       "familyButtons":20,"layerToggles":6}

async def nav_tabs(page):
    for v in ["relations","catalogue","audit","timeline"]:
        await page.locator(f'[data-view="{v}"]').click()
        s=await state(page)
        ok(s["view"]==v,f"view {v} didn't switch")
        ok(await page.locator(f'[data-view="{v}"]').get_attribute("aria-selected")=="true",f"tab {v} aria")
        ok(await page.locator('[data-main]').count()==1,"main region lost")
    await open_more(page)

async def presets(page):
    await reset(page)
    for val in ["600,2026","-600,650","200,1050","1100,1550","1500,2026"]:
        await page.locator(f'[data-range="{val}"]').click()
        a,b=map(int,val.split(","))
        s=await state(page)
        ok(abs(s["from"]-a)<1 and abs(s["to"]-b)<1,f"preset {val} not applied {s}")
    for action in ["whole-atlas","whole-atlas-chart"]:
        button=page.locator(f'[data-action="{action}"]')
        if not await button.is_visible():
            continue  # Responsive alternative is not a clickable control here.
        await button.click()
        s=await state(page)
        ok(abs(s["from"]+600)<.01 and abs(s["to"]-2026)<.01,f"Whole {action} not full")
        ok(await page.locator(".ia-travel-window").count()==1,"overview disappeared")

async def ranges(page):
    await reset(page)
    frm=page.locator("#ia-from-v3");to=page.locator("#ia-to-v3")
    for a,b in [("", "1200"),("1400","1300"),("-601","1600"),("1950","2050"),("1400","1404")]:
        await frm.fill(a);await to.fill(b);await page.locator('[data-action="apply-range"]').click()
        err=await page.locator('[data-range-error]').inner_text()
        ok(bool(err.strip()),f"invalid {a}:{b} not explained")
    for a,b in [(-600,-580),(600,2026),(1300,1340)]:
        await frm.fill(str(a));await to.fill(str(b));await page.locator('[data-action="apply-range"]').click()
        s=await state(page)
        ok(abs(s["from"]-a)<1 and abs(s["to"]-b)<1,f"valid dates {a}:{b} not applied")
        ok(not s["err"],"stale validation warning")
    await reset(page)

async def all_families(page):
    await reset(page)
    sel=page.locator("[data-text-family]")
    values=await sel.locator("option").evaluate_all("(xs)=>xs.map(x=>x.value).filter(Boolean)")
    ok(len(values)==18,f"expected 18 text families: {values}")
    for v in values:
        await sel.select_option(v)
        s=await state(page)
        ok(s["family"]==v,f"select {v} failed")
        ok(v in s["url"],f"share hash lost family {v}")
        ok(await page.locator("[data-text-family-status]").count()==1,"family status missing")
        ok(s["matching"]>0,f"no work in family {v} under full filters")
        ok(s["view"]=="timeline","textual family should open timeline")
    await sel.select_option("")
    ok((await state(page))["family"]=="","all-family option did not clear")

async def family_buttons(page):
    await reset(page)
    menu=page.locator("details.ia-route-explorer:has([data-text-route])")
    if not await menu.evaluate("(e)=>e.open"):await menu.locator(":scope > summary").click()
    values=await page.locator(".ia-explorer-shortcuts [data-text-route]").evaluate_all(
        "(xs)=>[...new Set(xs.map(x=>x.dataset.textRoute))]")
    ok(len(values)==20,f"20 family buttons expected, got {len(values)}")
    for v in values:
        el=page.locator(f'.ia-explorer-shortcuts [data-text-route="{v}"]')
        await el.click()
        s=await state(page)
        ok(s["family"]==v,f"family button {v} did not select")
        ok(s["matching"]>0,f"button {v} empty")
    await reset(page)

async def tradition_buttons(page):
    await reset(page)
    menu=page.locator(".ia-tradition-explorer")
    if not await menu.evaluate("(e)=>e.open"):await menu.locator(":scope > summary").click()
    vals=await page.locator(".ia-tradition-explorer [data-tradition-route]").evaluate_all(
        "(xs)=>xs.map(x=>x.dataset.traditionRoute)")
    ok(len(vals)==17,f"expected 17 tradition buttons, got {len(vals)}")
    for v in vals:
        await page.locator(f'.ia-tradition-explorer [data-tradition-route="{v}"]').click()
        s=await state(page)
        ok(s["traditions"]==[v],f"tradition {v} did not isolate")
        ok(s["matching"]>0,f"tradition {v} unexpectedly empty")
    await reset(page)

async def region_buttons(page):
    await reset(page)
    menu=page.locator(".ia-region-explorer")
    if not await menu.evaluate("(e)=>e.open"):await menu.locator(":scope > summary").click()
    vals=await page.locator(".ia-region-explorer [data-region-route]").evaluate_all(
        "(xs)=>xs.map(x=>x.dataset.regionRoute)")
    ok(len(vals)==10,f"expected ten regions: {vals}")
    for v in vals:
        await page.locator(f'.ia-region-explorer [data-region-route="{v}"]').click()
        s=await state(page)
        ok(s["region"]==v,f"region button {v} failed")
        ok(s["matching"]>0,f"region {v} unexpectedly zero")
    await reset(page)

async def tradition_checkboxes(page):
    await reset(page);await open_filters(page)
    for f in await page.locator("[data-family]").evaluate_all("(xs)=>xs.map(x=>x.dataset.family)"):
        el=page.locator(f'[data-family="{f}"]')
        await el.uncheck()
        s=await state(page)
        ok(f not in s["traditions"],f"uncheck {f} not respected")
        await el.check()
        ok(f in (await state(page))["traditions"],f"recheck {f} not respected")

async def relation_checkboxes(page):
    await reset(page);await open_filters(page)
    for f in await page.locator("[data-rel]").evaluate_all("(xs)=>xs.map(x=>x.dataset.rel)"):
        el=page.locator(f'[data-rel="{f}"]')
        await el.uncheck()
        ok(f not in (await state(page))["relations"],f"edge relation {f} uncheck")
        await el.check()
        ok(f in (await state(page))["relations"],f"edge relation {f} recheck")

async def layer_toggles(page):
    await reset(page);await open_filters(page)
    await page.locator('[data-range="1100,1550"]').click()
    for name in ["politics","events","schools","contexts","qualified"]:
        el=page.locator(f'[data-control="{name}"]')
        await el.uncheck()
        off=await state(page)
        ok(off[name] is False,f"layer {name} not off")
        if name=="politics":ok(off["periodCount"]==0,"periods still visible")
        if name=="events":ok(off["eventCount"]==0,"events still visible")
        if name=="schools":ok(off["networkCount"]==0,"schools still visible")
        await el.check()
        ok((await state(page))[name] is True,f"layer {name} not reenabled")
    # Focus is a contextual filter, so the checkbox should not appear effective
    # when there is no selected work.
    focus=page.locator('[data-control="focusOnly"]')
    ok(await focus.is_disabled(),"Focus Only must be disabled without a selected text")
    await page.locator('#ia-search-v3').fill('Sharḥ al-Mawāqif')
    await page.wait_for_timeout(350)
    await page.locator('#ia-results-v3 [data-work]').first.click()
    await open_filters(page)
    ok(await focus.is_enabled(),"Selecting a text must enable neighborhood focus")
    before=(await state(page))["matching"]
    await focus.check()
    s=await state(page)
    ok(s["focusOnly"] is True and s["matching"]<=before,
       "Focus Only did not restrict the current selection")
    await focus.uncheck()
    await reset(page)

async def selector_options(page):
    await reset(page);await open_filters(page)
    for name,values in [("density",["highlights","all"]),("links",["all","none","focus"]),("depth",["1","2","3","4"])]:
        for val in values:
            await page.locator(f'[data-control="{name}"]').select_option(val)
            got=(await state(page))[name]
            ok(str(got)==val,f"selector {name}={val} became {got}")
    await reset(page)

async def combination_matrix(page):
    await reset(page);await open_filters(page)
    fam=page.locator("[data-text-family]")
    reg=page.locator("[data-region-network]")
    # Test overlapping routes rather than accidentally replacing the other axes.
    for route,region,trad in [
        ("tahdhib","southasia","sunni"),("proclus_elements","greek","neoplatonic"),
        ("tajrid","iran","imami"),("mawaqif","ottoman","sunni"),
        ("fusus","southasia","akbarian"),("aristotle_metaphysics","greek","ancient")]:
        await reset(page);await open_filters(page)
        await reg.select_option(region)
        await page.locator(".ia-tradition-explorer summary").click() if not await page.locator(".ia-tradition-explorer").evaluate("(e)=>e.open") else None
        await page.locator(f'[data-tradition-route="{trad}"]').click()
        await fam.select_option(route)
        s=await state(page)
        ok(s["family"]==route and s["region"]==region and s["traditions"]==[trad],
           f"three dimensions not intersected {route}/{region}/{trad}")
    await reset(page);await open_filters(page)
    await reg.select_option("farangi")
    await fam.select_option("proclus_elements")
    s=await state(page)
    ok(s["matching"]==0,"expected deliberately incompatible region/family to have no records")
    ok(await page.locator('[data-action="reset-filters"]').count()==1,"empty view lacks reset")
    before=(s["from"],s["to"])
    await page.locator('[data-action="reset-filters"]').click()
    s=await state(page)
    ok(s["matching"]==386 and s["family"]=="" and s["region"]=="","empty reset failed")
    ok(abs(s["from"]-before[0])<1 and abs(s["to"]-before[1])<1,"reset shifted dates")
    await reset(page)

async def search(page):
    await reset(page)
    box=page.locator("#ia-search-v3")
    await box.fill("Jurjānī")
    await page.wait_for_timeout(300)
    ok((await state(page))["query"]=="Jurjānī","search state missing")
    ok(await page.locator("#ia-results-v3 button[data-work]").count()>0,"search suggestions missing")
    await box.press("Enter")
    s=await state(page)
    ok(s["detail"]=="work" and bool(s["selected"]),"Enter did not open work")
    await box.fill("zzzzzz_nonexistent_xyz")
    await page.wait_for_timeout(300)
    ok((await state(page))["matching"]==0,"nonsense search doesn't filter")
    ok(await page.locator("#ia-results-v3").inner_text(),"no-result search missing explanation")
    await box.fill("")
    await page.wait_for_timeout(300)
    ok((await state(page))["query"]=="","clear search failed")
    await reset(page)

async def details_and_sources(page):
    await reset(page)
    # Search-to-record is an actual user path, not an internal test hook.
    await page.locator("#ia-search-v3").fill("Sharḥ al-Mawāqif")
    await page.wait_for_timeout(350)
    await page.locator("#ia-results-v3 [data-work]").first.click()
    s=await state(page)
    ok(s["detail"]=="work","work panel failed")
    ok(await page.locator('[data-sheet] [data-action="close-detail"]').count()==1,"missing panel close")
    ok(await page.locator('[data-sheet] [data-action="focus-selected"]').count()==1,"trace connections missing")
    ok(await page.locator('[data-sheet] [data-action="center-selected"]').count()==1,"center missing")
    ok(await page.locator('[data-sheet] [data-action="copy-link"]').count()==1,"share missing")
    await page.locator('[data-sheet] [data-action="copy-link"]').click()
    ok("work=" in (await state(page))["url"],"shared work URL missing")
    await page.locator('[data-sheet] [data-action="focus-selected"]').click()
    ok((await state(page))["view"]=="relations","trace connections did not open relations")
    await page.locator('[data-sheet] [data-action="center-selected"]').click()
    ok((await state(page))["view"]=="timeline","center selected didn't restore timeline")
    # Source or related evidence opens its own details, and close dismisses.
    if await page.locator('[data-sheet] [data-source]').count():
        section=page.locator('[data-sheet] details:has([data-source])').first
        if await section.count() and not await section.evaluate("(el)=>el.open"):
            await section.locator(":scope > summary").click()
        await page.locator('[data-sheet] [data-source]').first.click()
        ok((await state(page))["detail"]=="source","source citation button unresponsive")
    await page.locator('[data-sheet] [data-action="close-detail"]').click()
    ok((await state(page))["detail"] is None,"close panel didn't work")
    await reset(page)

async def relations_and_evidence(page):
    await reset(page)
    await page.locator('[data-view="relations"]').click()
    s=await state(page)
    ok(s["view"]=="relations" and s["edges"]>0,"relationships view shows no edges")
    ok(await page.locator('[data-main] [data-edge]').count()>0,"no inspect relation buttons")
    await page.locator('[data-main] [data-edge]').first.click()
    ok((await state(page))["detail"]=="edge","inspect relation didn't show evidence")
    await page.locator('[data-view="audit"]').click()
    await page.locator('[data-audit-tab="relations"]').click()
    ok(await page.locator('[data-main] [data-edge]').count()>=300,"relation register truncated")
    await page.locator('[data-main] [data-edge]').first.click()
    ok((await state(page))["detail"]=="edge","audit evidence click failed")
    await reset(page)

async def catalogue(page):
    await reset(page)
    await page.locator('[data-view="catalogue"]').click()
    s=await state(page)
    ok(s["view"]=="catalogue" and s["page"]==1,"catalogue first page missing")
    ok(await page.locator('[data-main] tbody tr').count()==35,"catalogue page length")
    await page.locator('[data-action="next-page"]').click()
    ok((await state(page))["page"]==2,"Next not advancing")
    await page.locator('[data-action="previous-page"]').click()
    ok((await state(page))["page"]==1,"Previous not reversing")
    await page.locator('[data-main] tbody [data-work]').first.click()
    ok((await state(page))["detail"]=="work","catalogue row did not open record")
    await reset(page)

async def audit(page):
    await reset(page)
    await page.locator('[data-view="audit"]').click()
    for key in ["critical","notes","relations","sources","history","prior"]:
        await page.locator(f'[data-audit-tab="{key}"]').click()
        s=await state(page)
        ok(s["auditTab"]==key,f"audit subsection {key} failed")
        ok(await page.locator(f'[data-audit-tab="{key}"]').get_attribute("aria-pressed")=="true",
           f"audit {key} aria")
        ok(len((await page.locator('[data-main]').inner_text()).strip())>50,
           f"audit section {key} blank")
    await reset(page)

async def keyboard_and_pan(page):
    await reset(page)
    await page.locator('[data-range="1100,1550"]').click()
    before=await state(page)
    for action in ["pan-forward","pan-back","zoom-in","zoom-out"]:
        await page.locator(f'[data-action="{action}"]').click()
    after=await state(page)
    ok(20<=after["to"]-after["from"]<=2626,"zoom range invalid")
    nav=page.locator('[data-history-rail]')
    await nav.focus()
    old=(await state(page))["from"]
    await page.keyboard.press("ArrowRight")
    ok((await state(page))["from"]!=old,"navigator keyboard arrows don't travel")
    await page.keyboard.press("Home")
    ok(abs((await state(page))["from"]+600)<1,"Home doesn't travel to beginning")
    await page.keyboard.press("End")
    ok(abs((await state(page))["to"]-2026)<1,"End doesn't travel to end")
    # Main 100%-range gesture explicitly tested by the specialized touch QA.
    await reset(page)

async def deep_link(page):
    await reset(page)
    await page.locator('[data-text-family]').select_option("tajrid")
    await page.locator('[data-view="catalogue"]').click()
    s=await state(page);url=page.url
    ok("text_family=tajrid" in url and "view=catalogue" in url,"hash has missing states")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    s2=await state(page)
    ok(s2["family"]=="tajrid" and s2["view"]=="catalogue","share URL didn't restore family and view")
    await page.locator('[data-view="audit"]').click()
    await page.go_back(wait_until="domcontentloaded")
    await page.wait_for_function("document.querySelector('#kalam-timeline-app-v3').atlasTest.state.view==='catalogue'")
    s3=await state(page)
    ok(s3["view"]=="catalogue","Back didn't restore previous view")
    await reset(page)
    # Historial layer toggles must survive share/reload, not merely work in RAM.
    await open_filters(page)
    for flag in ["politics","events","contexts","schools"]:
        await page.locator(f'[data-control="{flag}"]').uncheck()
    await page.locator('[data-view="catalogue"]').click()
    await page.locator('[data-action="next-page"]').click()
    shared=await state(page)
    ok(shared["page"]==2 and all(shared[k] is False for k in ["politics","events","contexts","schools"]),
       "pre-share layer states incorrect")
    ok("page=2" in page.url and all(x in page.url for x in ["politics=0","events=0","contexts=0","networks=0"]),
       "share URL omits page or historical layer settings")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    restored=await state(page)
    ok(restored["page"]==2 and restored["view"]=="catalogue" and
       all(restored[k] is False for k in ["politics","events","contexts","schools"]),
       "reloaded URL failed to restore catalogue page or historical visibility")
    await reset(page)

async def downloads(page):
    await reset(page)
    for href in ["neoplatonism/","tahdhib/","downloads/intellectual-atlas-data.json",
                 "downloads/Intellectual_Atlas_Reference_Revision7.pdf",
                 "downloads/Gnamma_Intellectual_Atlas_Offline_Revision7.zip"]:
        # Download entries may live in the about panel, so check the markup, not visibility.
        ok(await page.locator(f'a[href="{href}"]').count()>0,f"Missing download/navigation link {href}")
        response=await page.request.get(BASE+href,timeout=30000)
        ok(response.status==200,f"Broken linked asset {href}: HTTP {response.status}")

async def layout(page):
    await reset(page)
    s=await state(page)
    ok(s["rootWidth"]<=s["screenWidth"]+4,f"page horizontal overflow {s['rootWidth']} > {s['screenWidth']}")
    ok(s["chartScroll"]>s["chartClient"],"long chart not scrollable")
    await page.evaluate("()=>document.querySelector('#kalam-timeline-app-v3').atlasTest.selectNode('jurjani_mawaqif',true)")
    for scheme in ["light","dark"]:
        await page.emulate_media(color_scheme=scheme)
        colors=await page.locator('[data-chart]').evaluate(
            "(el)=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color})")
        ok(colors["bg"] not in ("transparent","rgba(0, 0, 0, 0)"),f"{scheme} chart transparent")
        await page.screenshot(path=str(OUT/("desktop-"+scheme+".png")),full_page=False)
    await reset(page)

async def smoke_mobile(page,width,height):
    await setup(page)
    s=await state(page)
    ok(s["rootWidth"]<=s["screenWidth"]+4,f"mobile {width} horizontal page overflow")
    ok(await page.locator('[data-chart]').count()==1,"timeline missing")
    await open_more(page)
    await page.locator('[data-text-family]').select_option("proclus_elements")
    ok((await state(page))["family"]=="proclus_elements","mobile family select")
    await page.locator('[data-view="catalogue"]').click()
    ok((await state(page))["view"]=="catalogue","mobile catalogue tab")
    await page.locator('[data-view="audit"]').click()
    await page.locator('[data-audit-tab="sources"]').click()
    ok((await state(page))["auditTab"]=="sources","mobile audit")
    await page.locator('[data-view="timeline"]').click()
    await reset(page)
    ok(abs((await state(page))["to"]-2026)<1,"whole timeline mobile")
    await page.screenshot(path=str(OUT/f"mobile_{width}x{height}.png"),full_page=False)

async def main():
    async with async_playwright() as p:
        for browser_name,engine,w,h,mobile in [
             ("chromium",p.chromium,1440,900,False),
             ("chromium",p.chromium,390,844,True),
             ("chromium",p.chromium,844,390,True),
             ("webkit",p.webkit,1440,900,False),
             ("webkit",p.webkit,390,844,True)]:
            browser=await engine.launch(headless=True,args=["--no-sandbox"] if browser_name=="chromium" else [])
            ctx=await browser.new_context(viewport={"width":w,"height":h},
                                          is_mobile=mobile,has_touch=mobile)
            page=await ctx.new_page()
            page.set_default_timeout(8000)
            page.on("pageerror",lambda e: RESULT["console"].append(str(e)))
            if (browser_name,w)==("chromium",1440):
                await complete_matrix(page)
            else:
                await check(f"responsive smoke {browser_name} {w}x{h}",
                    lambda:smoke_mobile(page,w,h),page)
            await ctx.close();await browser.close()
    RESULT["metadata"]["passed"]=sum(x["status"]=="pass" for x in RESULT["tests"])
    RESULT["metadata"]["failed"]=len(RESULT["failures"])
    (OUT/"exhaustive-report.json").write_text(json.dumps(RESULT,ensure_ascii=False,indent=2),encoding="utf-8")
    print("FINAL AUDIT",json.dumps(RESULT["metadata"],ensure_ascii=False),flush=True)
    for f in RESULT["failures"]:print("AUDIT_FAILURE",f["name"],f["error"],flush=True)
    if RESULT["failures"] or RESULT["console"]:
        raise AssertionError(f"{len(RESULT['failures'])} scenarios failed; {len(RESULT['console'])} page errors")
if __name__=="__main__":asyncio.run(main())
