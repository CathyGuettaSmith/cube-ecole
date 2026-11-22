# Cube·École : specs et décisions

Ce document reprend tout ce qui a été décidé pendant la conception de l'entraîneur Rubik's Cube. Il sert de point de départ pour continuer le projet en mode code.

- **Page en ligne (artefact Claude)** : « Entraîneur Rubik's Cube »
- **Version hors ligne iPhone** : `Cube-Ecole.html`, à ouvrir dans l'app *Documents* (Readdle)
- **Langue de l'interface** : français. Notation WCA.

---

## 1. Pour qui, pour quoi

- Utilisatrices : la propriétaire du projet (profil très visuel) et une amie. Elles savent déjà résoudre le cube avec une méthode proche du CFOP : croix blanche, paires coin + arête (« 2 étages d'un coup »), croix jaune (surnommée « marguerite »), face jaune, puis placement des coins et des arêtes.
- Objectifs :
  1. **retrouver vite** quoi faire selon ce qu'on voit (« si tu vois ça → fais ça ») ;
  2. **mémoriser** les algorithmes, de façon visuelle ;
  3. **s'entraîner** sur l'appli ou sur un vrai cube ;
  4. **progresser** vers le CFOP complet.
- Usage principal : **iPhone**, souvent **sans réseau**. Tout doit tenir sur un écran de téléphone.

---

## 2. Architecture technique

### Fichiers source
| Fichier | Rôle |
|---|---|
| `template.html` | Toute l'appli (CSS + JS), avec 3 marqueurs à remplacer : `/*ENGINE*/`, `/*DATA*/`, `/*F2L*/` |
| `engine.js` | Moteur du cube : cubies, matrices entières, parseur de notation, normalisation |
| `data.js` | Données d'algorithmes (notation, gestes, débutant, 2 étapes, OLL, PLL, pool F2L) |
| `f2l.json` | Les 41 cas F2L retenus (généré par `pick.js`) |
| `build.js` | Assemble `template.html` + `engine.js` + `data.js` + `f2l.json` → `index.html` |
| `validate.js`, `f2l.js`, `pick.js`, `search.js` | Validation des algos par simulation, et génération des F2L |
| `flow*.py`, `gest*.py` | Tests de bout en bout (Playwright + Chrome headless) |

### Commandes
```bash
node build.js                    # génère index.html
node validate.js                 # vérifie OLL (57 distincts) et PLL (21 distincts)
node f2l.js && node pick.js      # couverture des 41 cas F2L et choix du meilleur algo
python3 flow.py                  # (et flow2…flow13, gest.py) tests d'interface
cp index.html Cube-Ecole.html    # version hors ligne
```
Les tests Playwright ouvrent `file:///home/claude/rubik/index.html` et utilisent `/usr/bin/google-chrome` : adapte ces deux chemins à ta machine.

### Contraintes
- **Un seul fichier HTML autonome** : seule ressource externe, les polices Google (Bricolage Grotesque, Figtree, JetBrains Mono). Hors ligne, le téléphone utilise ses polices habituelles.
- **Aucune bibliothèque.** Le cube 3D est fait en CSS 3D (`matrix3d`), les vignettes en SVG généré.
- **Progression dans `localStorage`**, clé `rubik-trainer-v2` (migration auto depuis `v1`). Elle est propre à chaque navigateur et n'est **pas synchronisée** entre appareils, ni entre la version en ligne et la copie hors ligne.

---

## 3. Conventions du cube

- **Orientation** : **jaune en haut, vert devant, orange à droite, rouge à gauche, bleu derrière, blanc en bas.**
- **Repère moteur** : x vers la droite, y vers le haut, z vers soi. Chaque cubie a `home`, `pos` et `rot` (matrice 3×3 entière).
- **Table des mouvements** `[axe, couches, sens]` : R `[0,[1],-1]`, L `[0,[-1],1]`, M `[0,[0],1]`, U `[1,[1],-1]`, D `[1,[-1],1]`, E `[1,[0],1]`, F `[2,[1],-1]`, B `[2,[-1],1]`, S `[2,[0],-1]`. Les doubles couches r/l/u/d/f/b tournent face + tranche. x, y, z tournent les 3 couches.
- **Affichage** : le prime s'écrit avec `′` (U+2032), « Rw » est lu comme « r ».
- **Normalisation** : un état est remis dans l'orientation standard en testant les 24 rotations. Les rotations du cube sont donc « invisibles » quand on compare deux états.
- **État d'un cas** : `caseState(alg)` = résolu → rotation qui annule celle de l'algo → algo inverse. Jouer l'algo depuis cet état donne toujours un cube résolu.

---

## 4. Données d'algorithmes (166 cas uniques)

| Ensemble | Contenu |
|---|---|
| Notation | 25 mouvements (R … z) |
| Gestes clés | 8 : Sexy move, Sexy inverse, Sexy gauche, Sledgehammer, Hedgeslammer, Sune, Anti-Sune, F sexy F′ |
| Débutant | 11 cas en 7 étapes (R′ D′ R D pour orienter les coins jaunes) |
| OLL 2 étapes | 3 cas de croix jaune + les 7 OCLL (OLL 21 à 27) |
| PLL 2 étapes | T, Y, Ua, Ub, H, Z |
| F2L | 41 cas, emplacement avant-droit |
| OLL | 57 cas |
| PLL | 21 cas (variantes facile / speed pour Ua, Ub, Ja) |

### Règles de validation (toutes respectées)
- **OLL** : chaque algo laisse les 2 premiers étages intacts, et les 57 motifs d'orientation sont tous différents (à un tour du haut près).
- **PLL** : les 2 premiers étages et la face jaune restent intacts, et les 21 classes sont différentes (à un tour du haut près, avant et après).
- **F2L** : la croix et les 3 autres emplacements restent intacts, et les 41 cas sont tous couverts.
  - 38 viennent d'algorithmes connus.
  - 3 viennent d'une recherche optimale (meet-in-the-middle sur R, U, F) : « R U′ R′ F′ U′ F », « R U R′ U′ R U R′ », « F′ U′ F U R U′ R′ ».
  - Choix du meilleur algo par un coût : rotations 0,6 ; d 1,3 ; F 1,15 ; autres 1. Une variante n'est gardée que si elle coûte au plus 2,5 de plus que la meilleure.
- **AUF des PLL** : on choisit le tour final du haut qui déplace le moins de pièces. Il s'affiche en bulle à contour pointillé (« Ajuster »).

### Corrections faites grâce à la simulation
- OLL 23 (« Phares ») : les 2 coins jaunes dessus sont côte à côte **devant**.
- OLL 24 (« T ») : les 2 coins jaunes dessus sont côte à côte **à droite**.
- L de la croix jaune : algo **F U R U′ R′ F′**, avec le L **derrière-gauche**. Il remplace f R U R′ U′ f′, qui correspond à un L devant-droite.
- Croix blanche : les 5 cas du Mémo ont été trouvés par recherche (les autres arêtes de la croix restent en place).

### Données de reconnaissance vérifiées
- **Croix jaune avec F R U R′ U′ F′** : L derrière-gauche → ligne horizontale → croix. Point → L devant-droite. Une ligne **verticale** redevient un **point**.
- **Méthode « sexy move » pour les coins jaunes** : cube retourné, jaune en bas, coin à placer en bas devant-droite, R U R′ U′ répété 2 ou 4 fois, puis on tourne seulement la face du bas. Elle marche sur les 7 cas, en 8 à 12 sexy moves.
  - Équivalent avec jaune en haut : R′ D′ R D.
  - Les variantes R′ U′ R U et R D R′ D′ **ne marchent pas**.
- **Ua / Ub** : face complète derrière ; si l'arête de devant doit aller à droite, c'est Ua ; à gauche, Ub.
- **T / Y** : des phares à gauche → T ; aucun phare → Y.

---

## 5. Les 4 vues

Navigation : barre en bas sur mobile, onglets en haut sur ordinateur. Routage par hash : `#parcours`, `#memo`, `#reviser`, `#bibliotheque`.

### 5.1 Apprendre (parcours)
- **Grande carte « Prochaine leçon »** : un seul bouton pour continuer.
- **Tuiles** : algos à réviser aujourd'hui, série de jours, algos appris, algos maîtrisés.
- **Ton objectif**, qui relie chaque objectif à une méthode :
  - Résoudre le cube = méthode débutant, **le plus simple** ;
  - Passer sous la minute = CFOP 2 étapes, **le meilleur compromis** ;
  - Devenir speedcuber = CFOP complet, **le plus populaire et compétitif**.

  Roux (le plus efficace en coups) est seulement cité. Les chapitres au-delà de l'objectif sont en retrait (« bonus ») mais restent accessibles. Aucun verrou.
- **6 chapitres** : Les bases (notation + gestes), Ton premier cube (débutant), Passer sous la minute (2 étapes), F2L (8 leçons), PLL complet, OLL complet. Leçons de 2 à 7 algos, durée estimée de 0,6 min par mouvement et 1,6 min par algo.
- **« Je maîtrise déjà »** (fait sur un vrai cube) :
  - bouton « J'y sais assez » sur chaque leçon ;
  - « Je connais déjà tout ce chapitre » ;
  - raccourci « Je connais les bases et la méthode débutant » (chapitres 1 et 2) ;
  - dans la Bibliothèque, « Je maîtrise » sur chaque algo.

  Effet : niveau 5, prochaine révision dans 16 jours. C'est annulable (« Annuler », « Je ne maîtrise plus ce chapitre »).
- **Masquage de ce qui est maîtrisé** : les leçons maîtrisées sont cachées, remplacées par le lien « N leçons maîtrisées masquées · Afficher ». Les chapitres entièrement maîtrisés passent dans une section « Déjà maîtrisé » en bas, réduits et grisés.

### 5.2 Leçon (plein écran)
1. **Intro** : vignettes des cas, durée, « Regarde, essaie, vérifie ».
2. **Découvrir** (un algo par écran) :
   - carte compacte « Reconnaître » (vignette + astuce) + « À retenir » (la phrase de gestes) ;
   - onglets **Regarder** / **À toi de jouer** ;
   - encadré « Sur ton vrai cube » ;
   - pour la notation : schéma de ce que fait le mouvement + doigté.
3. **Quiz** : QCM à 3 choix en bulles (algos), ou « Quel mouvement vois-tu ? » (animation en boucle). Une réponse fausse revient à la fin de la file.
4. **Fin** : score « du premier coup », confettis, cas ajoutés aux révisions (niveau 1, révision demain), bouton « Leçon suivante ».

### 5.3 Mémo (« si tu vois ça → fais ça »)
- **En haut** : légende des bulles + carte **« Ta prise de base »** (la méthode unique de doigtés).
- **6 étapes** avec navigation collante, chacune avec « Le réflexe » (la règle à retenir) et des cartes vignette + « Si tu vois » + « Alors fais » (phrase de gestes + bulles) + boutons Voir / À toi :
  1. Croix blanche (5 cas)
  2. Paires (F2L 1, 2, 3, 4, 17, 33, 32, 30)
  3. Croix jaune (point, L, ligne)
  4. Face jaune (7 cas classés par nombre de coins jaunes dessus)
  5. Placer les coins (T, Y)
  6. Placer les arêtes (Ua, Ub, H, Z)
- **Visionneuse plein écran** avec « Cas suivant » pour enchaîner tout le Mémo.

### 5.4 Réviser (répétition espacée)
- **Intervalles** par niveau : `[0, 1, 2, 4, 8, 16, 32]` jours. Niveau ≥ 1 = appris, ≥ 4 = maîtrisé.
- **Notes** :
  - « À revoir » : niveau 1, aujourd'hui, et la carte revient dans la session ;
  - « Difficile » : demain ;
  - « Bien » : +1 niveau ;
  - « Facile » : +2 niveaux.
- **Une révision = « Fais l'algorithme de mémoire »** dans le mode À toi de jouer, sans flèche. Puis la réponse s'affiche et on se note. La note suggérée dépend des corrections faites (erreurs + indices + retours + recommencements + flèche) : 0 → Bien, 1 ou 2 → Difficile, plus → À revoir.
- **Entraînement libre** : sur ma sélection (étoiles) ou sur un ensemble. Sessions de 15 cartes maximum.

### 5.5 Bibliothèque
- **Ensembles** : Atelier libre, Notation, Gestes clés, Débutant, OLL 2 étapes, PLL 2 étapes, F2L, PLL, OLL.
- **Filtres** : Tous, Ma sélection, Populaires, Faciles (≤ 8 coups, uniquement R U F L), Les plus courts (tiers le plus court), Nouveaux, En cours, Maîtrisés.
- **Tris** : standard, longueur, popularité, les moins connus d'abord.
- **Panneau du cas** : onglets Regarder / À toi de jouer, variantes, badges, note ou astuce, statut de révision (Ajouter / Je maîtrise / Réviser) et historique d'entraînement.
- **Atelier libre** : cube résolu, clavier de tous les mouvements (R L U D F B M r f x y z, chacun en normal, prime et double), gestes tactiles. Barre sur le cube : Retour, Recommencer, Mélanger (20 coups), 2 couches, Suivre. Il affiche « ce que fait ce mouvement » (doigté + schéma des cycles), la séquence groupée en gestes nommés, et un bandeau « Tu viens de faire : Sexy move ×2 ».

---

## 6. Composants clés

### 6.1 Bulles de mouvements
- **Bleu = sens normal, rouge = prime, double contour = demi-tour.** Taille 44 px (sm 30, xs 24).
- **Sous chaque bulle**, au choix (bascule « Sous les bulles : le sens / le doigt », mémorisée) :
  - **le sens** : « droite ↑ », « haut ← », « avant ↻ », « 2 droite ↑ », « cube ← » ;
  - **le doigt** : « index D ← », « poignet D ↑ ».
- **Recette** : l'algo est découpé en étapes nommées, avec la phrase « Sexy move puis Sledgehammer ».
  - Gestes reconnus : Sune, Anti-Sune, Sexy move, Sexy inverse, Sexy gauche, Sledgehammer, Hedgeslammer, Insertion longue, Insertion, Insertion avant, Tranche M.
  - Une répétition est fusionnée (« Sexy move ×3 »).
  - Contexte : Préparer (U au début), Ouvrir / Fermer (F…F′ ou f…f′), Tourner le cube, Ajuster (AUF final).

### 6.2 Lecteur 3D (`Player`)
- Cube CSS 3D, taille calculée selon la place disponible. La vue tourne en glissant à côté du cube ; un double-clic la réinitialise.
- **Barre de contrôle posée sur le cube** : début, précédent, lecture, suivant, boucle, suivre une pièce, vitesse (Lent 900 ms, Normal 520 ms, Rapide 260 ms par quart de tour, ×1,45 pour un demi-tour).
- **Pastilles sur le cube** : mouvement en cours (bulle colorée + sens) et doigt à utiliser (petite main animée + flèche).
- **Flèche 3D sur la rangée qui va tourner** (bleue ou rouge, « ×2 » pour un demi-tour). Elle se pose sur la face la plus visible et suit la vue. Toujours affichée quand on regarde.
- **Suivre une pièce** : touche une pièce (ou le bouton cible). Les autres pièces s'assombrissent, la pièce suivie garde ses vraies couleurs. Un tableau donne son trajet mouvement par mouvement (« haut-devant-droite → haut-derrière-droite »), et la liste des pièces qui bougent est proposée.
- **Masques de couleurs** : cross, d, f2l, oll, olle, all (pièces grisées selon l'étape).

### 6.3 Mode « À toi de jouer » (`Practice`)
- **Cube collé en haut** pendant qu'on fait défiler. Barre sur le cube : **Retour** (un seul mouvement), **Recommencer** (tout le cas), **2 couches** (si l'algo en contient), **Indice**, **Solution**.
- **Saisie** : clavier de bulles (pour chaque face de l'algo : normal, prime, double), ou gestes sur le cube.
- **Vérification par l'état du cube, pas par le nom des mouvements** :
  - un mouvement équivalent est accepté (« équivalent à f ») ;
  - un mouvement double couche fait en deux temps est accepté : « Moitié de f faite ✓, maintenant S ». Même chose pour un demi-tour fait en deux quarts de tour.
- **Flèche guide désactivée par défaut.** Elle s'affiche avec **Indice**, ou en permanence si on coche « Flèche toujours visible » (choix mémorisé). Après une erreur, la flèche montre le sens pour revenir.
- **Messages** : nom du geste en cours (« Tu es dans le Sexy move : 2/4 », « Sexy move fait ✓. Ensuite : Sledgehammer »). Erreur : « Il fallait U (haut ←) ».
- **Compteurs** : retours, recommencements, erreurs, indices. Une réussite n'est « de mémoire » que sans aucune aide ni flèche. Historique par algo (`S.prac`).

### 6.4 Gestes tactiles
- **Glisser sur une face** : la rangée ou la tranche touchée tourne dans le sens du doigt. Calcul : direction dans le plan de la face = axe × normale, projetée à l'écran ; seuil 16 px. Un centre tourne la tranche du milieu.
- **Glisser à côté du cube** : Atelier → rotation du cube (gauche/droite = y, haut/bas = x) ; À toi de jouer → change seulement la vue.
- **Toucher sans glisser** (< 6 px, < 450 ms) : suit une pièce.
- **Mode 2 couches** : un glissement sur une face extérieure donne r, l, u, d, f ou b.
- Correctif nécessaire : `.cubie{pointer-events:none}`, sinon la face du dessus ne réagit pas au toucher.

### 6.5 Doigtés : une seule méthode
- **Prise de base** : pouces devant, index sur le dessus, autres doigts derrière.
- **R, L** (et r, l) : poignet (R vers le haut, R′ vers le bas ; L vers le bas, L′ vers le haut).
- **U** : index droit vers la gauche · **U′** : index gauche vers la droite · **U2** : index puis majeur droits.
- **F / F′** : index droit / gauche, posé en haut de la face avant, pousse vers le bas.
- **D / D′** : annulaire gauche / droit sous le cube (vers la droite / vers la gauche).
- **M′** : annulaire gauche pousse vers le haut · **M** : tire vers le bas.
- **B / B′** : annulaire droit / gauche derrière en haut (vers la gauche / vers la droite).
- **x, y, z, E, S** : les deux mains.
- Dessin : main vue de dos (miroir pour la gauche), doigt actif en orange qui bouge en boucle dans son sens, flèche noire. Les doigtés B, M, E et S sont les moins standard : à valider en pratique.

### 6.6 Schéma « ce que fait un mouvement »
Grille 3×3 vue depuis la face concernée (R depuis la droite, U depuis le dessus…), avec des flèches courbes entre les positions : sens horaire pour un mouvement normal, échanges deux à deux pour un demi-tour. Texte des cycles (« un coin : haut-devant-droite → … → retour »). Pour une rotation : « la face avant part à gauche ».

---

## 7. Décisions UX (demandées pendant la conception)

1. Un parcours en petites leçons plutôt qu'un catalogue. Aucun verrou, objectif choisi par l'utilisatrice.
2. **Visuel d'abord** : bulles colorées (bleu / rouge), gestes nommés, phrase à retenir, vignettes calculées depuis l'algo.
3. **Faire les mouvements soi-même** (bulles ou gestes), avec **Retour d'un mouvement** et **Recommencer**, à portée de main **sur le cube**. Les retours **comptent** dans l'apprentissage.
4. **Flèches de sens** sur le cube quand on regarde. En pratique, la flèche n'apparaît **qu'en indice**.
5. **Suivre une pièce** pendant tout l'algorithme, et comprendre ce que fait chaque mouvement (cycles).
6. **Doigtés** avec une **seule méthode**, la plus simple et la plus rapide, sans liste d'alternatives. Le doigt et son **sens** sont animés.
7. **Interface compacte sur iPhone** : contrôles et pastilles sur le cube, cartes fusionnées, petit texte d'aide qui disparaît au premier toucher.
8. **Hors ligne** : fichier unique à ouvrir dans *Documents* (l'aperçu de l'app Fichiers ne lance pas toujours les animations).
9. **Progrès qui allègent l'interface** : cocher ce qu'on maîtrise déjà sur un vrai cube, masquer ou grouper ce qui est maîtrisé, pouvoir commencer directement à « Passer sous la minute ».
10. Toujours dire **comment tenir le cube** : jaune en haut, tourner le haut (U) jusqu'à retrouver le dessin. Aucune couleur imposée devant.

---

## 8. État stocké (`localStorage['rubik-trainer-v2']`)
```js
{
  srs:   { [caseId]: { b: 0..6, due: dayNumber } }, // niveau et prochaine révision
  star:  { [caseId]: true },                         // ma sélection
  v:     { [caseId]: variantIndex },
  speed: 'slow' | 'mid' | 'fast',
  goal:  'once' | 'sub1' | 'speed',
  streak, lastDay,                                   // série de jours
  libSet, done: { [lessonId]: scorePct }, open: { [chapterId]: bool },
  showKnown: { [chapterId]: bool },                  // afficher les leçons maîtrisées
  prac: { [caseId]: { wins, clean, undos, restarts } },
  guideOn: bool,                                     // flèche toujours visible en pratique
  fingers: bool                                      // sous les bulles : doigt (true) ou sens
}
```
Identifiants : `notation:R`, `gestes:0`, `debutant:3`, `olle:1`, `f2l:17`, `oll:27`, `pll:Ua`, `memo:cross2`.

---

## 9. Limites connues

- La progression n'est pas synchronisée entre appareils, ni entre la version en ligne et la version hors ligne.
- Sur la face du dessus vue en biais, un glissement en diagonale peut tourner la mauvaise rangée : il faut suivre les lignes du dessin.
- En pratique, si un algo contient une rotation (y′ dans certains F2L) et qu'on fait le mouvement équivalent sans tourner le cube, c'est bien accepté. Mais la flèche d'indice reste dans le repère tourné.
- Pas de COLL, ZBLL ni Roux (CMLL).
- Les vignettes F2L montrent l'emplacement avant-droit uniquement.

## 10. À faire (proposé, pas encore fait)

- **Mémo** :
  - encadré « La dernière face en 4 étapes », avec la règle « tourne le haut jusqu'à retrouver le dessin, puis fais l'algo » sur chaque carte ;
  - méthodes « un seul algo » : sexy move répété pour les coins jaunes (jaune en bas), Sune répété ;
  - chemin point → L → ligne → croix avec le même algo, et mise en garde sur la ligne verticale.
- **Doigtés** : faire valider B, M, E et S en pratique ; éventuellement un mode « doigtés » dans les révisions.
- **Vraie app hors ligne (PWA)** : hébergement (GitHub Pages / Netlify) + manifest + service worker, puis « Sur l'écran d'accueil » dans Safari.
- **Synchronisation** de la progression entre appareils (nécessite un backend).
- **Ensembles avancés** : COLL, ZBLL, Roux CMLL.
