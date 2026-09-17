# Matcap Editor

Éditeur de matcaps 3D — Vue 3 + TypeScript + Three.js, build Vite.

## Environnement

Node n'est pas installé sur l'hôte : **toute commande npm passe par Docker**.

```bash
docker compose up -d                  # démarre le dev server (http://localhost:5174)
docker compose exec app npm run build # type-check + build de production
docker compose exec app npm run <script>
```

Après toute modification de `package.json` ou `package-lock.json` :

```bash
docker compose up -d --build --renew-anon-volumes
```

Sans `--renew-anon-volumes`, le volume anonyme monté sur `/app/node_modules`
conserve l'ancienne arborescence et le conteneur tourne sur des dépendances
périmées.

## Formatage

Prettier fait autorité sur le formatage. Ne jamais reformater à la main et ne
jamais ajouter de règle de style dans la configuration ESLint : le style est
délégué à Prettier, ESLint ne traite que la qualité.

```bash
docker compose exec app npm run format        # applique
docker compose exec app npm run format:check  # vérifie
```

`npm run format` doit être lancé avant chaque commit.

## Versions contraintes

Deux dépendances sont volontairement en retard sur `latest`, ne pas les monter
sans vérifier que la cause a disparu :

- **typescript** reste en `^5` — TypeScript 7 casse `vue-tsc`, qui résout
  encore `typescript/lib/tsc`.
- **eslint** reste en `^9` — aucun plugin Vue/TS ne supporte encore ESLint 10.

## Lint

ESLint est en flat config (`eslint.config.js`). `airbnb-base` et
`eslint-plugin-import` n'ayant pas encore de version flat native, ils sont
chargés via `FlatCompat`. `skip-formatting` doit rester le dernier élément du
tableau : il neutralise les règles de style qui entreraient en conflit avec
Prettier.

```bash
docker compose exec app npm run lint        # corrige ce qui est auto-corrigeable
docker compose exec app npm run lint:check  # vérifie sans modifier
```

## Le type-check ne vérifie rien

`npm run type-check` lance `vue-tsc --noEmit` sur un `tsconfig.json` qui n'a que
des `references` et `"files": []`. Sans `--build`, il ne traverse pas les
sous-projets : il sort en vert sur n'importe quel code. Vérifié en y injectant
`const x: number = 'boom'` — aucune sortie.

Pour obtenir un vrai type-check :

```bash
docker compose exec app npx vue-tsc --build --force
```

Il remonte ~109 erreurs préexistantes (surtout `strictNullChecks` dans
`panes/lightInput/*` et `strictPropertyInitialization`). Procéder par
comparaison de totaux avant/après, comme pour le lint, et nettoyer les
artefacts que `--build` écrit à la racine (`*.tsbuildinfo`, `vite.config.js`)
— ils sont gitignorés.

Corriger le script demande de traiter ces 109 erreurs d'abord, sans quoi
`npm run build` échouerait. À planifier comme un ticket à part.

## Vérification navigateur

Ni `vue-tsc` ni `vite build` ne voient une régression d'ordre d'évaluation des
modules ou un câblage de dépendance cassé. `pw/check.mjs` pilote l'UI réelle —
pointeur sur le canvas, undo/redo clavier, boutons Tweakpane — et sort en
erreur si une étape échoue :

```bash
docker compose up -d   # le serveur doit tourner
docker run --rm --network host -v "$PWD/pw":/pw -w /pw -u 1000:1000 \
  mcr.microsoft.com/playwright:v1.56.0-noble node check.mjs http://localhost:5174/
```

Étapes couvertes : rendu des canvas, ajout de lumière, undo, redo, export de
projet. Le parcours traverse `Editor`, l'historique, le store, et la
sérialisation qui lit dans les contrôleurs de panneaux.

À lancer avant tout commit touchant aux imports, à l'ordre des blocs d'un SFC
ou au câblage des dépendances. Ne pas se contenter d'un build vert.

## Cycles d'imports

Le cycle qui cassait le chargement est coupé :

    SphereAmbiantPaneFolder -> PaneFolderCtrl -> Editor -> Project
        -> SphereMaterialPaneFolderCtrl -> PaneFolderCtrl

`PaneFolderCtrl` n'importe plus `Editor` en valeur : il le reçoit en paramètre
de `initialize()`, l'editor descendant depuis le payload de l'événement
`matcap:editor:ready`. L'import est devenu `import type`, donc effacé à la
compilation.

Le cycle `Editor <-> MatcapEditorWorld` est coupé de la même façon : le world
reçoit l'editor en paramètre de constructeur, comme `MatcapPreviewWorld` le
faisait déjà.

`import/no-cycle` est donc **activé** et vert. Il tient lieu de garde-fou : la
règle échoue désormais au lieu de laisser réapparaître le problème
silencieusement. Ne pas la redésactiver pour faire passer un changement.

La méthode qui marche, quand une dépendance ne sert qu'à l'intérieur d'une
méthode ou d'un constructeur : la passer en paramètre plutôt que l'importer.
L'import devient `import type`, effacé à la compilation, et l'arête disparaît.

Conséquence pratique, toujours valable : **ne jamais lancer `eslint --fix` sans
vérifier ensuite la page dans un navigateur**. Le build et `vue-tsc` ne
détectent pas une régression d'ordre d'évaluation. Le harnais `pw/check.mjs`
sert à ça (voir `tasks/lessons.md`).

## État connu

`npm run lint:check` remonte encore ~200 anomalies qui demandent des
modifications de code, pas de configuration. Attention : le compteur affiché
double une partie des fichiers, le lint scannant aussi la copie obsolète
`.board/worktrees/43/src`. Comparer des totaux avant/après, pas se fier au
chiffre absolu. Réparties en :

- 23 `@typescript-eslint/no-explicit-any`
- 21 `@typescript-eslint/no-unused-vars`
- 20 `import/prefer-default-export`
- 7 `import/extensions`, 5 `class-methods-use-this`, et divers

À traiter progressivement. Ne pas désactiver une règle pour faire tomber le
compteur sans avoir regardé ce qu'elle signale.
