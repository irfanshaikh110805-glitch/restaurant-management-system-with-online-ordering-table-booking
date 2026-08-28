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
      // General - stricter rules
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': ['warn', { 
        allow: ['warn', 'error'] 
      }],
      'no-debugger': 'error',
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      
      // Security
      'no-new-func': 'error',
      'no-script-url': 'error'
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
