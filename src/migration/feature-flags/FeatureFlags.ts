/**
 * Feature Flags pour la migration vers Clean Architecture
 * 
 * Permet d'activer progressivement les nouvelles fonctionnalités
 * tout en gardant le code legacy comme fallback
 */

export type FeatureFlagKey = 
    | 'clean-lights'      // Migration des lumières
    | 'clean-materials'   // Migration des matériaux  
    | 'clean-projects'    // Migration des projets
    | 'clean-ui';         // Migration UI

interface FeatureFlagConfig {
    enabled: boolean;
    description: string;
    rolloutPercentage?: number; // Pour un rollout progressif
}

export class FeatureFlags {
    private static flags: Record<FeatureFlagKey, FeatureFlagConfig> = {
        'clean-lights': {
            enabled: false,
            description: 'Migration du système de lumières vers Clean Architecture'
        },
        'clean-materials': {
            enabled: false,
            description: 'Migration du système de matériaux vers Clean Architecture'
        },
        'clean-projects': {
            enabled: false,
            description: 'Migration du système de projets vers Clean Architecture'
        },
        'clean-ui': {
            enabled: false,
            description: 'Migration de l\'interface utilisateur vers Clean Architecture'
        }
    };

    /**
     * Vérifie si une feature est activée
     */
    static isEnabled(feature: FeatureFlagKey): boolean {
        const flag = this.flags[feature];
        if (!flag) {
            console.warn(`Feature flag "${feature}" not found, defaulting to false`);
            return false;
        }
        return flag.enabled;
    }

    /**
     * Active une feature
     */
    static enable(feature: FeatureFlagKey): void {
        if (this.flags[feature]) {
            this.flags[feature].enabled = true;
            console.info(`Feature "${feature}" enabled`);
        }
    }

    /**
     * Désactive une feature
     */
    static disable(feature: FeatureFlagKey): void {
        if (this.flags[feature]) {
            this.flags[feature].enabled = false;
            console.info(`Feature "${feature}" disabled`);
        }
    }

    /**
     * Retourne toutes les features et leur état
     */
    static getAllFlags(): Record<FeatureFlagKey, FeatureFlagConfig> {
        return { ...this.flags };
    }

    /**
     * Active/désactive une feature selon un pourcentage de rollout
     */
    static enableWithRollout(feature: FeatureFlagKey, percentage: number): void {
        if (this.flags[feature]) {
            this.flags[feature].rolloutPercentage = percentage;
            // Pour cette phase, on active simplement si percentage > 0
            this.flags[feature].enabled = percentage > 0;
        }
    }

    /**
     * Utilitaire pour le debug
     */
    static debug(): void {
        console.group('🏁 Feature Flags Status');
        Object.entries(this.flags).forEach(([key, config]) => {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            console.log(`${status} ${key}: ${config.description}`);
        });
        console.groupEnd();
    }
}

/**
 * Hook pour utiliser les feature flags dans Vue
 */
export function useFeatureFlag(feature: FeatureFlagKey) {
    return {
        isEnabled: () => FeatureFlags.isEnabled(feature),
        enable: () => FeatureFlags.enable(feature),
        disable: () => FeatureFlags.disable(feature)
    };
}
