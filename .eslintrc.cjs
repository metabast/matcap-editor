/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        quotes: [2, 'single', {
            avoidEscape: true,
        }],
        'max-classes-per-file': ['error', 4],
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'indent': ['error', 4, {
            'SwitchCase': 1,
        }],
        'comma-dangle': [
            'error',
            {
                'arrays': 'always-multiline',
                'objects': 'always-multiline',
                'imports': 'always-multiline',
                'exports': 'always-multiline',
                'functions': 'ignore',
            },
        ],
        'semi': ['error', 'always'],
        'vue/max-attributes-per-line': ['error',
            {
                'singleline': {
                    'max': 1,
                },
                'multiline': {
                    'max': 1,
                },
            },
        ],
    },
};