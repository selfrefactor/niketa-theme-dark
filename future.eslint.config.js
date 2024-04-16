const { rules } = require('./scripts/tasks/lint/lint-rules');
const stylistic = require('@stylistic/eslint-plugin');
const sonarjs = require('eslint-plugin-sonarjs');
const perfectionist = require('eslint-plugin-perfectionist');
// import unusedImports from 'eslint-plugin-unused-imports'
const js =  require("@eslint/js");

module.exports = [
  {
    languageOptions: {
        ecmaVersion: 2022,
    }
},
  js.configs.recommended,
  {
      plugins: {
        '@stylistic': stylistic,
        sonarjs,
        perfectionist,
      },
      // extends: [
      //   'eslint:recommended',
      //   'plugin:sonarjs/recommended',
      //   'plugin:@stylistic/recommended-extends'
      // ],
      rules,
  }
];

