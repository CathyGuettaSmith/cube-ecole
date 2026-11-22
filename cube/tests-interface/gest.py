import asyncio
from playwright.async_api import async_playwright
TESTS = [  # (cubie pos, face, dx, dy, expected)
 ([1,0,1],'F',0,-60,"R"), ([1,0,1],'F',0,60,"R'"), ([0,1,1],'F',-60,0,"U"), ([0,1,1],'F',60,0,"U'"),
 ([0,0,1],'F',0,-60,"M'"), ([-1,0,1],'F',0,60,"L"), ([0,-1,1],'F',60,0,"D"),
 ([1,1,0],'U',0,-50,"R"), ([1,0,0],'R',0,-60,"S'"), ([1,0,-1],'R',0,-60,"B"), ([1,0,1],'R',0,-60,"F'"), ([0,1,0],'U',0,-50,"M'"), ([-1,1,0],'U',0,-50,"L'"),
 (None,None,-80,0,"y"), (None,None,0,-80,"x")]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        m = await b.new_page(viewport={'width':1200,'height':1000})
        await m.goto('file:///home/claude/rubik/index.html#bibliotheque'); await m.wait_for_timeout(400)
        await m.click('[data-set="atelier"]'); await m.wait_for_timeout(500)
        for pos, f, dx, dy, exp in TESTS:
            await m.click('[data-s="reset"]'); await m.wait_for_timeout(300)
            if pos:
                r = await m.evaluate("""([pos,f])=>{const sb=document.querySelector('#sandbox');const els=[...sb.querySelectorAll('.cubie')];
                  // model order equals els order; find via transform matrix translation
                  const S=parseFloat(els[0].style.width);
                  for(const e of els){const mm=e.style.transform.match(/matrix3d\\((.*)\\)/)[1].split(',').map(Number);const x=Math.round(mm[12]/S),y=-Math.round(mm[13]/S),z=Math.round(mm[14]/S);
                    if(x===pos[0]&&y===pos[1]&&z===pos[2]){const fc=e.querySelector('.face[data-f="'+f+'"] i');const rr=fc.getBoundingClientRect();return [rr.x+rr.width/2, rr.y+rr.height/2];}}return null;}""", [pos,f])
            else:
                vp = await m.evaluate("(()=>{const r=document.querySelector('#sandbox .viewport').getBoundingClientRect();return [r.x+18,r.y+18]})()")
                r = vp
            await m.mouse.move(r[0], r[1]); await m.mouse.down(); await m.mouse.move(r[0]+dx/3, r[1]+dy/3, steps=3); await m.mouse.move(r[0]+dx, r[1]+dy, steps=5); await m.mouse.up()
            await m.wait_for_timeout(900)
            seq = await m.evaluate("[...document.querySelectorAll('#sandbox [data-r=\"seq\"] .bb b')].map(e=>e.textContent)")
            print(pos, f, dx, dy, 'expected', exp, 'got', seq)
        await b.close()
asyncio.run(main())
