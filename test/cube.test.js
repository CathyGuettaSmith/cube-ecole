// Tests propres à Cube·École : la page, l'installation sur l'écran d'accueil
// et le mode hors ligne sont bien servis.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

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
