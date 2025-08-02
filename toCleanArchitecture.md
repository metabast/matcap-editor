# Plan de transformation vers Clean Architecture

## Objectif

Transformer l'architecture actuelle du **Matcap Editor** vers une **Clean Architecture** pour améliorer :
- La testabilité du code
- La séparation des responsabilités
- L'indépendance des frameworks
- La maintenabilité à long terme
- La scalabilité de l'application

## Analyse de l'architecture actuelle

### 🔍 **État actuel**

L'architecture actuelle présente des **couplages forts** entre les couches :

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vue Components │────│   Editor (God)   │────│   Three.js      │
│   Tweakpane UI   │    │   Commands       │    │   Stores        │
│   Pinia Stores   │    │   History        │    │   Events        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🚨 **Problèmes identifiés**

1. **Singleton Editor** - Point de défaillance unique
2. **Couplage Vue/Three.js** - Difficile à tester
3. **Commands dépendants de l'UI** - Pane et ValuesPaneCtrl dans les commandes
4. **Stores Pinia couplés** - Logique métier dans les stores
5. **Événements globaux** - Communication non typée
6. **Pas de couche de domaine** - Logique métier dispersée

## Architecture cible : Clean Architecture

### 🎯 **Principe de Clean Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRAMEWORKS & DRIVERS                     │
│  Vue.js | Three.js | Tweakpane | Pinia | File System      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  INTERFACE ADAPTERS                        │
│     Controllers | Presenters | Gateways | View Models      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION BUSINESS RULES               │
│              Use Cases | Application Services               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                 ENTERPRISE BUSINESS RULES                   │
│                    Entities | Domain                        │
└─────────────────────────────────────────────────────────────┘
```

### 📁 **Structure cible**

```
src/
├── domain/                          # Couche Domaine (Core)
│   ├── entities/                    # Entités métier
│   │   ├── Light.ts                 # Entité Lumière pure
│   │   ├── Material.ts              # Entité Matériau
│   │   ├── Project.ts               # Entité Projet
│   │   └── MatcapScene.ts           # Entité Scène
│   ├── repositories/                # Interfaces de repositories
│   │   ├── LightRepository.ts
│   │   ├── ProjectRepository.ts
│   │   └── MaterialRepository.ts
│   ├── services/                    # Services domaine
│   │   ├── LightService.ts
│   │   ├── MaterialService.ts
│   │   └── ProjectService.ts
│   └── value-objects/               # Objets valeur
│       ├── Position.ts
│       ├── Color.ts
│       └── MaterialProperties.ts
│
├── application/                     # Couche Application
│   ├── use-cases/                   # Cas d'usage
│   │   ├── AddLightUseCase.ts
│   │   ├── DeleteLightUseCase.ts
│   │   ├── UpdateMaterialUseCase.ts
│   │   ├── ExportProjectUseCase.ts
│   │   └── ImportProjectUseCase.ts
│   ├── ports/                       # Interfaces (Ports)
│   │   ├── input/                   # Ports d'entrée
│   │   │   ├── LightUseCases.ts
│   │   │   ├── MaterialUseCases.ts
│   │   │   └── ProjectUseCases.ts
│   │   └── output/                  # Ports de sortie
│   │       ├── LightRepository.ts
│   │       ├── FileSystem.ts
│   │       ├── EventBus.ts
│   │       └── RenderEngine.ts
│   └── services/                    # Services applicatifs
│       ├── CommandBus.ts
│       ├── QueryBus.ts
│       └── EventBus.ts
│
├── infrastructure/                  # Couche Infrastructure
│   ├── repositories/                # Implémentations repositories
│   │   ├── InMemoryLightRepository.ts
│   │   ├── LocalStorageProjectRepository.ts
│   │   └── PiniaStateRepository.ts
│   ├── adapters/                    # Adaptateurs externes
│   │   ├── ThreeJsRenderAdapter.ts
│   │   ├── TweakpaneUIAdapter.ts
│   │   ├── FileSystemAdapter.ts
│   │   └── EventBusAdapter.ts
│   ├── external/                    # Services externes
│   │   ├── three-js/
│   │   ├── tweakpane/
│   │   └── file-system/
│   └── persistence/                 # Persistance
│       ├── LocalStorageStore.ts
│       ├── IndexedDBStore.ts
│       └── FileStore.ts
│
├── presentation/                    # Couche Présentation
│   ├── controllers/                 # Contrôleurs
│   │   ├── LightController.ts
│   │   ├── MaterialController.ts
│   │   └── ProjectController.ts
│   ├── presenters/                  # Présentateurs
│   │   ├── ScenePresenter.ts
│   │   ├── UIPresenter.ts
│   │   └── ExportPresenter.ts
│   ├── view-models/                 # Modèles de vue
│   │   ├── LightViewModel.ts
│   │   ├── MaterialViewModel.ts
│   │   └── SceneViewModel.ts
│   └── mappers/                     # Mappeurs DTO
│       ├── LightMapper.ts
│       ├── MaterialMapper.ts
│       └── ProjectMapper.ts
│
└── ui/                             # Couche UI (Vue.js)
    ├── components/                 # Composants Vue purs
    ├── composables/                # Composables Vue
    ├── stores/                     # Stores Pinia (UI state only)
    └── types/                      # Types UI
