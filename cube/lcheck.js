const C = require('./engine.js');
function pn(p){ const a=[]; if(p[2]===1)a.push('devant'); if(p[2]===-1)a.push('derrière'); if(p[0]===1)a.push('droite'); if(p[0]===-1)a.push('gauche'); return a.join('-'); }
for (const a of ["F U R U' R' F'", "f R U R' U' f'", "F R U R' U' F'"]) {
  const Z = C.apply(C.solved(), C.invert(C.parse(a)));
  const o=[]; for (const c of Z){ if(c.pos[1]!==1||c.home.filter(v=>v).length!==2)continue; const y=C.facelets([c]).find(f=>f.color==='Y'); if(y.dir[1]===1) o.push(pn(c.pos)); }
  console.log(a, '=> arêtes jaunes dessus:', o.join(','));
}
