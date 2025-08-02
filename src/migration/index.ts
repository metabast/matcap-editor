/**
 * Point d'entrée principal pour la migration Clean Architecture
 * 
 * Ce module initialise et coordonne la migration progressive
 */

import { FeatureFlags } from './feature-flags/FeatureFlags';
import { migrationRegistry } from './adapters';
import { createLogger } from '@/shared/utils';
import { MESSAGES, MIGRATION_CONFIG } from '@/shared/constants';

const logger = createLogger('Migration');

/**
 * Configuration de la migration
 */
export interface MigrationConfig {
    enableDebugLogs?: boolean;
    autoFallback?: boolean;
    timeout?: number;
}

/**
 * Manager principal de la migration
 */
export class MigrationManager {
    private static instance: MigrationManager;
    private initialized = false;
    private config: MigrationConfig;

    private constructor(config: MigrationConfig = {}) {
        this.config = {
            enableDebugLogs: true,
            autoFallback: true,
            timeout: MIGRATION_CONFIG.OPERATION_TIMEOUT,
            ...config
        };
    }

    static getInstance(config?: MigrationConfig): MigrationManager {
        if (!this.instance) {
            this.instance = new MigrationManager(config);
        }
        return this.instance;
    }

    /**
     * Initialise la migration
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.warn('Migration already initialized');
            return;
        }

        try {
            logger.info(MESSAGES.MIGRATION.STARTED);

            // 1. Initialiser les feature flags
            this.initializeFeatureFlags();

            // 2. Initialiser les adaptateurs
            this.initializeAdapters();

            // 3. Configurer les event listeners
            this.setupEventListeners();

            this.initialized = true;
            logger.info(MESSAGES.MIGRATION.COMPLETED);

        } catch (error) {
            logger.error(MESSAGES.MIGRATION.FAILED, error);
            throw error;
        }
    }

    /**
     * Vérifie si la migration est initialisée
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Active une feature progressivement
     */
    enableFeature(featureName: string, percentage: number = 100): void {
        if (!this.initialized) {
            throw new Error('Migration not initialized');
        }

        logger.info(`🔄 Enabling feature: ${featureName} (${percentage}%)`);
        
        if (percentage >= 100) {
            FeatureFlags.enable(featureName as any);
        } else {
            FeatureFlags.enableWithRollout(featureName as any, percentage);
        }
    }

    /**
     * Désactive une feature
     */
    disableFeature(featureName: string): void {
        if (!this.initialized) {
            throw new Error('Migration not initialized');
        }

        logger.info(`❌ Disabling feature: ${featureName}`);
        FeatureFlags.disable(featureName as any);
    }

    /**
     * Retourne le status de toutes les features
     */
    getFeatureStatus(): Record<string, boolean> {
        const flags = FeatureFlags.getAllFlags();
        const status: Record<string, boolean> = {};
        
        Object.entries(flags).forEach(([key, config]) => {
            status[key] = config.enabled;
        });
        
        return status;
    }

    /**
     * Status de la migration
     */
    getStatus() {
        return {
            initialized: this.initialized,
            features: this.getFeatureStatus(),
            adapters: migrationRegistry.getAdaptersStatus(),
            config: this.config
        };
    }

    /**
     * Debug complet
     */
    debug(): void {
        console.group('🔄 Migration Manager Status');
        console.log('Initialized:', this.initialized);
        console.log('Config:', this.config);
        
        FeatureFlags.debug();
        migrationRegistry.debug();
        
        console.groupEnd();
    }

    // ========== MÉTHODES PRIVÉES ==========

    private initializeFeatureFlags(): void {
        logger.debug('Initializing feature flags');
        
        // Par défaut, toutes les features sont désactivées
        // Elles seront activées progressivement durant la migration
        FeatureFlags.disable('clean-lights');
        FeatureFlags.disable('clean-materials');
        FeatureFlags.disable('clean-projects');
        FeatureFlags.disable('clean-ui');
        
        logger.debug('Feature flags initialized');
    }

    private initializeAdapters(): void {
        logger.debug('Initializing migration adapters');
        
        // Les adaptateurs sont déjà initialisés via le registry
        // Vérifions qu'ils sont disponibles
        const availableAdapters = migrationRegistry.getAvailableAdapters();
        logger.debug('Available adapters:', availableAdapters);
        
        if (availableAdapters.length === 0) {
            logger.warn('No migration adapters available');
        }
    }

    private setupEventListeners(): void {
        logger.debug('Setting up event listeners');
        
        // Écouter les changements de feature flags pour le logging
        if (this.config.enableDebugLogs) {
            // Note: Implémentation basique pour l'instant
            // Les vrais event listeners seront ajoutés en Phase 2
        }
    }
}

/**
 * Instance singleton pour un accès facile
 */
export const migrationManager = MigrationManager.getInstance();

/**
 * Hook pour utiliser la migration dans Vue
 */
export function useMigration() {
    return {
        manager: migrationManager,
        
        // Raccourcis pour les opérations courantes
        enableFeature: (name: string, percentage?: number) => 
            migrationManager.enableFeature(name, percentage),
            
        disableFeature: (name: string) => 
            migrationManager.disableFeature(name),
            
        getStatus: () => migrationManager.getStatus(),
        
        debug: () => migrationManager.debug()
    };
}

/**
 * Initialise la migration au démarrage de l'application
 */
export async function initializeMigration(config?: MigrationConfig): Promise<void> {
    const manager = MigrationManager.getInstance(config);
    await manager.initialize();
}
