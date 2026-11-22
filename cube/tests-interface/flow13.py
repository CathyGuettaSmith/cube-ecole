import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto('file:///home/claude/rubik/index.html'); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('.quickKnow').scrollIntoView({block:'start'})"); await m.wait_for_timeout(200)
        await m.screenshot(path='n1.png')
        await m.click('[data-knowchs]'); await m.wait_for_timeout(400)
        await m.evaluate("window.scrollTo(0,0)"); await m.wait_for_timeout(200)
        await m.screenshot(path='n2.png')
        await m.evaluate("document.querySelector('.chapters').scrollIntoView({block:'start'})"); await m.wait_for_timeout(200)
        await m.screenshot(path='n3.png')
        # mark one lesson known in chapter 3
        await m.locator('[data-know="o2a"]').click(); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('.chapters').scrollIntoView({block:'start'})"); await m.wait_for_timeout(200)
        await m.screenshot(path='n4.png')
        print(errs)
        await b.close()
asyncio.run(main())
