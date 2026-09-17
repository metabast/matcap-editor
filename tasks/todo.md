# MATC-8 — Découper `Editor` en services

Découper, sans encore débrancher : les services sont extraits et `Command` cesse
de dépendre d'`Editor`, mais `Editor.instance` reste l'accès temporaire. Le
threading des 19 appelants et la suppression du singleton feront une sous-tâche
distincte (MATC-8b).

## Constat vérifié

- `History` stocke un `editor` qu'il ne lit jamais (`history.ts:16`) — déjà un
  service autonome.
- `editor.matcapEditorStore` et `editor.loader` : zéro consommateur. Getters
  morts, comme `contextIsReady` avant eux.
- `execute` a 19 appelants, tous dans du code d'interaction.
- La façade scène a 13 appelants, dont 8 sont des commandes.

## Tâches

- [x] 1. `SceneService` : nouveau, porte les deux worlds et les cinq opérations
      de scène (`addLight`, `deleteLight`, `updateLightPositions`, `addObject`,
      `removeObject`) plus `editorWorld` / `previewWorld`.
- [x] 2. `History` : supprimer le paramètre `editor` et le champ mort.
- [x] 3. `KeyboardShortcuts` : extraire `onKeydown` + `debounce`, prendre
      l'historique, rendre une fonction de désabonnement.
- [x] 4. `Command` : `editor: Editor` → `scene: SceneService`. Plus aucun import
      d'`Editor` dans `src/commands/`.
- [x] 5. Les 13 commandes suivent mécaniquement.
- [x] 6. Les 19 sites de construction passent `Editor.instance.scene`.
- [x] 7. `Editor` : façade de délégation. Suppression des getters morts et de
      l'interface `IEditor`.
- [x] 8. Étendre `pw/check.mjs` au glisser de lumière (couvre
      `updateLightPositions`).
- [x] 9. Vérifier : build, lint sans régression, `pw/check.mjs` vert, puis
      falsifier une assertion nouvelle.

## Non couvert

`addObject` / `removeObject` passent par l'import GLB, qui demande un fichier :
vérification manuelle.

## Revue

`Editor` passe de cinq responsabilités à une : composer et déléguer. Les treize
commandes n'importent plus `Editor` ; elles dépendent de `SceneService`.

Trois découvertes en cours de route :

1. `History` stockait un `editor` jamais lu, et `editor.matcapEditorStore` /
   `editor.loader` n'avaient aucun consommateur. Trois dépendances mortes,
   supprimées plutôt que déplacées.
2. `npm run type-check` ne vérifie rien (voir `CLAUDE.md`). Les 38 erreurs que
   ce refactor a introduites en cours de route n'auraient été vues par aucun
   garde-fou du projet. Mesuré avec `vue-tsc --build` : 109 avant, 109 après.
3. La première version de l'assertion « glisser une lumière » passait alors que
   `updateLightPositions` était volontairement cassé — la poignée suit le
   pointeur toute seule. L'assertion porte maintenant sur l'undo, seul chemin
   qui traverse réellement la commande. Falsifiée, elle échoue bien.

Reste pour MATC-8b : les 19 sites qui écrivent `Editor.instance.scene` nomment
désormais leur dépendance, mais l'attrapent encore par le singleton.