```

## Stratégie de migration : Coexistence temporaire

### 🏗️ **Option recommandée : Migration graduelle dans le même projet**

Pour minimiser les risques et permettre une transition fluide, nous allons utiliser une **approche par coexistence temporaire** :

```
src/
├── legacy/                          # Code actuel (à migrer progressivement)
│   ├── Editor.ts
│   ├── commands/
│   ├── stores/
│   ├── matcapEditor/
│   └── matcapPreview/
│
├── clean/                           # Nouvelle architecture Clean
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── shared/                          # Utilitaires partagés entre architectures
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── migration/                       # Outils et adaptateurs de migration
│   ├── adapters/                    # Adaptateurs legacy -> clean
│   ├── bridges/                     # Ponts entre architectures
│   ├── mappers/                     # Conversion de données
│   └── feature-flags/               # Activation progressive des features
│
└── components/                      # UI Vue (graduellement adaptée)
    ├── Canvas3D.vue
    ├── MatcapLights.vue
    └── ...
```

### ✅ **Avantages de cette approche :**

1. **Migration incrémentale** - Feature par feature, module par module
2. **Application toujours fonctionnelle** - Pas d'interruption de service
3. **Tests continus** - Validation à chaque étape
4. **Rollback facile** - Possibilité de revenir en arrière rapidement
5. **Équipe productive** - Développement parallèle possible
6. **Historique Git préservé** - Traçabilité complète des changements

## Plan de migration étape par étape

### 🚀 **Phase 1 : Setup de la coexistence (1 semaine)**

#### Étape 1.1 : Restructuration des dossiers
```bash
# Déplacer le code existant dans legacy/
mkdir src/legacy
mv src/Editor.ts src/legacy/
mv src/commands/ src/legacy/
mv src/stores/ src/legacy/
mv src/matcapEditor/ src/legacy/
mv src/matcapPreview/ src/legacy/

# Créer la structure Clean
mkdir -p src/clean/{domain,application,infrastructure,presentation}
mkdir -p src/migration/{adapters,bridges,mappers,feature-flags}
mkdir -p src/shared/{types,constants,utils}
```

#### Étape 1.2 : Feature flags pour la migration
```typescript
// migration/feature-flags/FeatureFlags.ts
export class FeatureFlags {
    private static flags: Record<string, boolean> = {
        'clean-lights': false,           // Use clean architecture for lights
        'clean-materials': false,        // Use clean architecture for materials
        'clean-projects': false,         // Use clean architecture for projects
        'clean-ui': false,              // Use clean UI components
    };

    static isEnabled(feature: string): boolean {
        return this.flags[feature] ?? false;
    }

