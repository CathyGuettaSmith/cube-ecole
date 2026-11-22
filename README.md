# Cube·École

Entraîneur de Rubik's Cube 3×3 en français, installable sur l'écran d'accueil de l'iPhone
et utilisable hors ligne. Hébergé à partir du modèle d'app perso (voir `../GUIDE.md`).
Reprise du projet : `REPRISE-cube-ecole.md` ; specs détaillées : `cube/SPECS.md`.

## Organisation

| Dossier | Contenu |
|---|---|
| `public/` | Ce qui est servi : `index.html` (**généré**, ne pas modifier à la main), service worker `sw.js`, manifeste et icônes |
| `cube/` | Sources de l'appli (`template.html`, `engine.js`, `data.js`, `f2l.json`), construction et vérification des algorithmes |
| `cube/tests-interface/` | Anciens tests d'interface Playwright (chemins à adapter avant usage) |
| `src/`, `test/` | Serveur du modèle (protection Cloudflare Access) et ses tests |

## Commandes

- `npm run build:cube` : reconstruit `public/index.html` (et la copie hors ligne `cube/Cube-Ecole.html`) depuis les sources.
- `npm run validate:cube` : vérifie les 57 OLL et 21 PLL par simulation ; échoue si un algorithme est cassé.
- `npm test` : 31 tests (protection d'accès + page, manifeste, service worker, icônes).
- `npm run icones` : régénère les icônes (Python + Pillow).
- `ACCESS_MODE=public npm start`, puis http://localhost:3000.

À chaque push, GitHub vérifie les algorithmes, contrôle que `public/index.html` correspond
aux sources, lance les tests puis le scan de sécurité. Railway attend leur réussite.

## Réglages Railway

App **publique** (décidé le 21/11/2026) : aucune donnée sur le serveur, contenu non sensible,
et pas de reconnexion par e-mail sur chaque téléphone.

| Variable | Valeur |
|---|---|
| `ACCESS_MODE` | `public` |

Rien d'autre : pas de Cloudflare Access, pas de clé d'IA. Adresse : celle générée par Railway
(**Generate Domain**), ou plus tard un domaine perso (voir `../GUIDE.md`, étape 8).

## Données

La progression reste dans le navigateur de chaque appareil (`localStorage`, clé
`rubik-trainer-v2`). Le serveur ne stocke rien. Attention : la progression de l'artefact
claude.ai ou d'une copie locale n'est pas reprise sur la version en ligne.
