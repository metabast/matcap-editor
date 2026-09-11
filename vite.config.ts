import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import FullReload from 'vite-plugin-full-reload';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), FullReload(['./src/**/*.{html,vue,ts,js}'])],
    server: {
        host: true,
        // Polling is required for HMR to detect host edits through the Docker bind mount.
        watch: { usePolling: true },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
        },
    },
});