    static enable(feature: string): void {
        this.flags[feature] = true;
    }

    static disable(feature: string): void {
        this.flags[feature] = false;
    }
}
```

#### Étape 1.3 : Adaptateurs de pont
```typescript
// migration/bridges/LegacyToCleanBridge.ts
export class LegacyToCleanBridge {
    constructor(
        private legacyEditor: LegacyEditor,
        private cleanLightController: LightController,
    ) {}

    async addLight(lightData: any): Promise<void> {
        if (FeatureFlags.isEnabled('clean-lights')) {
            // Utiliser la nouvelle architecture
            const command = this.mapToCleanCommand(lightData);
            await this.cleanLightController.addLight(command);
        } else {
            // Utiliser l'ancienne architecture
            this.legacyEditor.addLight(lightData);
        }
    }

    private mapToCleanCommand(lightData: any): AddLightRequest {
        return {
            type: lightData.type,
            position: {
                x: lightData.position.x,
                y: lightData.position.y,
                z: lightData.position.z,
            },
            properties: lightData.properties,
        };
    }
}
```

### 🎯 **Phase 2 : Extraction du domaine (2-3 semaines)**

#### Étape 2.1 : Créer les entités du domaine dans `clean/domain/`
```typescript
// clean/domain/entities/Light.ts
export class Light {
    constructor(
        public readonly id: LightId,
        public readonly type: LightType,
        public position: Position,
        public properties: LightProperties,
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

#### Étape 2.2 : Mappers entre legacy et clean
```typescript
// migration/mappers/LightMapper.ts
export class LightMapper {
    static fromLegacy(legacyLight: LegacyLightModel): Light {
        return new Light(
            LightId.create(legacyLight.id),
            LightType.fromString(legacyLight.type),
            Position.fromCoordinates(
                legacyLight.position.x,
                legacyLight.position.y,
                legacyLight.position.z
            ),
            LightProperties.fromLegacy(legacyLight.properties)
        );
    }

    static toLegacy(light: Light): LegacyLightModel {
        return new LegacyLightModel({
            id: light.id.value,
            type: light.type.value,
            position: {
                x: light.position.x,
                y: light.position.y,
                z: light.position.z,
            },
            properties: light.properties.toLegacy(),
        });
    }
}
```

#### Étape 2.3 : Tests des entités (isolation complète)
```typescript
// tests/clean/domain/entities/Light.test.ts
describe('Light Entity (Clean Architecture)', () => {
    it('should create a valid light', () => {
        const position = new Position(0, 0, 1);
        const properties = LightProperties.create({ intensity: 1.0 });
        
        const light = Light.create(LightType.SPOT, position, properties);
        
        expect(light.position).toEqual(position);
        expect(light.properties.intensity).toBe(1.0);
    });
});
```

### 🎯 **Phase 3 : Migration feature par feature (6-8 semaines)**

#### Étape 3.1 : Migration des lumières (première feature)
```typescript
// migration/adapters/LightFeatureAdapter.ts
export class LightFeatureAdapter {
    constructor(
        private legacyEditor: LegacyEditor,
        private cleanContainer: Container,
    ) {}

    async handleLightOperation(operation: string, data: any): Promise<any> {
        if (FeatureFlags.isEnabled('clean-lights')) {
            return this.executeWithCleanArchitecture(operation, data);
        } else {
            return this.executeWithLegacy(operation, data);
        }
    }

    private async executeWithCleanArchitecture(operation: string, data: any): Promise<any> {
        const lightController = this.cleanContainer.get<LightController>('LightController');
        
        switch (operation) {
            case 'add':
                return lightController.addLight(LightMapper.mapAddRequest(data));
            case 'delete':
                return lightController.deleteLight(data.id);
            case 'update':
                return lightController.updateLight(data.id, LightMapper.mapUpdateRequest(data));
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }

    private executeWithLegacy(operation: string, data: any): any {
        // Déléguer à l'ancien système
        return this.legacyEditor.handleLightOperation(operation, data);
    }
}
```

#### Étape 3.2 : Migration progressive des composants UI
```vue
<!-- components/MatcapLights.vue (version hybride) -->
<template>
    <div class="matcap-lights">
        <!-- Utilisation conditionnelle selon le feature flag -->
        <CleanLightPanel v-if="useCleanArchitecture" />
        <LegacyLightPanel v-else />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FeatureFlags } from '@/migration/feature-flags/FeatureFlags';
import CleanLightPanel from '@/clean/ui/components/LightPanel.vue';
import LegacyLightPanel from '@/legacy/components/MatcapLights.vue';

const useCleanArchitecture = computed(() => 
    FeatureFlags.isEnabled('clean-lights') && FeatureFlags.isEnabled('clean-ui')
);
</script>
```

### 🔄 **Phase 4 : Tests et validation parallèles (continu)**

#### Étape 4.1 : Tests de régression automatisés
```typescript
// tests/migration/regression.test.ts
describe('Migration Regression Tests', () => {
    it('should produce same results with legacy and clean architectures', async () => {
        // Test avec l'ancienne architecture
        FeatureFlags.disable('clean-lights');
        const legacyResult = await testAddLight(sampleLightData);
        
        // Test avec la nouvelle architecture
        FeatureFlags.enable('clean-lights');
        const cleanResult = await testAddLight(sampleLightData);
        
        // Les résultats doivent être équivalents
        expect(normalizeResult(cleanResult)).toEqual(normalizeResult(legacyResult));
    });
});
```

#### Étape 4.2 : Monitoring de la migration
```typescript
// migration/monitoring/MigrationMetrics.ts
export class MigrationMetrics {
    private static metrics: Record<string, number> = {};

    static trackFeatureUsage(feature: string, isClean: boolean): void {
        const key = `${feature}_${isClean ? 'clean' : 'legacy'}`;
        this.metrics[key] = (this.metrics[key] || 0) + 1;
    }

    static getReport(): MigrationReport {
        return {
            totalOperations: Object.values(this.metrics).reduce((a, b) => a + b, 0),
            cleanPercentage: this.calculateCleanPercentage(),
            featureBreakdown: this.metrics,
        };
    }
}
```

### 🧹 **Phase 5 : Nettoyage progressif (2-3 semaines)**

#### Étape 5.1 : Suppression du code legacy par feature
```bash
# Une fois que clean-lights est stable et testé
rm -rf src/legacy/commands/*Light*
rm -rf src/legacy/matcapEditor/LightModel.ts
# etc...
```

#### Étape 5.2 : Restructuration finale
```bash
# Déplacer le code clean vers la racine
mv src/clean/* src/
rmdir src/clean
rm -rf src/legacy  # Une fois tout migré
rm -rf src/migration  # Nettoyage final
```

## 🛠️ **Outils et scripts de migration**

### Script de setup initial
```bash
#!/bin/bash
# scripts/setup-migration.sh

echo "🏗️  Setting up Clean Architecture migration..."

# Create directory structure
mkdir -p src/{clean/{domain,application,infrastructure,presentation},migration/{adapters,bridges,mappers,feature-flags},shared/{types,constants,utils}}

# Move legacy code
echo "📦 Moving legacy code..."
mkdir -p src/legacy
mv src/Editor.ts src/legacy/ 2>/dev/null || true
mv src/commands src/legacy/ 2>/dev/null || true
mv src/stores src/legacy/ 2>/dev/null || true

echo "✅ Migration structure ready!"
```

### Script de validation
```typescript
// scripts/validate-migration.ts
import { exec } from 'child_process';
import { FeatureFlags } from '../src/migration/feature-flags/FeatureFlags';

async function validateMigration() {
    console.log('🧪 Running migration validation...');
    
    // Test avec legacy
    FeatureFlags.disable('clean-lights');
    await runTests('legacy');
    
    // Test avec clean
    FeatureFlags.enable('clean-lights');
    await runTests('clean');
    
    console.log('✅ Migration validation complete!');
}
```

## 🚦 **Critères de réussite de la migration**

### Métriques de validation
1. **Tests de régression** : 100% des tests passent en mode legacy ET clean
2. **Performance** : Pas de dégradation > 5% en mode clean
3. **Couverture de code** : > 90% pour le nouveau code clean
4. **Stabilité** : 0 bug critique introduit par la migration

### Points de contrôle
- ✅ **Checkpoint 1** : Entités du domaine créées et testées
- ✅ **Checkpoint 2** : Premier feature (lights) migré avec succès
- ✅ **Checkpoint 3** : UI hybride fonctionnelle
- ✅ **Checkpoint 4** : Tous les features migrés
- ✅ **Checkpoint 5** : Code legacy supprimé

Cette approche permet une **migration sûre et contrôlée** tout en maintenant la productivité de l'équipe et la stabilité de l'application.

---

## 🔍 **Corrections et précisions importantes**

### ⚠️ **Attention aux incohérences détectées**

1. **Numérotation des phases** : Les phases 6, 3, 4, 5 après la section principale doivent être renumérotées.
2. **Dépendance Inversify** : Le plan mentionne `inversify` pour l'injection de dépendances, mais ce package n'est pas installé dans le projet.
3. **Structure actuelle** : Le singleton n'est pas encore implémenté comme décrit - vérifier `Editor.ts` ligne 36-40.

### 🎯 **Phase 6 : Couche application (2-3 semaines)**

Une fois les entités stabilisées, nous implémentons la couche application :

#### Étape 6.1 : Créer les cas d'usage dans `clean/application/`
```typescript
// application/use-cases/AddLightUseCase.ts
export class AddLightUseCase {
    constructor(
        private lightRepository: LightRepository,
        private eventBus: EventBus,
    ) {}

    async execute(command: AddLightCommand): Promise<AddLightResult> {
        // Validation
        this.validateCommand(command);

        // Création de l'entité
        const light = Light.create(
            command.type,
            Position.fromCoordinates(command.x, command.y, command.z),
            LightProperties.fromCommand(command.properties),
        );

        // Sauvegarde
        await this.lightRepository.save(light);

        // Événement
        await this.eventBus.publish(new LightAddedEvent(light));

        return AddLightResult.success(light.id);
    }
}
```

#### Étape 2.2 : Implémenter le Command Bus
```typescript
// application/services/CommandBus.ts
export class CommandBus {
    private handlers = new Map<string, CommandHandler>();

    register<T extends Command>(
        commandType: new (...args: any[]) => T,
        handler: CommandHandler<T>,
    ): void {
        this.handlers.set(commandType.name, handler);
    }

    async execute<T extends Command>(command: T): Promise<any> {
        const handler = this.handlers.get(command.constructor.name);
        if (!handler) {
            throw new Error(`No handler for command ${command.constructor.name}`);
        }
        return handler.handle(command);
    }
}
```

### 🔧 **Phase 7 : Couche infrastructure (3-4 semaines)**

#### Étape 3.1 : Adaptateur Three.js
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

    async removeLight(lightId: LightId): Promise<void> {
        const threeLight = this.lights.get(lightId);
        if (threeLight) {
            this.scene.remove(threeLight);
            this.lights.delete(lightId);
        }
    }

    private createThreeLight(light: Light): THREE.Light {
        switch (light.type) {
            case LightType.RECT_AREA:
                return this.createRectAreaLight(light);
            case LightType.SPOT:
                return this.createSpotLight(light);
            // etc...
        }
    }
}
```

#### Étape 3.2 : Repository avec Pinia
```typescript
// infrastructure/repositories/PiniaLightRepository.ts
export class PiniaLightRepository implements LightRepository {
    constructor(private store: LightStore) {}

