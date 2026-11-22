import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        m.on('pageerror', lambda e: errs.append(str(e)))
        m.on('console', lambda x: errs.append('console:'+x.text) if x.type=='error' else None)
        await m.goto('file:///home/claude/rubik/index.html')
        await m.wait_for_timeout(700)
        await m.screenshot(path='m_home.png')
        await m.screenshot(path='m_home_full.png', full_page=True)
        # lesson flow: o2b
        await m.evaluate("document.querySelector('[data-lesson=\"o2b\"]').click()")
        await m.wait_for_timeout(300)
        await m.screenshot(path='m_intro.png')
        await m.click('#lsGo'); await m.wait_for_timeout(2600)
        await m.screenshot(path='m_learn.png')
        for i in range(3):
            await m.click('#lsNext'); await m.wait_for_timeout(300)
        await m.click('#lsNext'); await m.wait_for_timeout(400)
        await m.screenshot(path='m_quiz.png')
        # answer: click first option
        n=0
        while n<60 and await m.locator('.opt').count()>0:
            await m.locator('.opt').first.click(); await m.wait_for_timeout(200)
            if n==0: await m.screenshot(path='m_fb.png')
            await m.click('#qCont'); await m.wait_for_timeout(250); n+=1
            if await m.locator('#dnBack').count(): break
        await m.wait_for_timeout(700)
        await m.screenshot(path='m_done.png')
        await m.click('#dnBack'); await m.wait_for_timeout(300)
        # make due: set srs due to today via localStorage then reload review
        await m.evaluate("""()=>{const k='rubik-trainer-v2';const s=JSON.parse(localStorage.getItem(k));for(const id in s.srs)s.srs[id].due=0;localStorage.setItem(k,JSON.stringify(s));}""")
        await m.goto('file:///home/claude/rubik/index.html#reviser'); await m.reload(); await m.wait_for_timeout(500)
        await m.screenshot(path='m_review.png')
        await m.click('#rvGo'); await m.wait_for_timeout(600)
        await m.click('#rvShow2'); await m.wait_for_timeout(1500)
        await m.screenshot(path='m_rev_card.png')
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.wait_for_timeout(500)
        await m.screenshot(path='m_lib.png')
        await m.locator('.card').nth(3).click(); await m.wait_for_timeout(600)
        await m.screenshot(path='m_libp.png')
        # notation lesson quiz
        await m.goto('file:///home/claude/rubik/index.html'); await m.wait_for_timeout(400)
        await m.evaluate("document.querySelector('[data-ch=\"c1\"]').click()")
        await m.wait_for_timeout(200)
        await m.evaluate("document.querySelector('[data-lesson=\"n1\"]').click()")
        await m.click('#lsGo'); await m.wait_for_timeout(1500)
        await m.screenshot(path='m_move.png')
        for i in range(7): await m.click('#lsNext'); await m.wait_for_timeout(150)
        await m.wait_for_timeout(1200)
        await m.screenshot(path='m_mquiz.png')
        d = await b.new_page(viewport={'width':1360,'height':900})
        d.on('pageerror', lambda e: errs.append(str(e)))
        await d.goto('file:///home/claude/rubik/index.html'); await d.wait_for_timeout(600)
        await d.screenshot(path='d_home.png')
        print(errs)
        await b.close()
asyncio.run(main())
