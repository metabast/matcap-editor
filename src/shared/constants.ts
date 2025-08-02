/**
 * Constantes partagées pour la migration Clean Architecture
 */

// ========== CONFIGURATION MIGRATION ==========

export const MIGRATION_CONFIG = {
    // Durée de conservation des logs de migration (en ms)
    LOG_RETENTION_TIME: 24 * 60 * 60 * 1000, // 24 heures
    
    // Timeout pour les opérations de migration
    OPERATION_TIMEOUT: 5000, // 5 secondes
    
    // Nombre maximum de tentatives en cas d'échec
    MAX_RETRY_ATTEMPTS: 3,
    
    // Intervalle entre les tentatives (en ms)
    RETRY_INTERVAL: 1000, // 1 seconde
} as const;

// ========== FEATURE FLAGS ==========

export const FEATURE_FLAGS = {
    LIGHTS: 'clean-lights',
    MATERIALS: 'clean-materials', 
    PROJECTS: 'clean-projects',
    UI: 'clean-ui'
} as const;

// ========== ÉVÉNEMENTS SYSTÈME ==========

export const EVENTS = {
    // Événements de migration
    MIGRATION_STARTED: 'migration:started',
    MIGRATION_COMPLETED: 'migration:completed',
    MIGRATION_FAILED: 'migration:failed',
    
    // Événements de feature flags
    FEATURE_ENABLED: 'feature:enabled',
    FEATURE_DISABLED: 'feature:disabled',
    
    // Événements domain (Clean Architecture)
    LIGHT_ADDED: 'domain:light:added',
    LIGHT_REMOVED: 'domain:light:removed',
    LIGHT_UPDATED: 'domain:light:updated',
    
    MATERIAL_CHANGED: 'domain:material:changed',
    PROJECT_SAVED: 'domain:project:saved',
    PROJECT_LOADED: 'domain:project:loaded',
} as const;

// ========== LIMITES ET CONTRAINTES ==========

export const LIMITS = {
    // Limites pour les lumières
    MAX_LIGHTS: 50,
    MAX_LIGHT_INTENSITY: 10,
    MIN_LIGHT_INTENSITY: 0,
    
    // Limites pour les matériaux
    MAX_ROUGHNESS: 1,
    MIN_ROUGHNESS: 0,
    MAX_METALNESS: 1,
    MIN_METALNESS: 0,
    
    // Limites pour les projets
    MAX_PROJECT_NAME_LENGTH: 100,
    MAX_PROJECT_DESCRIPTION_LENGTH: 500,
} as const;

// ========== VALEURS PAR DÉFAUT ==========

export const DEFAULTS = {
    // Lumières
    LIGHT: {
        INTENSITY: 1,
        COLOR: { r: 1, g: 1, b: 1 },
        CAST_SHADOW: false,
        POSITION: { x: 0, y: 5, z: 5 }
    },
    
    // Matériaux
    MATERIAL: {
        METALNESS: 0,
        ROUGHNESS: 0.5,
        ENV_MAP_INTENSITY: 1
    },
    
    // Projets
    PROJECT: {
        NAME: 'Nouveau Projet',
        DESCRIPTION: '',
        VERSION: '1.0.0'
    }
} as const;

// ========== ERREURS ==========

export const ERROR_CODES = {
    // Erreurs de migration
    MIGRATION_FAILED: 'MIGRATION_FAILED',
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
    ADAPTER_NOT_FOUND: 'ADAPTER_NOT_FOUND',
    
    // Erreurs de validation
    INVALID_LIGHT_TYPE: 'INVALID_LIGHT_TYPE',
    INVALID_POSITION: 'INVALID_POSITION',
    INVALID_PROPERTIES: 'INVALID_PROPERTIES',
    
    // Erreurs de domaine
    LIGHT_NOT_FOUND: 'LIGHT_NOT_FOUND',
    MATERIAL_NOT_FOUND: 'MATERIAL_NOT_FOUND',
    PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
    
    // Erreurs système
    OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// ========== VERSIONS ==========

export const VERSIONS = {
    CURRENT_MIGRATION: '1.0.0',
    SUPPORTED_PROJECT_VERSIONS: ['1.0.0'],
    MIN_THREE_JS_VERSION: '0.153.0',
    RECOMMENDED_THREE_JS_VERSION: '0.163.0'
} as const;

// ========== CHEMINS ==========

export const PATHS = {
    LEGACY: 'src/legacy',
    CLEAN: 'src/clean',
    MIGRATION: 'src/migration',
    SHARED: 'src/shared'
} as const;

// ========== MESSAGES ==========

export const MESSAGES = {
    MIGRATION: {
        STARTED: '🚀 Migration démarrée',
        COMPLETED: '✅ Migration terminée avec succès',
        FAILED: '❌ Échec de la migration',
        FALLBACK: '🔄 Fallback vers l\'implémentation legacy',
    },
    
    FEATURE_FLAGS: {
        ENABLED: '✅ Feature activée',
        DISABLED: '❌ Feature désactivée',
        NOT_FOUND: '⚠️ Feature non trouvée'
    },
    
    VALIDATION: {
        SUCCESS: '✅ Validation réussie',
        FAILED: '❌ Validation échouée'
    }
} as const;

// ========== DEBUGGING ==========

export const DEBUG = {
    ENABLED: import.meta.env.NODE_ENV === 'development',
    LOG_LEVEL: import.meta.env.LOG_LEVEL || 'info',
    SHOW_MIGRATION_LOGS: true,
    SHOW_PERFORMANCE_LOGS: true
} as const;