    async save(light: Light): Promise<void> {
        const dto = LightMapper.toDTO(light);
        this.store.addLight(dto);
    }

    async findAll(): Promise<Light[]> {
        const dtos = this.store.getAllLights();
        return dtos.map(dto => LightMapper.toDomain(dto));
    }

    async delete(id: LightId): Promise<void> {
        this.store.removeLight(id.value);
    }
}
```

### 🎨 **Phase 8 : Couche présentation (2-3 semaines)**

#### Étape 4.1 : Contrôleurs
```typescript
// presentation/controllers/LightController.ts
export class LightController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private presenter: LightPresenter,
    ) {}

    async addLight(request: AddLightRequest): Promise<void> {
        try {
            const command = new AddLightCommand(
                request.type,
                request.position,
                request.properties,
            );
            
            const result = await this.commandBus.execute(command);
            this.presenter.presentSuccess(result);
        } catch (error) {
            this.presenter.presentError(error);
        }
    }

    async getLights(): Promise<void> {
        const query = new GetAllLightsQuery();
        const lights = await this.queryBus.execute(query);
        this.presenter.presentLights(lights);
    }
}
```

#### Étape 4.2 : Présentateurs
```typescript
// presentation/presenters/LightPresenter.ts
export class LightPresenter {
    constructor(private viewModel: LightViewModel) {}

