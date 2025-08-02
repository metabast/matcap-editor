# Architecture du projet Matcap Editor

## Vue d'ensemble

Le **Matcap Editor** est un éditeur de matcaps 3D développé avec **Vue 3 + TypeScript + Vite** utilisant **Three.js** pour le rendu 3D. Il permet de créer et éditer des matériaux matcap avec un système d'éclairage interactif et une prévisualisation en temps réel.

## Architecture générale

### Type de projet
- **Frontend :** Application web moderne avec Vue 3 + TypeScript
- **Rendu 3D :** Three.js avec extensions avancées
- **Build :** Vite pour un développement rapide
- **Styling :** Tailwind CSS

### Technologies clés
```json
{
  "frontend": ["Vue 3", "TypeScript", "Vite", "Tailwind CSS"],
  "3d": ["Three.js", "three-mesh-bvh", "RectAreaLightUniformsLib"],
  "ui": ["Tweakpane"],
  "state": ["Pinia"],
  "utils": ["Stats.js", "fflate", "nanoevents"]
}
```

## Patterns architecturaux

### 1. Pattern Singleton - Éditeur central

Le cœur de l'application repose sur un **éditeur singleton** qui orchestre toutes les fonctionnalités :

```typescript
// Editor.ts - Point d'entrée principal
class Editor implements IEditor {
    private static _instance: IEditor;
    public static get instance(): Editor {
        if (!this._instance) this._instance = new Editor();
        return this._instance;
    }
    
    private _matcapEditorWorld: MatcapEditorWorld;
    private _matcapPreviewWorld: MatcapPreviewWorld;
    private _history: History;
    private _loader: Loader;
}
```

**Responsabilités :**
- Coordination entre les deux mondes 3D
- Gestion de l'historique des commandes
- Interface avec les stores Pinia
- Gestion des événements globaux

### 2. Architecture à deux mondes 3D

L'application est divisée en **deux environnements 3D distincts** :

#### MatcapEditorWorld
```typescript
class MatcapEditorWorld {
    scene: Scene;
    camera: OrthographicCamera;  // Caméra orthographique pour l'édition
    renderer: WebGLRenderer;
    content: MatcapEditorContent;
}
```
- **Purpose :** Interface d'édition des matcaps
- **Caméra :** Orthographique pour une vue consistante
- **Canvas :** `canvas.webgl2`
- **Fonctionnalités :** Placement de lumières, édition de matériaux

#### MatcapPreviewWorld
```typescript
class MatcapPreviewWorld {
    scene: Scene;
    camera: PerspectiveCamera;   // Caméra perspective pour la navigation
    control: OrbitControls;      // Contrôles de navigation
    composer: EffectComposer;    // Post-processing
}
```
- **Purpose :** Prévisualisation des matériaux créés
- **Caméra :** Perspective avec contrôles OrbitControls
- **Canvas :** `canvas.webgl`
- **Fonctionnalités :** Navigation 3D, préview en temps réel

### 3. Pattern Command avec historique Undo/Redo

Implémentation complète du **pattern Command** pour toutes les actions utilisateur :

```typescript
// Command.ts - Interface commune
abstract class Command {
    public id: number;
    public type: string;
    public name: string;
    public editor: Editor;
    
    abstract execute(): void;
    abstract undo(): void;
}

// History.ts - Gestion de l'historique
class History {
    private undos: Command[] = [];
    private redos: Command[] = [];
    
    execute(cmd: Command): void
    undo(): Command | undefined
    redo(): Command | undefined
    clear(): void
}
```

#### Commandes principales

| Commande | Description | Fichier |
|----------|-------------|---------|
| `AddLightCommand` | Ajouter une lumière | `AddLightCommand.ts` |
| `DeleteLightCommand` | Supprimer une lumière | `DeleteLightCommand.ts` |
| `SetLightPropertyCommand` | Modifier propriété de lumière | `SetLightPropertyCommand.ts` |
| `SetLightModelPropertyCommand` | Modifier modèle de lumière | `SetLightModelPropertyCommand.ts` |
| `SetSphereMaterialParamsCommand` | Modifier matériau sphère | `SetSphereMaterialParamsCommand.ts` |
| `SetAmbiantLightCommand` | Modifier éclairage ambiant | `SetAmbiantLightCommand.ts` |
| `ImportProjectCommand` | Importer projet | `ImportProjectCommand.ts` |

