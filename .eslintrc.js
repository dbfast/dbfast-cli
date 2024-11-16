// .eslintrc.js
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
      'jest'
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    env: {
      node: true,
      jest: true
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': ['error', { 
        allow: ['warn', 'error'] 
      }],
    },
    overrides: [{
      // Only allow console in logger
      files: ['**/utils/logger.ts'],
      rules: {
        'no-console': 'off'
      }
    }]
   }