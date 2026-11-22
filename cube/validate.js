const C = require('./engine.js');
const D = require('./data.js');
const STD = { '0,1,0':'Y','0,-1,0':'W','0,0,1':'G','0,0,-1':'B','1,0,0':'O','-1,0,0':'R' };

function afterAlg(alg) { return C.normalize(C.apply(C.solved(), alg)); }
function badFacelets(s, pred) {
  const bad = [];
  for (const f of C.facelets(s)) if (pred(f) && STD[f.dir.join(',')] !== f.color) bad.push(f);
  return bad;
}
function caseState(alg, pre = '') {
  const inv = C.invert(C.parse(alg));
  const t = C.apply(C.apply(C.solved(), pre), inv);
  const N = C.normalizer(t);
  return C.apply(C.apply(C.apply(C.solved(), pre), N), inv);
}
function llString(s, fn) {
  const fs = C.facelets(s).filter(f => f.pos[1] === 1).map(f => C.key(f.pos, f.dir) + '=' + fn(f.color));
  return fs.sort().join(';');
}
const U = ['', 'U', 'U2', "U'"];

let errors = 0;
// OLL
const ollSig = {};
for (const [n, g, alg] of D.oll) {
  const s = afterAlg(alg);
  const bad = badFacelets(s, f => f.pos[1] <= 0);
  const top = badFacelets(s, f => f.pos[1] === 1 && f.dir[1] === 1 && false);
  if (bad.length) { console.log('OLL', n, 'breaks F2L', bad.length); errors++; continue; }
  let best = null;
  for (const b of U) {
    const z = C.apply(caseState(alg), b);
    const str = llString(z, c => c === 'Y' ? 'Y' : '.');
    if (!best || str < best) best = str;
  }
  // count oriented after alg: should be fully yellow top
  const s2 = afterAlg(alg); // from solved -> case inverse? check that alg solves orientation: case state + alg = solved obviously
  if (ollSig[best]) { console.log('OLL dup', n, 'with', ollSig[best]); errors++; }
  ollSig[best] = n;
  // check edges/corners oriented counts for group sanity
  const z = caseState(alg);
  let e = 0, c = 0;
  for (const f of C.facelets(z)) if (f.pos[1] === 1 && f.dir[1] === 1 && f.color === 'Y') {
    const nz = f.pos.filter(v => v !== 0).length;
    if (nz === 2) e++; if (nz === 3) c++;
  }
  if (e + c === 9) { console.log('OLL trivial', n); errors++; }
  console.log('OLL', n, g, 'edgesOriented', e, 'cornersOriented', c - 0);
}
console.log('OLL distinct', Object.keys(ollSig).length);

// PLL
const pllSig = {};
for (const [n, g, vars] of D.pll) {
  for (const v of vars) {
    const alg = typeof v === 'string' ? v : v.s;
    const s = afterAlg(alg);
    const bad = badFacelets(s, f => f.pos[1] <= 0 || f.dir[1] === 1);
    if (bad.length) { console.log('PLL', n, alg, 'breaks', bad.length); errors++; continue; }
    let best = null;
    for (const a of U) for (const b of U) {
      const z = C.apply(caseState(alg, a), b);
      const str = llString(z, c => c);
      if (!best || str < best) best = str;
    }
    if (pllSig[best] && pllSig[best] !== n) { console.log('PLL dup', n, 'with', pllSig[best]); errors++; }
    pllSig[best] = n;
  }
}
console.log('PLL distinct', Object.keys(pllSig).length);

module.exports = { caseState, afterAlg, badFacelets, llString, STD };
if (require.main === module) {
  console.log('errors', errors);
  // Code d'erreur pour bloquer la mise en ligne si un algorithme est cassé.
  if (errors > 0 || Object.keys(ollSig).length !== 57 || Object.keys(pllSig).length !== 21) process.exitCode = 1;
}
