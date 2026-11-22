import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=3)
        await m.emulate_media(reduced_motion='reduce')
        await m.goto('file:///home/claude/rubik/index.html#memo'); await m.wait_for_timeout(400)
        await m.locator('.grip').screenshot(path='k1.png')
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.reload(); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('[data-set=\"notation\"]').click()"); await m.wait_for_timeout(300)
        shots=[]
        for i,mv in enumerate(["R","U'","F","D"]):
            await m.evaluate("(id)=>document.querySelector('.card[data-id=\"'+id+'\"]').click()", 'notation:'+mv); await m.wait_for_timeout(300)
            await m.locator('#lpNote .fcard').screenshot(path=f'k{i+2}.png')
        await b.close()
asyncio.run(main())
