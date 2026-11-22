const C = require('./engine.js');
const { missing, byCase, sig, validF2L } = require('./f2l.js');
const { STD } = require('./validate.js');
const GEN = ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', "F'", 'F2'];
// projection: all cubies with home y<=0 that are not centers
function proj(s) {
  return s.filter(c => c.home[1] <= 0 && c.home.filter(v => v).length > 1)
    .map(c => c.pos.join(',') + ':' + c.rot.join(',')).join('|');
}
function tracked(s) { return s.filter(c => c.home[1] <= 0 && c.home.filter(v => v).length > 1); }
function bfs(start, depth) {
  const map = new Map(); let frontier = [[tracked(start), []]];
  map.set(proj(frontier[0][0]), []);
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (const [s, path] of frontier) for (const g of GEN) {
      if (path.length && path[path.length - 1][0] === g[0]) continue;
      const t = C.apply(C.clone(s), g); const k = proj(t);
      if (map.has(k)) continue; const p = path.concat(g); map.set(k, p); next.push([t, p]);
    }
    frontier = next;
  }
  return map;
}
// Build a case state from a signature by finding a random state matching it.
function stateForSig(target) {
  const gens = ["R U R'", "R U' R'", "R U2 R'", "F' U F", "F' U' F", 'U', "R' F R F'", "R U R' U'", 'U2'];
  for (let i = 0; i < 200000; i++) {
    let seq = ''; const n = 1 + Math.floor(Math.random() * 6);
    for (let j = 0; j < n; j++) seq += ' ' + gens[Math.floor(Math.random() * gens.length)];
    // signature of state = sig of alg whose inverse is seq
    const algInv = C.invert(C.parse(seq)).map(m => m.label).join(' ');
    if (!validF2L(algInv)) continue;
    if (sig(algInv) === target) return C.apply(C.solved(), seq);
  }
}
const back = bfs(C.solved(), 6);
for (const m of missing) {
  const st = stateForSig(m);
  const fwd = bfs(st, 6);
  const sols = [];
  for (const [k, p] of fwd) if (back.has(k)) {
    const b = back.get(k);
    const inv = C.invert(C.parse(b.join(' '))).map(x => x.label);
    sols.push(p.concat(inv).join(' '));
  }
  sols.sort((a, b) => a.split(' ').length - b.split(' ').length);
  const good = sols.filter(a => sig(a) === m && validF2L(a));
  console.log('CASE', m.slice(0, 60));
  console.log(good.slice(0, 12).join('\n'));
}
