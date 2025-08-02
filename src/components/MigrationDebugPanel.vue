<template>
    <div class="migration-debug" v-if="showDebug">
        <div class="migration-debug__header">
            <h3>🔄 Migration Status</h3>
            <button @click="showDebug = false" class="close-btn">×</button>
        </div>

        <div class="migration-debug__content">
            <!-- Status général -->
            <div class="section">
                <h4>📊 General Status</h4>
                <div class="status-item">
                    <span class="label">Initialized:</span>
                    <span :class="['status', status.initialized ? 'success' : 'error']">
                        {{ status.initialized ? '✅' : '❌' }}
                    </span>
                </div>
            </div>

            <!-- Feature Flags -->
            <div class="section">
                <h4>🏁 Feature Flags</h4>
                <div v-for="(enabled, feature) in status.features" :key="feature" class="feature-item">
                    <span class="feature-name">{{ feature }}</span>
                    <button @click="toggleFeature(feature)" :class="['toggle-btn', enabled ? 'enabled' : 'disabled']">
                        {{ enabled ? '✅ ON' : '❌ OFF' }}
                    </button>
                </div>
            </div>

            <!-- Adapters Status -->
            <div class="section">
                <h4>🔧 Adapters</h4>
                <div v-for="(enabled, adapter) in status.adapters" :key="adapter" class="adapter-item">
                    <span class="adapter-name">{{ adapter }}</span>
                    <span :class="['status', enabled ? 'success' : 'error']">
                        {{ enabled ? 'Clean' : 'Legacy' }}
                    </span>
                </div>
            </div>

            <!-- Actions -->
            <div class="section">
                <h4>🎮 Actions</h4>
                <div class="actions">
                    <button @click="testLightAdapter" class="action-btn">
                        Test Light Adapter
                    </button>
                    <button @click="refreshStatus" class="action-btn">
                        Refresh Status
                    </button>
                    <button @click="debugLogs" class="action-btn">
                        Show Debug Logs
                    </button>
                </div>
            </div>

            <!-- Logs -->
            <div class="section" v-if="logs.length > 0">
                <h4>📝 Recent Logs</h4>
                <div class="logs">
                    <div v-for="(log, index) in logs.slice(-10)" :key="index" :class="['log-item', log.level]">
                        <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                        <span class="log-message">{{ log.message }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Toggle Button -->
    <button v-if="!showDebug" @click="showDebug = true" class="migration-debug-toggle"
        title="Show Migration Debug Panel">
        🔄
    </button>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useMigration } from '@/migration';
import { useMigrationAdapter } from '@/migration/adapters';

interface LogEntry {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: Date;
}

// État du composant
const showDebug = ref(false);
const logs = ref<LogEntry[]>([]);

// Hooks de migration
const { manager, enableFeature, disableFeature, getStatus, debug } = useMigration();
const { light: lightAdapter } = useMigrationAdapter();

// Status réactif
const status = reactive({
    initialized: false,
    features: {} as Record<string, boolean>,
    adapters: {} as Record<string, boolean>
});

// Fonctions
const refreshStatus = () => {
    const currentStatus = getStatus();
    status.initialized = currentStatus.initialized;
    status.features = currentStatus.features;
    status.adapters = currentStatus.adapters;

    addLog('info', 'Status refreshed');
};

const toggleFeature = (featureName: string) => {
    const isEnabled = status.features[featureName];

    if (isEnabled) {
        disableFeature(featureName);
        addLog('info', `Feature ${featureName} disabled`);
    } else {
        enableFeature(featureName);
        addLog('info', `Feature ${featureName} enabled`);
    }

    // Rafraîchir le status après un court délai
    setTimeout(refreshStatus, 100);
};

const testLightAdapter = async () => {
    try {
        addLog('info', 'Testing light adapter...');

        const testLightData = {
            id: 'debug-test-light',
            type: 'RectAreaLight' as const,
            position: { x: 0, y: 5, z: 5 },
            properties: {
                intensity: 1,
                color: { r: 1, g: 1, b: 1 },
                width: 2,
                height: 2
            }
        };

        const lightId = await lightAdapter.addLight(testLightData);
        addLog('info', `Light added successfully: ${lightId}`);

        // Test get lights
        const lights = lightAdapter.getLights();
        addLog('info', `Current lights count: ${lights.length}`);

    } catch (error: any) {
        addLog('error', `Light adapter test failed: ${error.message}`);
    }
};

const debugLogs = () => {
    debug();
    addLog('info', 'Debug logs displayed in console');
};

const addLog = (level: LogEntry['level'], message: string) => {
    logs.value.push({
        level,
        message,
        timestamp: new Date()
    });

    // Garder seulement les 50 derniers logs
    if (logs.value.length > 50) {
        logs.value = logs.value.slice(-50);
    }
};

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
};

// Initialisation
onMounted(() => {
    refreshStatus();
    addLog('info', 'Migration Debug Panel initialized');

    // Auto-refresh du status toutes les 5 secondes
    setInterval(refreshStatus, 5000);
});

// Exposition pour le développement
if (import.meta.env.DEV) {
    (window as any).migrationDebug = {
        refreshStatus,
        toggleFeature,
        testLightAdapter,
        debugLogs,
        showPanel: () => { showDebug.value = true; },
        hidePanel: () => { showDebug.value = false; }
    };
}
</script>

<style scoped>
.migration-debug {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    max-height: 80vh;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border: 1px solid #333;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 10000;
    overflow: hidden;
}

.migration-debug__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
}

.migration-debug__header h3 {
    margin: 0;
    font-size: 14px;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
}

.migration-debug__content {
    padding: 10px;
    max-height: calc(80vh - 60px);
    overflow-y: auto;
}

.section {
    margin-bottom: 15px;
}

.section h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #4CAF50;
}

.status-item,
.feature-item,
.adapter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
}

.label,
.feature-name,
.adapter-name {
    font-size: 11px;
}

.status.success {
    color: #4CAF50;
}

.status.error {
    color: #f44336;
}

.toggle-btn {
    background: none;
    border: 1px solid #666;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
}

.toggle-btn.enabled {
    border-color: #4CAF50;
    color: #4CAF50;
}

.toggle-btn.disabled {
    border-color: #f44336;
    color: #f44336;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.action-btn {
    background: #333;
    border: 1px solid #666;
    color: white;
    padding: 5px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
}

.action-btn:hover {
    background: #444;
}

.logs {
    max-height: 150px;
    overflow-y: auto;
    background: #1a1a1a;
    padding: 5px;
    border-radius: 3px;
}

.log-item {
    display: flex;
    gap: 8px;
    padding: 2px 0;
    font-size: 10px;
}

.log-time {
    color: #666;
    flex-shrink: 0;
}

.log-item.info .log-message {
    color: #ccc;
}

.log-item.warn .log-message {
    color: #ff9800;
}

.log-item.error .log-message {
    color: #f44336;
}

.log-item.debug .log-message {
    color: #2196F3;
}

.migration-debug-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid #4CAF50;
    color: white;
    font-size: 20px;
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.migration-debug-toggle:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
}
</style>
