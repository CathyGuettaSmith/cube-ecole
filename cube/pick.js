const C = require('./engine.js');
const { byCase, sig, stm, CORNER, EDGE } = require('./f2l.js');
const extra = ["R U' R' F' U' F", "R U R' U' R U R'", "F' U' F U R U' R'"];
for (const a of extra) (byCase[sig(a)] = byCase[sig(a)] || []).push(a);
function cost(a) {
  const ms = C.parse(a); let c = 0;
  for (const m of ms) c += 'xyz'.includes(m.base) ? 0.6 : m.base === 'd' ? 1.3 : (m.base==='F'?1.15:1) ;
  return c;
}
const out = [];
for (const k in byCase) {
  const algs = [...new Set(byCase[k])].sort((a,b)=>cost(a)-cost(b));
  // category from signature
  const parts = k.split(';');
  const cPos = parts.find(p=>p.startsWith(CORNER)).split('@')[1].split('/')[0];
  const ePos = parts.find(p=>p.startsWith(EDGE)).split('@')[1].split('/')[0];
  const cUp = cPos.split(',')[1]==='1', eUp = ePos.split(',')[1]==='1';
  // white facing up?
  const wUp = parts.some(p=>p.startsWith(CORNER) && p.includes('/0,1,0=W'));
  let cat = cUp && eUp ? (wUp ? 'Coin blanc dessus' : 'Coin et arête en haut') : cUp ? 'Arête dans le slot' : eUp ? 'Coin dans le slot' : 'Coin et arête dans le slot';
  const keep = algs.filter((a,i)=> i===0 || cost(a) <= cost(algs[0]) + 2.5).slice(0,2);
  out.push({ cat, algs: keep, c: cost(algs[0])});
}
const order = ['Coin et arête en haut','Coin blanc dessus','Arête dans le slot','Coin dans le slot','Coin et arête dans le slot'];
out.sort((a,b)=> order.indexOf(a.cat)-order.indexOf(b.cat) || a.c-b.c);
console.log(out.length);
require("fs").writeFileSync("f2l.json", JSON.stringify(out.map(o=>[o.cat,o.algs])));
