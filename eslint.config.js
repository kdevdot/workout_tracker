import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/**', 'node_modules/**', 'public/**', 'Machines/**', 'coverage/**']),
  {
    files: ['src/**/*.{ts,vue}', '*.config.{ts,js}'],
    extends: [js.configs.recommended, ts.configs.recommended, vue.configs['flat/recommended']],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.test.ts', '*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Test files legitimately declare multiple small component fixtures.
    files: ['src/**/*.test.ts'],
    rules: { 'vue/one-component-per-file': 'off' },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    // shadcn's owned primitives intentionally use the upstream single-word names.
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      // Optional primitive props fall through to Reka/CVA defaults or are omitted.
      'vue/require-default-prop': 'off',
    },
  },
  prettier,
]);
