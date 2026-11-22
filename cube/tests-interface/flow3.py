import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        m.on('console', lambda x: errs.append('console:'+x.text) if x.type=='error' else None)
        await m.goto('file:///home/claude/rubik/index.html#memo'); await m.wait_for_timeout(600)
        await m.screenshot(path='q_memo.png')
        await m.evaluate("document.getElementById('memo-2').scrollIntoView()"); await m.wait_for_timeout(200)
        await m.screenshot(path='q_memo2.png')
        await m.evaluate("document.getElementById('memo-4').scrollIntoView()"); await m.wait_for_timeout(200)
        await m.screenshot(path='q_memo4.png')
        await m.locator('[data-mv="f2l:17"][data-vm="watch"]').click(); await m.wait_for_timeout(500)
        # track a piece via button
        await m.locator('#vwPl [data-a="track"]').click(); await m.wait_for_timeout(300)
        await m.locator('#vwPl .tbCand').first.click(); await m.wait_for_timeout(2500)
        await m.screenshot(path='q_track.png')
        await m.evaluate("document.getElementById('ovBody').scrollTop = 700"); await m.wait_for_timeout(200)
        await m.screenshot(path='q_track2.png')
        await m.click('#ovClose'); await m.wait_for_timeout(300)
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.reload(); await m.wait_for_timeout(500)
        await m.click('[data-set="atelier"]'); await m.wait_for_timeout(500)
        await m.locator('.key').nth(0).click(); await m.wait_for_timeout(800)
        await m.screenshot(path='q_sb.png')
        await m.evaluate("window.scrollTo(0, 900)"); await m.wait_for_timeout(200)
        await m.screenshot(path='q_sb2.png')
        print(errs)
        await b.close()
asyncio.run(main())
