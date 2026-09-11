# Module three-matcap-orm-material

## Vue d'ensemble

Le module `three-matcap-orm-material` est une **extension TypeScript indépendante** de Three.js qui implémente un matériau matcap avancé avec support **ORM (Occlusion, Roughness, Metalness)**. Il permet de créer des matériaux matcap dynamiques avec interpolation multi-niveaux basée sur la rugosité.

## Architecture du module

### Structure des fichiers

```
three-matcap-orm-material/
├── package.json                    # Configuration du module ES6
├── tsconfig.json                   # Configuration TypeScript
├── README.md                       # Documentation (lien CodePen)
└── src/
    ├── index.ts                    # Point d'entrée et exports
    ├── materials/
    │   └── MeshMatcapORMMaterial.ts # Classe principale du matériau
    └── shaders/
        └── shaderChunk/
            ├── matcapORM.ts        # Fragment shader principal
            └── matcapORMUniform.ts # Uniforms et utilitaires GLSL
```

### Configuration du projet

```json
{
    "name": "three-matcap-orm-material",
    "type": "module", // Module ES6
    "dependencies": {
        "three": "^0.153.0" // Version Three.js compatible
    },
    "scripts": {
        "build": "tsc ./src/index.ts --outDir ./dist --module esnext --target esnext"
    }
}
```

**Caractéristiques :**

- Module ES6 privé (non publié sur npm)
- Build TypeScript manuel avec configuration custom
- Dépendance Three.js v0.153.0
- Structure modulaire et réutilisable

## Classe MeshMatcapORMMaterial

### Héritage et architecture

```typescript
export class MeshMatcapORMMaterial extends THREE.MeshMatcapMaterial {
    private customUniforms: {
        uMap2: { value: THREE.Texture | null }; // Texture albedo alternative
        uRoughness: { value: number }; // Valeur de rugosité (0-1)
        uRoughnessMap: { value: THREE.Texture | null }; // Texture de rugosité
        uMetalness: { value: number }; // Valeur de metalness (0-1)
        uColor: { value: THREE.Color }; // Couleur de base
    };
}
```

**Principe :** Extension propre de `MeshMatcapMaterial` sans modification du core Three.js

### Système d'uniforms personnalisés

#### Déclaration des uniforms

```typescript
this.customUniforms = {
    uMap2: { value: null }, // Pas de texture par défaut
    uRoughness: { value: 0 }, // Surface parfaitement lisse
    uRoughnessMap: { value: null }, // Pas de carte de rugosité
    uMetalness: { value: 0 }, // Surface non métallique
    uColor: { value: new THREE.Color(0xffffff) }, // Blanc par défaut
};
```

#### Injection dans le shader

```typescript
this.onBeforeCompile = (shader: THREE.Shader) => {
    // Ajout des defines nécessaires
    shader.defines = Object.assign(shader.defines, { USE_UV: '' });

    // Injection des uniforms personnalisés
    shader.uniforms = Object.assign(shader.uniforms, this.customUniforms);

    // Remplacement des chunks de shader
    shader.fragmentShader = shader.fragmentShader.replace('#define MATCAP', matcapORMUniform);
    shader.fragmentShader = shader.fragmentShader.replace(
        'vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;',
        matcapORM,
    );
};
```

### API publique (Getters/Setters)

#### Propriétés de couleur et texture

```typescript
// Couleur alternative (uColor)
set color2(value: THREE.Color): void
get color2(): THREE.Color

// Texture albedo alternative (uMap2)
set map2(value: THREE.Texture | null): void {
    if (value) this.defines.USE_MAP2 = '';      // Active le define
    else delete this.defines.USE_MAP2;          // Désactive le define
    this.customUniforms.uMap2.value = value;
}
get map2(): THREE.Texture | null
```

#### Propriétés PBR

```typescript
// Rugosité (contrôle l'interpolation matcap)
set roughness(value: number): void
get roughness(): number

// Carte de rugosité
set roughnessMap(value: THREE.Texture | null): void
get roughnessMap(): THREE.Texture | null

// Metalness (uniforme disponible, extensible)
set metalness(value: number): void
get metalness(): number
```

#### Méthode utilitaire

```typescript
applyMapsFromOtherMaterial(material: MeshMatcapORMMaterial): void {
    // Copie toutes les propriétés d'un autre matériau
    if (material.color) this.color2 = material.color;
    if (material.map) this.map2 = material.map;
    if (material.roughness) this.roughness = material.roughness;
    if (material.roughnessMap) this.roughnessMap = material.roughnessMap;
    if (material.normalMap) this.normalMap = material.normalMap;
}
```

## Système de shaders

### 1. matcapORMUniform.ts - Déclarations et utilitaires

