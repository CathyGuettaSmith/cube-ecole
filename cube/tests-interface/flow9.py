import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        m = await b.new_page(viewport={'width':390,'height':760})
        await m.goto('file:///home/claude/rubik/index.html#memo'); await m.wait_for_timeout(400)
        await m.locator('[data-mv="oll:27"][data-vm="do"]').click(); await m.wait_for_timeout(600)
        disp = "getComputedStyle(document.querySelector('#vwPl .mvArrow')).display"
        print('au départ :', await m.evaluate(disp))
        await m.click('[data-p="hint"]'); await m.wait_for_timeout(300)
        print('après Indice :', await m.evaluate(disp))
        await m.locator('.key.hint').first.click(); await m.wait_for_timeout(900)
        print('après le mouvement :', await m.evaluate(disp))
        await b.close()
asyncio.run(main())
