module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  globals: {
    describe: true,
    beforeEach: true,
    it: true,
    expect: true,
    jest: true,
    beforeAll: true,
    rollbar: true,
    afterAll: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: [
    '*.bundle.js',
    '/node_modules/**',
    '/build/**',
    '**/*.json',
    '**/*.xml',
    'lib/plottr_components/dist/**',
    'lib/plottr_check-prop-types/**',
  ],
  rules: {
    'no-unused-vars': [
      'warn',
      {
        args: 'none',
        argsIgnorePattern: 'req|res|next|val',
        varsIgnorePattern: '_',
      },
    ],
    'prettier/prettier': ['error'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
