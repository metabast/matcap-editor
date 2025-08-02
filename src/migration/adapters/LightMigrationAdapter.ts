/**
 * PHASE 3 - ADAPTATEUR DE MIGRATION DES LUMIÈRES
 * Pont entre l'ancien système Legacy et la nouvelle Clean Architecture
 */

import { LightFeatureFlags } from '../feature-flags/LightFeatureFlags';
import type LightModel from '@/legacy/matcapEditor/LightModel';
import type Editor from '@/legacy/Editor';
import type { LightModelPositions } from '@/ts/types/PanesTypes';

// Import conditionnel des entités Clean (si activées)
let Light: any, LightType: any, Position: any, Rotation: any, Transform: any, Intensity: any, Color: any, LightId: any;

/**
 * Adaptateur principal pour la migration des lumières
 */
export class LightMigrationAdapter {
    private static initialized = false;
    
    /**
     * Initialise l'adaptateur selon les feature flags
     */
    static async initialize(): Promise<void> {
        if (this.initialized) return;
        
        if (LightFeatureFlags.isEnabled('clean-lights-domain')) {
            // Import dynamique des entités Clean quand activées
            const cleanModule = await import('@/clean/domain/entities/Light');
            const transformModule = await import('@/clean/domain/value-objects/Transform');
            const lightPropsModule = await import('@/clean/domain/value-objects/LightProperties');
            const colorModule = await import('@/clean/domain/value-objects/Color');
            const entityIdModule = await import('@/clean/domain/value-objects/EntityId');
            
            Light = cleanModule.Light;
            LightType = cleanModule.LightType;
            Position = transformModule.Position;
            Rotation = transformModule.Rotation;
            Transform = transformModule.Transform;
            Intensity = lightPropsModule.Intensity;
            Color = colorModule.Color;
            LightId = entityIdModule.LightId;
            
            console.log('🎯 Clean Light Domain entities loaded');
        }
        
        this.initialized = true;
    }
    
    /**
     * Gestion hybride : Add Light
     */
    static async handleAddLight(editor: Editor, lightModel: LightModel): Promise<void> {
        await this.initialize();
        
        if (LightFeatureFlags.isEnabled('clean-lights-usecases')) {
            return this.handleAddLightClean(editor, lightModel);
        } else {
            return this.handleAddLightLegacy(editor, lightModel);
        }
    }
    
    /**
     * Gestion hybride : Delete Light
     */
    static async handleDeleteLight(editor: Editor, lightModel: LightModel): Promise<void> {
        await this.initialize();
        
        if (LightFeatureFlags.isEnabled('clean-lights-usecases')) {
            return this.handleDeleteLightClean(editor, lightModel);
        } else {
            return this.handleDeleteLightLegacy(editor, lightModel);
        }
    }
    
    /**
     * Gestion hybride : Update Light Position
     */
    static async handleUpdateLightPosition(
        editor: Editor, 
        lightModel: LightModel, 
        positions: LightModelPositions
    ): Promise<void> {
        await this.initialize();
        
        if (LightFeatureFlags.isEnabled('clean-lights-usecases')) {
            return this.handleUpdateLightPositionClean(editor, lightModel, positions);
        } else {
            return this.handleUpdateLightPositionLegacy(editor, lightModel, positions);
        }
    }
    
    // === MÉTHODES LEGACY (comportement actuel) ===
    
    private static handleAddLightLegacy(editor: Editor, lightModel: LightModel): void {
        // Comportement actuel sans modification
        editor.matcapEditorWorld.scene.add(lightModel.light);
        
        if (lightModel.light.type === 'SpotLight') {
            const spotLight = lightModel.light as any;
            editor.matcapEditorWorld.scene.add(spotLight.target);
        }
        
        console.log('📦 Legacy: Light added', lightModel.light.type);
    }
    
    private static handleDeleteLightLegacy(editor: Editor, lightModel: LightModel): void {
        // Comportement actuel
        editor.matcapEditorWorld.content.deleteLight(lightModel);
        console.log('📦 Legacy: Light deleted', lightModel.light.type);
    }
    
    private static handleUpdateLightPositionLegacy(
        editor: Editor, 
        lightModel: LightModel, 
        positions: LightModelPositions
    ): void {
        // Comportement actuel
        lightModel.screenPosition = positions.screenPosition;
        lightModel.setPositionX(positions.position.x);
        lightModel.setPositionY(positions.position.y);
        lightModel.setPositionZ(positions.position.z);
        lightModel.update();
        
        console.log('📦 Legacy: Light position updated');
    }
    
