/**
 * PHASE 3 - REPOSITORY IMPLEMENTATION POUR PINIA
 * Infrastructure layer - Adaptation vers le store Pinia existant
 */

import { Light as DomainLight } from '@/clean/domain/entities/Light';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import type LightModel from '@/legacy/matcapEditor/LightModel';
import type { LightRepository } from '@/clean/application/use-cases/LightUseCases';

/**
 * Implémentation du LightRepository utilisant le store Pinia existant
 * Fait le pont entre Clean Architecture et l'infrastructure legacy
 */
export class PiniaLightRepository implements LightRepository {
    private store = matcapEditorStore();
    
    async save(light: DomainLight): Promise<void> {
        try {
            // Conversion Light entity -> LightModel legacy
            const lightModel = this.convertCleanLightToLegacy(light);
            
            // Ajout dans le store Pinia
            this.store.addLight(lightModel);
            
            console.log('💾 Light saved to Pinia store:', light.id.toString());
        } catch (error) {
            console.error('Error saving light to Pinia store:', error);
            throw new Error(`Failed to save light: ${error}`);
        }
    }
    
    async findById(id: string): Promise<DomainLight | null> {
        try {
            // Recherche dans le store Pinia
            const lightModel = this.store.lights.find((l: any) => 
                this.getLightModelId(l) === id
            );
            
            if (!lightModel) {
                return null;
            }
            
            // Conversion LightModel legacy -> Light entity
            return this.convertLegacyLightToClean(lightModel);
            
        } catch (error) {
            console.error('Error finding light by id:', error);
            return null;
        }
    }
    
    async findAll(): Promise<DomainLight[]> {
        try {
            // Récupération depuis le store Pinia
            const lightModels = this.store.lights;
            
            // Conversion de tous les LightModel -> Light entities
            const lights: DomainLight[] = [];
            for (const lightModel of lightModels) {
                try {
                    const light = this.convertLegacyLightToClean(lightModel as any);
                    lights.push(light);
                } catch (error) {
                    console.warn('Failed to convert legacy light:', error);
                }
            }
            
            return lights;
            
        } catch (error) {
            console.error('Error getting all lights:', error);
            throw new Error(`Failed to get lights: ${error}`);
        }
    }
    
    async delete(id: string): Promise<void> {
        try {
            // Recherche du LightModel correspondant
            const lightModel = this.store.lights.find((l: any) => 
                this.getLightModelId(l) === id
            );
            
            if (!lightModel) {
                throw new Error(`Light with id ${id} not found`);
            }
            
            // Suppression du store Pinia
            this.store.removeLight(lightModel as any);
            
            console.log('🗑️ Light deleted from Pinia store:', id);
        } catch (error) {
            console.error('Error deleting light:', error);
            throw error;
        }
    }
    
    async update(light: DomainLight): Promise<void> {
        try {
            const id = light.id.toString();
            
            // Recherche et suppression de l'ancien
            await this.delete(id);
            
            // Ajout de la nouvelle version
            await this.save(light);
            
            console.log('🔄 Light updated in Pinia store:', id);
        } catch (error) {
            console.error('Error updating light:', error);
            throw new Error(`Failed to update light: ${error}`);
        }
    }
    
    // === MÉTHODES PRIVÉES DE CONVERSION ===
    
    /**
     * Convertit une entité Clean Light vers un LightModel legacy
     */
    private convertCleanLightToLegacy(light: DomainLight): LightModel {
        // TODO: Utiliser le mapper bidirectionnel existant
        // Pour l'instant, simulation basique
        const transform = light.transform;
        const position = transform ? {
            x: transform.position.x,
            y: transform.position.y,
            z: transform.position.z
        } : { x: 0, y: 0, z: 0 };
        
        const mockLightModel = {
            light: {
                type: this.mapCleanTypeToLegacy(light.type),
                position,
                intensity: light.intensity.value,
                color: {
                    r: light.color.r,
                    g: light.color.g,
                    b: light.color.b
                },
                uuid: light.id.toString()
            },
            screenPosition: { x: 0, y: 0 }, // TODO: calculer la position écran
            distance: 1,
            front: true
        } as any;
        
        return mockLightModel;
    }
    
    /**
     * Convertit un LightModel legacy vers une entité Clean Light
     */
    private convertLegacyLightToClean(lightModel: any): DomainLight {
        // Utilisation du mapper simplifié existant
        const { SimpleLightMapper } = require('@/migration/mappers/SimpleLightMapper');
        
        // Conversion via le mapper existant
        const simpleLegacyLight = {
            type: lightModel.light.type,
            position: {
                x: lightModel.light.position.x,
                y: lightModel.light.position.y,
                z: lightModel.light.position.z
            },
            color: {
                r: lightModel.light.color.r,
                g: lightModel.light.color.g,
                b: lightModel.light.color.b
            },
            intensity: lightModel.light.intensity,
            visible: true
        };
        
        const simpleCleanLight = SimpleLightMapper.legacyToClean(simpleLegacyLight);
        
        // Conversion vers l'entité Clean complète
        const { Light: CleanLight, Position, Intensity, Color } = require('@/clean/domain/entities/Light');
        
        const position = Position.create(
            simpleCleanLight.position.x,
            simpleCleanLight.position.y,
            simpleCleanLight.position.z
        );
        
        const intensity = Intensity.create(simpleCleanLight.intensity);
        const color = Color.create(
            simpleCleanLight.color.r,
            simpleCleanLight.color.g,
            simpleCleanLight.color.b
        );
        
        switch (simpleCleanLight.type) {
            case 'point':
                return CleanLight.createPoint(position, intensity, color);
            case 'spot':
                return CleanLight.createSpot(position, intensity, color);
            case 'area':
                return CleanLight.createArea(position, intensity, color);
            default:
                throw new Error(`Unsupported light type: ${simpleCleanLight.type}`);
        }
    }
    
    /**
     * Génère un ID pour un LightModel legacy
     */
    private getLightModelId(lightModel: any): string {
        // Utilise l'UUID de la lumière Three.js comme ID
        return lightModel.light.uuid;
    }
    
    /**
     * Mappe les types Clean vers Legacy
     */
    private mapCleanTypeToLegacy(cleanType: string): string {
        switch (cleanType) {
            case 'point': return 'PointLight';
            case 'spot': return 'SpotLight';
            case 'area': return 'RectAreaLight';
            case 'directional': return 'DirectionalLight';
            case 'ambient': return 'AmbientLight';
            default: return 'PointLight';
        }
    }
}
