import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'node_modules', 'build', '.vscode', 'public']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
          experimentalObjectRestSpread: true
        }
      }
    },
    rules: {
      // General
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': ['warn', { 
        allow: ['warn', 'error'] 
      }],
      'no-debugger': 'warn',
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error'
    }
  },
  // Allow console in utility/test files
  {
    files: [
      'src/utils/logger.js',
      'src/utils/errorMonitoring.js',
      'src/utils/securityTest.js',
      'src/utils/securityMiddleware.js',
      'src/utils/rateLimiter.js',
      'src/utils/registerServiceWorker.js',
      'src/utils/webVitals.js'
    ],
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  }
];
