# Reprise du projet Cube·École

Document de passation pour héberger Cube·École comme app web perso (Railway + Cloudflare), à partir du modèle d'app préparé dans une autre session. Le détail technique complet est dans `SPECS.md`, dans le même dossier.

---

## 1. Objectif et public

**Cube·École** est un entraîneur de Rubik's Cube 3×3, en français, pensé d'abord pour l'iPhone et utilisable hors ligne. Il sert à :
- **retrouver vite quoi faire** selon ce qu'on voit sur le cube (« si tu vois ça → fais ça ») ;
- **mémoriser** les algorithmes de façon visuelle : bulles colorées, gestes nommés, flèches, doigtés ;
- **s'entraîner**, sur l'appli (cube 3D manipulable) ou sur un vrai cube ;
- **progresser** de la méthode débutant jusqu'au CFOP complet.

**Public** : usage personnel, pour la propriétaire du projet et une amie qui savent déjà résoudre le cube (méthode proche du CFOP) et veulent aller plus vite. **Pas d'élèves, de classe ni d'enseignants** : il n'y a donc aucune donnée d'élève. Le contenu convient à tout débutant, ce qui permet une ouverture plus large plus tard.

---

## 2. Ce qui fonctionne déjà

L'appli complète tient dans **un seul fichier HTML** (`index.html`, environ 210 Ko), sans bibliothèque ni serveur. Elle a été testée de bout en bout (Playwright) et sur iPhone.

- **4 vues** : Apprendre (parcours), Mémo (aide-mémoire), Réviser (répétition espacée), Bibliothèque.
- **166 cas d'algorithmes**, tous vérifiés par simulation : notation (25), gestes clés (8), méthode débutant (11), OLL et PLL en 2 étapes, F2L (41), OLL (57), PLL (21).
- **Parcours** en 6 chapitres et petites leçons (regarder → essayer → quiz). On choisit un objectif (débutant, sous la minute, speedcuber). On peut cocher « Je maîtrise déjà », et les leçons maîtrisées sont masquées.
- **Mémo** : la méthode CFOP en 6 étapes, avec des cartes « Si tu vois / Alors fais » et l'encadré « Ta prise de base » (doigtés).
- **Cube 3D** (CSS 3D) :
  - animation coup par coup, contrôles posés sur le cube, flèche 3D du sens de rotation ;
  - suivi d'une pièce, schéma « ce que fait ce mouvement » ;
  - doigtés animés : quelle main, quel doigt, quel sens.
- **« À toi de jouer »** :
  - on fait l'algo soi-même, avec des bulles ou en glissant le doigt sur le cube ;
  - Retour d'un mouvement, Recommencer, Indice, mode 2 couches ;
  - la réponse est vérifiée par l'état du cube, donc un mouvement équivalent est accepté.
- **Révisions espacées** (intervalles de 1, 2, 4, 8, 16 et 32 jours), avec une note suggérée selon les aides utilisées.
- **Atelier libre** : cube libre, tous les mouvements, mélange, suivi de pièce.

## 3. Ce qui reste à faire

**Pour l'hébergement (nouveau) :**
1. Servir `index.html` comme site statique sur Railway, avec un domaine via Cloudflare. Aucun backend n'est nécessaire pour la version actuelle.
2. En faire une **PWA** (manifest + service worker + icône) pour l'installer sur l'écran d'accueil de l'iPhone et l'utiliser hors ligne. C'est ce qui remplacera l'astuce actuelle du fichier ouvert dans l'app *Documents*.
3. Mettre en cache les polices Google dans le service worker, ou les embarquer dans le projet.
4. *(Optionnel)* **Synchronisation de la progression** entre appareils : il faudrait alors un backend et des comptes (voir § 5).

**Pour le contenu (backlog déjà décidé) :**
- Mémo : encadré « La dernière face en 4 étapes », et la consigne « tourne le haut (U) jusqu'à retrouver le dessin, puis fais l'algo » sur chaque carte.
- Mémo, croix jaune : le chemin point → L → ligne → croix avec un seul algo (F R U R′ U′ F′), avec la mise en garde « une ligne verticale redevient un point ».
- Mémo, face jaune : les méthodes « un seul algo » (sexy move répété, jaune en bas ; Sune répété).
- Faire valider les doigtés les moins standard (B, M, E, S).
- Plus tard : COLL, ZBLL, Roux (CMLL).

---

## 4. Décisions prises et leurs raisons

