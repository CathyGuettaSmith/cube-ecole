import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        m = await b.new_page(viewport={'width':1200,'height':1000})
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.wait_for_timeout(400)
        await m.click('[data-set="atelier"]'); await m.wait_for_timeout(500)
        get = """(pos)=>{const sb=document.querySelector('#sandbox');const els=[...sb.querySelectorAll('.cubie')];const S=parseFloat(els[0].style.width);
          for(const e of els){const mm=e.style.transform.match(/matrix3d\\((.*)\\)/)[1].split(',').map(Number);const x=Math.round(mm[12]/S),y=-Math.round(mm[13]/S),z=Math.round(mm[14]/S);
          if(x===pos[0]&&y===pos[1]&&z===pos[2]){const rr=e.querySelector('.face[data-f="U"] i').getBoundingClientRect();return [rr.x+rr.width/2, rr.y+rr.height/2];}}}"""
        for a, c, exp in [([1,1,1],[1,1,-1],"R"), ([-1,1,-1],[-1,1,1],"L"), ([-1,1,1],[1,1,1],"F'"), ([1,1,-1],[-1,1,-1],"B")]:
            await m.click('[data-s="reset"]'); await m.wait_for_timeout(300)
            p1 = await m.evaluate(get, a); p2 = await m.evaluate(get, c)
            await m.mouse.move(*p1); await m.mouse.down(); await m.mouse.move((p1[0]+p2[0])/2,(p1[1]+p2[1])/2, steps=4); await m.mouse.move(*p2, steps=4); await m.mouse.up(); await m.wait_for_timeout(900)
            print(a,'->',c,'expected',exp,'got', await m.evaluate("[...document.querySelectorAll('#sandbox [data-r=\"seq\"] .bb b')].map(e=>e.textContent)"))
        await b.close()
asyncio.run(main())
