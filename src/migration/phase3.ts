/**
 * PHASE 3 MIGRATION - EXPORTS PRINCIPAUX
 * Export des composants Clean Architecture pour les lumières
 */

import { LightFeatureFlags } from './feature-flags/LightFeatureFlags';
import { LightMigrationAdapter } from './adapters/LightMigrationAdapter';
import { LightCommandAdapter } from './adapters/LightCommandAdapter';

// ===== FEATURE FLAGS =====
export { LightFeatureFlags } from './feature-flags/LightFeatureFlags';

// ===== ADAPTERS =====
export { LightMigrationAdapter } from './adapters/LightMigrationAdapter';
export { LightCommandAdapter } from './adapters/LightCommandAdapter';

// ===== MAPPERS (Phase 2 conservés) =====
export { SimpleLightMapper } from './mappers/SimpleLightMapper';

// ===== CLEAN ARCHITECTURE (exports simplifiés) =====
export type { Light, LightType } from '../clean/domain/entities/Light';

/**
 * Factory pour charger dynamiquement les Use Cases Clean
 */
export class CleanLightFactory {
    static async createUseCases() {
        if (!LightFeatureFlags.isEnabled('clean-lights-usecases')) {
            throw new Error('Clean Light Use Cases not enabled');
        }
        
        const [
            { AddLightUseCase, DeleteLightUseCase, UpdateLightPositionUseCase },
            { PiniaLightRepository },
            { EventBusFactory }
        ] = await Promise.all([
            import('../clean/application/use-cases/LightUseCases'),
            import('../clean/infrastructure/repositories/PiniaLightRepository'),
            import('../clean/infrastructure/events/EventBus')
        ]);
        
        const repository = new PiniaLightRepository();
        const eventBus = EventBusFactory.createConfiguredEventBus();
        
        return {
            addLight: new AddLightUseCase(repository, eventBus),
            deleteLight: new DeleteLightUseCase(repository, eventBus),
            updatePosition: new UpdateLightPositionUseCase(repository, eventBus),
            repository,
            eventBus
        };
    }
}

/**
 * Status global de la migration Phase 3
 */
export function getPhase3Status() {
    return {
        featureFlags: LightFeatureFlags.getStatus(),
        adapters: {
            migration: LightMigrationAdapter.getMigrationStatus(),
            commands: LightCommandAdapter.getStatus()
        }
    };
}
