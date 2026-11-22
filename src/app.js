import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { loadConfig, aiAvailable } from './config.js';
import { createAccessGuard } from './access.js';
import { createAiClient, validateAiRequest, askClaude, describeAiError, createHourlyLimiter } from './ia.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');

// Options injectables pour les tests : `jwks` (clés de test) et
// `aiClient` (faux client IA, pour ne jamais appeler la vraie API).
export function createApp({ config = loadConfig(), jwks, aiClient } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'same-origin',
    });
    if (config.mode === 'private') res.set('Cache-Control', 'private, no-store');
    next();
  });

  // Vérification de santé : ne révèle rien d'autre que « ok » ou « mal configurée ».
  app.get('/healthz', (_req, res) => {
    if (config.problems.length > 0) return res.status(503).json({ status: 'misconfigured' });
    return res.json({ status: 'ok' });
  });

  // Configuration incomplète : on refuse tout.
  if (config.problems.length > 0) {
    for (const problem of config.problems) console.error(`[config] ${problem}`);
    app.use((_req, res) => {
      res.status(503).type('text/plain; charset=utf-8')
        .send('Application mal configurée : accès refusé.');
    });
    return app;
  }

  app.use(createAccessGuard(config, { jwks }));
  app.use(express.json({ limit: '100kb' }));

  const iaOn = aiAvailable(config);
  const ai = iaOn ? (aiClient ?? createAiClient(config)) : null;
  const allowAiCall = createHourlyLimiter(config.ai.maxRequestsPerHour);

  app.get('/api/moi', (req, res) => {
    res.json({ mode: config.mode, email: req.accessUser?.email ?? null, ia: iaOn });
  });

  app.post('/api/ia', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'IA non activée pour cette app.' });
    const invalid = validateAiRequest(req.body);
    if (invalid) return res.status(400).json({ error: invalid });
    if (!allowAiCall()) return res.status(429).json({ error: 'Plafond horaire de requêtes IA atteint.' });
    try {
      const result = await askClaude(ai, config, req.body);
      if (result.refused) return res.json({ text: null, refused: true });
      return res.json(result);
    } catch (err) {
      const { status, error } = describeAiError(err);
      console.error(`[ia] ${err?.status ?? ''} ${err?.message ?? err}`);
      return res.status(status).json({ error });
    }
  });

  app.use(express.static(publicDir));

  app.use((_req, res) => res.status(404).type('text/plain; charset=utf-8').send('Page introuvable.'));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Requête illisible.' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Requête trop volumineuse.' });
    console.error('[erreur]', err);
    return res.status(500).type('text/plain; charset=utf-8').send('Erreur interne.');
  });

  return app;
}
