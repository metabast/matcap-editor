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
