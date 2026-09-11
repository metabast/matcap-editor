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

## État connu

`npm run lint` est cassé : le script utilise les drapeaux `--ext` et
`--ignore-path` supprimés en ESLint 9, et `.eslintrc.cjs` est au format legacy
alors qu'ESLint 9 attend un `eslint.config.js`. La migration en flat config
reste à faire.
