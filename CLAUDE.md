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

## Cycles d'imports

Le cycle qui cassait le chargement est coupé :

    SphereAmbiantPaneFolder -> PaneFolderCtrl -> Editor -> Project
        -> SphereMaterialPaneFolderCtrl -> PaneFolderCtrl

`PaneFolderCtrl` n'importe plus `Editor` en valeur : il le reçoit en paramètre
de `initialize()`, l'editor descendant depuis le payload de l'événement
`matcap:editor:ready`. L'import est devenu `import type`, donc effacé à la
compilation.

Il reste un cycle latent `Editor <-> MatcapEditorWorld`, inoffensif tant que
`MatcapEditorWorld` ne lit `Editor.instance` que dans son constructeur. Il
disparaîtra avec l'injection de dépendances (MATC-7), qui conditionne la
réactivation d'`import/no-cycle`.

Conséquence pratique, toujours valable : **ne jamais lancer `eslint --fix` sans
vérifier ensuite la page dans un navigateur**. Le build et `vue-tsc` ne
détectent pas une régression d'ordre d'évaluation.

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