    presentLights(lights: Light[]): void {
        const viewLights = lights.map(light => ({
            id: light.id.value,
            type: light.type.value,
            position: {
                x: light.position.x,
                y: light.position.y,
                z: light.position.z,
            },
            properties: light.properties.toView(),
        }));

        this.viewModel.updateLights(viewLights);
    }

    presentError(error: Error): void {
        this.viewModel.setError(error.message);
    }
}
```

### 🖼️ **Phase 9 : Refactoring UI Vue.js (2-3 semaines)**

#### Étape 5.1 : Composants Vue purs
```vue
<!-- ui/components/LightPanel.vue -->
<template>
    <div class="light-panel">
        <LightList 
            :lights="lights" 
            @add-light="handleAddLight"
            @delete-light="handleDeleteLight"
        />
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { LightController } from '@/presentation/controllers/LightController';

const lightController = inject<LightController>('lightController');

const handleAddLight = (lightData: AddLightRequest) => {
    lightController?.addLight(lightData);
};
</script>
```

#### Étape 5.2 : Composables pour la logique
```typescript
// ui/composables/useLights.ts
export function useLights() {
    const lightController = inject<LightController>('lightController');
    const lightViewModel = inject<LightViewModel>('lightViewModel');

    const lights = computed(() => lightViewModel?.lights.value || []);
    const error = computed(() => lightViewModel?.error.value);

    const addLight = async (data: AddLightRequest) => {
        await lightController?.addLight(data);
    };

    const deleteLight = async (id: string) => {
        await lightController?.deleteLight(id);
    };

    return {
        lights,
        error,
        addLight,
        deleteLight,
    };
}
```

## Configuration de l'injection de dépendances

### 🔄 **Setup du container DI**

**⚠️ Note importante :** Le package `inversify` n'est pas encore installé. Il faudra l'ajouter :

```bash
npm install inversify reflect-metadata
npm install --save-dev @types/inversify
```

```typescript
// main.ts
import 'reflect-metadata'; // Requis pour inversify
import { Container } from 'inversify';
import { setupDependencies } from './di/container';

