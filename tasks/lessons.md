# Lessons

## Vérifier dans le navigateur, pas seulement au build

`vue-tsc` et `vite build` résolvent les modules via le `baseUrl` du tsconfig
et évaluent l'arbre différemment du serveur de dev. Deux régressions de suite
sont passées au travers d'un `type-check` + `build` verts :

1. un import réécrit en spécificateur nu par `import/no-relative-packages` ;
2. un `ReferenceError` de TDZ provoqué par l'inversion `<template>`/`<script>`
   sur un cycle d'imports préexistant.

**Règle :** toute modification touchant aux chemins d'import, à l'ordre des
imports, à l'ordre des blocs d'un SFC ou à la résolution de modules se valide
en chargeant la page et en vérifiant l'absence d'erreur console.

Vérification navigateur disponible sans MCP (npx absent de l'hôte) :

```bash
docker run --rm --network host -v "$PWD/pw":/pw -w /pw -u 1000:1000 \
  mcr.microsoft.com/playwright:v1.56.0-noble node check.mjs http://localhost:5174/
```

## Ne pas annoncer « vérifié » sur un signal partiel

Dire qu'un changement est vérifié alors que seule une partie de la chaîne a
été testée est pire que ne rien dire : la personne arrête de chercher.
Énoncer ce qui a été testé, et ce qui ne l'a pas été.

## Un `--fix` automatique n'est pas anodin

`eslint --fix` a modifié 40 fichiers et introduit deux régressions. Sur un
codebase avec des cycles d'imports, les règles d'ordonnancement (`import/order`,
`vue/block-order`) changent la sémantique d'exécution. Les appliquer par lots
et vérifier entre chaque.

## Supprimer un import peut déplacer l'entrée d'un cycle

En rendant la composition root explicite (MATC-6), l'import d'`Editor` en tête
de `Canvas3D.vue` a été retiré. Page blanche : `ReferenceError: Cannot access
'PaneFolderControler' before initialization`.

Cet import ne servait à rien fonctionnellement — il appelait `contextIsReady()`,
du code mort. Son rôle réel était d'amorcer le graphe de modules dans un ordre
où `PaneFolderCtrl` était évalué avant que `SphereMaterialPaneFolderCtrl` en
hérite. Une béquille d'ordre de chargement que rien ne signalait.

**Règle :** sur un codebase à cycles, retirer un import est un changement
d'ordre d'évaluation au même titre qu'en ajouter un. Et la bonne réponse n'est
pas de rétablir l'ordre, mais de couper l'arête : une dépendance utilisée
seulement à l'intérieur d'une méthode se passe en paramètre, ce qui transforme
l'import en `import type` et l'efface à la compilation.

## Utiliser la vérification navigateur déjà documentée

Le harnais Playwright décrit plus haut existait ; il a été redemandé à
l'utilisateur de tester à la main deux fois avant d'y penser. Lire ce fichier
avant de déclarer qu'une vérification est hors de portée.
