import asyncio
from playwright.async_api import async_playwright
GET = """([pos,f])=>{const sb=document.querySelector('#lpPrac');const els=[...sb.querySelectorAll('.cubie')];const S=parseFloat(els[0].style.width);
  for(const e of els){const mm=e.style.transform.match(/matrix3d\\((.*)\\)/)[1].split(',').map(Number);const x=Math.round(mm[12]/S),y=-Math.round(mm[13]/S),z=Math.round(mm[14]/S);
  if(x===pos[0]&&y===pos[1]&&z===pos[2]){const fc=e.querySelector('.face[data-f="'+f+'"] i');if(!fc)return null;const rr=fc.getBoundingClientRect();return [rr.x+rr.width/2, rr.y+rr.height/2];}}return null;}"""
async def swipe(m, pos, f, dx, dy):
    r = await m.evaluate(GET, [pos, f])
    await m.mouse.move(*r); await m.mouse.down(); await m.mouse.move(r[0]+dx/3, r[1]+dy/3, steps=3); await m.mouse.move(r[0]+dx, r[1]+dy, steps=4); await m.mouse.up()
    await m.wait_for_timeout(900)
async def open_case(m):
    await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.reload(); await m.wait_for_timeout(400)
    await m.evaluate("document.querySelector('[data-set=\"oll\"]').click()"); await m.wait_for_timeout(300)
    await m.evaluate("document.querySelector('.card[data-id=\"oll:44\"]').click()"); await m.wait_for_timeout(400)
    await m.click('#lpTabs [data-m="do"]'); await m.wait_for_timeout(500)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs=[]
        m = await b.new_page(viewport={'width':1200,'height':1000})
        m.on('pageerror', lambda e: errs.append(str(e)))
        msg = lambda: m.locator('#lpPrac .pracMsg').inner_text()
        # A) deux glissements : face avant puis tranche du milieu (f = F + S)
        await open_case(m)
        await swipe(m, [1,0,1], 'R', 0, 70); print('A1', await msg())
        await swipe(m, [1,0,0], 'R', 0, 70); print('A2', await msg())
        # B) mode 2 couches, un seul glissement
        await open_case(m)
        await m.click('#lpPrac [data-p="wide"]'); await m.wait_for_timeout(200)
        await swipe(m, [1,0,1], 'R', 0, 70); print('B1', await msg())
        # C) bulle f puis le reste par indices -> victoire
        await open_case(m)
        for i in range(10):
            if await m.locator('#lpPrac .pracMsg.win').count(): break
            await m.click('#lpPrac [data-p="hint"]'); await m.wait_for_timeout(80)
            await m.locator('#lpPrac .key.hint').first.click(); await m.wait_for_timeout(850)
        print('C', await msg())
        # D) glissement sur face, mauvais sens -> erreur, puis retour
        await open_case(m)
        await swipe(m, [1,0,1], 'R', 0, -70); print('D1', await msg())
        await m.click('#lpPrac [data-p="undo"]'); await m.wait_for_timeout(900); print('D2', await msg())
        print(errs)
        await b.close()
asyncio.run(main())