    // === MÉTHODES CLEAN (nouvelle architecture) ===
    
    private static async handleAddLightClean(editor: Editor, lightModel: LightModel): Promise<void> {
        if (!Light) {
            console.warn('Clean Light entities not loaded, falling back to legacy');
            return this.handleAddLightLegacy(editor, lightModel);
        }
        
        try {
            // Conversion LightModel -> Clean Light Entity
            const cleanLight = this.convertLegacyToClean(lightModel);
            
            // TODO: Utiliser AddLightUseCase quand implémenté
            console.log('✨ Clean: Light entity created', cleanLight);
            
            // Fallback vers legacy pour le moment
            this.handleAddLightLegacy(editor, lightModel);
            
        } catch (error) {
            console.error('Error in clean light handling, falling back to legacy:', error);
            this.handleAddLightLegacy(editor, lightModel);
        }
    }
    
    private static async handleDeleteLightClean(editor: Editor, lightModel: LightModel): Promise<void> {
        try {
            // TODO: Utiliser DeleteLightUseCase quand implémenté
            console.log('✨ Clean: Light delete use case (TODO)');
            
            // Fallback vers legacy pour le moment
            this.handleDeleteLightLegacy(editor, lightModel);
            
        } catch (error) {
            console.error('Error in clean light deletion, falling back to legacy:', error);
            this.handleDeleteLightLegacy(editor, lightModel);
        }
    }
    
    private static async handleUpdateLightPositionClean(
        editor: Editor, 
        lightModel: LightModel, 
        positions: LightModelPositions
    ): Promise<void> {
        try {
            // TODO: Utiliser UpdateLightPositionUseCase quand implémenté
            console.log('✨ Clean: Light position update use case (TODO)');
            
            // Fallback vers legacy pour le moment
            this.handleUpdateLightPositionLegacy(editor, lightModel, positions);
            
        } catch (error) {
            console.error('Error in clean light position update, falling back to legacy:', error);
            this.handleUpdateLightPositionLegacy(editor, lightModel, positions);
        }
    }
    
    // === UTILITAIRES DE CONVERSION ===
    
    /**
     * Convertit un LightModel legacy vers une entité Clean Light
     */
    private static convertLegacyToClean(lightModel: LightModel): any {
        if (!Light || !Position || !Rotation || !Transform || !Intensity || !Color || !LightId) {
            throw new Error('Clean entities not available');
        }
        
        const threeLight = lightModel.light;
        
        // Création des Value Objects
        const position = Position.create(
            threeLight.position.x,
            threeLight.position.y,
            threeLight.position.z
        );
        
        const rotation = Rotation.zero();
        const transform = Transform.create(position, rotation);
        
        const intensity = Intensity.create(threeLight.intensity);
        const color = Color.create(
            threeLight.color.r,
            threeLight.color.g,
            threeLight.color.b
        );
        
        // Création d'un ID et nom pour la lumière migrée
        const lightId = LightId.create();
        const lightName = `migrated-${threeLight.type}-${lightId.toString().slice(0, 8)}`;
        
        // Factory method selon le type
        switch (threeLight.type) {
            case 'PointLight':
                return Light.createPoint(lightId, lightName, transform, color, intensity);
            case 'SpotLight':
                return Light.createSpot(lightId, lightName, transform, color, intensity);
            case 'RectAreaLight':
                return Light.createArea(lightId, lightName, transform, color, intensity);
            default:
                throw new Error(`Unsupported light type: ${threeLight.type}`);
        }
    }
    
    /**
     * Convertit une entité Clean Light vers LightModel legacy
     */
    private static convertCleanToLegacy(cleanLight: any): LightModel {
        // TODO: Implémenter la conversion inverse
        throw new Error('Clean to Legacy conversion not implemented yet');
    }
    
    /**
     * Status de la migration
     */
    static getMigrationStatus(): {
        initialized: boolean;
        cleanEntitiesLoaded: boolean;
        activeFlags: Record<string, boolean>;
    } {
        return {
            initialized: this.initialized,
            cleanEntitiesLoaded: !!Light,
            activeFlags: LightFeatureFlags.getStatus()
        };
    }
}
