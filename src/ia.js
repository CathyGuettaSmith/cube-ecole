// Connexion à l'IA Claude (Anthropic). La clé reste côté serveur :
// le navigateur n'y a jamais accès.

import Anthropic from '@anthropic-ai/sdk';

// Modèles qui acceptent le repli automatique côté serveur quand le modèle
// principal décline une demande.
const FALLBACK_MODELS = new Set([
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-sonnet-5-5',
  'claude-fable-5-2',
  'claude-fable-5-1',
]);

const MAX_MESSAGE_CHARS = 8000;
const MAX_HISTORY = 20;

export function createAiClient(config) {
  return new Anthropic({ apiKey: config.ai.apiKey });
}

// Contrôle le contenu envoyé par le navigateur. Renvoie un message
// d'erreur lisible, ou null si tout va bien.
export function validateAiRequest(body) {
  const message = body?.message;
  if (typeof message !== 'string' || message.trim() === '') return 'Message vide.';
  if (message.length > MAX_MESSAGE_CHARS) return `Message trop long (${MAX_MESSAGE_CHARS} caractères maximum).`;
  const history = body.history ?? [];
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return 'Historique invalide.';
  for (const turn of history) {
    if (!turn || !['user', 'assistant'].includes(turn.role)) return 'Historique invalide.';
    if (typeof turn.content !== 'string' || turn.content.length > MAX_MESSAGE_CHARS) return 'Historique invalide.';
  }
  return null;
}

export async function askClaude(client, config, { message, history = [] }) {
  const params = {
    model: config.ai.model,
    max_tokens: config.ai.maxTokens,
    output_config: { effort: config.ai.effort },
    system: config.ai.systemPrompt,
    messages: [
      ...history.map(({ role, content }) => ({ role, content })),
      { role: 'user', content: message },
    ],
  };
  if (FALLBACK_MODELS.has(config.ai.model)) {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }

  const response = await client.beta.messages.create(params);

  if (response.stop_reason === 'refusal') {
    return { text: null, refused: true, model: response.model };
  }
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
  return {
    text,
    refused: false,
    truncated: response.stop_reason === 'max_tokens',
    model: response.model,
  };
}

// Traduit une erreur de l'API en réponse HTTP pour le navigateur.
export function describeAiError(err) {
  if (err instanceof Anthropic.AuthenticationError) return { status: 502, error: 'La clé IA est refusée : vérifier ANTHROPIC_API_KEY.' };
  if (err instanceof Anthropic.PermissionDeniedError) return { status: 502, error: 'La clé IA n\'a pas accès à ce modèle.' };
  if (err instanceof Anthropic.NotFoundError) return { status: 502, error: 'Modèle IA inconnu : vérifier AI_MODEL.' };
  if (err instanceof Anthropic.RateLimitError) return { status: 429, error: 'L\'IA est saturée, réessayer dans un instant.' };
  if (err instanceof Anthropic.BadRequestError) return { status: 502, error: 'Demande refusée par l\'IA.' };
  if (err instanceof Anthropic.APIError) return { status: 502, error: 'L\'IA est indisponible pour le moment.' };
  return { status: 500, error: 'Erreur inattendue.' };
}

// Plafond global de requêtes IA par heure, pour protéger le budget.
export function createHourlyLimiter(maxPerHour, now = () => Date.now()) {
  let windowStart = now();
  let count = 0;
  return () => {
    const t = now();
    if (t - windowStart >= 3_600_000) {
      windowStart = t;
      count = 0;
    }
    if (count >= maxPerHour) return false;
    count += 1;
    return true;
  };
}
