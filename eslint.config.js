import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import globals from 'globals';

// airbnb-base and eslint-plugin-import ship no native flat config yet, so they
// are wrapped through the eslintrc compatibility layer.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default defineConfigWithVueTs(
    {
        name: 'app/ignores',
        ignores: ['dist/**', 'node_modules/**', 'public/**', 'three-matcap-orm-material/dist/**'],
    },

    { name: 'app/files', files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'] },

    js.configs.recommended,
    ...compat.extends('airbnb-base', 'plugin:import/recommended', 'plugin:import/typescript'),
    ...pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,

    {
        name: 'app/language-options',
        languageOptions: {
            ecmaVersion: 'latest',
            globals: { ...globals.browser, ...globals.node },
        },
        settings: {
            'import/resolver': {
                node: true,
                typescript: { project: ['tsconfig.app.json'] },
            },
        },
    },

    {
        name: 'app/rules',
        rules: {
            'linebreak-style': ['error', 'unix'],
            'no-use-before-define': 'off',
            'no-underscore-dangle': 'off',
            'no-plusplus': 'off',
            'import/no-extraneous-dependencies': 'off',
            'global-require': 'off',
            'no-promise-executor-return': 'off',
            'prefer-regex-literals': 'off',
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-shadow': 'off',
            'import/no-cycle': 'off',
            'no-param-reassign': ['error', { props: false }],
            'import/order': [
                'error',
                {
                    groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object', 'type'],
                },
            ],
            'import/extensions': ['error', 'never', { vue: 'always', json: 'always' }],
            'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            '@typescript-eslint/no-shadow': ['error'],
            'prefer-destructuring': ['error', { array: false, object: true }],
            'vue/singleline-html-element-content-newline': 'off',
            'vue/no-v-html': 'warn',
            'vue/no-unused-refs': 'error',
            'vue/component-api-style': ['warn', ['script-setup', 'options']],
            'vue/block-lang': ['error', { script: { lang: 'ts' } }],
            'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
        },
    },

    // Must stay last: disables every stylistic rule that would fight Prettier.
    skipFormatting,
);
