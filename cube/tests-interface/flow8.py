import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':760}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto('file:///home/claude/rubik/index.html'); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('[data-lesson=\"b1\"]').click()")
        await m.click('#lsGo'); await m.wait_for_timeout(1200)
        await m.screenshot(path='u1.png')
        await m.click('#lsNext'); await m.wait_for_timeout(1500)
        await m.screenshot(path='u2.png')
        await m.click('#lsTabs [data-m="do"]'); await m.wait_for_timeout(500)
        await m.screenshot(path='u3.png')
        await m.evaluate("document.getElementById('ovBody').scrollTop = 400"); await m.wait_for_timeout(300)
        await m.screenshot(path='u4.png')
        print(errs)
        await b.close()
asyncio.run(main())
