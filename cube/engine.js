// ===== Moteur de cube (cubies + matrices entières) =====
const CUBE = (() => {
  const FACE_VEC = { U:[0,1,0], D:[0,-1,0], F:[0,0,1], B:[0,0,-1], R:[1,0,0], L:[-1,0,0] };
  const FACE_COLOR = { U:'Y', D:'W', F:'G', B:'B', R:'O', L:'R' };
  const ALL = [-1,0,1];
  const MOVES = {
    R:[0,[1],-1], L:[0,[-1],1], M:[0,[0],1],
    U:[1,[1],-1], D:[1,[-1],1], E:[1,[0],1],
    F:[2,[1],-1], B:[2,[-1],1], S:[2,[0],-1],
    r:[0,[0,1],-1], l:[0,[-1,0],1], u:[1,[0,1],-1], d:[1,[-1,0],1], f:[2,[0,1],-1], b:[2,[-1,0],1],
    x:[0,ALL,-1], y:[1,ALL,-1], z:[2,ALL,-1]
  };
  function rotQ(axis, q) {
    q = ((q % 4) + 4) % 4;
    let m = [1,0,0, 0,1,0, 0,0,1];
    const one = axis === 0 ? [1,0,0, 0,0,-1, 0,1,0]
              : axis === 1 ? [0,0,1, 0,1,0, -1,0,0]
              : [0,-1,0, 1,0,0, 0,0,1];
    for (let i = 0; i < q; i++) m = mul(one, m);
    return m;
  }
  function mul(a, b) {
    const r = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
      r[i*3+j] = a[i*3]*b[j] + a[i*3+1]*b[3+j] + a[i*3+2]*b[6+j];
    return r;
  }
  function mv(m, v) {
    return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
  }
  function solved() {
    const s = [];
    for (const x of ALL) for (const y of ALL) for (const z of ALL) {
      if (!x && !y && !z) continue;
      s.push({ home:[x,y,z], pos:[x,y,z], rot:[1,0,0,0,1,0,0,0,1] });
    }
    return s;
  }
  function clone(s) { return s.map(c => ({ home:c.home, pos:c.pos.slice(), rot:c.rot.slice() })); }
  // Parse "R U R' U2 Rw x'" -> [{base,q,label}]
  function parse(str) {
    const out = [];
    const re = /([RLUDFBMESxyzrludfb])(w?)(2'|2|'|’|)?/g;
    let m;
    const clean = str.replace(/[()\[\]]/g, ' ');
    while ((m = re.exec(clean))) {
      let base = m[1];
      if (m[2] === 'w') base = base.toLowerCase();
      const suf = (m[3] || '').replace('’', "'");
      const q = suf === "'" ? -1 : suf === '2' ? 2 : suf === "2'" ? -2 : 1;
      const label = (m[2] === 'w' ? m[1] + 'w' : base) + (suf === "'" ? "'" : suf === '2' ? '2' : suf === "2'" ? "2'" : '');
      out.push({ base, q, label });
    }
    return out;
  }
  function invert(moves) {
    return moves.slice().reverse().map(m => ({ base:m.base, q:-m.q, label: labelOf(m.base, -m.q) }));
  }
  function labelOf(base, q) {
    const b = /[rludfb]/.test(base) ? base : base;
    return b + (q === -1 ? "'" : q === 2 ? '2' : q === -2 ? "2'" : '');
  }
  function applyMove(s, m) {
    const [axis, layers, dir] = MOVES[m.base];
    const R = rotQ(axis, dir * m.q);
    for (const c of s) if (layers.includes(c.pos[axis])) { c.pos = mv(R, c.pos); c.rot = mul(R, c.rot); }
    return s;
  }
  function apply(s, moves) {
    if (typeof moves === 'string') moves = parse(moves);
    for (const m of moves) applyMove(s, m);
    return s;
  }
  // Facelets: [{pos, dir, color, home}]
  function facelets(s) {
    const out = [];
    for (const c of s) for (const f in FACE_VEC) {
      const v = FACE_VEC[f], ax = v[0] ? 0 : v[1] ? 1 : 2, sg = v[ax];
      if (c.home[ax] !== sg) continue;
      out.push({ pos:c.pos, dir:mv(c.rot, v), color:FACE_COLOR[f], home:c.home });
    }
    return out;
  }
  const key = (p, d) => p.join(',') + '|' + d.join(',');
  function faceletMap(s) {
    const m = {};
    for (const f of facelets(s)) m[key(f.pos, f.dir)] = f.color;
    return m;
  }
  function dirName(d) { for (const f in FACE_VEC) { const v = FACE_VEC[f]; if (v[0]===d[0]&&v[1]===d[1]&&v[2]===d[2]) return f; } }
  // 24 rotations
  const ROTS = (() => {
    const seqs = ['', 'y', 'y2', "y'"];
    const pre = ['', 'x', 'x2', "x'", 'z', "z'"];
    const list = [];
    for (const p of pre) for (const q of seqs) list.push((p + ' ' + q).trim());
    return list;
  })();
  function centerColor(s, face) {
    const v = FACE_VEC[face];
    for (const c of s) if (c.pos[0]===v[0]&&c.pos[1]===v[1]&&c.pos[2]===v[2]) {
      for (const f of facelets([c])) return f.color;
    }
  }
  function isNormal(s) { return centerColor(s,'U')==='Y' && centerColor(s,'F')==='G'; }
  function normalizer(s) {
    for (const r of ROTS) { const t = apply(clone(s), r); if (isNormal(t)) return r; }
    throw new Error('no normalizer');
  }
  function normalize(s) { return apply(s, normalizer(s)); }
  return { FACE_VEC, FACE_COLOR, MOVES, parse, invert, apply, applyMove, solved, clone, facelets, faceletMap, key, dirName, normalize, normalizer, centerColor, rotQ, mul, mv, labelOf };
})();
if (typeof module !== 'undefined') module.exports = CUBE;
