// Tests propres à Cube·École : la page, l'installation sur l'écran d'accueil
// et le mode hors ligne sont bien servis.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createRequire } from 'node:module';

const BACKUP = createRequire(import.meta.url)('../cube/backup.js');

async function start(env) {
  const app = createApp({ config: loadConfig(env) });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { call: (path) => fetch(base + path), close: () => new Promise((r) => server.close(r)) };
}

describe('Cube·École en mode public', () => {
  let srv;
  before(async () => { srv = await start({ ACCESS_MODE: 'public' }); });
  after(() => srv.close());

  test('la page d\'accueil est l\'entraîneur', async () => {
    const res = await srv.call('/');
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Cube·École/);
    assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
    assert.match(html, /serviceWorker\.register\('sw\.js'\)/);
    assert.match(html, /id="saveExport"/);
    assert.match(html, /id="saveImport"/);
    assert.match(html, /const BACKUP = /);
  });

  test('le manifeste d\'installation est valide', async () => {
    const res = await srv.call('/manifest.webmanifest');
    assert.equal(res.status, 200);
    const manifest = JSON.parse(await res.text());
    assert.equal(manifest.short_name, 'Cube·École');
    assert.equal(manifest.display, 'standalone');
    assert.ok(manifest.icons.some((i) => i.sizes === '512x512'));
  });

  test('le service worker est servi comme script', async () => {
    const res = await srv.call('/sw.js');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
  });

  test('les icônes existent', async () => {
    for (const nom of ['icone-192.png', 'icone-512.png', 'apple-touch-icon.png']) {
      const res = await srv.call(`/${nom}`);
      assert.equal(res.status, 200, nom);
      assert.equal(res.headers.get('content-type'), 'image/png', nom);
    }
  });

  test('les sources de développement ne sont pas exposées', async () => {
    for (const chemin of ['/cube/data.js', '/cube/template.html', '/package.json', '/.env.example']) {
      assert.equal((await srv.call(chemin)).status, 404, chemin);
    }
  });
});

describe('Sauvegarde de la progression', () => {
  const DEF = { srs: {}, star: {}, goal: 'sub1', streak: 0 };
  const prog = { srs: { 'oll:21': { b: 3, due: 20400 } }, star: { 'pll:T': true }, goal: 'sub30', streak: 4 };

  test('un fichier sauvegardé se restaure à l\'identique', () => {
    const now = new Date('2026-11-22T10:00:00Z');
    const r = BACKUP.parse(JSON.stringify(BACKUP.make(prog, now)), DEF);
    assert.equal(r.ok, true);
    assert.deepEqual(r.data, prog);
    assert.equal(r.date.toISOString(), now.toISOString());
    assert.equal(BACKUP.fileName(now), 'cube-ecole-progression-2026-11-22.json');
  });

  test('les réglages absents de la sauvegarde reprennent leur valeur par défaut', () => {
    const r = BACKUP.parse(JSON.stringify(BACKUP.make({ srs: {} })), DEF);
    assert.equal(r.ok, true);
    assert.equal(r.data.goal, 'sub1');
  });

  test('un fichier qui n\'est pas une sauvegarde est refusé', () => {
    const mauvais = ['', 'pas du json', '[]', '{}', JSON.stringify({ app: 'autre', format: 1, data: prog }),
      JSON.stringify({ app: 'cube-ecole', format: 1, data: { star: {} } }),
      JSON.stringify({ app: 'cube-ecole', format: 1, data: { srs: { x: { b: 9, due: 1 } } } }),
      JSON.stringify({ app: 'cube-ecole', format: 1, data: { srs: {}, star: [] } }),
      'x'.repeat(2000001)];
    for (const texte of mauvais) assert.equal(BACKUP.parse(texte, DEF).ok, false, texte.slice(0, 60));
  });

  test('une sauvegarde d\'une version plus récente est refusée avec un message clair', () => {
    const r = BACKUP.parse(JSON.stringify({ app: 'cube-ecole', format: 2, data: prog }), DEF);
    assert.equal(r.ok, false);
    assert.match(r.error, /version plus récente/);
  });
});
