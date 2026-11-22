import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('[data-set=\"oll\"]').click()"); await m.wait_for_timeout(300)
        await m.evaluate("document.querySelector('.card[data-id=\"oll:33\"]').click()"); await m.wait_for_timeout(500)
        st = m.locator('#lpPlayer .stage')
        await st.screenshot(path='a1.png')   # next: R
        await m.click('#lpPlayer [data-a="next"]'); await m.wait_for_timeout(900)
        await st.screenshot(path='a2.png')   # next: U
        await m.click('#lpPlayer [data-a="next"]'); await m.wait_for_timeout(900)
        await st.screenshot(path='a3.png')   # next: R'
        await m.click('#lpPlayer [data-a="next"]'); await m.wait_for_timeout(900)
        await m.click('#lpPlayer [data-a="next"]'); await m.wait_for_timeout(900)
        await m.click('#lpPlayer [data-a="next"]'); await m.wait_for_timeout(900)
        await st.screenshot(path='a4.png')   # next: F
        print(errs)
        await b.close()
asyncio.run(main())
