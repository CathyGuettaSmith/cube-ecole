// Lecture et contrôle de la configuration (variables d'environnement).
// Principe : toute configuration incomplète ou douteuse est signalée dans
// `problems`, et l'app refuse alors toutes les requêtes (fail closed).

const TEAM_DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/;
const AUD_RE = /^[A-Za-z0-9]{32,128}$/;
const EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);

// Accepte « monequipe », « monequipe.cloudflareaccess.com »
// ou « https://monequipe.cloudflareaccess.com/ ».
export function normalizeTeamDomain(raw) {
  if (typeof raw !== 'string') return null;
  let value = raw.trim().toLowerCase().replace(/^https:\/\//, '').replace(/\/+$/, '');
  if (value && !value.includes('.')) value = `${value}.cloudflareaccess.com`;
  return TEAM_DOMAIN_RE.test(value) ? value : null;
}

function positiveInt(raw, fallback) {
  const n = Number.parseInt(raw ?? '', 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function loadConfig(env = process.env) {
  const problems = [];

  const mode = (env.ACCESS_MODE ?? '').trim().toLowerCase();
  if (mode !== 'public' && mode !== 'private') {
    problems.push('ACCESS_MODE doit valoir « public » ou « private ».');
  }

  let teamDomain = null;
  let aud = null;
  if (mode === 'private') {
    teamDomain = normalizeTeamDomain(env.CF_ACCESS_TEAM_DOMAIN);
    if (!teamDomain) {
      problems.push('CF_ACCESS_TEAM_DOMAIN manquant ou invalide (attendu : monequipe.cloudflareaccess.com).');
    }
    aud = (env.CF_ACCESS_AUD ?? '').trim();
    if (!AUD_RE.test(aud)) {
      problems.push('CF_ACCESS_AUD manquant ou invalide (copier l\'« Application Audience (AUD) Tag » de Cloudflare).');
      aud = null;
    }
  }

  const apiKey = (env.ANTHROPIC_API_KEY ?? '').trim();
  const effort = (env.AI_EFFORT ?? '').trim().toLowerCase();
  const ai = {
    enabled: apiKey.length > 0,
    apiKey: apiKey || null,
    model: (env.AI_MODEL ?? '').trim() || 'claude-opus-5-5',
    effort: EFFORTS.has(effort) ? effort : 'medium',
    maxTokens: positiveInt(env.AI_MAX_TOKENS, 16000),
    maxRequestsPerHour: positiveInt(env.AI_MAX_REQUESTS_PER_HOUR, 100),
    allowPublic: (env.AI_ALLOW_PUBLIC ?? '').trim().toLowerCase() === 'true',
    systemPrompt: (env.AI_SYSTEM_PROMPT ?? '').trim()
      || 'Tu es un assistant utile. Réponds en français, de façon claire et concise.',
  };

  return { mode, teamDomain, aud, ai, problems };
}

// L'IA n'est proposée que si une clé existe, et, pour une app publique,
// seulement si on l'a explicitement autorisé (sinon n'importe qui
// pourrait consommer le crédit IA).
export function aiAvailable(config) {
  return config.ai.enabled && (config.mode === 'private' || config.ai.allowPublic);
}
