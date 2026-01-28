const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const nextPlugin = require('@next/eslint-plugin-next')

module.exports = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '**/*.config.js',
      'eslint.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-page-custom-font': 'off',
    },
  },
]
