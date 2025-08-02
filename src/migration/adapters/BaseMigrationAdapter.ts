/**
 * Adaptateur de base pour la migration
 * 
 * Fournit les fonctionnalités communes pour tous les adaptateurs de migration
 */

import { FeatureFlags, type FeatureFlagKey } from '@/migration/feature-flags/FeatureFlags';

export abstract class BaseMigrationAdapter {
    protected featureFlag: FeatureFlagKey;

    constructor(featureFlag: FeatureFlagKey) {
        this.featureFlag = featureFlag;
    }

    /**
     * Détermine si on doit utiliser la nouvelle implémentation ou l'ancienne
     */
    protected shouldUseCleanImplementation(): boolean {
        return FeatureFlags.isEnabled(this.featureFlag);
    }

    /**
     * Exécute une opération avec fallback automatique
     */
    protected async executeWithFallback<T>(
        operation: string,
        cleanImplementation: () => Promise<T>,
        legacyImplementation: () => Promise<T>
    ): Promise<T> {
        try {
            if (this.shouldUseCleanImplementation()) {
                console.debug(`🔄 Using clean implementation for ${operation}`);
                return await cleanImplementation();
            } else {
                console.debug(`📦 Using legacy implementation for ${operation}`);
                return await legacyImplementation();
            }
        } catch (error) {
            console.error(`❌ Error in ${operation}:`, error);
            
            // Si l'implémentation clean échoue, fallback vers legacy
            if (this.shouldUseCleanImplementation()) {
                console.warn(`🔄 Clean implementation failed, falling back to legacy for ${operation}`);
                return await legacyImplementation();
            }
            
            throw error;
        }
    }

    /**
     * Exécute une opération synchrone avec fallback
     */
    protected executeWithFallbackSync<T>(
        operation: string,
        cleanImplementation: () => T,
        legacyImplementation: () => T
    ): T {
        try {
            if (this.shouldUseCleanImplementation()) {
                console.debug(`🔄 Using clean implementation for ${operation}`);
                return cleanImplementation();
            } else {
                console.debug(`📦 Using legacy implementation for ${operation}`);
                return legacyImplementation();
            }
        } catch (error) {
            console.error(`❌ Error in ${operation}:`, error);
            
            // Si l'implémentation clean échoue, fallback vers legacy
            if (this.shouldUseCleanImplementation()) {
                console.warn(`🔄 Clean implementation failed, falling back to legacy for ${operation}`);
                return legacyImplementation();
            }
            
            throw error;
        }
    }

    /**
     * Log de migration pour le debug
     */
    protected logMigration(operation: string, data?: any): void {
        const implementation = this.shouldUseCleanImplementation() ? 'CLEAN' : 'LEGACY';
        console.debug(`🔄 Migration [${implementation}] ${operation}`, data);
    }
}

/**
 * Interface pour tous les adaptateurs de migration
 */
export interface MigrationAdapter {
    getFeatureFlag(): FeatureFlagKey;
    isCleanEnabled(): boolean;
}

/**
 * Factory pour créer des adaptateurs de migration
 */
export class MigrationAdapterFactory {
    private static adapters = new Map<string, BaseMigrationAdapter>();

    static register(name: string, adapter: BaseMigrationAdapter): void {
        this.adapters.set(name, adapter);
    }

    static get<T extends BaseMigrationAdapter>(name: string): T | undefined {
        return this.adapters.get(name) as T;
    }

    static getAll(): Map<string, BaseMigrationAdapter> {
        return new Map(this.adapters);
    }
}
