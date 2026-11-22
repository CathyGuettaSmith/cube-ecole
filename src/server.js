import { loadConfig, aiAvailable } from './config.js';
import { createApp } from './app.js';

const config = loadConfig();
const app = createApp({ config });
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const server = app.listen(port, '0.0.0.0', () => {
  const etat = config.problems.length > 0 ? 'MAL CONFIGURÉE (tout est refusé)' : `mode ${config.mode}`;
  console.log(`App démarrée sur le port ${port} — ${etat} — IA ${aiAvailable(config) ? 'activée' : 'désactivée'}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