const container = new Container();
setupDependencies(container);

const app = createApp(App);

// Provide du container
app.provide('container', container);
```

### ⚙️ **Configuration des dépendances**

**⚠️ Note :** Cette configuration nécessite d'ajouter les décorateurs TypeScript et les métadonnées de réflexion.

```typescript
// di/container.ts
import { Container } from 'inversify';
import { injectable, inject } from 'inversify';

// Décorateurs nécessaires pour les classes
@injectable()
export class PiniaLightRepository implements LightRepository { /* ... */ }

@injectable() 
export class AddLightUseCase { /* ... */ }

export function setupDependencies(container: Container): void {
    // Repositories
    container.bind<LightRepository>('LightRepository').to(PiniaLightRepository);
    container.bind<ProjectRepository>('ProjectRepository').to(LocalStorageProjectRepository);

    // Use Cases
    container.bind<AddLightUseCase>('AddLightUseCase').to(AddLightUseCase);
    container.bind<DeleteLightUseCase>('DeleteLightUseCase').to(DeleteLightUseCase);

    // Services
    container.bind<CommandBus>('CommandBus').to(CommandBus).inSingletonScope();
    container.bind<QueryBus>('QueryBus').to(QueryBus).inSingletonScope();

    // Adapters
    container.bind<RenderEngine>('RenderEngine').to(ThreeJsRenderAdapter);
    container.bind<EventBus>('EventBus').to(EventBusAdapter);

    // Controllers
    container.bind<LightController>('LightController').to(LightController);
    container.bind<MaterialController>('MaterialController').to(MaterialController);
}
```

## Gestion des commandes et historique

### 🔄 **Command Pattern moderne**

```typescript
// application/commands/Command.ts
export abstract class Command {
    abstract readonly type: string;
    abstract readonly timestamp: Date;
}

