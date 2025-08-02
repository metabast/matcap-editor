/**
 * Index principal des mappers de migration
 * Assure la coexistence Legacy <-> Clean Architecture
 */

// Import des mappers simplifies pour eviter les problemes de dependances
import { 
    SimpleLightMapper, 
    SimpleMaterialMapper, 
    SimpleProjectMapper,
    type SimpleCleanLight,
    type SimpleLegacyLight,
    type SimpleCleanMaterial,
    type SimpleLegacyMaterial,
    type SimpleCleanProject,
    type SimpleLegacyProject
} from './SimpleLightMapper.js';

/**
 * Registry central des mappers
 */
export class MapperRegistry {
    private static initialized = false;
    private static mappers = new Map<string, any>();
    
    static initialize(): void {
        if (this.initialized) return;
        
        try {
            // Enregistrement des mappers simplifies
            this.mappers.set('light', SimpleLightMapper);
            this.mappers.set('material', SimpleMaterialMapper);
            this.mappers.set('project', SimpleProjectMapper);
            
            this.initialized = true;
            console.log('MapperRegistry initialise avec succes');
        } catch (error) {
            console.error('Erreur lors de initialisation du MapperRegistry:', error);
            throw error;
        }
    }
    
    static getMapper(type: string): any {
        if (!this.initialized) {
            this.initialize();
        }
        
        const mapper = this.mappers.get(type);
        if (!mapper) {
            throw new Error(`Mapper non trouve pour le type: ${type}`);
        }
        
        return mapper;
    }
    
    static isInitialized(): boolean {
        return this.initialized;
    }
    
    static getAllMappers(): string[] {
        return Array.from(this.mappers.keys());
    }
}

/**
 * Utilitaires de validation des mappers
 */
export class MapperUtils {
    
    /**
     * Valide qu'un mapper fonctionne correctement (bidirectionnel)
     */
    static validateMapper(mapperName: string): boolean {
        try {
            const mapper = MapperRegistry.getMapper(mapperName);
            
            // Test basique de conversion bidirectionnelle
            const testData = this.getTestData(mapperName);
            
            // Legacy -> Clean -> Legacy
            const clean = mapper.legacyToClean(testData.legacy);
            const backToLegacy = mapper.cleanToLegacy(clean);
            
            // Verification basique de la coherence
            if (mapperName === 'light') {
                return this.validateLightMapping(testData.legacy, backToLegacy);
            } else if (mapperName === 'material') {
                return this.validateMaterialMapping(testData.legacy, backToLegacy);
            } else if (mapperName === 'project') {
                return this.validateProjectMapping(testData.legacy, backToLegacy);
            }
            
            return true;
        } catch (error) {
            console.error(`Validation echouee pour ${mapperName}:`, error);
            return false;
        }
    }
    
    /**
     * Valide tous les mappers enregistres
     */
    static validateAllMappers(): { valid: boolean; results: Record<string, boolean> } {
        MapperRegistry.initialize();
        
        const results: Record<string, boolean> = {};
        const mapperNames = MapperRegistry.getAllMappers();
        
        for (const name of mapperNames) {
            results[name] = this.validateMapper(name);
        }
        
        const valid = Object.values(results).every(result => result);
        
        console.log('Resultats validation mappers:', results);
        
        return { valid, results };
    }
    
    // === METHODES PRIVEES ===
    
    private static getTestData(mapperName: string): any {
        switch (mapperName) {
            case 'light':
                return {
                    legacy: {
                        type: 'PointLight',
                        position: { x: 0, y: 5, z: 0 },
                        color: { r: 1, g: 1, b: 1 },
                        intensity: 1,
                        visible: true
                    }
                };
                
            case 'material':
                return {
                    legacy: {
                        type: 'MeshStandardMaterial',
                        metalness: 0.5,
                        roughness: 0.5
                    }
                };
                
            case 'project':
                return {
                    legacy: {
                        name: 'Test Project',
                        lights: [],
                        materials: []
                    }
                };
                
            default:
                return { legacy: {} };
        }
    }
    
    private static validateLightMapping(original: SimpleLegacyLight, converted: SimpleLegacyLight): boolean {
        return (
            original.type === converted.type &&
            original.position.x === converted.position.x &&
            original.position.y === converted.position.y &&
            original.position.z === converted.position.z &&
            original.intensity === converted.intensity
        );
    }
    
    private static validateMaterialMapping(original: SimpleLegacyMaterial, converted: SimpleLegacyMaterial): boolean {
        return original.type === converted.type;
    }
    
    private static validateProjectMapping(original: SimpleLegacyProject, converted: SimpleLegacyProject): boolean {
        return original.name === converted.name;
    }
}

// Exports principaux
export { 
    SimpleLightMapper as LightMapper,
    SimpleMaterialMapper as MaterialMapper, 
    SimpleProjectMapper as ProjectMapper 
};

export type {
    SimpleCleanLight as CleanLight,
    SimpleLegacyLight as LegacyLight,
    SimpleCleanMaterial as CleanMaterial,
    SimpleLegacyMaterial as LegacyMaterial,
    SimpleCleanProject as CleanProject,
    SimpleLegacyProject as LegacyProject
};
