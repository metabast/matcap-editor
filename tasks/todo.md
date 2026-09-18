# MATC-5 · 5/6 — Modèle de projet explicite

## Plan

- [x] 1. `src/ts/types/MatcapProject.ts` : `MatcapProject`, `SerializedLight`,
      `SerializedVector2|3`, écrits à la main, sans import Three/Tweakpane.
      Supprimer `TProject.ts`. `color: any` -> `string` dans
      `TSphereRenderMaterial` / `TSphereRenderAmbiant`.
- [x] 2. `LightModel` : `toSerialized(): SerializedLight` explicite,
      `createFromSerialized(s: SerializedLight)` typé au lieu de `any`.
- [x] 3. `src/services/ProjectService.ts` : classe injectée (scene, history,
      store), abonnements dans le constructeur. Supprimer `commons/Project.ts`
      et ses `let` de module ; `Editor` l'instancie.
- [x] 4. `ImportProjectCommand` typé sur `MatcapProject`, plus de `any`.
- [x] 5. `SpherePaneFolder` construit les deux contrôleurs avec `new` ;
      suppression des getters `static instance` et des gardes qui jettent.
- [x] 6. `pw/check.mjs` : aller-retour export -> réimport vérifié sur le
      matériau rendu, les lumières et l'ambiant.
- [x] 7. type-check + lint:check + build + `pw/check.mjs` verts.

## Notes

Format de fichier volontairement inchangé (decision du 2026-09-18) : les clés
`sphereRenderMaterial` / `sphereRenderAmbiant` disent où la valeur s'applique,
et `_light` reste la sortie de `Object3D.toJSON()`. Le découplage du format
lui-meme (version 2 + lecture des deux formes) est un ticket a part.

Pas de test unitaire : vitest n'est pas installé dans ce projet (aucune
dépendance ni script dans package.json, seul `tsconfig.vitest.json` subsiste).
La vérification passe par `pw/check.mjs`.

## Review

`MatcapProject` / `SerializedLight` décrivent le fichier à la main, sans import
Three ni Tweakpane. `ProjectService` reçoit scene, history et store du
composition root ; `commons/Project.ts` et ses deux `let` de module ont disparu,
comme les getters `static instance` des deux panneaux sphère.

Deux écarts assumés :

- `LightModel.toSerialized()` n'écrit plus `_oldPositions` (état de glisser,
  jamais relu à l'import) ;
- `ProjectService.clear()` copie la liste avant d'itérer. L'ancien code faisait
  `_store.lights.forEach(...)` alors que `deleteLight` splice ce même tableau :
  une lumière sur deux survivait à un import.

Vérifications : `type-check` vert, `format:check` vert, `build` vert,
`lint:check` à 197 (pas de nouvelle anomalie sur les fichiers touchés),
`pw/check.mjs` vert avec trois nouvelles étapes d'aller-retour.

Les trois nouvelles assertions ont été falsifiées avant d'être crues : lumières
non rejouées à l'import -> « importing restores the lights identically » échoue ;
matériau et ambiant corrompus à la sérialisation -> les deux assertions
correspondantes échouent.

## MATC-5 · 6/6 — Bus d'événements typé et désabonnable

- [x] `EventMap` (nom → signature de callback) dans `src/commons/Events.ts`
- [x] `on()` renvoie l'`Unsubscribe` de nanoevents ; `emit()` variadique typé
- [x] supprimer `getNewEmitter()` (mort) et la constante `EVENT_FILES_DROPPED`
      (remplacée par le canal littéral `files:dropped`)
- [x] supprimer les canaux morts : emits commentés de `PreviewMaterialFolder`,
      `matcap:content:ready` (aucun écouteur), et les abonnements sans émetteur
      `matcap:ambiant:update`, `matcap:light:delete`, `matcap:light:stopMoving`,
      `matcap:material:update` — avec les handlers devenus inutilisés
      (`onAmbiantChanged`, `onLightStopMoving`, `onMaterialUpdate` ; `deleteLight`
      reste, `SceneService` l'appelle)
- [x] désabonnement : `onUnmounted` dans `MatcapLights.vue`, `CanvasSnapshots.vue`,
      `MatcapProperties.vue`, `DragAndDropHelper.vue` ; `dispose()` dans
      `MatcapEditorContent`, `MatcapPreviewContent`, `ProjectService`, `Loader`,
      `RenderManager`, `LightPaneFolder`, `PreviewMaterialFolder`
- [x] `npm run type-check` + `lint:check` + `pw/check.mjs` verts

### Revue

- `EventMap` : 24 canaux typés dans `src/commons/Events.ts`, `on()` renvoie
  l'`Unsubscribe` de nanoevents, `emit()` est variadique sur
  `Parameters<EventMap[K]>`.
- Falsification : renommer `matcap:light:startMoving` dans l'`EventMap` fait
  échouer `vue-tsc` sur ses deux appelants (critère vérifié en le voyant rouge).
- Canaux morts supprimés : `matcap:content:ready` (aucun écouteur),
  `matcap:ambiant:update`, `matcap:light:delete`, `matcap:light:stopMoving`,
  `matcap:material:update` (aucun émetteur), plus les `emit` commentés de
  `PreviewMaterialFolder`. Audit final : aucun canal déclaré sans usage, aucun
  émetteur sans écouteur, aucun écouteur sans émetteur.
- Fuite réelle trouvée au passage : `LightModelBoolean` s'abonnait à
  `light:change` à chaque sélection de lumière, et `clean()` ne disposait que le
  widget. Les désabonnements sont désormais possédés par `LightPaneFolder`
  (`data.bindingUnsubscribes`) et purgés dans `clean()`.
- Seam de teardown : `Editor.dispose()` → worlds → `content.dispose()`, plus
  `RenderManager`, `ProjectService`, `Loader`, et libération du slot singleton.
  Les panneaux se disposent depuis le `onUnmounted` de leur composant.
- Vérifications : `type-check` vert, `build` vert, `lint:check` 194 anomalies
  (baseline ~196, aucune nouvelle sur les fichiers touchés), `pw/check.mjs` 22/22
  sans erreur console, plus deux sondes ad hoc — sélection de mesh qui rafraîchit
  le pane matériau (0.00 -> 0.33) et chaîne `generate` du grid de snapshots.
- Le grid de snapshots n'est pas observable en headless : le contexte WebGL a
  `preserveDrawingBuffer: false` et SwiftShader rend un readback vide, donc
  `toBlob()` ne produit que du transparent et `canvas.snapshots` reste vierge —
  y compris sur `HEAD`. Ce n'est pas un oracle : à vérifier dans un vrai
  navigateur, pas dans `pw/`.

## Tests de caractérisation sur History et les commandes

- [x] `History` : exécution, undo, redo, vidage des redos, `clear()` (11 tests)
- [x] trois commandes contre un double manuel de `SceneService` (5 tests)
- [x] 11 mutations d'une ligne passées sur `history.ts`,
      `SetSphereMaterialParamsCommand` et `AddLightCommand` : toutes rendent au
      moins un test rouge
- [x] `npm run test:unit` ajouté et documenté dans `CLAUDE.md` au même titre que
      `type-check` et `lint:check`

### Review

`vitest` n'était pas installé malgré `tsconfig.vitest.json` : ajouté en
devDependency (`npm install -D --legacy-peer-deps`, le conflit de peer deps
`eslint-config-airbnb-base` vs ESLint 9 étant préexistant). `vitest.config.ts`
importe `./vite.config.js` — l'extension `.ts` fait échouer `vue-tsc`
(TS5097), l'absence d'extension déclenche un avertissement Vite.
