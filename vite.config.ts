import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import glsl from 'vite-plugin-glsl';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    resolve:{
        alias: {
            "src": "/src",
        },
    },
    plugins: [svelte(), glsl()],
    build: {
        outDir: 'build',
    },
    server: {
        port: 3005,
    },
});
