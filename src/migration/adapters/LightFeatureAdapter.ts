/**
 * Adaptateur de migration pour le système de lumières
 * 
 * Gère la transition entre l'ancien système de lumières et le nouveau
 */

import { BaseMigrationAdapter } from './BaseMigrationAdapter';
import type { FeatureFlagKey } from '@/migration/feature-flags/FeatureFlags';

// Types pour la migration des lumières
export interface LegacyLightData {
    id: string;
    type: 'RectAreaLight' | 'SpotLight' | 'DirectionalLight';
    position: { x: number; y: number; z: number };
    properties: Record<string, any>;
}

export interface CleanLightData {
    id: string;
    type: 'RECT_AREA' | 'SPOT' | 'DIRECTIONAL';
    position: { x: number; y: number; z: number };
    properties: Record<string, any>;
}

export class LightFeatureAdapter extends BaseMigrationAdapter {
    constructor() {
        super('clean-lights' as FeatureFlagKey);
    }

    /**
     * Ajouter une lumière avec fallback automatique
     */
    async addLight(lightData: LegacyLightData): Promise<string> {
        return this.executeWithFallback(
            'addLight',
            () => this.addLightClean(lightData),
            () => this.addLightLegacy(lightData)
        );
    }

    /**
     * Supprimer une lumière avec fallback automatique
     */
    async removeLight(lightId: string): Promise<void> {
        return this.executeWithFallback(
            'removeLight',
            () => this.removeLightClean(lightId),
            () => this.removeLightLegacy(lightId)
        );
    }

    /**
     * Modifier une lumière avec fallback automatique
     */
    async updateLight(lightId: string, updates: Partial<LegacyLightData>): Promise<void> {
        return this.executeWithFallback(
            'updateLight',
            () => this.updateLightClean(lightId, updates),
            () => this.updateLightLegacy(lightId, updates)
        );
    }

    /**
     * Obtenir toutes les lumières avec fallback automatique
     */
    getLights(): LegacyLightData[] {
        return this.executeWithFallbackSync(
            'getLights',
            () => this.getLightsClean(),
            () => this.getLightsLegacy()
        );
    }

    /**
     * Vérifie si l'implémentation clean est activée
     */
    isCleanEnabled(): boolean {
        return this.shouldUseCleanImplementation();
    }

    // ========== IMPLÉMENTATIONS CLEAN (à développer en Phase 2) ==========

    private async addLightClean(lightData: LegacyLightData): Promise<string> {
        this.logMigration('addLightClean', lightData);
        
        // TODO: Implémenter avec les Use Cases Clean Architecture
        // const command = new AddLightCommand(this.mapToCleanData(lightData));
        // const result = await this.addLightUseCase.execute(command);
        // return result.lightId;
        
        // Pour l'instant, fallback vers legacy
        throw new Error('Clean implementation not yet available');
    }

    private async removeLightClean(lightId: string): Promise<void> {
        this.logMigration('removeLightClean', { lightId });
        
        // TODO: Implémenter avec les Use Cases Clean Architecture
        // const command = new RemoveLightCommand(lightId);
        // await this.removeLightUseCase.execute(command);
        
        throw new Error('Clean implementation not yet available');
    }

    private async updateLightClean(lightId: string, updates: Partial<LegacyLightData>): Promise<void> {
        this.logMigration('updateLightClean', { lightId, updates });
        
        // TODO: Implémenter avec les Use Cases Clean Architecture
        // const command = new UpdateLightCommand(lightId, this.mapToCleanData(updates));
        // await this.updateLightUseCase.execute(command);
        
        throw new Error('Clean implementation not yet available');
    }

    private getLightsClean(): LegacyLightData[] {
        this.logMigration('getLightsClean');
        
        // TODO: Implémenter avec les Use Cases Clean Architecture
        // const query = new GetAllLightsQuery();
        // const lights = await this.getAllLightsUseCase.execute(query);
        // return lights.map(light => this.mapToLegacyData(light));
        
        throw new Error('Clean implementation not yet available');
    }

    // ========== IMPLÉMENTATIONS LEGACY ==========

    private async addLightLegacy(lightData: LegacyLightData): Promise<string> {
        this.logMigration('addLightLegacy', lightData);
        
        // TODO: Importer et utiliser l'ancien système
        // const { AddLightCommand } = await import('@/legacy/commands/AddLightCommand');
        // const command = new AddLightCommand(lightData);
        // return await command.execute();
        
        // Simulation pour l'instant
        return `light_${Date.now()}`;
    }

    private async removeLightLegacy(lightId: string): Promise<void> {
        this.logMigration('removeLightLegacy', { lightId });
        
        // TODO: Importer et utiliser l'ancien système
        // const { DeleteLightCommand } = await import('@/legacy/commands/DeleteLightCommand');
        // const command = new DeleteLightCommand(lightId);
        // await command.execute();
    }

    private async updateLightLegacy(lightId: string, updates: Partial<LegacyLightData>): Promise<void> {
        this.logMigration('updateLightLegacy', { lightId, updates });
        
        // TODO: Importer et utiliser l'ancien système
        // const { SetLightPropertyCommand } = await import('@/legacy/commands/SetLightPropertyCommand');
        // const command = new SetLightPropertyCommand(lightId, updates);
        // await command.execute();
    }

    private getLightsLegacy(): LegacyLightData[] {
        this.logMigration('getLightsLegacy');
        
        // TODO: Récupérer depuis l'ancien store
        // const { matcapEditorStore } = await import('@/stores/matcapEditorStore');
        // return matcapEditorStore.lights;
        
        // Simulation pour l'instant
        return [];
    }

    // ========== UTILITAIRES DE MAPPING ==========

    private mapToCleanData(legacyData: Partial<LegacyLightData>): Partial<CleanLightData> {
        const typeMapping: Record<string, string> = {
            'RectAreaLight': 'RECT_AREA',
            'SpotLight': 'SPOT',
            'DirectionalLight': 'DIRECTIONAL'
        };

        return {
            ...legacyData,
            type: legacyData.type ? typeMapping[legacyData.type] as any : undefined
        };
    }

    private mapToLegacyData(cleanData: CleanLightData): LegacyLightData {
        const typeMapping: Record<string, string> = {
            'RECT_AREA': 'RectAreaLight',
            'SPOT': 'SpotLight',
            'DIRECTIONAL': 'DirectionalLight'
        };

        return {
            ...cleanData,
            type: typeMapping[cleanData.type] as any
        };
    }
}

// Export du singleton
export const lightAdapter = new LightFeatureAdapter();
