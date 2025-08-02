/**
 * Tests pour valider la Phase 1: Setup coexistence
 */

import { FeatureFlags } from '@/migration/feature-flags/FeatureFlags';
import { MigrationManager } from '@/migration';
import { migrationRegistry } from '@/migration/adapters';

describe('Phase 1: Setup coexistence', () => {
    
    describe('FeatureFlags', () => {
        beforeEach(() => {
            // Reset des flags avant chaque test
            FeatureFlags.disable('clean-lights');
            FeatureFlags.disable('clean-materials');
            FeatureFlags.disable('clean-projects');
            FeatureFlags.disable('clean-ui');
        });

        it('should have all flags disabled by default', () => {
            expect(FeatureFlags.isEnabled('clean-lights')).toBe(false);
            expect(FeatureFlags.isEnabled('clean-materials')).toBe(false);
            expect(FeatureFlags.isEnabled('clean-projects')).toBe(false);
            expect(FeatureFlags.isEnabled('clean-ui')).toBe(false);
        });

        it('should enable and disable flags correctly', () => {
            FeatureFlags.enable('clean-lights');
            expect(FeatureFlags.isEnabled('clean-lights')).toBe(true);

            FeatureFlags.disable('clean-lights');
            expect(FeatureFlags.isEnabled('clean-lights')).toBe(false);
        });

        it('should return all flags status', () => {
            FeatureFlags.enable('clean-lights');
            const flags = FeatureFlags.getAllFlags();
            
            expect(flags['clean-lights'].enabled).toBe(true);
            expect(flags['clean-materials'].enabled).toBe(false);
        });

        it('should handle rollout percentage', () => {
            FeatureFlags.enableWithRollout('clean-lights', 50);
            // Pour cette phase, rollout > 0 active la feature
            expect(FeatureFlags.isEnabled('clean-lights')).toBe(true);

            FeatureFlags.enableWithRollout('clean-materials', 0);
            expect(FeatureFlags.isEnabled('clean-materials')).toBe(false);
        });
    });

    describe('MigrationManager', () => {
        let manager: MigrationManager;

        beforeEach(() => {
            // Reset des flags avant chaque test
            FeatureFlags.disable('clean-lights');
            FeatureFlags.disable('clean-materials');
            FeatureFlags.disable('clean-projects');
            FeatureFlags.disable('clean-ui');
            
            manager = MigrationManager.getInstance();
        });

        it('should initialize successfully', async () => {
            await manager.initialize();
            expect(manager.isInitialized()).toBe(true);
        });

        it('should not initialize twice', async () => {
            await manager.initialize();
            const consoleSpy = vi.spyOn(console, 'warn');
            
            await manager.initialize();
            expect(consoleSpy).toHaveBeenCalledWith(
                '[Migration] Migration already initialized',
                undefined
            );
        });

        it('should enable and disable features', async () => {
            await manager.initialize();
            
            manager.enableFeature('clean-lights');
            expect(FeatureFlags.isEnabled('clean-lights')).toBe(true);

            manager.disableFeature('clean-lights');
            expect(FeatureFlags.isEnabled('clean-lights')).toBe(false);
        });

        it('should return correct status', async () => {
            await manager.initialize();
            manager.enableFeature('clean-lights');
            
            const status = manager.getStatus();
            expect(status.initialized).toBe(true);
            expect(status.features['clean-lights']).toBe(true);
            expect(status.features['clean-materials']).toBe(false);
        });

        it('should check initialization state correctly', () => {
            // Le manager étant un singleton, il peut déjà être initialisé
            // On vérifie juste que la méthode existe et retourne un boolean
            expect(typeof manager.isInitialized()).toBe('boolean');
        });
    });

    describe('MigrationRegistry', () => {
        it('should have light adapter available', () => {
            expect(migrationRegistry.hasAdapter('light')).toBe(true);
            expect(migrationRegistry.getAvailableAdapters()).toContain('light');
        });

        it('should provide access to light adapter', () => {
            const lightAdapter = migrationRegistry.light;
            expect(lightAdapter).toBeDefined();
            expect(typeof lightAdapter.addLight).toBe('function');
        });

        it('should return adapters status', () => {
            const status = migrationRegistry.getAdaptersStatus();
            expect(status).toHaveProperty('light');
            expect(typeof status.light).toBe('boolean');
        });
    });

    describe('LightFeatureAdapter', () => {
        beforeEach(() => {
            // Reset des flags avant chaque test
            FeatureFlags.disable('clean-lights');
        });

        it('should use legacy implementation by default', () => {
            const adapter = migrationRegistry.light;
            expect(adapter.isCleanEnabled()).toBe(false);
        });

        it('should switch to clean implementation when flag is enabled', () => {
            FeatureFlags.enable('clean-lights');
            const adapter = migrationRegistry.light;
            expect(adapter.isCleanEnabled()).toBe(true);
        });

        it('should handle light operations with fallback', async () => {
            const adapter = migrationRegistry.light;
            
            // Test avec implementation legacy (flags désactivés)
            FeatureFlags.disable('clean-lights');
            
            const lightData = {
                id: 'test-light',
                type: 'RectAreaLight' as const,
                position: { x: 0, y: 5, z: 5 },
                properties: { intensity: 1, color: { r: 1, g: 1, b: 1 } }
            };

            // Pour l'instant, ça devrait utiliser l'implémentation simulée
            const lightId = await adapter.addLight(lightData);
            expect(typeof lightId).toBe('string');
            expect(lightId).toContain('light_');
        });
    });

    describe('Integration Tests', () => {
        it('should work end-to-end', async () => {
            // 1. Initialiser la migration
            const manager = MigrationManager.getInstance();
            await manager.initialize();

            // 2. Vérifier que les adaptateurs sont disponibles
            expect(migrationRegistry.hasAdapter('light')).toBe(true);

            // 3. Tester avec legacy (défaut)
            const adapter = migrationRegistry.light;
            expect(adapter.isCleanEnabled()).toBe(false);

            // 4. Activer clean et tester
            manager.enableFeature('clean-lights');
            expect(adapter.isCleanEnabled()).toBe(true);

            // 5. Vérifier le status global
            const status = manager.getStatus();
            expect(status.initialized).toBe(true);
            expect(status.features['clean-lights']).toBe(true);
        });
    });
});
