"""Real browser regression: GNAMMA expanded bibliography and atlas source-map links.

Run against python -m http.server 8123 in repository root.
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

BASE=os.getenv("GN_ATLAS_URL","http://127.0.0.1:8123/research/intellectual-atlas/")
OUT=Path("/tmp/gnamma-bibliography-qa")
OUT.mkdir(exist_ok=True)

def check(value,label):
    if not value:raise AssertionError(label)

async def selected(page):
    return await page.evaluate("""() => ({
       total:document.querySelector('#stats')?.textContent||'',
       cards:document.querySelectorAll('.work').length,
       first:document.querySelector('.work h3')?.textContent||'',
       urls:[...document.querySelectorAll('.work a.source-link')].map(a=>a.href),
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
       science:document.getElementById('science')?.value,
       school:document.getElementById('school')?.value,
       provenance:document.getElementById('provenance')?.value,
       hash:location.hash,
       pages:document.getElementById('pages')?.textContent
    })""")

async def run(page):
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("console",lambda m:errors.append(m.text) if m.type=="error" else None)
    response=await page.goto(BASE+"corpora/expansion.html",wait_until="domcontentloaded",timeout=65000)
    check(response.status==200,"Expanded site HTTP failure")
    await page.wait_for_function("""() => document.getElementById('stats')?.textContent.includes('matching records')""",timeout=60000)
    initial=await selected(page)
    check(initial["cards"]==40,"40 results per page expected")
    check(initial["overflow"]<=3,"Document exceeds horizontal viewport")
    check(initial["science"]=="fiqh","Initial discipline should be Fiqh")
    await page.locator('#more > summary').click()
    await page.locator('#provenance').select_option("manuscript")
    for school,fiqh,usul in [("hanafi",40,40),("maliki",40,30),("shafii",40,40),("hanbali",40,39)]:
        await page.locator('#science').select_option('fiqh')
        await page.locator('#school').select_option(school)
        fiq=await selected(page)
        check(str(fiqh)+" matching records" in fiq['total'] and fiq['cards']==40,
              f"{school} fiqh manuscript sample did not render: "+str(fiq))
        check(all(u.startswith('https://app.alreq.com/') for u in fiq['urls']),
              f"{school} listed non-manuscript source URLs")
        await page.locator('#science').select_option('usul')
        us=await selected(page)
        check(str(usul)+" matching records" in us['total'] and us['cards']==min(40,usul),
              f"{school} usul sample did not render: "+str(us))
    await page.locator('#school').select_option('all')
    for science, minimum in [('nahw',150),('sarf',50),('balagha',100)]:
        await page.locator('#science').select_option(science)
        view=await selected(page)
        total=int(view["total"].split(" matching")[0].replace(",",""))
        check(total>=minimum,f"{science} manuscript sample smaller than expected: "+str(view))
        check(view['cards']==40,f"{science} first page should have 40 books")
        check(view["overflow"]<=3,f"{science} page causes overflow")
    await page.locator('#provenance').select_option('openiti')
    await page.locator('#science').select_option('fiqh')
    openiti=await selected(page)
    check(int(openiti["total"].split(" matching")[0].replace(",",""))>500,
          "OpenITI fiqh candidate works not loaded")
    check(all(u.startswith('https://github.com/OpenITI/RELEASE/') for u in openiti['urls']),
          "Source URLs must be original pinned OpenITI version links")
    await page.locator('#provenance').select_option('all')
    await page.locator('#science').select_option('balagha')
    await page.locator('#q').fill('شرح')
    search=await selected(page)
    check('0 matching records' not in search['total'],"Arabic search produced no matches")
    await page.locator('#q').fill('')
    before=await selected(page)
    await page.locator('#next').click()
    after=await selected(page)
    check(before['first']!=after['first'] and 'page=2' in after['hash'],
          "Pagination did not change works and shareable state")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("""() => document.getElementById('stats')?.textContent.includes('matching records')""",timeout=60000)
    check('page=2' in (await selected(page))["hash"],"Deep link lost active page")
    await page.locator('#clear').click()
    check((await selected(page))['science']=='fiqh',"Reset failed")
    check(not errors, "Browser errors: "+str(errors[:5]))

    # Main atlas must surface the manuscript shortlist within Fiqh source mode,
    # without changing the pre-existing 30-reader-version backing map.
    r=await page.goto(BASE+"#view=sources&science=fiqh&source_tab=method&madhhab=maliki",wait_until="domcontentloaded")
    check(r.status==200,"Atlas failed to load")
    await page.wait_for_function("""() =>
      document.querySelector('#kalam-timeline-app-v3')?.atlasTest?.state?.view==='sources'&&
      document.querySelector('.ia-source-expansion-grid a')?.href
    """,timeout=60000)
    excerpt=await page.evaluate("""() => ({
      text:document.querySelector('.ia-source-expansion')?.textContent,
      previews:document.querySelectorAll('.ia-source-expansion-grid a').length,
      links:[...document.querySelectorAll('.ia-source-expansion-grid a')].map(a=>a.href),
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    })""")
    check('30 additional manuscript bibliography records' in excerpt['text'],"Mālikī uṣūl 30-title preview missing")
    check(excerpt["previews"]>0 and excerpt["previews"]<=12,"Wrong preview size")
    check(all('app.alreq.com' in x for x in excerpt['links']),"Preview links must be manuscript catalogue URLs")
    check(excerpt['overflow']<=3,"Atlas source preview overflows mobile view")
    await page.screenshot(path=str(OUT/"fiqh-atlas.png"),full_page=False)
    check(not errors,"Final JS errors: "+str(errors[:5]))
    return {"status":"PASS","browser":page.context.browser.browser_type.name,"viewport":page.viewport_size,
            "fiqh_school_counts":{"hanafi":40,"maliki":40,"shafii":40,"hanbali":40},
            "usul_school_counts":{"hanafi":40,"maliki":30,"shafii":40,"hanbali":39},
            "source_preview_entries":excerpt["previews"],"console_errors":errors}

async def main():
    p=argparse.ArgumentParser()
    p.add_argument('--browser',choices=['chromium','webkit'],default='chromium')
    p.add_argument('--width',type=int,default=390)
    p.add_argument('--height',type=int,default=844)
    args=p.parse_args()
    async with async_playwright() as playwright:
        browser=await getattr(playwright,args.browser).launch(headless=True,args=['--no-sandbox'] if args.browser=='chromium' else [])
        mobile=args.width<=500 or args.height<=500
        ctx=await browser.new_context(viewport={'width':args.width,'height':args.height},is_mobile=mobile,has_touch=mobile)
        page=await ctx.new_page()
        try:
            result=await run(page)
            print(json.dumps(result,ensure_ascii=False))
            await page.screenshot(path=str(OUT/('bibliography-'+args.browser+'.png')),full_page=False)
            (OUT/('report-'+args.browser+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2))
        finally:
            await ctx.close()
            await browser.close()
if __name__=='__main__':
    asyncio.run(main())
