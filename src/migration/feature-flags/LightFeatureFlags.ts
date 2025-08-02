/**
 * Phase 3 - Migration des Lumières
 * Feature Flag pour activer progressivement Clean Architecture pour les lumières
 */

export class LightFeatureFlags {
    private static flags = {
        'clean-lights-domain': { enabled: false, percentage: 0 },
        'clean-lights-usecases': { enabled: false, percentage: 0 },
        'clean-lights-ui': { enabled: false, percentage: 0 },
        'clean-lights-commands': { enabled: false, percentage: 0 },
        'clean-lights-full': { enabled: false, percentage: 0 }
    };
    
    static isEnabled(feature: string): boolean {
        const flag = this.flags[feature as keyof typeof this.flags];
        if (!flag) return false;
        
        if (!flag.enabled) return false;
        if (flag.percentage >= 100) return true;
        if (flag.percentage <= 0) return false;
        
        // Rollout basé sur un hash déterministe
        const hash = this.simpleHash(feature + Date.now().toString());
        return (hash % 100) < flag.percentage;
    }
    
    static enable(feature: string, percentage = 100): void {
        if (feature in this.flags) {
            this.flags[feature as keyof typeof this.flags] = {
                enabled: true,
                percentage: Math.max(0, Math.min(100, percentage))
            };
            console.log(`🎯 Feature enabled: ${feature} (${percentage}%)`);
        }
    }
    
    static disable(feature: string): void {
        if (feature in this.flags) {
            this.flags[feature as keyof typeof this.flags] = {
                enabled: false,
                percentage: 0
            };
            console.log(`⏸️ Feature disabled: ${feature}`);
        }
    }
    
    static getStatus(): Record<string, boolean> {
        const result: Record<string, boolean> = {};
        for (const [key, flag] of Object.entries(this.flags)) {
            result[key] = this.isEnabled(key);
        }
        return result;
    }
    
    private static simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    // Helpers pour les combinaisons
    static get isAnyCleanLightEnabled(): boolean {
        return Object.keys(this.flags).some(feature => this.isEnabled(feature));
    }
    
    static get isFullCleanLightEnabled(): boolean {
        return this.isEnabled('clean-lights-full');
    }
}