| Décision | Raison |
|---|---|
| Un seul fichier HTML autonome, sans bibliothèque | Marche hors ligne, se copie partout, rien à maintenir |
| Orientation fixe : jaune en haut, vert devant | Celle des tutoriels CFOP ; toutes les vignettes sont calculées dans ce repère |
| Tous les algos et toutes les descriptions vérifiés par simulation | Deux erreurs de mémoire ont été trouvées et corrigées (OLL 23 et 24, le L de la croix jaune) |
| Bulles **bleues** (normal) / **rouges** (prime), double contour pour un demi-tour | Profil d'utilisatrice très visuel, demande explicite |
| Algos découpés en gestes nommés (« Sexy move puis Sledgehammer ») | Plus facile à retenir qu'une suite de lettres |
| Contrôles posés sur le cube, cube collé en haut pendant la pratique | Sur iPhone, l'écran manquait de place pour manipuler |
| Flèche de sens toujours affichée quand on **regarde** ; en **pratique**, seulement avec « Indice » | La pratique doit tester la mémoire |
| « Retour d'un mouvement » plutôt que tout recommencer, mais les retours sont comptés | Corriger sans tout perdre, tout en mesurant les progrès honnêtement |
| Vérification par l'état du cube, pas par le nom du mouvement | Un glissement ne tourne qu'une couche : il faut accepter r = R + M′ et les équivalences |
| Une seule méthode de doigtés (la standard des speedcubers) | Demande explicite : une seule chose à suivre, la plus simple et la plus rapide |
| Pas de verrou sur les leçons, « Je maîtrise déjà », masquage de ce qui est maîtrisé | Les utilisatrices savent déjà résoudre le cube ; l'interface doit s'alléger avec les progrès |
| Progression dans le navigateur (`localStorage`) | Pas de compte ni de serveur, respect de la vie privée, fonctionne hors ligne |

---

## 5. Données conservées

- **Ce qui est conservé** : la progression de révision (niveau et prochaine date par algorithme), les favoris (« Ma sélection »), les leçons faites ou maîtrisées, les statistiques d'entraînement (réussites, retours, recommencements), la série de jours et les réglages (vitesse, objectif, affichage du sens ou du doigt, flèche guide).
- **Où** : uniquement dans le navigateur de chaque appareil (`localStorage`, clé `rubik-trainer-v2`). Le schéma complet est dans `SPECS.md` § 8.
- **Aucun compte, aucun serveur, aucune donnée personnelle** : ni nom, ni e-mail, ni identifiant.
- **Conséquence** : la progression n'est pas partagée entre appareils, ni entre la version en ligne et une copie locale. Elle se perd si on vide les données du navigateur.
- **Si on ajoute la synchronisation** : il faudra des comptes (login par lien e-mail par exemple) et une base qui stocke le même objet JSON par utilisateur. Seuls l'e-mail de connexion et la progression seraient stockés.

## 6. Public ou réservé

- **Le contenu peut être public** : algorithmes standard, aucune donnée sensible. Une URL publique ne pose pas de problème.
- **À garder privé** :
  - les éventuels comptes et leur progression, si la synchronisation est ajoutée (chaque personne ne voit que la sienne) ;
  - le tableau de bord et les variables Railway / Cloudflare.
- **À trancher** : publique pour tous, ou réservée à quelques personnes (accès protégé, par exemple Cloudflare Access).

## 7. Besoins d'IA

**Aucun aujourd'hui** : tout est calculé dans le navigateur (simulation du cube, vérification des réponses, répétition espacée).

Idées possibles pour plus tard, non décidées :
- **reconnaissance d'un cube en photo** pour dire quel cas c'est et quoi faire (vision) ;
- **coach conversationnel** qui explique un cas ou répond à « pourquoi ça ne marche pas » ;
- **résolution d'un mélange quelconque**, sans IA : un solveur algorithmique (Kociemba) suffit.

Si une IA est ajoutée, la clé d'API doit rester côté serveur (variable d'environnement Railway), jamais dans le HTML.

---

## 8. Fichiers et contenu

| Fichier | Contenu |
|---|---|
| `REPRISE-cube-ecole.md` | Ce document de reprise |
| `SPECS.md` | Specs détaillées : architecture, conventions du cube, règles de validation, chaque vue et composant, état stocké, limites, backlog |
| `index.html` | **L'appli construite**, à déployer. Généré, ne pas modifier à la main |
| `Cube-Ecole.html` | Copie de `index.html` pour l'usage hors ligne sur iPhone (app *Documents*) |
| `template.html` | Source principale de l'appli (HTML + CSS + JS), avec les marqueurs `/*ENGINE*/`, `/*DATA*/`, `/*F2L*/` |
| `engine.js` | Moteur du cube : cubies, rotations, parseur de notation, normalisation |
| `data.js` | Données d'algorithmes : notation, gestes, débutant, 2 étapes, OLL, PLL, pool F2L |
| `f2l.json` | Les 41 cas F2L retenus (généré par `pick.js`) |
| `build.js` | Assemble les sources : `node build.js` → `index.html` |
| `validate.js` | Vérifie OLL (57 distincts) et PLL (21 distincts) par simulation |
| `f2l.js`, `pick.js`, `search.js` | Couverture des 41 cas F2L, choix du meilleur algo, recherche optimale des cas manquants |
| `cross2.js`, `ocll.js`, `lcheck.js`, `pllx.js` | Scripts de vérification ponctuels : cas de la croix blanche, reconnaissance OCLL, L de la croix jaune, mouvements PLL |
| `flow.py` … `flow13.py`, `gest.py`, `gest2.py` | Tests d'interface (Playwright + Chrome) : leçon, quiz, révisions, bibliothèque, pratique, gestes, flèches, doigtés, « Je maîtrise » |

