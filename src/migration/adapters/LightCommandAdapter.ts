/**
 * PHASE 3 - ADAPTATEUR DE COMMANDES LUMIÈRES
 * Intercepte les commandes legacy et les redirige vers Clean Architecture
 */

import { LightFeatureFlags } from '../feature-flags/LightFeatureFlags';
import type { Command } from '@/legacy/commons/Command';
import type Editor from '@/legacy/Editor';
import type LightModel from '@/legacy/matcapEditor/LightModel';

// Imports Clean Architecture (chargés dynamiquement)
let AddLightUseCase: any, DeleteLightUseCase: any, UpdateLightPositionUseCase: any;
let PiniaLightRepository: any, EventBusFactory: any;

/**
 * Adaptateur pour intercepter et rediriger les commandes de lumières
 */
export class LightCommandAdapter {
    private static initialized = false;
    private static useCases: {
        addLight?: any;
        deleteLight?: any;
        updatePosition?: any;
    } = {};
    
    /**
     * Initialise l'adaptateur avec les Use Cases Clean
     */
    static async initialize(): Promise<void> {
        if (this.initialized) return;
        
        if (LightFeatureFlags.isEnabled('clean-lights-usecases')) {
            try {
                // Import dynamique des Use Cases
                const useCasesModule = await import('@/clean/application/use-cases/LightUseCases');
                AddLightUseCase = useCasesModule.AddLightUseCase;
                DeleteLightUseCase = useCasesModule.DeleteLightUseCase;
                UpdateLightPositionUseCase = useCasesModule.UpdateLightPositionUseCase;
                
                // Import des repositories et event bus
                const { PiniaLightRepository: Repository } = await import('@/clean/infrastructure/repositories/PiniaLightRepository');
                const { EventBusFactory: Factory } = await import('@/clean/infrastructure/events/EventBus');
                
                PiniaLightRepository = Repository;
                EventBusFactory = Factory;
                
                // Initialisation des Use Cases
                const repository = new PiniaLightRepository();
                const eventBus = EventBusFactory.createConfiguredEventBus();
                
                this.useCases = {
                    addLight: new AddLightUseCase(repository, eventBus),
                    deleteLight: new DeleteLightUseCase(repository, eventBus),
                    updatePosition: new UpdateLightPositionUseCase(repository, eventBus)
                };
                
                console.log('🎯 Clean Light Use Cases initialized');
            } catch (error) {
                console.error('Failed to initialize Clean Light Use Cases:', error);
            }
        }
        
        this.initialized = true;
    }
    
    /**
     * Intercepte AddLightCommand
     */
    static async handleAddLightCommand(
        originalCommand: Command,
        editor: Editor,
        lightModel: LightModel
    ): Promise<void> {
        await this.initialize();
        
        if (this.useCases.addLight && LightFeatureFlags.isEnabled('clean-lights-commands')) {
            return this.handleAddLightClean(lightModel);
        } else {
            return this.handleAddLightLegacy(originalCommand);
        }
    }
    
    /**
     * Intercepte DeleteLightCommand
     */
    static async handleDeleteLightCommand(
        originalCommand: Command,
        editor: Editor,
        lightModel: LightModel
    ): Promise<void> {
        await this.initialize();
        
        if (this.useCases.deleteLight && LightFeatureFlags.isEnabled('clean-lights-commands')) {
            return this.handleDeleteLightClean(lightModel);
        } else {
            return this.handleDeleteLightLegacy(originalCommand);
        }
    }
    
    /**
     * Intercepte SetLightPositionCommand
     */
    static async handleUpdateLightPositionCommand(
        originalCommand: Command,
        editor: Editor,
        lightModel: LightModel,
        positions: any
    ): Promise<void> {
        await this.initialize();
        
        if (this.useCases.updatePosition && LightFeatureFlags.isEnabled('clean-lights-commands')) {
            return this.handleUpdateLightPositionClean(lightModel, positions);
        } else {
            return this.handleUpdateLightPositionLegacy(originalCommand);
        }
    }
    
    // === MÉTHODES CLEAN ===
    
    private static async handleAddLightClean(lightModel: LightModel): Promise<void> {
        try {
            const threeLight = lightModel.light;
            
            // Création de la commande Clean
            const command = {
                type: this.mapLegacyTypeToClean(threeLight.type),
                position: {
                    x: threeLight.position.x,
                    y: threeLight.position.y,
                    z: threeLight.position.z
                },
                intensity: threeLight.intensity,
                color: {
                    r: threeLight.color.r,
                    g: threeLight.color.g,
                    b: threeLight.color.b
                }
            };
            
            // Exécution du Use Case
            const result = await this.useCases.addLight.execute(command);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            console.log('✨ Clean: Light added via Use Case', result.lightId);
            
        } catch (error) {
            console.error('Error in Clean add light:', error);
            throw error;
        }
    }
    
    private static async handleDeleteLightClean(lightModel: LightModel): Promise<void> {
        try {
            const lightId = lightModel.light.uuid;
            
            // Exécution du Use Case
            const result = await this.useCases.deleteLight.execute(lightId);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            console.log('✨ Clean: Light deleted via Use Case', lightId);
            
        } catch (error) {
            console.error('Error in Clean delete light:', error);
            throw error;
        }
    }
    
    private static async handleUpdateLightPositionClean(
        lightModel: LightModel,
        positions: any
    ): Promise<void> {
        try {
            const command = {
                lightId: lightModel.light.uuid,
                position: {
                    x: positions.position.x,
                    y: positions.position.y,
                    z: positions.position.z
                }
            };
            
            // Exécution du Use Case
            const result = await this.useCases.updatePosition.execute(command);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            console.log('✨ Clean: Light position updated via Use Case', command.lightId);
            
        } catch (error) {
            console.error('Error in Clean update light position:', error);
            throw error;
        }
    }
    
    // === MÉTHODES LEGACY (fallback) ===
    
    private static handleAddLightLegacy(originalCommand: Command): void {
        console.log('📦 Legacy: Executing AddLightCommand');
        originalCommand.execute();
    }
    
    private static handleDeleteLightLegacy(originalCommand: Command): void {
        console.log('📦 Legacy: Executing DeleteLightCommand');
        originalCommand.execute();
    }
    
    private static handleUpdateLightPositionLegacy(originalCommand: Command): void {
        console.log('📦 Legacy: Executing SetLightPositionCommand');
        originalCommand.execute();
    }
    
    // === UTILITAIRES ===
    
    private static mapLegacyTypeToClean(legacyType: string): string {
        switch (legacyType) {
            case 'PointLight': return 'point';
            case 'SpotLight': return 'spot';
            case 'RectAreaLight': return 'area';
            case 'DirectionalLight': return 'directional';
            case 'AmbientLight': return 'ambient';
            default: return 'point';
        }
    }
    
    /**
     * Status de l'adaptateur
     */
    static getStatus(): {
        initialized: boolean;
        useCasesLoaded: boolean;
        activeFlags: Record<string, boolean>;
    } {
        return {
            initialized: this.initialized,
            useCasesLoaded: !!this.useCases.addLight,
            activeFlags: LightFeatureFlags.getStatus()
        };
    }
}
