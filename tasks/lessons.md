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
`pw/check.mjs`, voir la section dédiée de `CLAUDE.md`.

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

## Un test qui n'a jamais échoué ne prouve rien

`pw/check.mjs` passait au vert sur ses cinq étapes. En cassant volontairement
l'injection d'`editor` dans `MatcapEditorWorld`, deux défauts sont apparus :
les assertions undo/redo comparaient `0` à `0` et restaient vertes alors que
rien n'avait été ajouté, et un `hasText` non exact cliquait le bouton
« Export » au lieu d'« Export project ».

**Règle :** après avoir écrit une vérification, la falsifier — casser la ligne
qu'elle est censée protéger et confirmer qu'elle échoue, avec un code de sortie
non nul. Vérifier le code de sortie sans le masquer derrière un pipe.

## L'oracle d'un test doit être hors de portée du mécanisme testé

Trois assertions de `pw/check.mjs` sont passées au vert sans rien tester :

1. « glisser une lumière la déplace » — la poignée suit le pointeur seule ;
2. « la lumière expose ses bindings » — `intensity` existe aussi dans le
   panneau ambiant, un sélecteur global restait vert ;
3. « annuler restaure la rugosité » — `Ctrl+Z` déclenche l'annulation de texte
   du navigateur sur le champ Tweakpane, qui remet l'ancienne valeur même avec
   `undo()` cassé, et même après un `blur()`.

Le point commun : l'oracle était contaminé par un autre mécanisme capable de
produire le résultat attendu. Choisir un observable que seul le code testé peut
produire — ici le matériau rendu, pas le champ de saisie.

**Règle :** ne jamais retenir une assertion sans l'avoir vue échouer sur une
cassure délibérée de la ligne exacte qu'elle protège.

## Ne jamais enchaîner `git stash` et `git stash pop` à l'aveugle

Le wrapper `rtk git` refuse certains drapeaux courts (`-q`, `-r`) et sort en
erreur. Dans un `A && B`, le `&&` protège ; dans un `A; B`, non : un
`git stash -u -q` rejeté suivi d'un `git stash pop` a dépilé une remise
préexistante de l'utilisateur et créé quatre conflits sans rapport avec le
travail en cours.

Règle : pour mesurer une baseline, comparer avec `git worktree add` sur un
commit, ou lire les chiffres déjà produits plus tôt dans la session. Si un
`stash` est vraiment nécessaire, vérifier `git stash list` avant _et_ après le
push, et ne dépiler que par `git stash pop stash@{n}` avec le n vérifié.

## Un `stash` avorté suivi d'un `pop` déroule le stash de quelqu'un d'autre

`git stash -q` échoue sous le proxy rtk (il rejette les options inconnues).
Enchaîné avec `; git stash pop`, le `pop` s'exécute quand même et dépile
l'entrée précédente — ici un stash `docker compose dev/build` vieux de plusieurs
commits, qui a produit quatre conflits dans l'arbre de travail.

Règle : jamais de `;` entre un `stash` et son `pop` — uniquement `&&`, et
uniquement après avoir lu `git stash list`. Pour une baseline, préférer
`git worktree add`, qui ne touche pas à l'arbre courant.

## Les pixels d'un canvas WebGL ne sont pas un oracle en headless

Le renderer tourne avec `preserveDrawingBuffer: false`, et sous SwiftShader
(headless Chromium) le readback hors frame rend du transparent : `toBlob()` sur
le canvas de l'éditeur produit une image vide, donc le grid de snapshots reste
vierge dans `pw/` alors qu'il fonctionne dans un vrai navigateur. Une sonde qui
lit `getImageData` d'un canvas alimenté par ces blobs mesure cette limite, pas
l'application.

Règle : ne jamais conclure à une panne applicative depuis des pixels lus en
headless. Les oracles utilisables restent l'état applicatif lu par
`globalThis.matcapEditor` et le DOM. Et une sonde jamais vue passer ne prouve
rien, exactement comme une assertion jamais vue échouer.
