const { rules } = require('./scripts/lint/lint-rules');

module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  plugins: [
    'sonarjs',
    'unused-imports',
    'perfectionist',
  ],
  extends: [
    'eslint:recommended',
    'plugin:sonarjs/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json',
  },
  rules,
};
