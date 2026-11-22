import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { createApp } from '../src/app.js';
import { loadConfig, normalizeTeamDomain } from '../src/config.js';

const TEAM = 'monequipe.cloudflareaccess.com';
const AUD = 'a'.repeat(64);
const PRIVATE_ENV = { ACCESS_MODE: 'private', CF_ACCESS_TEAM_DOMAIN: TEAM, CF_ACCESS_AUD: AUD };

let goodKey;
let otherKey;
let jwks;

before(async () => {
  goodKey = await generateKeyPair('RS256');
  otherKey = await generateKeyPair('RS256');
  const jwk = await exportJWK(goodKey.publicKey);
  jwks = createLocalJWKSet({ keys: [{ ...jwk, kid: 'cle-1', alg: 'RS256', use: 'sig' }] });
});

function sign({ key = goodKey.privateKey, aud = AUD, iss = `https://${TEAM}`, exp = '5m', email = 'Cathy@Example.com' } = {}) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'RS256', kid: 'cle-1' })
    .setIssuer(iss)
    .setAudience(aud)
    .setSubject('utilisateur-1')
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key);
}

// Démarre l'app sur un port libre et renvoie une fonction d'appel.
async function start(env, options = {}) {
  const app = createApp({ config: loadConfig(env), jwks, ...options });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (path, { token, ...init } = {}) => fetch(base + path, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(token ? { 'Cf-Access-Jwt-Assertion': token } : {}) },
  });
  return { call, close: () => new Promise((r) => server.close(r)) };
}

const fakeAi = (impl) => ({ beta: { messages: { create: impl } } });
const okAi = fakeAi(async (params) => ({
  model: params.model,
  stop_reason: 'end_turn',
  content: [{ type: 'text', text: `écho : ${params.messages.at(-1).content}` }],
}));

const postJson = (body, token) => ({
  method: 'POST',
  token,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

describe('app publique', () => {
  let srv;
  before(async () => { srv = await start({ ACCESS_MODE: 'public' }); });
  after(() => srv.close());

  test('la page d\'accueil est accessible sans jeton', async () => {
    const res = await srv.call('/');
    assert.equal(res.status, 200);
    assert.match(await res.text(), /<html/i);
  });

  test('/healthz répond ok', async () => {
    const res = await srv.call('/healthz');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok' });
  });

  test('/api/moi ne connaît personne', async () => {
    const res = await srv.call('/api/moi');
    assert.deepEqual(await res.json(), { mode: 'public', email: null, ia: false });
  });
});

describe('app privée', () => {
  let srv;
  before(async () => { srv = await start(PRIVATE_ENV); });
  after(() => srv.close());

  test('sans jeton → 403', async () => {
    const res = await srv.call('/');
    assert.equal(res.status, 403);
  });

  test('les fichiers et l\'API sont aussi protégés', async () => {
    assert.equal((await srv.call('/manifest.webmanifest')).status, 403);
    assert.equal((await srv.call('/api/moi')).status, 403);
    assert.equal((await srv.call('/api/ia', postJson({ message: 'bonjour' }))).status, 403);
  });

  test('jeton illisible → 403', async () => {
    assert.equal((await srv.call('/', { token: 'nimportequoi' })).status, 403);
  });

  test('mauvaise audience → 403', async () => {
    assert.equal((await srv.call('/', { token: await sign({ aud: 'b'.repeat(64) }) })).status, 403);
  });

  test('mauvais émetteur → 403', async () => {
    assert.equal((await srv.call('/', { token: await sign({ iss: 'https://autre.cloudflareaccess.com' }) })).status, 403);
  });

  test('jeton signé par une autre clé → 403', async () => {
    assert.equal((await srv.call('/', { token: await sign({ key: otherKey.privateKey }) })).status, 403);
  });

  test('jeton expiré → 403', async () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    assert.equal((await srv.call('/', { token: await sign({ exp: past }) })).status, 403);
  });

  test('jeton non signé (alg none) → 403', async () => {
    const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const unsigned = `${enc({ alg: 'none' })}.${enc({ iss: `https://${TEAM}`, aud: AUD, email: 'x@y.z', exp: 9999999999 })}.`;
    assert.equal((await srv.call('/', { token: unsigned })).status, 403);
  });

  test('jeton valide → 200', async () => {
    const res = await srv.call('/', { token: await sign() });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'private, no-store');
  });

  test('jeton valide → l\'e-mail de la personne connectée est lisible', async () => {
    const res = await srv.call('/api/moi', { token: await sign() });
    assert.deepEqual(await res.json(), { mode: 'private', email: 'cathy@example.com', ia: false });
  });

  test('/healthz reste joignable sans jeton (vérification de Railway)', async () => {
    assert.equal((await srv.call('/healthz')).status, 200);
  });
});

