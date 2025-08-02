import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import * as THREE from 'three';
import { initializeMigration } from '@/migration';

(globalThis as any ).THREE = THREE; // Expose THREE to APP Scripts and Console

import './assets/main.css';

const app = createApp(App);

app.use(createPinia());

// Initialiser la migration Clean Architecture
initializeMigration({
    enableDebugLogs: true,
    autoFallback: true
}).then(() => {
    console.log('🚀 Migration Clean Architecture initialisée');
}).catch((error) => {
    console.error('❌ Erreur lors de l\'initialisation de la migration:', error);
});

app.mount('#app');
