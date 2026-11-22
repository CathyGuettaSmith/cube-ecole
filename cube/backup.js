// ===== Sauvegarde de la progression dans un fichier =====
// La progression vit dans le navigateur (localStorage). Ce module fabrique un fichier
// de sauvegarde et relit un tel fichier, en refusant tout ce qui n'en est pas un.
const BACKUP = (() => {
  const APP = 'cube-ecole';
  const FORMAT = 1;
  const OBJETS = ['srs', 'star', 'v', 'done', 'open', 'prac', 'showKnown'];
  const MAX = 2000000; // un vrai fichier fait quelques dizaines de Ko

  const estObjet = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

  function make(state, now) {
    return { app: APP, format: FORMAT, date: (now || new Date()).toISOString(), data: state };
  }

  function fileName(now) {
    const d = now || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `cube-ecole-progression-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
  }

  // Renvoie { ok:true, data, date } ou { ok:false, error } (message pour la personne).
  function parse(text, defaults) {
    const refus = { ok: false, error: "Ce fichier n'est pas une sauvegarde de Cube·École." };
    if (typeof text !== 'string' || text.length > MAX) return refus;
    let b;
    try { b = JSON.parse(text); } catch (e) { return refus; }
    if (!estObjet(b) || b.app !== APP || !estObjet(b.data)) return refus;
    if (typeof b.format !== 'number' || b.format > FORMAT) {
      return { ok: false, error: 'Cette sauvegarde vient d’une version plus récente de Cube·École. Mets l’appli à jour puis réessaie.' };
    }
    const d = b.data;
    if (!estObjet(d.srs)) return refus;
    for (const k of OBJETS) if (k in d && !estObjet(d[k])) return refus;
    for (const id in d.srs) {
      const e = d.srs[id];
      if (!estObjet(e) || !Number.isInteger(e.b) || e.b < 1 || e.b > 6 || !Number.isInteger(e.due)) return refus;
    }
    const data = Object.assign(JSON.parse(JSON.stringify(defaults || {})), d);
    const date = typeof b.date === 'string' && !Number.isNaN(Date.parse(b.date)) ? new Date(b.date) : null;
    return { ok: true, data, date };
  }

  return { make, fileName, parse };
})();
if (typeof module !== 'undefined') module.exports = BACKUP;
