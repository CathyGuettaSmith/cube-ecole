import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto('file:///home/claude/rubik/index.html#memo'); await m.wait_for_timeout(400)
        await m.locator('[data-mv="oll:27"][data-vm="watch"]').click(); await m.wait_for_timeout(300)
        await m.click('#vwPl [data-a="next"]'); await m.wait_for_timeout(900)
        await m.screenshot(path='h1.png')
        await m.evaluate("document.querySelector('#vwPl .lgB[data-lg=\"doigts\"]').click()"); await m.wait_for_timeout(300)
        await m.evaluate("document.querySelector('#vwPl .algBox').scrollIntoView()"); await m.wait_for_timeout(200)
        await m.screenshot(path='h2.png')
        await m.click('#ovClose'); await m.wait_for_timeout(200)
        await m.evaluate("document.querySelector('[data-ch=\"c1\"]') && 0")
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.reload(); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('[data-set=\"notation\"]').click()"); await m.wait_for_timeout(300)
        await m.evaluate("document.querySelector('.card[data-id=\"notation:U\"]').click()"); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('#lpNote').scrollIntoView()"); await m.wait_for_timeout(200)
        await m.screenshot(path='h3.png')
        print(errs)
        await b.close()
asyncio.run(main())