Commandes : `node build.js`, puis `node validate.js`, puis les tests. Dans les tests, adapte deux chemins : celui d'`index.html` (`file:///home/claude/rubik/index.html`) et celui de Chrome (`/usr/bin/google-chrome`).

Pour l'hébergement, le minimum à servir est **`index.html` seul**. Les autres fichiers servent au développement.

---

## 9. Intégration au modèle d'app (`apps-perso/modele-app`)

Ce que j'ai vérifié dans le modèle : c'est un serveur Express qui sert les fichiers du dossier `public/` après le contrôle d'accès Cloudflare. Il n'impose pas de politique de sécurité de contenu (CSP), donc les scripts et styles intégrés de Cube·École fonctionnent tels quels.

**Plan de reprise proposé :**
1. Créer le dépôt `cube-ecole` à partir du modèle (« Use this template », étape 5 du `GUIDE.md`).
2. Mettre les sources de ce dossier dans un sous-dossier `cube/` du dépôt : `template.html`, `engine.js`, `data.js`, `f2l.json`, `build.js`, les scripts de validation et les tests.
3. Modifier `build.js` pour qu'il écrive directement dans `public/index.html`, à la place de la page d'exemple du modèle. Supprimer `public/app.js` et `public/style.css` s'ils ne servent plus.
4. Ajouter un script `npm run build:cube` (`node cube/build.js`) et un test dans `test/app.test.js` : en mode public, `GET /` renvoie 200 et contient « Cube·École ». Garder les 26 tests du modèle verts.
5. Faire tourner `node cube/validate.js` dans la CI : un algorithme cassé doit bloquer le déploiement.
6. Variables Railway : `ACCESS_MODE` seulement (aucune clé d'IA, l'app n'en utilise pas).
7. Ajouter la PWA (étape 2 du § 3) : `manifest.webmanifest`, `sw.js` et une icône dans `public/`.

**Public ou privé ?**
- **Public** (`ACCESS_MODE=public`) : le plus simple, le mieux adapté à l'usage hors ligne, et aucun risque puisqu'aucune donnée n'est stockée côté serveur.
- **Privé** : il faut se connecter par code e-mail sur chaque appareil, et la session expire.

C'est à toi de choisir.

**Point d'attention, PWA + mode privé :** le modèle envoie `Cache-Control: private, no-store` en mode privé. Le service worker peut quand même mettre la page en cache (le Cache API ne tient pas compte de cet en-tête). En revanche, quand la session Cloudflare a expiré, une requête réseau renvoie la page de connexion. Le service worker doit donc fonctionner en « réseau d'abord, cache en secours », et ne mettre en cache que les réponses 200 de la page elle-même.

---

## 10. Liens utiles

- **Artefact claude.ai (version en ligne actuelle)** : « Entraîneur Rubik's Cube » — https://claude.ai/artifact/VkFE9Qau8qseUJyrZbnEjh (privé, visible seulement par sa propriétaire connectée).
- **Maquettes** : pas de maquette séparée. Le design est dans `template.html`, et les captures de référence ont été faites pendant les tests.
- **Modèle d'app pour l'hébergement** : `apps-perso/modele-app/`, avec son guide `apps-perso/GUIDE.md` et sa reprise `apps-perso/REPRISE-apps-perso.md`.

Aucune clé, aucun mot de passe ni aucune donnée personnelle ne figure dans ces fichiers.

---

## 11. Avancement de l'hébergement (21/11/2026)

- ✅ Dépôt préparé dans ce dossier à partir de `modele-app` : sources dans `cube/`, page générée dans `public/index.html` (construction reproductible vérifiée).
- ✅ PWA : manifeste, icônes, service worker « réseau d'abord, cache en secours » (ne met jamais en cache une redirection ni une erreur). Vérifié dans Chrome sans interface : page servie hors ligne, aucune erreur JavaScript.
- ✅ La CI vérifie les algorithmes (`npm run validate:cube`, qui échoue désormais réellement en cas d'erreur), la cohérence page ↔ sources, puis 31 tests et le scan Trivy.
- ⏳ Polices Google : mises en cache par le service worker après la première visite en ligne (pas embarquées).
- ✅ App **publique** (choix de Cathy le 21/11/2026) : `ACCESS_MODE=public`, sans Cloudflare Access. Domaine facultatif (adresse Railway au départ).
- ⏳ Reste : compte GitHub perso et compte Railway (créés par Cathy), push après son accord, puis Railway (`../GUIDE.md`, étapes 4 à 6 et 8).
- Non vérifié localement : construction de l'image Docker et scan Trivy (Docker arrêté sur le Mac) ; la CI GitHub le fera au premier push.
