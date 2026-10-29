"""Full interaction audit of the Gnamma Intellectual Atlas.

Every advertised family/tradition/region/relation choice is activated through
the actual DOM controls. Run in both Chromium and WebKit, portrait and desktop.

Usage: python verify_exhaustive_ui_browser.py --browser chromium --width 1440 --height 900 --full
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

URL=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path(os.getenv("GN_ATLAS_QA_OUT","/tmp/gnamma-atlas-exhaustive"))
OUT.mkdir(parents=True,exist_ok=True)

def check(value,message):
    if not value:
        raise AssertionError(message)

async def snap(page):
    return await page.evaluate("""() => {
      const a=document.querySelector('#kalam-timeline-app-v3').atlasTest,s=a.state;
      return {view:s.view,from:s.from,to:s.to,selected:s.selected,detailType:s.detailType,
        detailId:s.detailId,family:s.textFamily,region:s.regionNetwork,search:s.q,
        density:s.density,links:s.links,depth:s.depth,page:s.page,qualified:s.qualified,
        contexts:s.contexts,politics:s.politics,events:s.events,schools:s.schools,
        focusOnly:s.focusOnly,traditions:[...s.families],relations:[...s.rels],
        filtered:a.filteredNodes(false).map(n=>n.id),visible:a.getVisible(),
        hash:location.hash,bodyOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        chartScroll:document.querySelector('[data-chart]')?.scrollHeight||0,
        chartClient:document.querySelector('[data-chart]')?.clientHeight||0};
    }""")

async def ensure_open(page,css):
    el=page.locator(css)
    if not await el.evaluate("(e)=>e.open"):
        await el.locator(":scope > summary").click()
    check(await el.evaluate("(e)=>e.open"),"Could not expand "+css)

async def reset(page):
    await ensure_open(page,".ia-secondary-controls")
    await page.locator('[data-action="whole-atlas"]').click()
    s=await snap(page)
    check(s["view"]=="timeline" and s["family"]=="" and s["region"]=="","Whole atlas did not reset the main route")
    return s

async def metric(page):
    return await page.evaluate("""() => ({
        count:document.querySelectorAll('[data-chart] svg').length,
        work:document.querySelectorAll('[data-chart] [data-work]').length,
        polit:document.querySelectorAll('[data-polity]').length,
        event:document.querySelectorAll('[data-event-rule]').length,
        school:document.querySelectorAll('[data-network]').length,
        edge:document.querySelectorAll('[data-chart] [data-edge]').length,
        invalid:!!document.querySelector('[data-chart] svg path[d*="NaN"],[data-chart] svg rect[x="NaN"]'),
        duplicates:(()=>{
          const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
          return ids.length-new Set(ids).size;
        })()
      })""")

async def run_audit(page,full=True):
    cases=0
    notes=[]
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("console",lambda m:errors.append("Console error: "+m.text[:260]) if m.type=="error" and "favicon" not in m.text.lower() else None)
    resp=await page.goto(URL,wait_until="domcontentloaded",timeout=65000)
    check(resp and resp.status==200,"Atlas document not returned HTTP 200")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest",timeout=40000)
    data=await page.evaluate("""() => {
      const d=document.querySelector('#kalam-timeline-app-v3').atlasTest.data;
      return {n:d.nodes.length,e:d.edges.length,s:d.sources.length,
        family:d.textual_families.map(f=>({id:f.id,label:f.label,root:f.root,members:f.member_ids})),
        sources:d.sources.map(x=>x.id),graph:d.edges.map(e=>({id:e.id,source:e.source,target:e.target})),
        nodes:d.nodes.map(n=>({id:n.id,trad:n.tradition,secondary:n.intellectual_traditions||[],type:n.node_type}))};
    }""")
    check((data["n"],data["e"],data["s"])==(375,348,349),"Canonical record/relationship/source count unexpectedly changed")
    check(len(data["family"])==18,"There should be 18 textual family choices")
    check(await page.locator('[data-view]').count()==4,"Four main navigation tabs")
    check(await page.locator('#ia-text-family-v3 option').count()==19,"All texts + 18 text families")
    check(await page.locator('.ia-explorer-shortcuts > details').count()==3,"Three map exploration layers")
    await ensure_open(page,".ia-secondary-controls")
    await ensure_open(page,".ia-filters")
    check(await page.locator('input[data-family]').count()==17,"17 traditions")
    check(await page.locator('input[data-rel]').count()==13,"13 relationship kinds")
    check(await page.locator('#ia-region-network-v3 option').count()==11,"All regions plus 10 region choices")
    check((await metric(page))["duplicates"]==0,"Duplicate HTML ids")
    cases+=8

    # Verify every one of 18 actual SELECT options activates its own route,
    # limits work membership, adjusts the time range and has an accessible status.
    for family in data["family"]:
        key=family["id"]
        await page.locator("#ia-text-family-v3").select_option(key)
        s=await snap(page)
        check(s["family"]==key and s["view"]=="timeline",f"Text family selector failed: {key}")
        check(s["selected"]==family["root"],f"Wrong root for {key}")
        check(set(s["filtered"])==set(family["members"]),f"Family filter wrong members: {key}")
        check(family["label"] in await page.locator('[data-text-family-status]').inner_text(),f"Family status missing {key}")
        check(s["to"]>s["from"] and s["to"]<=2026 and s["from"]>=-600,f"Family time range invalid: {key}")
        check(not (await metric(page))["invalid"],f"Invalid SVG geometry for {key}")
        cases+=6
    await page.locator("#ia-text-family-v3").select_option("")
    s=await snap(page)
    check(s["family"]=="" and len(s["filtered"])==375,"All texts option failed")
    cases+=1

    # The dedicated source-dossier shortcut and the in-place clear action.
    await page.locator("#ia-text-family-v3").select_option("tajrid")
    await page.locator('[data-action="clear-text-family"]').click()
    check((await snap(page))["family"]=="","Clear-text-family button left route active")
    cases+=1
    await ensure_open(page,".gn-atlas-introduction")
    await page.locator('[data-action="tahdhib-route"]').click()
    check((await snap(page))["family"]=="tahdhib","Tahdhīb research shortcut is not connected")
    cases+=1
    await page.locator('[data-action="clear-text-family"]').click()
    # The other UI for the same textual families is the grouped exploration
    # button grid. Test every button, not just the underlying SELECT control.
    await ensure_open(page,".ia-explorer-shortcuts .ia-route-explorer:has([data-text-route])")
    check(await page.locator('.ia-explorer-shortcuts button[data-text-route]').count()==18,
          "Missing a text-family exploration button")
    if full:
        for f in data["family"]:
            await page.locator(f'.ia-explorer-shortcuts button[data-text-route="{f["id"]}"]').click()
            s=await snap(page)
            check(s["family"]==f["id"] and s["selected"]==f["root"],f"Family button not wired: {f['id']}")
            cases+=1
    await reset(page)

    # All 17 tradition summary buttons, then checkbox changes, ensure the
    # chosen source-qualified/overlapping membership is reflected in UI state.
    await ensure_open(page,".ia-tradition-explorer")
    trad_buttons=await page.locator('.ia-tradition-explorer button[data-tradition-route]').evaluate_all(
        "(els)=>els.map(e=>e.dataset.traditionRoute)")
    check(len(trad_buttons)==17 and len(set(trad_buttons))==17,"Tradition route button registry incorrect")
    for name in trad_buttons:
        await page.locator(f'.ia-tradition-explorer button[data-tradition-route="{name}"]').click()
        s=await snap(page)
        check(s["traditions"]==[name] and s["view"]=="timeline",f"Tradition summary button failed: {name}")
        expected={n["id"] for n in data["nodes"] if name in [n["trad"]]+n["secondary"]}
        check(set(s["filtered"])==expected,f"Incorrect overlapping tradition membership: {name}")
        cases+=2
    await reset(page)
    for name in trad_buttons:
        checkbox=page.locator(f'input[data-family="{name}"]')
        await checkbox.uncheck()
        s=await snap(page)
        check(name not in s["traditions"] and not await checkbox.is_checked(),f"Tradition checkbox off failed: {name}")
        await checkbox.check()
        check(name in (await snap(page))["traditions"],f"Tradition checkbox on failed: {name}")
        cases+=2
    await reset(page)

    # All ten regional choices through both the selector and summary-map buttons.
    await ensure_open(page,".ia-region-explorer")
    region_keys=await page.locator('#ia-region-network-v3 option').evaluate_all("(els)=>els.slice(1).map(x=>x.value)")
    check(len(region_keys)==10 and len(set(region_keys))==10,"Regional selector registry incorrect")
    for name in region_keys:
        await page.locator('#ia-region-network-v3').select_option(name)
        s=await snap(page)
        check(s["region"]==name and s["view"]=="timeline",f"Regional selector failed: {name}")
        check(len(s["filtered"])>0,f"Regional category has zero recorded entries: {name}")
        check(not (await metric(page))["invalid"],f"SVG invalid for region {name}")
        cases+=3
    await page.locator("#ia-region-network-v3").select_option("")
    check(len((await snap(page))["filtered"])==375,"All regions did not restore all records")
    if full:
        for name in region_keys:
            await page.locator(f'.ia-region-explorer button[data-region-route="{name}"]').click()
            s=await snap(page)
            check(s["region"]==name and s["view"]=="timeline",f"Regional summary route failed: {name}")
            cases+=1
    await reset(page)

    # Every one of the 13 relationship kind checkboxes, in both directions.
    rel_keys=await page.locator('input[data-rel]').evaluate_all("(els)=>els.map(x=>x.dataset.rel)")
    check(len(rel_keys)==13 and len(set(rel_keys))==13,"Relationship registry incorrect")
    for name in rel_keys:
        cb=page.locator(f'input[data-rel="{name}"]')
        await cb.uncheck()
        check(name not in (await snap(page))["relations"],f"Relationship off failed: {name}")
        await cb.check()
        check(name in (await snap(page))["relations"],f"Relationship on failed: {name}")
        cases+=2

    # Date presets are distinct meaningful periods, not inert buttons.
    for label,from_y,to_y in [
        ("600,2026",600,2026),("-600,650",-600,650),
        ("200,1050",200,1050),("1100,1550",1100,1550),("1500,2026",1500,2026)]:
        await page.locator(f'[data-range="{label}"]').click()
        s=await snap(page)
        check(abs(s["from"]-from_y)<1 and abs(s["to"]-to_y)<1,f"Date preset {label} misrouted")
        cases+=1
    # The redundant in-chart All years button intentionally hides on wide
    # desktop layouts; the main Whole atlas button remains available there.
    chart_whole=page.locator('[data-action="whole-atlas-chart"]')
    if await chart_whole.is_visible():
        await chart_whole.click()
        check((await snap(page))["to"]-(await snap(page))["from"]==2626,
              "In-chart All years button did not restore full chronology")
        cases+=1
    await reset(page)
    # An actual SVG tap must be delivered to its link rather than swallowed
    # by the chart's pointer-capture handler.
    cluster=page.locator('[data-chart] a[data-cluster]').first
    check(await cluster.count()>0,"Overview does not expose any century group")
    await cluster.click()
    ss=await snap(page)
    check(ss["to"]-ss["from"]<2626,"Selecting a century group didn't zoom into it")
    work=page.locator('[data-chart] a[data-work]').first
    check(await work.count()>0,"Zoomed century contains no individually clickable texts")
    wanted=await work.get_attribute('data-work')
    await work.click()
    selected=await snap(page)
    check(selected["selected"]==wanted and selected["detailType"]=="work",
          "SVG book click was swallowed by pointer capture rather than opening details")
    await page.locator('[data-action="close-detail"]').click()
    cases+=4
    await reset(page)
    full_range=await snap(page)
    check((full_range["from"],full_range["to"])==(-600,2026),"Whole atlas must show entire chronology")
    await page.locator('[data-action="zoom-in"]').click()
    s=await snap(page)
    check(s["to"]-s["from"]<2626,"Zoom-in not working from Whole")
    old=s["to"]-s["from"]
    await page.locator('[data-action="zoom-out"]').click()
    check((await snap(page))["to"]-(await snap(page))["from"]>old,"Zoom-out not working")
    for name,direction in [("pan-forward",1),("pan-back",-1)]:
        await reset(page)
        await page.locator(f'[data-action="{name}"]').click()
        s=await snap(page)
        check(s["to"]-s["from"]<2626,f"{name} doesn't escape Whole atlas")
        cases+=1

    # Interval validation: invalid input must not silently become an unrelated
    # 20-year window, and blank fields must not be reinterpreted as year zero.
    await page.locator('[data-range="1100,1550"]').click()
    good=await snap(page)
    await page.locator('#ia-from-v3').fill('1600')
    await page.locator('#ia-to-v3').fill('1400')
    await page.locator('[data-action="apply-range"]').click()
    bad=await snap(page)
    message=await page.locator('[data-range-error]').inner_text()
    check(message.strip()!="" and abs(bad["from"]-good["from"])<.01 and abs(bad["to"]-good["to"])<.01,
          "Reversed year range should show error and preserve current view, got "+str((bad["from"],bad["to"],message)))
    cases+=1
    await page.locator('#ia-from-v3').fill('')
    await page.locator('#ia-to-v3').fill('1200')
    await page.locator('[data-action="apply-range"]').click()
    check((await page.locator('[data-range-error]').inner_text()).strip()!="",
          "Blank year input wrongly treated as year zero")
    cases+=1
    await page.locator('#ia-from-v3').fill('1200')
    await page.locator('#ia-to-v3').fill('1250')
    await page.locator('[data-action="apply-range"]').click()
    valid=await snap(page)
    check((valid["from"],valid["to"])==(1200,1250) and
          not (await page.locator('[data-range-error]').inner_text()).strip(),"Valid custom year inputs not applied")
    cases+=1

    # Layer switches must affect actual SVG output as well as checkbox state.
    await page.locator('[data-range="200,1050"]').click()
    checks=[("politics","polit"),("schools","school"),("events","event")]
    for key,svg_key in checks:
        await page.locator(f'[data-control="{key}"]').uncheck()
        check((await metric(page))[svg_key]==0,f"{key} layer still drawn when disabled")
        await page.locator(f'[data-control="{key}"]').check()
        check((await snap(page))[key] is True,f"{key} checkbox didn't restore")
        cases+=2
    for key in ["contexts","qualified","focusOnly"]:
        cb=page.locator(f'[data-control="{key}"]')
        old=await cb.is_checked()
        await cb.set_checked(not old)
        check((await snap(page))[key]==(not old),f"Toggle {key} has no effect")
        await cb.set_checked(old)
        cases+=2
    for val in ["1","2","3","4"]:
        await page.locator('[data-control="depth"]').select_option(val)
        check((await snap(page))["depth"]==int(val),f"Depth {val} ignored")
        cases+=1
    for val in ["all","highlights"]:
        await page.locator('[data-control="density"]').select_option(val)
        check((await snap(page))["density"]==val,f"Density {val} ignored")
        cases+=1
    for val in ["focus","all","none"]:
        await page.locator('[data-control="links"]').select_option(val)
        check((await snap(page))["links"]==val,f"Links mode {val} ignored")
        if val=="none":
            check((await metric(page))["edge"]==0,"Hidden links still drawn")
        cases+=1
    await reset(page)

    # Incompatible AND combinations must explain why a family map is empty,
    # and provide a clear action without forcing a new historical era.
    await reset(page)
    await page.locator('#ia-text-family-v3').select_option('plato_timaeus')
    await page.locator('#ia-region-network-v3').select_option('farangi')
    empty=await snap(page)
    check(len(empty["filtered"])==0,"Expected empty test intersection was not empty")
    check(await page.locator('.ia-filter-empty').count()==1,
          "Incompatible text-family/region filters lack actionable explanation")
    await page.locator('[data-action="reset-filters"]').click()
    clean=await snap(page)
    check(clean["family"]=="" and clean["region"]=="" and len(clean["filtered"])==375,
          "Clear restrictive filters did not restore all works")
    check(abs(clean["from"]-empty["from"])<.01 and abs(clean["to"]-empty["to"])<.01,
          "Clear restrictive filters unexpectedly changed selected years")
    cases+=4
    await reset(page)

    # Four tab modes, six evidence sub-tabs, and catalogue pagination.
    for val,heading in [
        ("timeline","Texts, empires and events"),
        ("relations","Sources and later reception"),
        ("catalogue","Work catalogue"),
        ("audit","Evidence and editorial decisions")]:
        await page.locator(f'[data-view="{val}"]').click()
        s=await snap(page)
        check(s["view"]==val and await page.locator(f'[data-view="{val}"]').get_attribute("aria-selected")=="true",
              f"Main tab {val} failed")
        check(heading in await page.locator('[data-main] h2').first.inner_text(),f"Wrong main view for {val}")
        cases+=2
    audit_tabs=["critical","notes","relations","sources","history","prior"]
    for val in audit_tabs:
        await page.locator(f'[data-audit-tab="{val}"]').click()
        s=await snap(page)
        check(await page.locator(f'[data-audit-tab="{val}"]').get_attribute('aria-pressed')=="true",
              f"Audit sub-tab {val} not selected")
        check((await page.locator('[data-main]').inner_text()).strip()!="",
              f"Audit sub-tab {val} empty")
        cases+=2
    await page.locator('[data-view="catalogue"]').click()
    count=await page.locator('[data-main] tbody tr').count()
    check(count==35,"Catalog page 1 should contain 35 rows")
    await page.locator('[data-action="next-page"]').click()
    check((await snap(page))["page"]==2,"Next page not advancing")
    await page.locator('[data-action="previous-page"]').click()
    check((await snap(page))["page"]==1,"Previous page not going back")
    cases+=3
    await page.locator('[data-main] button[data-work]').first.click()
    selected=await snap(page)
    check(selected["detailType"]=="work" and await page.locator('[data-sheet]').is_visible(),
          "Catalogue work row fails to open detail")
    await page.locator('[data-action="close-detail"]').click()
    check(not await page.locator('[data-sheet]').is_visible(),"Close detail failed")
    cases+=2

    # Work → author → work → evidence → relationship → audit cross-view actions.
    await page.evaluate("()=>document.querySelector('#kalam-timeline-app-v3').atlasTest.selectNode('jurjani_mawaqif',true)")
    check(await page.locator('[data-sheet] button[data-text-route="mawaqif"]').count()>0,
          "Jurjani Mawāqif family link missing")
    check(await page.locator('[data-sheet] button[data-text-route="tajrid"]').count()>0,
          "Jurjani Tajrīd family link missing")
    await page.locator('[data-sheet] button[data-author]').first.click()
    check((await snap(page))["detailType"]=="author","Author profile failed to open")
    await page.locator('[data-sheet] button[data-work]').first.click()
    check((await snap(page))["detailType"]=="work","Author-to-work navigation failed")
    await page.locator('[data-action="copy-link"]').click()
    check("work=" in (await snap(page))["hash"],"Copy-link did not preserve deep link")
    await page.locator('[data-action="center-selected"]').click()
    s=await snap(page)
    check(s["view"]=="timeline" and s["from"]<s["to"],"Center selected work failed")
    await page.locator('[data-action="focus-selected"]').click()
    check((await snap(page))["view"]=="relations","Trace connections action failed")
    await page.locator('[data-action="all-relations"]').click()
    s=await snap(page)
    check(s["view"]=="audit" and
          await page.locator('[data-audit-tab="relations"]').get_attribute("aria-pressed")=="true",
          "All relations action failed")
    await page.locator('[data-main] button[data-edge]').first.click()
    check((await snap(page))["detailType"]=="edge","Relationship evidence not opening")
    await page.locator('[data-sheet] button[data-work]').first.click()
    check((await snap(page))["detailType"]=="work","Relationship-to-work navigation failed")
    cases+=10
    await page.locator('[data-view="audit"]').click()
    await page.locator('[data-audit-tab="history"]').click()
    await page.locator('[data-main] button[data-history]').first.click()
    check((await snap(page))["detailType"]=="history","Historical detail not opening")
    cases+=1
    await page.locator('[data-audit-tab="critical"]').click()
    source_btn=page.locator('[data-main] button[data-source]')
    if await source_btn.count()>0:
        await source_btn.first.click()
        check((await snap(page))["detailType"]=="source","Source reference detail not opening")
        cases+=1
    await reset(page)

    # Search: matching, nonmatching, Enter/Escape, search outside active
    # tradition, and restoring all filter dimensions before centering.
    search=page.locator('#ia-search-v3')
    await search.fill("Tajrīd")
    await page.wait_for_timeout(310)
    check(await page.locator('#ia-results-v3 button[data-work]').count()>0,"Search suggestions missing Tajrīd")
    first=await page.locator('#ia-results-v3 button[data-work]').first.get_attribute('data-work')
    await page.locator('#ia-results-v3 button[data-work]').first.click()
    check((await snap(page))["selected"]==first,"Search suggestion did not open result")
    cases+=2
    await search.fill("something_not_in_375_record_titles_9876")
    await page.wait_for_timeout(310)
    check("No title or author matches" in await page.locator('#ia-results-v3').inner_text(),
          "Search no-results feedback missing")
    await search.press("Escape")
    check(await page.locator('#ia-results-v3').is_hidden(),"Search Escape doesn't close suggestions")
    cases+=2
    # Enter should select the first matching record just as the suggestion
    # button does, without leaving stale search filters behind.
    await reset(page)
    await search.fill("Proclus")
    await page.wait_for_timeout(300)
    candidate=await page.locator('#ia-results-v3 button[data-work]').first.get_attribute('data-work')
    await search.press("Enter")
    enter=await snap(page)
    check(candidate and enter["selected"]==candidate and enter["search"]=="",
          "Search Enter fails to select/center its first result")
    cases+=1
    await reset(page)
    await page.locator('.ia-tradition-explorer button[data-tradition-route="sunni"]').click()
    await search.fill("Porphyry")
    await page.wait_for_timeout(310)
    greek=page.locator('#ia-results-v3 button[data-work]').first
    check(await greek.count()>0,"Search should suggest across active filters")
    wanted=await greek.get_attribute('data-work')
    await greek.click()
    s=await snap(page)
    check(s["selected"]==wanted,"Search result outside active tradition did not open")
    check(wanted in s["filtered"],"Selected search work remains invisible under incompatible tradition filter")
    cases+=3

    # Hash round-trips, standalone source/region hash and malformed bounds.
    await reset(page)
    await page.locator('#ia-text-family-v3').select_option("tajrid")
    await page.locator('#ia-region-network-v3').select_option("iran")
    before=await snap(page)
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    after=await snap(page)
    check(after["family"]==before["family"] and after["region"]==before["region"],
          "Bookmark reload lost family/region scope")
    cases+=1
    await page.goto(URL+"#region=southasia",wait_until="domcontentloaded")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    check((await snap(page))["region"]=="southasia","Standalone region deep link ignored")
    cases+=1
    await page.goto(URL+"#source=F01",wait_until="domcontentloaded")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    check((await snap(page))["detailType"]=="source","Standalone source deep link ignored")
    cases+=1
    for fragment in ["#view=timeline&from=5000&to=6000",
                     "#view=timeline&from=-2000&to=-1500"]:
        await page.goto(URL+fragment,wait_until="domcontentloaded")
        await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
        s=await snap(page)
        check(-600<=s["from"]<=s["to"]<=2026 and s["to"]-s["from"]>=20,
              "Malformed date hash produced an inverted/off-chart timeline: "+str((fragment,s["from"],s["to"])))
        cases+=1

    # Responsive content, keyboard focus and accessible labels.
    s=await snap(page)
    check(s["bodyOverflow"]<=3,"Horizontal page overflow")
    check((await metric(page))["duplicates"]==0,"Duplicate ids after all rendering operations")
    await page.locator('[data-view="timeline"]').click()
    await page.locator('[data-chart]').focus()
    old=(await snap(page))["from"]
    await page.keyboard.press("ArrowRight")
    check((await snap(page))["from"]!=old,"Timeline keyboard arrow failed")
    await page.locator('[data-history-rail]').focus()
    await page.keyboard.press("End")
    check((await snap(page))["to"]<=2026,"Overview keyboard End overshoots chronology")
    cases+=4
    await page.locator('[data-view="timeline"]').focus()
    await page.keyboard.press("ArrowRight")
    check((await snap(page))["view"]=="relations",
          "Keyboard ArrowRight does not switch main navigation tab")
    await page.locator('[data-view="timeline"]').click()
    cases+=1
    for scheme in ["dark","light"]:
        await page.emulate_media(color_scheme=scheme)
        canvas=await page.locator('[data-chart]').evaluate("(e)=>getComputedStyle(e).backgroundColor")
        check(canvas not in ("","transparent","rgba(0, 0, 0, 0)"),
              f"Chart background becomes transparent in {scheme}")
        cases+=1
    check(not errors,"Unhandled JS/console errors: "+str(errors[:6]))
    report={"checks":cases,"browser":page.context.browser.browser_type.name,
        "viewport":page.viewport_size,"full":full,
        "inventories":{"families":len(data["family"]),"traditions":len(trad_buttons),
                        "regions":len(region_keys),"relationships":len(rel_keys),
                        "auditTabs":len(audit_tabs)},"notes":notes,"errors":errors}
    return report

async def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--browser",choices=["chromium","webkit"],default="chromium")
    ap.add_argument("--width",type=int,default=1440)
    ap.add_argument("--height",type=int,default=900)
    ap.add_argument("--full",action="store_true")
    args=ap.parse_args()
    async with async_playwright() as p:
        engine=getattr(p,args.browser)
        browser=await engine.launch(headless=True,args=["--no-sandbox"] if args.browser=="chromium" else [])
        mobile=args.width<=500 or args.height<=500
        context=await browser.new_context(viewport={"width":args.width,"height":args.height},
                                          device_scale_factor=1,is_mobile=mobile,has_touch=mobile)
        page=await context.new_page()
        try:
            report=await run_audit(page,args.full)
            file=OUT/f"report_{args.browser}_{args.width}x{args.height}.json"
            file.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
            await page.screenshot(path=str(OUT/f"final_{args.browser}_{args.width}x{args.height}.png"),full_page=False)
            print("PASS EXHAUSTIVE UI",json.dumps(report,ensure_ascii=False),flush=True)
        except Exception as exc:
            print("FAIL EXHAUSTIVE UI",args.browser,args.width,args.height,
                  repr(exc),flush=True)
            await page.screenshot(path=str(OUT/f"failed_{args.browser}_{args.width}x{args.height}.png"),full_page=False)
            raise
        finally:
            await context.close()
            await browser.close()

if __name__=="__main__":asyncio.run(main())
