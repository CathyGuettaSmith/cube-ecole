const C = require('./engine.js'); const D = require('./data.js');
function caseState(alg){ const inv = C.invert(C.parse(alg)); const t = C.apply(C.solved(), inv); return C.apply(C.apply(C.solved(), C.normalizer(t)), inv); }
function pn(p){ const a=[]; if(p[2]===1)a.push('devant'); if(p[2]===-1)a.push('derrière'); if(p[0]===1)a.push('droite'); if(p[0]===-1)a.push('gauche'); return a.join('-'); }
const DN = { '0,1,0':'haut','0,0,1':'devant','0,0,-1':'derrière','1,0,0':'droite','-1,0,0':'gauche' };
for (const n of [21,22,23,24,25,26,27]) {
  const alg = D.oll.find(o => o[0]===n)[2]; const Z = caseState(alg);
  const out = [];
  for (const c of Z) { if (c.pos[1]!==1 || c.home.filter(v=>v).length!==3) continue; const y = C.facelets([c]).find(f=>f.color==='Y'); out.push(pn(c.pos)+':'+DN[y.dir.join()]); }
  console.log(n, out.join('  '));
}
for (const [n,a] of [['Ligne',"F R U R' U' F'"],['L',"f R U R' U' f'"]]) { const Z = caseState(a); const out=[]; for (const c of Z){ if(c.pos[1]!==1||c.home.filter(v=>v).length!==2)continue; const y=C.facelets([c]).find(f=>f.color==='Y'); if(y.dir[1]===1) out.push(pn(c.pos)); } console.log(n,'jaunes dessus:',out.join(',')); }
