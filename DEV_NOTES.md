This README is source of truth for all other repos.

## ESLint default rules

eslint/packages/eslint-config-eslint/eslintrc.js
https://raw.githubusercontent.com/eslint/eslint/main/packages/eslint-config-eslint/eslintrc.js

## Sources of truth

- `rambda-scripts` - TS
- `wort-spiel` - TS with React
- `niketa-dark-theme` - JS

Each of the repos has list of repos that depend on it and through scripts, dependencies, configs and scripts are updated.
===
npx husky init

.husky/pre-commit
npx lint-staged
===
combinatorics-contast.js holds example lint errors
===
TODO:

optionals:

on more complex project, lint all initially can show if prettier is needed at all

task.json - simply overwrite and merge as it gives good option for testing initially