### 4. Gestion d'état avec Pinia

**Stores centralisés** pour la gestion de l'état réactif :

#### matcapEditorStore
```typescript
export const matcapEditorStore = defineStore('matcapEditor', {
    state: () => ({
        sizes: {
            view: 256,
            exportDefault: 256,
            exportRatios: [0.5, 1, 2, 4]
        },
        material: {
            roughness: 0,
            metalness: 1
        },
        ambiant: {
            color: new Color(),
            intensity: 0
        },
        lights: [] as Lights,
        isUILightVisible: true
    })
});
```

#### matcapPreviewStore
```typescript
// Store pour la prévisualisation des matériaux
export const matcapPreviewStore = defineStore('matcapPreview', {
    // État de la préview, matériaux, etc.
});
```

### 5. Architecture événementielle

**Système d'événements découplé** pour la communication inter-modules :

```typescript
// Events.ts - Système d'événements centralisé
events.emit('matcap:editor:light:add', lightModel);
events.emit('matcap:editor:light:remove', lightModel);
events.emit('matcap:ui:light:update:current', lightModel);
events.emit('matcap:snapshot', data);
```

## Modules principaux

### Interface utilisateur (Tweakpane)

**Architecture modulaire** pour les contrôles UI basée sur Tweakpane :

```typescript
// PaneFolderCtrl.ts - Classe de base
abstract class PaneFolderControler {
    protected _editor: Editor;
    protected _pane: Pane;
    
    abstract _generate(): void;
    abstract get serializedParams(): any;
}
```

#### Contrôleurs spécialisés

| Contrôleur | Responsabilité | Fichier |
|------------|----------------|---------|
| `LightPaneFolder` | Gestion des lumières individuelles | `LightPaneFolder.ts` |
| `SphereMaterialPaneFolderCtrl` | Matériaux de la sphère | `SphereMaterialPaneFolderCtrl.ts` |
| `SphereAmbiantPaneFolder` | Éclairage ambiant | `SphereAmbiantPaneFolder.ts` |
| `ImportExportMatcapPaneFolder` | Import/Export | `ImportExportMatcapPaneFolder.ts` |

### Système de lumières

**Architecture orientée objet** pour la gestion des lumières :

```typescript
// LightModel.ts - Wrapper autour des lumières Three.js
class LightModel {
    private _light: RectAreaLight | SpotLight | PointLight;
    public screenPosition: Vector2;
    
    static createFromSerialized(data: any): LightModel
    setPositionX(x: number): void
    setPositionY(y: number): void
    setPositionZ(z: number): void
    update(): void
}

// LightFabric.ts - Factory pour création de lumières
class LightFabric {
    static create(type: string, params: any): LightModel
}
```

#### Types de lumières supportées
- **RectAreaLight** : Lumières rectangulaires
- **SpotLight** : Projecteurs avec angle et pénombre
- **PointLight** : Lumières omnidirectionnelles
- **AmbientLight** : Éclairage ambiant global

### Rendu 3D

#### Pipeline de rendu optimisé

```typescript
// RenderManager.ts - Gestion du pipeline de rendu
class RenderManager {
    private renderer: WebGLRenderer;
    private composer: EffectComposer;
    
    render(scene: Scene, camera: Camera): void
    addPostProcessing(): void
}
```

#### Optimisations Three.js

```typescript
// MatcapEditorWorld.ts - Optimisations BVH
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

(BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
(BufferGeometry.prototype as any).disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

// Initialisation des uniformes pour RectAreaLight
RectAreaLightUniformsLib.init();
```

#### Matériau custom

**Module séparé** pour le matériau matcap personnalisé :

```typescript
// three-matcap-orm-material/src/materials/MeshMatcapORMMaterial.ts
class MeshMatcapORMMaterial extends ShaderMaterial {
    // Implémentation custom du matériau matcap avec ORM
}
```

## Organisation des fichiers

