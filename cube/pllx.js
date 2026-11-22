const C = require('./engine.js');
function caseState(alg){ const inv = C.invert(C.parse(alg)); const t = C.apply(C.solved(), inv); return C.apply(C.apply(C.solved(), C.normalizer(t)), inv); }
function pn(p){ const a=[]; if(p[2]===1)a.push('devant'); if(p[2]===-1)a.push('derrière'); if(p[0]===1)a.push('droite'); if(p[0]===-1)a.push('gauche'); return a.join('-'); }
for (const [n, alg] of [['Ua',"R U' R U R U R U' R' U' R2"],['Ub',"R2 U R U R' U' R' U' R' U R'"],['T',"R U R' U' R' F R2 U' R' U' R U R' F'"],['Y',"F R U' R' U' R U R' F' R U R' U' R' F R F'"]]) {
  for (const b of ['', 'U', 'U2', "U'"]) {
    const full = (alg + ' ' + b).trim(); const Z = caseState(full); const s = C.clone(Z); C.apply(s, full); C.apply(s, C.normalizer(s));
    const mv = []; Z.forEach((c, i) => { if (c.pos[1] !== 1 || c.home.filter(v=>v).length < 2) return; if (c.pos.join() !== s[i].pos.join()) mv.push(pn(c.pos) + '→' + pn(s[i].pos)); });
    console.log(n, JSON.stringify(b), mv.length, mv.join(', '));
  }
}