export abstract class CommandHandler<T extends Command> {
    abstract handle(command: T): Promise<CommandResult>;
}
```

### 📚 **Historique découplé**

```typescript
// application/services/HistoryService.ts
export class HistoryService {
    private undoStack: CommandRecord[] = [];
    private redoStack: CommandRecord[] = [];

    async execute(command: Command): Promise<void> {
        const result = await this.commandBus.execute(command);
        
        if (result.isSuccess) {
            this.undoStack.push({
                command,
                undoCommand: result.undoCommand,
                timestamp: new Date(),
            });
            this.redoStack = []; // Clear redo stack
        }
    }

    async undo(): Promise<void> {
        const record = this.undoStack.pop();
        if (record) {
            await this.commandBus.execute(record.undoCommand);
            this.redoStack.push(record);
        }
    }

    async redo(): Promise<void> {
        const record = this.redoStack.pop();
        if (record) {
            await this.commandBus.execute(record.command);
            this.undoStack.push(record);
        }
    }
}
```

## Tests et validation

### 🧪 **Tests unitaires des entités**

```typescript
// tests/domain/entities/Light.test.ts
describe('Light Entity', () => {
    it('should create a valid light', () => {
        const position = new Position(0, 0, 1);
        const properties = LightProperties.create({ intensity: 1.0 });
        
        const light = Light.create(LightType.SPOT, position, properties);
        
        expect(light.position).toEqual(position);
        expect(light.properties.intensity).toBe(1.0);
    });

    it('should update position immutably', () => {
        const light = createTestLight();
        const newPosition = new Position(1, 1, 1);
        
        const updatedLight = light.updatePosition(newPosition);
        
        expect(updatedLight.position).toEqual(newPosition);
        expect(light.position).not.toEqual(newPosition);
    });
});
```

### 🔬 **Tests d'intégration des use cases**

```typescript
// tests/application/use-cases/AddLightUseCase.test.ts
describe('AddLightUseCase', () => {
    let useCase: AddLightUseCase;
    let mockRepository: jest.Mocked<LightRepository>;
    let mockEventBus: jest.Mocked<EventBus>;

    beforeEach(() => {
        mockRepository = createMockLightRepository();
        mockEventBus = createMockEventBus();
        useCase = new AddLightUseCase(mockRepository, mockEventBus);
    });

    it('should add a light successfully', async () => {
        const command = new AddLightCommand(
            LightType.SPOT,
            0, 0, 1,
            { intensity: 1.0 }
        );

        const result = await useCase.execute(command);

        expect(result.isSuccess).toBe(true);
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(mockEventBus.publish).toHaveBeenCalledWith(
            expect.any(LightAddedEvent)
        );
    });
});
```

## Bénéfices attendus

### ✅ **Avantages de la Clean Architecture**

1. **Testabilité maximale**
   - Entities et Use Cases testables sans dépendances externes
   - Mocking facilité des adapters
   - Tests rapides et fiables

2. **Indépendance des frameworks**
   - Domaine indépendant de Vue.js, Three.js, Tweakpane
   - Migration facilitée vers d'autres technologies
   - Réutilisabilité du code métier

3. **Séparation claire des responsabilités**
   - Chaque couche a un rôle bien défini
   - Couplage faible entre les couches
   - Facilite la maintenance

4. **Évolutivité**
   - Ajout de nouvelles fonctionnalités facilité
   - Modification des détails d'implémentation sans impact
   - Architecture extensible

5. **Qualité du code**
   - Code plus lisible et compréhensible
   - Réduction de la complexité
   - Moins de bugs en production

### 📊 **Métriques de qualité cibles**

- **Couverture de tests** : > 90%
- **Complexité cyclomatique** : < 10 par méthode
- **Couplage afférent/efférent** : Respecter la règle de dépendance
- **Duplication de code** : < 3%

### ⚠️ **Points d'attention identifiés dans l'analyse**

1. **Version Three.js** : Le projet utilise Three.js v0.163.0, mais le sous-module `three-matcap-orm-material` utilise v0.153.0
2. **Architecture actuelle** : Le singleton Editor n'est pas implémenté comme décrit dans l'analyse (pas de méthode getInstance statique)
3. **Stores Pinia** : L'état actuel est déjà bien découplé, la migration sera moins complexe que prévu
4. **Commands** : Certaines commandes dépendent déjà de Tweakpane (LightPaneFolder), confirme le problème de couplage identifié

## Timeline et ressources

### 📅 **Planning détaillé**

**⚠️ Planning mis à jour avec numérotation correcte :**

| Phase | Durée | Effort | Livrable |
|-------|-------|---------|----------|
| **Phase 1** | 1 semaine | 30-40h | Setup coexistence et feature flags |
| **Phase 2** | 2-3 semaines | 60-80h | Domaine complet (entités, value objects) |
| **Phase 3** | 6-8 semaines | 200-250h | Migration feature par feature avec ponts |
| **Phase 4** | Continu | - | Tests et validation parallèles |
| **Phase 5** | 2-3 semaines | 60-80h | Nettoyage progressif du code legacy |
| **Phase 6** | 2-3 semaines | 60-80h | Use Cases et Command Bus |
| **Phase 7** | 3-4 semaines | 80-100h | Adapters et Infrastructure |
| **Phase 8** | 2-3 semaines | 60-80h | Controllers et Presenters |
| **Phase 9** | 2-3 semaines | 60-80h | UI Vue.js refactorisée |
| **Tests & Doc** | 1-2 semaines | 40-60h | Tests complets et documentation |

**Total estimé : 18-25 semaines (650-850h)**

### 👥 **Ressources nécessaires**

- **1 Senior Developer** (architecture et domain modeling)
- **1-2 Developers** (implémentation)
- **1 Tester** (tests automatisés)

### 🎯 **Jalons critiques**

**⚠️ Jalons mis à jour :**

1. **Milestone 1** : Setup coexistence et feature flags (Phase 1)
2. **Milestone 2** : Entités du domaine validées (Phase 2)
3. **Milestone 3** : Premier feature migré avec succès (Phase 3)
4. **Milestone 4** : Use Cases opérationnels (Phase 6)
5. **Milestone 5** : Adapter Three.js fonctionnel (Phase 7)
6. **Milestone 6** : Migration UI complète (Phase 9)
7. **Milestone 7** : Tests et documentation finalisés

## Conclusion

Cette transformation vers Clean Architecture permettra au **Matcap Editor** de devenir une application :
- **Robuste** avec une architecture éprouvée
- **Testable** avec une couverture de tests élevée  
- **Maintenable** avec une séparation claire des responsabilités
- **Évolutive** avec une architecture extensible
- **Professionnelle** respectant les bonnes pratiques du développement logiciel

L'investissement initial sera significatif mais les bénéfices à long terme justifient largement cette refactoring architecturale.