```
src/
├── Editor.ts                    # Singleton principal et orchestrateur
├── main.ts                      # Point d'entrée Vue.js
├── App.vue                      # Composant racine
├── history.ts                   # Gestion undo/redo
│
├── components/                  # Composants Vue
│   ├── Canvas3D.vue            # Composant principal avec les deux canvas
│   ├── MatcapLights.vue        # Interface de gestion des lumières
│   ├── MatcapProperties.vue    # Propriétés des matcaps
│   └── PreviewProperties.vue   # Propriétés de préview
│
├── stores/                     # Stores Pinia
│   ├── matcapEditorStore.ts   # État de l'éditeur
│   ├── matcapPreviewStore.ts  # État de la préview
│   └── counter.ts             # Store exemple
│
├── commands/                   # Pattern Command
│   ├── AddLightCommand.ts     # Ajout de lumière
│   ├── DeleteLightCommand.ts  # Suppression de lumière
│   ├── SetLightPropertyCommand.ts
│   ├── SetSphereMaterialParamsCommand.ts
│   └── index.ts               # Exports des commandes
│
├── commons/                   # Utilitaires partagés
│   ├── Command.ts            # Classe de base des commandes
│   ├── Events.ts             # Système d'événements
│   ├── Loader.ts             # Chargement de fichiers
│   ├── Project.ts            # Gestion des projets
│   ├── Stats.ts              # Monitoring des performances
│   └── Utils.ts              # Fonctions utilitaires
│
├── matcapEditor/             # Monde d'édition
│   ├── MatcapEditorWorld.ts  # Classe principale du monde d'édition
│   ├── MatcapEditorContent.ts # Contenu de la scène d'édition
│   ├── LightModel.ts         # Modèle de lumière
│   ├── LightFabric.ts        # Factory de lumières
│   ├── RenderManager.ts      # Gestionnaire de rendu
│   └── panes/                # Contrôles UI Tweakpane
│       ├── LightPaneFolder.ts
│       ├── SphereMaterialPaneFolderCtrl.ts
│       └── lightInput/       # Inputs spécialisés
│
├── matcapPreview/            # Monde de préview
│   ├── MatcapPreviewWorld.ts # Classe principale du monde preview
│   ├── MatcapPreviewContent.ts # Contenu de la scène preview
│   └── panes/                # Contrôles preview
│
└── ts/types/                 # Définitions TypeScript
    ├── PanesTypes.ts         # Types pour Tweakpane
    ├── TProject.ts           # Type projet
    └── TSphereRenderMaterial.ts
```

## Flux de données

### 1. Interaction utilisateur
```
User Action → Tweakpane Control → Command Creation → Editor.execute() → History.execute() → Command.execute() → Store Update → UI Reactive Update
```

### 2. Rendu 3D
```
Store Changes → Event Emission → World Update → Scene Modification → Render Loop → Canvas Display
```

### 3. Import/Export
```
File Input → DroppedFileManager → ImportProjectCommand → Multiple Sub-Commands → Store Updates → UI Refresh
```

## Points forts architecturaux

### ✅ Avantages

1. **Séparation claire des responsabilités** entre édition et préview
2. **Pattern Command complet** avec undo/redo fonctionnel pour toutes les actions
3. **Architecture modulaire** avec des modules spécialisés et réutilisables
4. **Gestion d'état centralisée** avec Pinia et réactivité Vue
5. **Système d'événements découplé** permettant la communication inter-modules
6. **Support TypeScript strict** avec interfaces bien définies
7. **Optimisations Three.js** (BVH, uniformes RectAreaLight)
8. **Modularité UI** avec Tweakpane et contrôleurs spécialisés

### 🔧 Améliorations possibles

1. **Tests unitaires** : Ajouter une couverture de tests pour les commandes et stores
2. **Documentation des APIs** : JSDoc pour les interfaces publiques
3. **Lazy loading** : Chargement paresseux des modules Three.js
4. **Worker threads** : Déporter les calculs intensifs
5. **Validation TypeScript** : Types plus stricts pour les paramètres de commandes

## Conclusion

Cette architecture est **bien conçue pour un éditeur 3D professionnel** avec :
- Une séparation claire entre logique métier et interface utilisateur
- Un système de commandes robuste avec historique complet
- Une gestion d'état réactive et centralisée
- Des optimisations Three.js appropriées
- Une modularité permettant l'extension facile de nouvelles fonctionnalités

L'architecture supporte efficacement les besoins d'un éditeur de matcaps avec prévisualisation temps réel, système d'éclairage complexe, et workflows d'import/export.
