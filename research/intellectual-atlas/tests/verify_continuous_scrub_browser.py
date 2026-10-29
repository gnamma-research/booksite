"""Atlas revision 7.1: test live drag/scrub and source-honest date glyphs.

Runs after the existing broad Chromium and WebKit suite. Real mobile Chromium
touch events are injected through CDP; iOS Safari physical momentum still needs
a device-level check.
"""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright

URL=os.getenv('GN_ATLAS_URL','http://127.0.0.1:8123/research/intellectual-atlas/')
OUT=Path(os.getenv('GN_ATLAS_QA_OUT','/tmp/gnamma-atlas-browser'))
OUT.mkdir(parents=True,exist_ok=True)
results=[]

async def snapshot(page):
    return await page.evaluate("""() => {
        const s=document.querySelector('#kalam-timeline-app-v3').atlasTest.state;
        return {from:s.from,to:s.to,thumb:parseFloat(document.querySelector('.ia-travel-window').style.left),
           scroll:document.querySelector('[data-chart]').scrollTop};
    }""")

async def move(page,el,dx,touch=False):
    await el.scroll_into_view_if_needed()
    r=await el.bounding_box()
    x=r['x']+r['width']/2;y=r['y']+min(55,r['height']/2)
    if touch:
        session=await page.context.new_cdp_session(page)
        await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
    else:
        await page.mouse.move(x,y)
        await page.mouse.down()
    seen=[]
    for i in range(1,7):
        px=x+dx*i/6
        if touch:await session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':px,'y':y,'id':1}]})
        else:await page.mouse.move(px,y)
        await page.wait_for_timeout(100)
        seen.append(await snapshot(page))
    if touch:await session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    else:await page.mouse.up()
    await page.wait_for_timeout(130)
    end=await snapshot(page)
    return seen,end

async def exercise(engine,width,height,mobile=False):
    browser=await engine.launch(headless=True,args=['--no-sandbox'] if engine.name=='chromium' else [])
    ctx=await browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile)
    page=await ctx.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    response=await page.goto(URL,wait_until='domcontentloaded',timeout=60000)
    assert response and response.status==200
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    assert await page.locator('.ia-travel-grip').count()==1
    assert await page.locator('[data-history-rail]').evaluate("(e)=>getComputedStyle(e).cursor")=='grab'
    assert await page.locator('[data-chart] svg').evaluate("(e)=>getComputedStyle(e).touchAction")=='pan-y'
    report={'browser':engine.name,'viewport':f'{width}x{height}'}
    for name,selector in [('overview','.ia-travel-grip'),('diagram','[data-chart]')]:
        await page.evaluate("()=>document.querySelector('#kalam-timeline-app-v3').atlasTest.setRange(1075,1450)")
        use_touch=mobile and engine.name=='chromium'
        seen,end=await move(page,page.locator(selector),65 if mobile else 165,use_touch)
        vals=[s['from'] for s in seen]
        assert len({round(v,2) for v in vals})>=4,(name,vals)
        assert all((vals[i+1]-vals[i])*(1 if name=='overview' else -1)>0 for i in range(5)),(name,vals)
        assert len({round(s['thumb'],2) for s in seen})>=4
        assert abs(end['from']-vals[-1])<.25,('Release should not jump',end,vals)
        report[name]=[round(v,1) for v in vals]
    for left,right,id,kind,stages in [
        (1320,1360,'iji_mawaqif','multiple_stages',2),
        (245,320,'plotinus_enneads','multiple_stages',2),
        (1260,1300,'tusi_tajrid','upper_bound',0),
        (1370,1400,'taftazani_maqasid','exact',0),
        (1010,1050,'avicenna_isharat','range',0)]:
        await page.evaluate("(r)=>document.querySelector('#kalam-timeline-app-v3').atlasTest.setRange(...r)",[left,right])
        item=page.locator(f'[data-chart] [data-work="{id}"]')
        await item.wait_for()
        props=await item.evaluate("""e => ({kind:e.dataset.dateKind,
            marks:e.querySelectorAll('.ia-date-open').length,
            sizes:[...e.querySelectorAll('rect.ia-date-glyph')].map(x=>+x.getAttribute('width')),
            explanation:e.getAttribute('aria-label')})""")
        assert props['kind']==kind,(id,props)
        assert all(s<=10 for s in props['sizes']),(id,props)
        if stages:assert props['marks']==stages,(id,props)
        assert props['explanation'] and (kind=='exact' or any(w in props['explanation'].lower() for w in ('not','possible','earlier','approximate','separately')))
    await page.evaluate("()=>document.querySelector('#kalam-timeline-app-v3').atlasTest.selectNode('iji_mawaqif',true)")
    note=await page.locator('[data-sheet]').inner_text()
    assert '1330' in note and '1352' in note and 'Several separately attested' in note
    if mobile and engine.name=='chromium':
        el=page.locator('[data-chart]');await el.scroll_into_view_if_needed()
        r=await el.bounding_box()
        await el.evaluate("(e)=>e.scrollTop=0")
        before=await snapshot(page);x=r['x']+r['width']/2;y=r['y']+min(95,r['height']/2)
        session=await ctx.new_cdp_session(page)
        await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':7}]})
        for i in range(1,6):
            await session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-34*i,'id':7}]})
            await page.wait_for_timeout(55)
        await session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        await page.wait_for_timeout(135)
        after=await snapshot(page)
        assert after['scroll']>0 and abs(after['from']-before['from'])<.001,(before,after)
    await page.locator('[data-chart]').scroll_into_view_if_needed()
    await page.screenshot(path=str(OUT/f'atlas_smooth_{engine.name}_{width}x{height}.png'),full_page=False)
    assert not errors,errors[:3]
    results.append(report)
    print('PASS continuous',engine.name,width,height,flush=True)
    await ctx.close();await browser.close()

async def main():
    async with async_playwright() as p:
        for browser,w,h,mobile in [(p.chromium,1440,900,False),(p.chromium,390,844,True),
                                   (p.chromium,844,390,True),(p.webkit,1440,900,False),
                                   (p.webkit,390,844,True)]:
            await exercise(browser,w,h,mobile)
    (OUT/'continuous-report.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))
if __name__=='__main__':asyncio.run(main())
