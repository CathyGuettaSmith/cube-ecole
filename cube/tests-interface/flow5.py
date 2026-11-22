import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        # practice on OLL 33 (Sexy + Sledge) via library
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('[data-set=\"oll\"]').click()"); await m.wait_for_timeout(300)
        await m.evaluate("document.querySelector('.card[data-id=\"oll:33\"]').click()"); await m.wait_for_timeout(400)
        await m.click('#lpTabs [data-m="do"]'); await m.wait_for_timeout(400)
        for i in range(6):
            await m.click('#lpPrac [data-p="hint"]'); await m.wait_for_timeout(80)
            await m.locator('#lpPrac .key.hint').first.click(); await m.wait_for_timeout(850)
            if i == 1: print('msg2:', await m.locator('#lpPrac .pracMsg').inner_text())
            if i == 3: print('msg4:', await m.locator('#lpPrac .pracMsg').inner_text())
        await m.evaluate("document.querySelector('#lpPrac .seqBox').scrollIntoView({block:'center'})"); await m.wait_for_timeout(200)
        await m.screenshot(path='s_prac.png')
        # sandbox sexy move
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.reload(); await m.wait_for_timeout(400)
        await m.click('[data-set="atelier"]'); await m.wait_for_timeout(400)
        keys = {"R":0,"R'":1,"U":6,"U'":7}
        for mv in ["R","U","R'","U'","R","U","R'","U'"]:
            await m.locator('#sandbox .key').nth(keys[mv]).click(); await m.wait_for_timeout(750)
        print('sandbox named:', await m.locator('#sandbox .named').inner_text())
        await m.evaluate("document.querySelector('#sandbox [data-r=\"seq\"]').scrollIntoView({block:'center'})"); await m.wait_for_timeout(200)
        await m.screenshot(path='s_sb.png')
        print(errs)
        await b.close()
asyncio.run(main())
