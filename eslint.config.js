// eslint.config.js
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default [
  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Perfectionist plugin for import sorting
  perfectionistPlugin.configs['recommended-natural'],

  // TypeScript rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      // General code style rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/.wxt/**',
      '.output/**',
      'dist/**',
      'public/**',
      'tsconfig.*',
    ],
  },

  // Prettier integration - this ensures ESLint respects the Prettier settings
  prettierConfig,
  prettierPlugin,
];
