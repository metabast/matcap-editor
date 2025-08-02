/**
 * Mapper simplifié pour les lumières
 * Version de base sans dépendances externes pour les tests
 */

// Types simplifiés pour éviter les imports
export interface SimpleCleanLight {
    id: string;
    type: 'point' | 'spot' | 'area' | 'directional' | 'ambient';
    position: { x: number; y: number; z: number };
    color: { r: number; g: number; b: number };
    intensity: number;
    visible: boolean;
    properties?: Record<string, any>;
}

export interface SimpleLegacyLight {
    type: string;
    position: { x: number; y: number; z: number };
    color: { r: number; g: number; b: number };
    intensity: number;
    visible: boolean;
    [key: string]: any;
}

/**
 * Mapper simplifié Legacy ↔ Clean
 */
export class SimpleLightMapper {
    
    static legacyToClean(legacy: SimpleLegacyLight): SimpleCleanLight {
        return {
            id: `light_${Date.now()}`,
            type: this.mapLegacyType(legacy.type),
            position: { ...legacy.position },
            color: { ...legacy.color },
            intensity: legacy.intensity,
            visible: legacy.visible,
            properties: {}
        };
    }
    
    static cleanToLegacy(clean: SimpleCleanLight): SimpleLegacyLight {
        return {
            type: this.mapCleanType(clean.type),
            position: { ...clean.position },
            color: { ...clean.color },
            intensity: clean.intensity,
            visible: clean.visible
        };
    }
    
    private static mapLegacyType(legacyType: string): SimpleCleanLight['type'] {
        switch (legacyType) {
            case 'PointLight': return 'point';
            case 'SpotLight': return 'spot';
            case 'RectAreaLight': return 'area';
            case 'DirectionalLight': return 'directional';
            case 'AmbientLight': return 'ambient';
            default: return 'point';
        }
    }
    
    private static mapCleanType(cleanType: SimpleCleanLight['type']): string {
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

/**
 * Mapper simple pour matériaux
 */
export interface SimpleCleanMaterial {
    id: string;
    type: string;
    properties: Record<string, any>;
}

export interface SimpleLegacyMaterial {
    type: string;
    [key: string]: any;
}

export class SimpleMaterialMapper {
    
    static legacyToClean(legacy: SimpleLegacyMaterial): SimpleCleanMaterial {
        return {
            id: `material_${Date.now()}`,
            type: legacy.type || 'standard',
            properties: { ...legacy }
        };
    }
    
    static cleanToLegacy(clean: SimpleCleanMaterial): SimpleLegacyMaterial {
        return {
            type: clean.type,
            ...clean.properties
        };
    }
}

/**
 * Mapper simple pour projets
 */
export interface SimpleCleanProject {
    id: string;
    name: string;
    lights: SimpleCleanLight[];
    materials: SimpleCleanMaterial[];
}

export interface SimpleLegacyProject {
    name?: string;
    lights: SimpleLegacyLight[];
    materials: SimpleLegacyMaterial[];
}

export class SimpleProjectMapper {
    
    static legacyToClean(legacy: SimpleLegacyProject): SimpleCleanProject {
        return {
            id: `project_${Date.now()}`,
            name: legacy.name || 'Untitled Project',
            lights: legacy.lights.map(l => SimpleLightMapper.legacyToClean(l)),
            materials: legacy.materials.map(m => SimpleMaterialMapper.legacyToClean(m))
        };
    }
    
    static cleanToLegacy(clean: SimpleCleanProject): SimpleLegacyProject {
        return {
            name: clean.name,
            lights: clean.lights.map(l => SimpleLightMapper.cleanToLegacy(l)),
            materials: clean.materials.map(m => SimpleMaterialMapper.cleanToLegacy(m))
        };
    }
}
