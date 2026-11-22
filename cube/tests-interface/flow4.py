import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto('file:///home/claude/rubik/index.html#memo'); await m.wait_for_timeout(500)
        await m.locator('[data-mv="f2l:3"][data-vm="do"]').click(); await m.wait_for_timeout(600)
        await m.locator('.key').nth(0).click(); await m.wait_for_timeout(900)   # U (correct first move)
        await m.locator('.key').nth(4).click(); await m.wait_for_timeout(900)   # wrong probably
        await m.click('[data-p="undo"]'); await m.wait_for_timeout(900)
        await m.screenshot(path='r_undo.png')
        for i in range(10):
            if await m.locator('.pracMsg.win').count(): break
            await m.click('[data-p="hint"]'); await m.wait_for_timeout(100)
            await m.locator('.key.hint').first.click(); await m.wait_for_timeout(900)
        await m.evaluate("document.getElementById('ovBody').scrollTop = 0")
        await m.screenshot(path='r_win.png')
        print(await m.locator('.pracMsg').inner_text())
        print(errs)
        await b.close()
asyncio.run(main())
