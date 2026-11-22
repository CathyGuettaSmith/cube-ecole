import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto('file:///home/claude/rubik/index.html#memo'); await m.wait_for_timeout(500)
        await m.locator('[data-mv="oll:27"][data-vm="do"]').click(); await m.wait_for_timeout(700)
        await m.evaluate("document.getElementById('ovBody').scrollTop = 120"); await m.wait_for_timeout(200)
        await m.screenshot(path='g1.png')
        await m.locator('.key').nth(0).click(); await m.wait_for_timeout(900)   # R correct
        await m.screenshot(path='g2.png')
        await m.locator('.key').nth(1).click(); await m.wait_for_timeout(900)   # R' wrong
        await m.screenshot(path='g3.png')
        print(await m.locator('.pracMsg').inner_text())
        print(errs)
        await b.close()
asyncio.run(main())
