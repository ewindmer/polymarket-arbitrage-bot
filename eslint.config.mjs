import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig, {
        plugins: {
            prettier: prettierPlugin, 
        },

        rules: {
            'prettier/prettier': 'warn', 
            '@typescript-eslint/no-unused-vars': 'off', 
        },
    },
];
