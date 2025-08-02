/**
 * Registre central des adaptateurs de migration
 * 
 * Point d'entrée unique pour accéder à tous les adaptateurs de migration
 */

import { MigrationAdapterFactory } from './BaseMigrationAdapter';
import { LightFeatureAdapter, lightAdapter } from './LightFeatureAdapter';

/**
 * Types des adaptateurs disponibles
 */
export interface MigrationAdapters {
    light: LightFeatureAdapter;
    // material: MaterialFeatureAdapter;  // À ajouter en Phase 3
    // project: ProjectFeatureAdapter;    // À ajouter en Phase 3  
    // ui: UIFeatureAdapter;              // À ajouter en Phase 3
}

/**
 * Registry central des adaptateurs
 */
export class MigrationRegistry {
    private static instance: MigrationRegistry;
    private adapters: Partial<MigrationAdapters> = {};

    private constructor() {
        this.initializeAdapters();
    }

    static getInstance(): MigrationRegistry {
        if (!this.instance) {
            this.instance = new MigrationRegistry();
        }
        return this.instance;
    }

    private initializeAdapters(): void {
        // Enregistrement des adaptateurs disponibles
        this.adapters.light = lightAdapter;
        
        // Enregistrement dans la factory
        MigrationAdapterFactory.register('light', lightAdapter);
        
        console.info('🔄 Migration adapters initialized');
    }

    /**
     * Accès aux adaptateurs
     */
    get light(): LightFeatureAdapter {
        if (!this.adapters.light) {
            throw new Error('Light adapter not initialized');
        }
        return this.adapters.light;
    }

    /**
     * Vérifie si un adaptateur est disponible
     */
    hasAdapter(name: keyof MigrationAdapters): boolean {
        return !!this.adapters[name];
    }

    /**
     * Retourne la liste des adaptateurs disponibles
     */
    getAvailableAdapters(): string[] {
        return Object.keys(this.adapters);
    }

    /**
     * Status de tous les adaptateurs
     */
    getAdaptersStatus(): Record<string, boolean> {
        const status: Record<string, boolean> = {};
        
        Object.entries(this.adapters).forEach(([name, adapter]) => {
            if (adapter && 'shouldUseCleanImplementation' in adapter) {
                status[name] = (adapter as any).shouldUseCleanImplementation();
            }
        });
        
        return status;
    }

    /**
     * Debug info
     */
    debug(): void {
        console.group('🔄 Migration Registry Status');
        console.log('Available adapters:', this.getAvailableAdapters());
        console.log('Adapters status:', this.getAdaptersStatus());
        console.groupEnd();
    }
}

/**
 * Instance singleton pour un accès facile
 */
export const migrationRegistry = MigrationRegistry.getInstance();

/**
 * Hook pour utiliser les adaptateurs dans Vue
 */
export function useMigrationAdapter() {
    return {
        light: migrationRegistry.light,
        // Autres adaptateurs seront ajoutés progressivement
        registry: migrationRegistry
    };
}