describe('configuration incomplète → tout est refusé', () => {
  const cas = {
    'ACCESS_MODE absent': {},
    'ACCESS_MODE inconnu': { ACCESS_MODE: 'prive' },
    'CF_ACCESS_AUD absent': { ACCESS_MODE: 'private', CF_ACCESS_TEAM_DOMAIN: TEAM },
    'CF_ACCESS_TEAM_DOMAIN absent': { ACCESS_MODE: 'private', CF_ACCESS_AUD: AUD },
    'domaine d\'équipe étranger': { ...PRIVATE_ENV, CF_ACCESS_TEAM_DOMAIN: 'pirate.example.com' },
  };
  for (const [nom, env] of Object.entries(cas)) {
    test(nom, async () => {
      const srv = await start(env);
      try {
        assert.equal((await srv.call('/')).status, 503);
        assert.equal((await srv.call('/', { token: await sign() })).status, 503);
        assert.equal((await srv.call('/healthz')).status, 503);
      } finally {
        await srv.close();
      }
    });
  }
});

describe('normalisation du domaine d\'équipe', () => {
  test('formes acceptées', () => {
    assert.equal(normalizeTeamDomain('monequipe'), TEAM);
    assert.equal(normalizeTeamDomain(' https://MonEquipe.cloudflareaccess.com/ '), TEAM);
  });
  test('formes refusées', () => {
    assert.equal(normalizeTeamDomain('monequipe.cloudflareaccess.com.pirate.fr'), null);
    assert.equal(normalizeTeamDomain(''), null);
    assert.equal(normalizeTeamDomain(undefined), null);
  });
});

describe('IA', () => {
  test('app privée avec clé : la réponse passe par le serveur', async () => {
    let received;
    const ai = fakeAi(async (params) => { received = params; return okAi.beta.messages.create(params); });
    const srv = await start({ ...PRIVATE_ENV, ANTHROPIC_API_KEY: 'cle-de-test' }, { aiClient: ai });
    try {
      const token = await sign();
      const moi = await (await srv.call('/api/moi', { token })).json();
      assert.equal(moi.ia, true);
      const res = await srv.call('/api/ia', postJson({ message: 'bonjour' }, token));
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.text, 'écho : bonjour');
      assert.equal(received.model, 'claude-opus-5-5');
      assert.equal(received.fallbacks, 'default');
      assert.deepEqual(received.output_config, { effort: 'medium' });
    } finally {
      await srv.close();
    }
  });

  test('sans clé : IA désactivée', async () => {
    const srv = await start(PRIVATE_ENV, { aiClient: okAi });
    try {
      const res = await srv.call('/api/ia', postJson({ message: 'bonjour' }, await sign()));
      assert.equal(res.status, 503);
    } finally {
      await srv.close();
    }
  });

  test('app publique : IA désactivée sauf autorisation explicite', async () => {
    const env = { ACCESS_MODE: 'public', ANTHROPIC_API_KEY: 'cle-de-test' };
    const ferme = await start(env, { aiClient: okAi });
    try {
      assert.equal((await ferme.call('/api/ia', postJson({ message: 'bonjour' }))).status, 503);
    } finally {
      await ferme.close();
    }
    const ouvert = await start({ ...env, AI_ALLOW_PUBLIC: 'true' }, { aiClient: okAi });
    try {
      assert.equal((await ouvert.call('/api/ia', postJson({ message: 'bonjour' }))).status, 200);
    } finally {
      await ouvert.close();
    }
  });

  test('message vide ou trop long → 400', async () => {
    const srv = await start({ ...PRIVATE_ENV, ANTHROPIC_API_KEY: 'cle-de-test' }, { aiClient: okAi });
    try {
      const token = await sign();
      assert.equal((await srv.call('/api/ia', postJson({ message: '  ' }, token))).status, 400);
      assert.equal((await srv.call('/api/ia', postJson({ message: 'x'.repeat(8001) }, token))).status, 400);
    } finally {
      await srv.close();
    }
  });

  test('plafond horaire atteint → 429', async () => {
    const srv = await start(
      { ...PRIVATE_ENV, ANTHROPIC_API_KEY: 'cle-de-test', AI_MAX_REQUESTS_PER_HOUR: '1' },
      { aiClient: okAi },
    );
    try {
      const token = await sign();
      assert.equal((await srv.call('/api/ia', postJson({ message: 'un' }, token))).status, 200);
      assert.equal((await srv.call('/api/ia', postJson({ message: 'deux' }, token))).status, 429);
    } finally {
      await srv.close();
    }
  });
});
