/**
 * PHASE 3 - SCRIPT DE TEST ET DÉMONSTRATION
 * Test de l'intégration Clean Architecture pour les lumières
 */

import { LightFeatureFlags } from './feature-flags/LightFeatureFlags';
import { LightMigrationAdapter } from './adapters/LightMigrationAdapter';
import { LightCommandAdapter } from './adapters/LightCommandAdapter';
import { CleanLightFactory, getPhase3Status } from './phase3';

/**
 * Test de base des feature flags
 */
function testFeatureFlags() {
    console.log('🧪 Testing Feature Flags...');
    
    // État initial
    console.log('Initial status:', LightFeatureFlags.getStatus());
    
    // Activation progressive
    LightFeatureFlags.enable('clean-lights-domain', 100);
    LightFeatureFlags.enable('clean-lights-usecases', 50);
    LightFeatureFlags.enable('clean-lights-commands', 25);
    
    console.log('After enabling:', LightFeatureFlags.getStatus());
    
    // Test de rollout progressif
    const domainRollouts = [];
    for (let i = 0; i < 10; i++) {
        domainRollouts.push(LightFeatureFlags.isEnabled('clean-lights-usecases'));
    }
    
    const enabledCount = domainRollouts.filter(Boolean).length;
    console.log(`Rollout test (50%): ${enabledCount}/10 enabled (expected ~5)`);
}

/**
 * Test de l'adapter de migration
 */
async function testMigrationAdapter() {
    console.log('🧪 Testing Migration Adapter...');
    
    // Mock Editor et LightModel
    const mockEditor = {
        addLight: (light: any) => {
            console.log('Legacy addLight called with:', light.type);
            return { uuid: 'legacy-light-1' };
        },
        deleteLight: (lightModel: any) => {
            console.log('Legacy deleteLight called for:', lightModel.light.uuid);
        }
    };
    
    const mockLightModel = {
        light: {
            uuid: 'test-light-1',
            type: 'PointLight',
            position: { x: 1, y: 2, z: 3 },
            intensity: 1.0,
            color: { r: 1, g: 1, b: 1 }
        }
    };
    
    try {
        // Test addLight
        await LightMigrationAdapter.addLight(mockEditor as any, mockLightModel as any);
        
        // Test deleteLight
        await LightMigrationAdapter.deleteLight(mockEditor as any, mockLightModel as any);
        
        console.log('Migration adapter test completed');
        
    } catch (error) {
        console.error('Migration adapter test failed:', error);
    }
}

/**
 * Test de l'adapter de commandes
 */
async function testCommandAdapter() {
    console.log('🧪 Testing Command Adapter...');
    
    const mockCommand = {
        execute: () => console.log('Legacy command executed')
    };
    
    const mockEditor = {};
    const mockLightModel = {
        light: {
            uuid: 'test-light-2',
            type: 'SpotLight',
            position: { x: 5, y: 6, z: 7 },
            intensity: 1.5,
            color: { r: 0.8, g: 0.9, b: 1.0 }
        }
    };
    
    try {
        // Test AddLightCommand
        await LightCommandAdapter.handleAddLightCommand(
            mockCommand as any,
            mockEditor as any,
            mockLightModel as any
        );
        
        // Test DeleteLightCommand
        await LightCommandAdapter.handleDeleteLightCommand(
            mockCommand as any,
            mockEditor as any,
            mockLightModel as any
        );
        
        console.log('Command adapter test completed');
        
    } catch (error) {
        console.error('Command adapter test failed:', error);
    }
}

/**
 * Test des Use Cases Clean (si activés)
 */
async function testCleanUseCases() {
    console.log('🧪 Testing Clean Use Cases...');
    
    if (!LightFeatureFlags.isEnabled('clean-lights-usecases')) {
        console.log('Clean Use Cases not enabled, skipping test');
        return;
    }
    
    try {
        const { addLight, deleteLight, updatePosition } = await CleanLightFactory.createUseCases();
        
        // Test AddLight
        const addResult = await addLight.execute({
            type: 'point',
            position: { x: 10, y: 11, z: 12 },
            intensity: 2.0,
            color: { r: 1, g: 0.5, b: 0.2 }
        });
        
        console.log('AddLight result:', addResult);
        
        if (addResult.success && addResult.lightId) {
            // Test UpdatePosition
            const updateResult = await updatePosition.execute({
                lightId: addResult.lightId,
                position: { x: 15, y: 16, z: 17 }
            });
            
            console.log('UpdatePosition result:', updateResult);
            
            // Test DeleteLight
            const deleteResult = await deleteLight.execute(addResult.lightId);
            console.log('DeleteLight result:', deleteResult);
        }
        
        console.log('Clean Use Cases test completed');
        
    } catch (error) {
        console.error('Clean Use Cases test failed:', error);
    }
}

/**
 * Fonction principale de test
 */
export async function runPhase3Tests() {
    console.log('🚀 PHASE 3 MIGRATION TESTS STARTING');
    console.log('=====================================');
    
    // Test des feature flags
    testFeatureFlags();
    console.log('');
    
    // Test des adapters
    await testMigrationAdapter();
    console.log('');
    
    await testCommandAdapter();
    console.log('');
    
    // Test des Use Cases
    await testCleanUseCases();
    console.log('');
    
    // Status final
    console.log('📊 FINAL PHASE 3 STATUS:');
    console.log(JSON.stringify(getPhase3Status(), null, 2));
    
    console.log('=====================================');
    console.log('🎉 PHASE 3 TESTS COMPLETED');
}

/**
 * Script de démonstration rapide
 */
export function quickDemo() {
    console.log('⚡ Quick Phase 3 Demo');
    
    // Activation complète
    LightFeatureFlags.enable('clean-lights-domain', 100);
    LightFeatureFlags.enable('clean-lights-usecases', 100);
    LightFeatureFlags.enable('clean-lights-commands', 100);
    
    console.log('✅ All Phase 3 features enabled');
    console.log('Status:', getPhase3Status());
}

// Auto-run si exécuté directement
if (typeof process !== 'undefined' && process.argv?.[1]?.includes('phase3-test')) {
    runPhase3Tests().catch(console.error);
}
