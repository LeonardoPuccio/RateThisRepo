// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

// Note: We'll use autoImports from WXT once it's generated
// import autoImports from './.wxt/eslint-auto-imports.mjs';

export default [
  // autoImports, // Uncomment after first running wxt prepare
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // General code style rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  prettierConfig,
  prettierPlugin,
];
