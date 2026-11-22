# Consignes pour les assistants IA (Codex, Cursor, Copilot…)

Les consignes de ce projet sont dans **`CLAUDE.md`**. Elles s'appliquent à tout assistant IA,
pas seulement à Claude : lis ce fichier en entier avant toute modification et respecte-le.
En cas de doute, `CLAUDE.md` fait foi.

Les règles les plus importantes :

- Explique simplement, en français, ce que tu fais et ce qu'il reste à vérifier.
- Ne contourne jamais la protection d'accès et n'ajoute aucun secret dans le dépôt.
- Cube·École : modifie uniquement les sources de `cube/`, jamais `public/index.html` (généré).
  Puis `npm run build:cube`, `npm run validate:cube` et `npm test` : tout doit réussir.
- `npm test` doit réussir avant tout commit. Ajoute des tests pour chaque nouvelle fonctionnalité.
- **Ne pousse jamais sur GitHub sans l'accord explicite de la personne qui te le demande** : chaque
  push sur `main` met l'app en ligne.
  Fais un commit local, montre ce qui a changé, puis attends « pousse ».
