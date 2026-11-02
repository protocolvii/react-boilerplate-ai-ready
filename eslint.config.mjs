import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: false
    },
    ignores: ['node_modules/**', 'public/**', 'build/**', 'dist/**']
  },
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    }
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-console': 'off',
      'no-alert': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.js'] }],
      'object-shorthand': ['error', 'always', { avoidQuotes: false }],
      'import/no-unresolved': 'off',
      'react/no-array-index-key': 'off',
      'prefer-destructuring': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'prefer-promise-reject-errors': 'off',
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: [],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref']
        }
      ],
      'no-else-return': 'off',
      'no-param-reassign': 'off',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$',
          caughtErrors: 'none'
        }
      ],
      'react/prop-types': 'off',
      'react-hooks/set-state-in-effect': 'off'
    }
  },
  {
    files: ['vite.config.mjs', 'vite/**/*.mjs', 'tests/**/*.mjs', 'playwright*.config.js', 'vitest.config.js'],
    languageOptions: { globals: globals.node },
    // 当前 import resolver 不支持部分依赖的 package exports；实际解析由 Vite / Node 验证。
    rules: { 'import/no-unresolved': 'off' }
  },
  {
    files: ['tests/e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'import/no-unresolved': 'off' }
  },
  {
    files: ['tests/unit/**/*.js', 'tests/components/**/*.jsx', 'tests/setup.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser }, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { 'import/no-unresolved': 'off', 'react/prop-types': 'off', 'react/jsx-filename-extension': ['error', { extensions: ['.jsx'] }] }
  },
  {
    files: ['src/components/ui/**/*.jsx'],
    rules: {
      'react/jsx-filename-extension': ['warn', { extensions: ['.jsx'] }],
      'jsx-a11y/anchor-has-content': 'off'
    }
  },
  eslintConfigPrettier
];
