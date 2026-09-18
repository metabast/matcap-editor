import viteConfig from './vite.config.js';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'node',
            include: ['src/**/*.spec.ts'],
        },
    }),
);
