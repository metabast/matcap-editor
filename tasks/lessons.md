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
