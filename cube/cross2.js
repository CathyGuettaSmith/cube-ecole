const C = require('./engine.js');
const DEDGES = ['0,-1,-1','1,-1,0','-1,-1,0'];
const find = (s, h) => s.find(c => c.home.join() === h);
function others(s){ return DEDGES.every(h => { const c = find(s, h); return c.pos.join() === h && c.rot.join() === '1,0,0,0,1,0,0,0,1'; }); }
function key(s){ const c = find(s, '0,-1,1'); const w = C.facelets([c]).find(f => f.color === 'W'); return c.pos.join() + ' W' + w.dir.join(); }
const GEN = ['U',"U'",'U2','F',"F'",'F2','R',"R'",'R2','L',"L'",'L2','D',"D'"];
const best = {};
let frontier = [[C.solved(), []]];
for (let d = 0; d <= 4; d++) {
  for (const [s, p] of frontier) if (others(s)) { const k = key(s); if (!best[k]) best[k] = []; if (best[k].length < 4 && (best[k][0] || p).length === p.length) best[k].push(p); }
  const nx = [];
  for (const [s, p] of frontier) for (const g of GEN) { if (p.length && p[p.length-1][0] === g[0]) continue; nx.push([C.apply(C.clone(s), g), p.concat(g)]); }
  frontier = nx;
}
for (const k in best) console.log(k, '=>', best[k].map(p => C.invert(C.parse(p.join(' '))).map(m => m.label).join(' ')).join('  |  '));
