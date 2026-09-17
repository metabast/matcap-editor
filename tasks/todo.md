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

---

# Ticket type-check — rendre `npm run type-check` effectif

- [x] `vue-tsc --build --force` dans le script ; falsifié, il échoue bien (exit 2).
- [x] Configuration : `module`/`moduleResolution` incohérents dans
      `tsconfig.node.json`, `three-matcap-orm-material/src` absent des `include`,
      sortie du projet node redirigée hors de l'arbre.
- [x] `window.d.ts` n'augmentait rien : un import en tête en faisait un module.
- [x] `THREE.Shader` a disparu des types de Three → `WebGLProgramParametersWithUniforms`.
- [x] 56 `strictNullChecks` dans `panes/lightInput/*` → garde en tête de binding.
- [x] 34 `strictPropertyInitialization` → `!` documenté par classe.
- [x] 109 → 0.

## Revue

Les gardes transforment un plantage en retour silencieux : un garde qui se
déclencherait à tort viderait le panneau sans rien signaler. D'où une huitième
étape dans `pw/check.mjs`, qui vérifie que la lumière sélectionnée expose bien
ses bindings.

Cette assertion a dû être reprise deux fois avant de prouver quoi que ce soit :
« intensity » existe aussi dans le panneau ambiant, donc un sélecteur global
restait vert alors que le binding était supprimé. Elle est maintenant restreinte
au dossier « Current Light », et la falsification la fait échouer.

---

# MATC-9 — Source de vérité unique

- [x] Le store porte `material` (roughness, metalness, color) et `ambiant`.
- [x] `SceneService.applySphereMaterial()` / `applyAmbiant()` : le store pousse
      vers Three, jamais l'inverse.
- [x] Les deux contrôleurs se lient au store ; la copie fantôme
      `_roughnessCtrl` / `_metalnessCtrl` / `_colorCtrl` disparaît.
- [x] `SetSphereMaterialParamsCommand` et `SetAmbiantLightCommand` ne prennent
      plus de `Pane` ni de `ValuesPaneCtrl`, et n'appellent plus `pane.refresh()`.
- [x] Le rafraîchissement devient un événement, `MatcapProperties` s'y abonne.
- [x] `Project` sérialise le store ; `ImportProjectCommand` n'importe plus de
      contrôleur Tweakpane.
- [x] Harnais étendu à l'aller-retour rugosité, falsifié.

## Revue

L'état réel était pire que « trois canaux » : `store.material` n'était lu qu'une
fois, à la construction, puis jamais mis à jour ; l'action
`setSphereRenderMaterial` n'avait aucun appelant. La vérité vivait dans le
matériau Three, avec une copie fantôme dans le contrôleur pour l'undo et
l'export.

Le garde anti-boucle s'est révélé indispensable : sans lui, `pane.refresh()`
réenregistre une commande à chaque undo, et le second undo réapplique la valeur.
Le harnais le prouve — c'est la falsification qui l'a montré, pas le
raisonnement.

Trois assertions ont dû être reprises avant de prouver quoi que ce soit. La
dernière a coûté le plus cher : `Ctrl+Z` déclenche l'annulation de texte du
navigateur sur le champ Tweakpane, qui remet la valeur précédente quoi que fasse
l'application. L'assertion était verte même avec `undo()` volontairement cassé.
Elle porte maintenant sur le matériau rendu.