```glsl
#define MATCAP

// Uniforms du matériau
uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uColor;
uniform sampler2D uMap2;
uniform sampler2D uRoughnessMap;

// Fonction de remapping linéaire
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// Extraction d'une cellule de la grille matcap 3x3
vec4 getCellMatcap(sampler2D matcap, vec2 uv, float row, float col) {
    return texture2D(matcap, vec2(uv.x/3., uv.y/3.) + vec2(1./3.*col, 1./3.*row));
}
```

**Fonctions clés :**

- **`map()`** : Remapping linéaire entre deux plages de valeurs
- **`getCellMatcap()`** : Extraction d'une cellule spécifique dans une grille 3x3

### 2. matcapORM.ts - Logique de rendu principal

#### Extraction de la grille matcap 3x3

```glsl
// Extraction des 9 cellules de la grille matcap
vec4 matcap0 = getCellMatcap(matcap, uv, 2., 0.);  // Rangée 2, Colonne 0
vec4 matcap1 = getCellMatcap(matcap, uv, 2., 1.);  // Rangée 2, Colonne 1
vec4 matcap2 = getCellMatcap(matcap, uv, 2., 2.);  // Rangée 2, Colonne 2
// ... jusqu'à matcap8 (Rangée 0, Colonne 2)
```

**Organisation de la grille :**

```
matcap6  matcap7  matcap8    (Rangée 0 - Rugosité élevée)
matcap3  matcap4  matcap5    (Rangée 1 - Rugosité moyenne)
matcap0  matcap1  matcap2    (Rangée 2 - Rugosité faible)
```

#### Gestion de la rugosité

```glsl
float roughness = uRoughness;

// Support des cartes de rugosité
#ifdef USE_ROUGHNESSMAP
    vec4 roughnessMapColor = texture2D(uRoughnessMap, vUv);
    roughness = roughnessMapColor.g;  // Canal vert pour la rugosité
#endif
```

#### Interpolation progressive des matcaps

```glsl
float interval = 1./8.;  // 8 niveaux de transition

// Interpolation pour chaque matcap selon la rugosité
matcap0.rgb *= clamp(map(roughness, 0., interval, 1., 0.), 0., 1.);

matcap1.rgb *= clamp(map(roughness, 0., interval, 0., 1.), 0., 1.);
matcap1.rgb *= clamp(map(roughness, interval, interval * 2., 1., 0.), 0., 1.);

// ... pour chaque niveau de rugosité
```

**Logique d'interpolation :**

- Chaque matcap est actif sur une plage de rugosité spécifique
- Transitions fluides entre les niveaux grâce aux fonctions `clamp()` et `map()`
- 8 intervalles de rugosité pour 9 matcaps

#### Rendu final

```glsl
// Combinaison de tous les matcaps
vec3 matcapProgress =
    matcap0.rgb + matcap1.rgb + matcap2.rgb + matcap3.rgb + matcap4.rgb +
    matcap5.rgb + matcap6.rgb + matcap7.rgb + matcap8.rgb;

// Application de la couleur/texture de base
diffuseColor.rgb = uColor;
#ifdef USE_MAP2
    diffuseColor.rgb = texture2D(uMap2, vUv).rgb;
#endif

// Résultat final
outgoingLight = diffuseColor.rgb * matcapProgress;
```

## Fonctionnalités avancées

### 1. Système de grille matcap dynamique

**Concept :** Une texture matcap unique contient 9 variations organisées en grille 3x3

- **Rangée 0** : Surfaces très rugueuses (diffuses)
- **Rangée 1** : Surfaces moyennement rugueuses
- **Rangée 2** : Surfaces lisses (réfléchissantes)

### 2. Interpolation basée sur la rugosité

**Algorithme :**

```
Rugosité 0.0 → 100% matcap0 (surface parfaitement lisse)
Rugosité 0.125 → 50% matcap0 + 50% matcap1
Rugosité 0.25 → 100% matcap1
...
Rugosité 1.0 → 100% matcap8 (surface très rugueuse)
```

### 3. Support complet des textures PBR

| Propriété         | Uniform GLSL    | Define             | Description                   |
| ----------------- | --------------- | ------------------ | ----------------------------- |
| **Albedo**        | `uColor`        | -                  | Couleur de base               |
| **Albedo Map**    | `uMap2`         | `USE_MAP2`         | Texture couleur alternative   |
| **Roughness**     | `uRoughness`    | -                  | Valeur de rugosité (0-1)      |
| **Roughness Map** | `uRoughnessMap` | `USE_ROUGHNESSMAP` | Carte de rugosité (canal G)   |
| **Metalness**     | `uMetalness`    | -                  | Valeur metalness (extensible) |

### 4. Système de defines conditionnels

```typescript
// Activation/désactivation des fonctionnalités selon les textures
if (value) this.defines.USE_MAP2 = '';
else delete this.defines.USE_MAP2;
```

