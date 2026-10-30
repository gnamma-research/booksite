"""Browser smoke test of the GNAMMA bilingual Summa book reader.

From a running local repo server on 127.0.0.1:8123, e.g. run:
python research/intellectual-atlas/tests/verify_summa_reader_browser.py --browser chromium --width 390 --height 844
"""
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

URL="http://127.0.0.1:8123/research/intellectual-atlas/avicennian-summa/chapters/reader.html"
OUT=Path("/tmp/gnamma-atlas-exhaustive")
OUT.mkdir(parents=True,exist_ok=True)

async def verify(engine,width,height):
    errors=[]
    async with async_playwright() as p:
        browser=await getattr(p,engine).launch(headless=True)
        page=await browser.new_page(viewport={"width":width,"height":height})
        page.on("pageerror",lambda error:errors.append(str(error)))
        for chapter in (1,5,9):
            num=f"ch{chapter:02d}"
            response=await page.goto(URL+"#"+num,wait_until="domcontentloaded",timeout=60000)
            assert response.status==200, f"Reader HTTP {response.status}"
            await page.wait_for_function(
                "(id) => !!document.querySelector('#'+id) && !document.querySelector('#'+id).hidden",num
            )
            assert await page.locator("article.scholar-chapter").count()==9
            assert await page.locator("article.scholar-chapter:visible").count()==1
            assert await page.locator(f"article#{num}:visible").count()==1
            assert await page.locator("#current-title").inner_text()==f"Chapter {chapter} of 9"
            assert await page.locator(f'article#{num} a[href^="http"]').count()>0
            overflow=await page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            assert overflow<=4, f"Horizontal overflow {overflow} pixels in chapter {num}"
        assert await page.locator("article#ch05 [dir='rtl']").count()>0, "Arabic passages not RTL"
        await page.locator('.side a[href="#ch07"]').click()
        assert await page.locator("article#ch07:visible").count()==1
        await page.reload(wait_until="domcontentloaded")
        assert await page.locator("article#ch07:visible").count()==1, "Deep link did not survive reload"
        for color in ("light","dark"):
            await page.emulate_media(color_scheme=color)
            await page.screenshot(path=str(OUT/f"summa-{engine}-{width}x{height}-{color}.png"),full_page=False)
        assert not errors, f"JavaScript page errors: {errors}"
        await browser.close()
        print(json.dumps({"browser":engine,"size":[width,height],"chapters":9,
            "deep_links":True,"RTL":True,"themes":2,"status":"pass"}))

if __name__=="__main__":
    args=argparse.ArgumentParser()
    args.add_argument("--browser",choices=["chromium","webkit"],default="chromium")
    args.add_argument("--width",type=int,default=1440)
    args.add_argument("--height",type=int,default=900)
    a=args.parse_args()
    asyncio.run(verify(a.browser,a.width,a.height))
