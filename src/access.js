// Vérification du jeton Cloudflare Access.
// Cloudflare ajoute l'en-tête `Cf-Access-Jwt-Assertion` à chaque requête
// qu'il a autorisée. On vérifie sa signature (clés publiques de l'équipe),
// son émetteur, son audience (AUD tag) et sa date d'expiration.
// Sans jeton valide : 403. Refus par défaut, y compris si les clés
// publiques sont injoignables.

import { createRemoteJWKSet, jwtVerify } from 'jose';

export const ACCESS_HEADER = 'cf-access-jwt-assertion';

function deny(req, res, reason) {
  console.warn(`[accès] refusé ${req.method} ${req.path} : ${reason}`);
  res.status(403).type('text/plain; charset=utf-8').send('Accès refusé.');
}

export function createAccessGuard(config, { jwks } = {}) {
  if (config.mode === 'public') {
    return (req, _res, next) => {
      req.accessUser = null;
      next();
    };
  }

  if (config.mode !== 'private' || config.problems.length > 0 || !config.teamDomain || !config.aud) {
    // Ne devrait jamais arriver (l'app bloque avant), mais on refuse par sécurité.
    return (req, res) => deny(req, res, 'configuration incomplète');
  }

  const issuer = `https://${config.teamDomain}`;
  const keySet = jwks ?? createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));

  return async (req, res, next) => {
    const token = req.get(ACCESS_HEADER);
    if (!token) return deny(req, res, 'jeton absent');
    try {
      const { payload } = await jwtVerify(token, keySet, {
        issuer,
        audience: config.aud,
        algorithms: ['RS256'],
        clockTolerance: 30,
      });
      req.accessUser = {
        email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
        id: typeof payload.sub === 'string' ? payload.sub : null,
      };
      return next();
    } catch (err) {
      return deny(req, res, err?.code ?? 'jeton invalide');
    }
  };
}