**Avantages :**

- Optimisation automatique du shader
- Compilation conditionnelle des fonctionnalités
- Performance optimale selon les besoins

## Utilisation dans le projet

### Import et instanciation

```typescript
import { MeshMatcapORMMaterial } from '../three-matcap-orm-material/src/index';

const material = new MeshMatcapORMMaterial({
    matcap: matcapGridTexture, // Texture grille 3x3
});
```

### Configuration des propriétés

```typescript
// Propriétés de base
material.roughness = 0.5;
material.metalness = 0.8;
material.color2 = new THREE.Color(0xff0000);

// Textures
material.map2 = albedoTexture;
material.roughnessMap = roughnessTexture;
```

### Intégration avec l'éditeur matcap

```typescript
// Dans MatcapEditorContent.ts
this.sphereRenderMaterial = new MeshMatcapORMMaterial({
    matcap: this.matcap,
});

// Synchronisation avec les stores Pinia
material.roughness = store.material.roughness;
material.metalness = store.material.metalness;
```

## Avantages techniques

### ✅ Points forts

1. **Extension propre de Three.js**
    - Aucune modification du core Three.js
    - Compatibilité totale avec l'écosystème existant
    - API cohérente avec les matériaux standards

2. **Système matcap sophistiqué**
    - Grille 3x3 pour 9 variations de surface
    - Interpolation fluide entre niveaux de rugosité
    - Rendu réaliste avec une seule texture

3. **Performance optimisée**
    - Compilation conditionnelle des shaders
    - Uniforms optimisés selon les besoins
    - Pas de calculs inutiles

4. **Flexibilité d'usage**
    - Support complet des workflows PBR
    - API simple et intuitive
    - Extensibilité pour nouvelles fonctionnalités

5. **Architecture modulaire**
    - Module indépendant et réutilisable
    - Séparation claire shader/logique
    - Documentation par l'exemple (CodePen)

### 🔧 Améliorations possibles

1. **Support metalness complet**

    ```glsl
    // Utilisation de uMetalness dans le fragment shader
    vec3 metallic = mix(diffuseColor.rgb, vec3(0.0), metalness);
    ```

2. **Support des normales maps**

    ```typescript
    set normalMap(value: THREE.Texture | null): void
    ```

3. **Optimisations shader**
    - Pré-calculs des intervalles
    - Optimisation des boucles d'interpolation
    - Support des LOD matcap

4. **Documentation technique**
    - Commentaires GLSL détaillés
    - Diagrammes d'architecture
    - Exemples d'usage avancés

5. **Tests et validation**
    ```typescript
    // Tests unitaires pour les propriétés
    describe('MeshMatcapORMMaterial', () => {
        it('should interpolate roughness correctly', () => {
            // Test interpolation
        });
    });
    ```

## Workflow de développement

### Build et développement

```bash
# Build du module
npm run build

# Génération des types TypeScript
npm run tsc
```

### Intégration dans l'éditeur

```typescript
// Import dans le projet principal
import { MeshMatcapORMMaterial } from './three-matcap-orm-material/src/index';

// Utilisation dans MatcapEditorWorld
const material = new MeshMatcapORMMaterial({
    matcap: this.matcapTexture,
});
```

## Exemple d'usage complet

### Création et configuration

```typescript
import { MeshMatcapORMMaterial } from './three-matcap-orm-material/src/index';
import * as THREE from 'three';

// Création du matériau
const material = new MeshMatcapORMMaterial({
    matcap: matcapGridTexture,
});

// Configuration des propriétés PBR
material.roughness = 0.3; // Surface moyennement rugueuse
material.metalness = 0.9; // Surface très métallique
material.color2 = new THREE.Color(0x00ff00);

// Application des textures
material.map2 = colorTexture;
material.roughnessMap = roughnessTexture;

// Application à un mesh
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
```

### Animation de la rugosité

```typescript
// Animation en temps réel
function animate() {
    const time = Date.now() * 0.001;
    material.roughness = (Math.sin(time) + 1) * 0.5; // 0 à 1
    requestAnimationFrame(animate);
}
```

## Conclusion

Le module `three-matcap-orm-material` représente une **extension sophistiquée et innovante** de Three.js qui :

- **Révolutionne le rendu matcap** avec un système de grille 3x3 et interpolation dynamique
- **Respecte les standards Three.js** tout en apportant des fonctionnalités avancées
- **Optimise les performances** grâce à la compilation conditionnelle
- **Facilite l'intégration PBR** dans les workflows modernes
- **Permet la création d'éditeurs avancés** comme le matcap-editor

Le système d'interpolation basé sur la rugosité est particulièrement innovant et ouvre de nouvelles possibilités pour le rendu temps réel de matériaux complexes avec une approche légère et performante.
