# Plan de transformation vers Clean Architecture - Optimisé pour Claude Sonnet

> 📋 **Document de référence technique** - Migration architecturale complète  
> 🎯 **Contexte** : Matcap Editor Vue 3 + TypeScript + Three.js  
> 📅 **Estimation** : 18-25 semaines (650-850h)  
> 🔄 **Approche** : Migration graduelle avec coexistence legacy/clean

## Table des matières

- [1. Analyse de l'existant](#1-analyse-de-lexistant)
- [2. Architecture cible](#2-architecture-cible)  
- [3. Stratégie de migration](#3-stratégie-de-migration)
- [4. Plan d'exécution détaillé](#4-plan-dexécution-détaillé)
- [5. Implémentations techniques](#5-implémentations-techniques)
- [6. Validation et tests](#6-validation-et-tests)
- [7. Planning et ressources](#7-planning-et-ressources)
- [Annexes](#annexes)

---

## 1. Analyse de l'existant

### 1.1 État architectural actuel

**🔍 Problèmes identifiés :**
- Singleton Editor (point de défaillance unique)
- Couplage Vue/Three.js (difficile à tester)
- Commands dépendants de l'UI (Pane dans les commandes)
- Stores Pinia couplés (logique métier dans les stores)
- Événements globaux non typés
- Absence de couche domaine

**📊 Diagramme actuel :**
```
Vue Components ←→ Editor (God Object) ←→ Three.js
Tweakpane UI   ←→ Commands + History  ←→ Stores + Events
```

### 1.2 Technologies validées
- ✅ Vue 3 + TypeScript (architecture solide)
- ✅ Three.js v0.163.0 (rendering optimal)
- ✅ Pinia (state management)
- ✅ Tweakpane (UI controls)
- ⚠️ Incohérence : sous-module three-matcap-orm-material utilise Three.js v0.153.0

---

## 2. Architecture cible

### 2.1 Principes Clean Architecture

```
┌─── FRAMEWORKS & DRIVERS ────────────────────────┐
│ Vue.js │ Three.js │ Tweakpane │ Pinia │ FS     │
├─── INTERFACE ADAPTERS ──────────────────────────┤  
│ Controllers │ Presenters │ Gateways │ ViewModels │
├─── APPLICATION BUSINESS RULES ──────────────────┤
│ Use Cases │ Application Services │ Command/Query │
├─── ENTERPRISE BUSINESS RULES ───────────────────┤
│ Entities │ Domain Services │ Value Objects    │
└──────────────────────────────────────────────────┘
```

### 2.2 Structure de dossiers cible

<details>
<summary>📁 Arborescence complète (cliquer pour développer)</summary>

```
src/
├── domain/                    # ✨ CORE BUSINESS LOGIC
│   ├── entities/
│   │   ├── Light.ts          # Entité métier principale
│   │   ├── Material.ts
│   │   ├── Project.ts
│   │   └── MatcapScene.ts
│   ├── repositories/         # Interfaces (contrats)
│   ├── services/            # Services domaine
│   └── value-objects/       # Objets valeur immutables
│
├── application/              # 🎯 USE CASES
│   ├── use-cases/           # Logique applicative
│   ├── ports/               # Interfaces I/O
│   └── services/            # Command/Query Bus
│
├── infrastructure/          # 🔧 TECHNICAL DETAILS
│   ├── repositories/        # Implémentations concrètes
│   ├── adapters/           # Three.js, Tweakpane, etc.
│   └── persistence/        # LocalStorage, IndexedDB
│
├── presentation/           # 🎨 UI COORDINATION
│   ├── controllers/        # Orchestration
│   ├── presenters/        # Transformation des données
│   └── view-models/       # État UI
│
└── ui/                    # 🖼️ VUE COMPONENTS
    ├── components/        # Vue purs
    ├── composables/      # Logique Vue
    └── stores/          # État UI uniquement
```
</details>

---

## 3. Stratégie de migration

### 3.1 Approche coexistence temporaire

**🎯 Principe :** Migration graduelle sans interruption de service

```
src/
├── legacy/              # 📦 Code actuel (temporaire)
├── clean/              # ✨ Nouvelle architecture
├── migration/          # 🔄 Outils de transition
│   ├── adapters/       # Ponts legacy ↔ clean
│   ├── feature-flags/  # Activation progressive
│   └── mappers/        # Conversion de données
└── shared/            # 🤝 Utilitaires communs
```

### 3.2 Feature flags implémentation

```typescript
// migration/feature-flags/FeatureFlags.ts
export class FeatureFlags {
    private static flags = {
        'clean-lights': false,    // Migration des lumières
        'clean-materials': false, // Migration des matériaux
        'clean-projects': false,  // Migration des projets
        'clean-ui': false        // Migration UI
    };
    
    static isEnabled(feature: string): boolean {
        return this.flags[feature] ?? false;
    }
}
```

---

## 4. Plan d'exécution détaillé

### Phase 1: Setup coexistence (1 semaine)
**🎯 Objectif :** Préparer l'infrastructure de migration

**📋 Tâches :**
1. Restructurer dossiers (legacy/, clean/, migration/)
2. Implémenter feature flags
3. Créer adaptateurs de pont
4. Tests de non-régression

**✅ Critères de réussite :**
- Application fonctionne identiquement
- Structure de coexistence opérationnelle
- Feature flags testables

---

### Phase 2: Extraction domaine (2-3 semaines)
**🎯 Objectif :** Créer les entités métier pures

**📋 Entités principales :**

<details>
<summary>💡 Light Entity (cliquer pour voir le code)</summary>

```typescript
// clean/domain/entities/Light.ts
export class Light {
    constructor(
        public readonly id: LightId,
        public readonly type: LightType,
        public position: Position,
        public properties: LightProperties
    ) {}

    updatePosition(newPosition: Position): Light {
        return new Light(this.id, this.type, newPosition, this.properties);
    }

    updateIntensity(intensity: number): Light {
        const newProperties = { ...this.properties, intensity };
        return new Light(this.id, this.type, this.position, newProperties);
    }
}
```
</details>

**✅ Critères de réussite :**
- Entités testables sans dépendances
- Value objects immutables
- Mappers legacy ↔ clean fonctionnels

---

### Phase 3: Migration feature par feature (6-8 semaines)
**🎯 Objectif :** Migrer progressivement chaque fonctionnalité

**🔄 Ordre de migration :**
1. **Lumières** (feature la plus isolée)
2. **Matériaux** 
3. **Projets**
4. **Interface utilisateur**

**📋 Pattern pour chaque feature :**

<details>
<summary>🔧 Adaptateur de migration (exemple)</summary>

```typescript
// migration/adapters/LightFeatureAdapter.ts
export class LightFeatureAdapter {
    async handleLightOperation(operation: string, data: any) {
        if (FeatureFlags.isEnabled('clean-lights')) {
            return this.executeWithCleanArchitecture(operation, data);
        } else {
            return this.executeWithLegacy(operation, data);
        }
    }
}
```
</details>

---

### Phase 4: Tests et validation (continu)
**🎯 Objectif :** Garantir la non-régression

**🧪 Types de tests :**
- Tests de régression automatisés
- Tests de performance
- Tests d'intégration
- Monitoring de migration

---

### Phase 5: Nettoyage progressif (2-3 semaines)
**🎯 Objectif :** Supprimer le code legacy

**📋 Processus :**
1. Validation complète par feature
2. Suppression du code legacy
3. Restructuration finale
4. Documentation mise à jour

---

## 5. Implémentations techniques

### 5.1 Injection de dépendances

**⚠️ Prérequis :** Installation d'Inversify
```bash
npm install inversify reflect-metadata
npm install --save-dev @types/inversify
```

<details>
<summary>⚙️ Configuration container DI</summary>

```typescript
// di/container.ts
import 'reflect-metadata';
import { Container } from 'inversify';

export function setupDependencies(container: Container): void {
    // Repositories
    container.bind<LightRepository>('LightRepository').to(PiniaLightRepository);
    
    // Use Cases
    container.bind<AddLightUseCase>('AddLightUseCase').to(AddLightUseCase);
    
    // Services
    container.bind<CommandBus>('CommandBus').to(CommandBus).inSingletonScope();
}
```
</details>

### 5.2 Use Cases implémentation

<details>
<summary>🎯 AddLightUseCase exemple</summary>

```typescript
// application/use-cases/AddLightUseCase.ts
export class AddLightUseCase {
    constructor(
        private lightRepository: LightRepository,
        private eventBus: EventBus
    ) {}

    async execute(command: AddLightCommand): Promise<AddLightResult> {
        // 1. Validation
        this.validateCommand(command);

        // 2. Création entité
        const light = Light.create(command.type, command.position, command.properties);

        // 3. Persistance
        await this.lightRepository.save(light);

        // 4. Événement
        await this.eventBus.publish(new LightAddedEvent(light));

        return AddLightResult.success(light.id);
    }
}
```
</details>

### 5.3 Adaptateurs Three.js

<details>
<summary>🎨 ThreeJsRenderAdapter</summary>

```typescript
// infrastructure/adapters/ThreeJsRenderAdapter.ts
export class ThreeJsRenderAdapter implements RenderEngine {
    private scene: THREE.Scene;
    private lights: Map<LightId, THREE.Light>;

    async renderLight(light: Light): Promise<void> {
        const threeLight = this.createThreeLight(light);
        this.lights.set(light.id, threeLight);
        this.scene.add(threeLight);
    }

    private createThreeLight(light: Light): THREE.Light {
        switch (light.type) {
            case LightType.RECT_AREA:
                return this.createRectAreaLight(light);
            case LightType.SPOT:
                return this.createSpotLight(light);
        }
    }
}
```
</details>

---

## 6. Validation et tests

### 6.1 Métriques qualité cibles
- **Couverture tests** : > 90%
- **Complexité cyclomatique** : < 10/méthode
- **Duplication code** : < 3%
- **Performance** : Pas de dégradation > 5%

### 6.2 Tests de régression

<details>
<summary>🧪 Exemple test de régression</summary>

```typescript
describe('Migration Regression Tests', () => {
    it('should produce same results with legacy and clean', async () => {
        // Test legacy
        FeatureFlags.disable('clean-lights');
        const legacyResult = await testAddLight(sampleData);
        
        // Test clean
        FeatureFlags.enable('clean-lights');
        const cleanResult = await testAddLight(sampleData);
        
        expect(cleanResult).toEqual(legacyResult);
    });
});
```
</details>

---

## 7. Planning et ressources

### 7.1 Timeline détaillée

| Phase | Durée | Effort | Jalons |
|-------|-------|--------|--------|
| **Phase 1** | 1 sem | 30-40h | ✅ Coexistence opérationnelle |
| **Phase 2** | 2-3 sem | 60-80h | ✅ Domaine complet |
| **Phase 3** | 6-8 sem | 200-250h | ✅ Migration features |
| **Phase 4** | Continu | - | ✅ Tests validés |
| **Phase 5** | 2-3 sem | 60-80h | ✅ Nettoyage legacy |
| **Phases 6-9** | 8-10 sem | 300-350h | ✅ Use cases, infra, présentation, UI |

**📊 Total estimé : 18-25 semaines (650-850h)**

### 7.2 Équipe recommandée
- **1 Senior Developer** (architecture + domain modeling)
- **1-2 Developers** (implémentation)
- **1 Tester** (tests automatisés)

---

## Annexes

### A. Points d'attention identifiés
- ⚠️ **Version Three.js** : Incohérence v0.163.0 vs v0.153.0
- ⚠️ **Singleton Editor** : Implémentation différente de l'analyse initiale
- ✅ **Stores Pinia** : Déjà bien découplés
- ✅ **Commands** : Couplage UI confirmé (besoin migration)

### B. Scripts utilitaires

<details>
<summary>🛠️ Script setup migration</summary>

```bash
#!/bin/bash
# scripts/setup-migration.sh
echo "🏗️ Setting up Clean Architecture migration..."

# Create structure
mkdir -p src/{clean/{domain,application,infrastructure,presentation},migration/{adapters,bridges,mappers,feature-flags},shared/{types,constants,utils}}

# Move legacy
mkdir -p src/legacy
mv src/Editor.ts src/legacy/ 2>/dev/null || true
mv src/commands src/legacy/ 2>/dev/null || true

echo "✅ Migration structure ready!"
```
</details>

### C. Ressources techniques
- 📚 [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- 📚 [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- 🛠️ [Inversify.js Documentation](http://inversify.io/)

---

**🎯 Conclusion :** Cette migration permettra au Matcap Editor de devenir une application robuste, testable, maintenable et évolutive, respectant les bonnes pratiques du développement logiciel moderne.
