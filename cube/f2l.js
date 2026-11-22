const C = require('./engine.js');
const D = require('./data.js');
const { caseState, afterAlg, STD } = require('./validate.js');
const CORNER = '1,-1,1', EDGE = '1,0,1';
const U = ['', 'U', 'U2', "U'"];

function validF2L(alg) {
  const s = afterAlg(alg);
  for (const f of C.facelets(s)) {
    if (f.pos[1] > 0) continue;
    const k = f.pos.join(',');
    if (k === CORNER || k === EDGE) continue;
    if (STD[f.dir.join(',')] !== f.color) return false;
  }
  return true;
}
function pairSig(s) {
  const parts = [];
  for (const f of C.facelets(s)) {
    const h = f.home.join(',');
    if (h === CORNER || h === EDGE) parts.push(h + '@' + f.pos.join(',') + '/' + f.dir.join(',') + '=' + f.color);
  }
  return parts.sort().join(';');
}
function sig(alg) {
  let best = null;
  for (const b of U) { const str = pairSig(C.apply(caseState(alg), b)); if (!best || str < best) best = str; }
  return best;
}
// Enumerate all 41 cases by scrambling: search states reachable, collect signatures from random sequences
function enumerateCases() {
  const seen = new Set();
  const gens = ["R U R'", "R U' R'", "R U2 R'", "F' U F", "F' U' F", 'U', "R' F R F'", "R U R' U'", 'U2'];
  for (let i = 0; i < 20000; i++) {
    let seq = '';
    const n = 1 + Math.floor(Math.random() * 6);
    for (let j = 0; j < n; j++) seq += ' ' + gens[Math.floor(Math.random() * gens.length)];
    const s = C.apply(C.solved(), seq);
    // only if other F2L pieces solved
    let ok = true;
    for (const f of C.facelets(s)) {
      if (f.pos[1] > 0) continue; const k = f.pos.join(',');
      if (k === CORNER || k === EDGE) continue;
      if (STD[f.dir.join(',')] !== f.color) { ok = false; break; }
    }
    if (!ok) continue;
    let best = null;
    for (const b of U) { const str = pairSig(C.apply(C.clone(s), b)); if (!best || str < best) best = str; }
    seen.add(best);
  }
  return seen;
}
function stm(alg) { return C.parse(alg).filter(m => !'xyz'.includes(m.base)).length; }

const all = enumerateCases();
const solvedSig = (() => { let best=null; for (const b of U){const s=pairSig(C.apply(C.solved(), b)); if(!best||s<best)best=s;} return best; })();
all.delete(solvedSig);
console.log('cases enumerated', all.size);
const byCase = {};
for (const alg of D.f2lPool) {
  if (!validF2L(alg)) { console.log('INVALID', alg); continue; }
  const s = sig(alg);
  if (s === solvedSig) { console.log('TRIVIAL', alg); continue; }
  (byCase[s] = byCase[s] || []).push(alg);
}
console.log('covered', Object.keys(byCase).length);
const missing = [...all].filter(s => !byCase[s]);
console.log('missing', missing.length);
module.exports = { byCase, missing, all, pairSig, sig, validF2L, stm, CORNER, EDGE };
if (require.main === module) {
  for (const k in byCase) console.log(byCase[k].join('  |  '));
  console.log(JSON.stringify(missing, null, 0));
}
