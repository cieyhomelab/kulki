import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'test-results/', 'playwright-report/', 'coverage/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
    rules: {
      // The player never sees errors and the product has no logging (see AGENTS.md).
      'no-console': 'error',
      // Native dialogs block the page and cannot be styled or tested; nothing may hit the network.
      'no-restricted-globals': [
        'error',
        ...['alert', 'confirm', 'prompt'].map((name) => ({
          name,
          message: 'Use an HTML dialog rendered by the UI layer.',
        })),
        ...['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'].map((name) => ({
          name,
          message: 'The game works offline and must not use the network.',
        })),
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Take randomness from the injected rng (src/game/rng.js) so tests stay deterministic.',
        },
      ],
    },
  },
  {
    files: ['src/game/rng.js'],
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    files: ['tools/**/*.js', 'tests/**/*.js', '*.js'],
    languageOptions: { globals: globals.node },
  },
];
