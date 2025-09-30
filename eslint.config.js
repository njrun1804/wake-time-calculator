import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Helpful for Claude Code integration
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console for debugging
      'prefer-const': 'warn',
      'no-var': 'error',

      // Code quality
      'eqeqeq': ['error', 'always'],
      'curly': ['warn', 'multi-line'], // Allow compact single-line if statements
      'no-throw-literal': 'error',
      'no-eval': 'error',
      'no-useless-escape': 'warn',

      // Best practices for vanilla JS
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      '.history/**',
    ],
  },
];