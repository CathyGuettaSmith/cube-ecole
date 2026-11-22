# Consignes pour Claude — app perso

Cette app est créée à partir du modèle d'app perso. Projet personnel : n'utiliser aucun dépôt,
accès, serveur ou secret professionnel.

La personne qui demande l'app n'est pas développeuse : explique simplement, en français,
ce que tu as fait, et dis-lui ce qu'elle doit faire ensuite (où cliquer, quoi vérifier).

## À ne jamais casser

- `src/access.js` et `src/config.js` assurent la protection : ne pas les contourner,
  ne pas ajouter de route avant le contrôle d'accès dans `src/app.js` (seul `/healthz` y est).
- Garder le refus par défaut : configuration incomplète = tout refusé.
- Les tests existants de `test/app.test.js` doivent continuer à passer. Ajouter des tests
  pour chaque nouvelle fonctionnalité.
- Aucun secret dans le dépôt. Toute nouvelle clé = nouvelle variable d'environnement,
  documentée dans `.env.example` (sans valeur) et dans `README.md`.

## Spécifique à Cube·École

- Lire `REPRISE-cube-ecole.md` puis `cube/SPECS.md` avant toute modification.
- Modifier uniquement les sources de `cube/` (`template.html`, `engine.js`, `data.js`, `f2l.json`),
  puis `npm run build:cube`. Ne jamais modifier `public/index.html` à la main.
- Tout algorithme ajouté ou modifié doit être vérifié par simulation : `npm run validate:cube`.
- Le service worker (`public/sw.js`) charge d'abord le réseau : une nouvelle version arrive
  seule dès que le téléphone est en ligne. Incrémenter `CACHE` (`cube-ecole-v2`…) seulement
  si la liste des fichiers mis en cache change.
- Les scripts de `cube/` sont en CommonJS (`cube/package.json`) ; le serveur est en modules ES.

## Construire l'app

- Interface : fichiers statiques dans `public/`, en français, lisible sur téléphone.
- Routes serveur : dans `src/app.js`, après le contrôle d'accès.
- Personne connectée (app privée) : `req.accessUser.email`.
- IA : appeler `askClaude` de `src/ia.js` côté serveur. Ne jamais exposer la clé au navigateur.
- Données à conserver : proposer une base Postgres Railway (variable `DATABASE_URL`)
  plutôt que des fichiers, car le disque du conteneur est effacé à chaque déploiement.

## Avant de pousser

- `npm test` doit réussir.
- Ne pousser sur GitHub qu'avec l'accord explicite de la propriétaire : chaque push sur `main`
  met l'app en ligne.
