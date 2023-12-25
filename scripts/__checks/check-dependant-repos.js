const DEPENDANT_REPOS = ['../niketa-theme']

const { existsSync } = require('fs')
const { readFile, readJson } = require('fs-extra')
const { scanFolder } = require('helpers-fn')
const { resolve } = require('path')
const { endsWith, filter } = require('rambdax')

const EXPECTED_FILES = [
  'constants.js',
  'lint/lint-all-fn.js',
  'lint/lint-all.js',
  'lint/lint-fn.js',
  'lint/lint-rules.js',
  'lint/lint.js',
  'run/jest-fn.js',
  'run/jest.js',
]

const EXPECTED_GIT_IGNORE = [
  'scripts/outputs/eslint-output-file.txt',
  'scripts/outputs/jest-output-file.txt',
  'scripts/outputs/eslint-all-output-file.txt'
]
const EXPECTED_SCRIPTS = [
  'lint:file',
  'lint:all',
  'jest:file'
]

const CHECK_CONTENT = [
  '.eslintrc.js',
  'scripts/lint/lint-rules.js',
]

let EXPECTED_DEV_DEPENDENCIES = [
  "@biomejs/biome",
  "@stylistic/eslint-plugin",
  "eslint",
  "eslint-plugin-babel",
  "eslint-plugin-jest",
  "eslint-plugin-node",
  "eslint-plugin-perfectionist",
  "eslint-plugin-sonarjs",
  "eslint-plugin-unused-imports",
  "fs-extra",
  "helpers-fn",
  "jest",
  "prettier",
  "rambdax"
]

const BASE = resolve(__dirname, '../../../')

function checkPackageJson({scripts, niketaScripts, devDependencies}) {
  const correctScripts = filter(
    (_, prop) => EXPECTED_SCRIPTS.includes(prop),
  )(scripts)
  if(Object.keys(correctScripts).length !== EXPECTED_SCRIPTS.length){
    return { error: `Scripts are not correct`, errorData:{correctScripts, scripts} }
  }
  if(niketaScripts === undefined){
    return { error: `niketaScripts is empty`, }
  }
  // Keep it simple
  // if there is case, where more is used, then read and evaluate
  if(niketaScripts.length !== 2){
    return { error: `niketaScripts are not correct`, errorData:niketaScripts }
  }
  const devDependenciesKeys = Object.keys(devDependencies)
  const wrongDevDependencies = filter(
    prop => !devDependenciesKeys.includes(prop),
  )(EXPECTED_DEV_DEPENDENCIES)

  if(wrongDevDependencies.length > 0){
    return { error: `devDependencies are not correct`, errorData: `Run: yarn add -D ${  
       wrongDevDependencies.join(' ')
     }` }
  }

  return { success: true }
}

async function checkDependantRepo(relativePath) {
  try {
    const directoryPath = resolve(BASE, relativePath)
    const gitIgnoreContent = (await readFile(`${directoryPath}/.gitignore`)).toString()
    if(
      !EXPECTED_GIT_IGNORE.every(x => gitIgnoreContent.includes(x))
    ){
      return { error: `gitignore is not correct` }
    }
    if (!existsSync(directoryPath)) {
      return { error: `Directory ${directoryPath} does not exist` }
    }
    const files = await scanFolder({
      filterFn: (x) => x.endsWith('.js'),
      folder: `${directoryPath}/scripts`,
    })
    const wrongFiles = EXPECTED_FILES.filter((filePath) => files.find(endsWith(filePath)) === undefined)

    if (wrongFiles.length > 0) {
      return { error: `Files are not correct`, errorData:wrongFiles }
    }
    const wrongContent = await Promise.all(CHECK_CONTENT.map(async filePath => {
      const content = (await readFile(`${directoryPath}/${filePath}`)).toString().trim()
      const expectedContent = (await readFile(`${BASE}/${filePath}`)).toString().trim()
      if(
        content !== expectedContent
      ) console.log('unexpected content', filePath)

      return content !== expectedContent
    }))
    if(wrongContent.some(x => x)){
      return { error: `Content is not correct for strict check` }
    }

    const {scripts, niketaScripts, devDependencies} = await readJson(`${directoryPath}/package.json`)
    return checkPackageJson({scripts, niketaScripts, devDependencies})
  }catch(err){
    return { error: err.message, data: 'in try/catch' }
  }
}
// Start simple
// on too many changes, then introduce script that syncs
void (async function checkDependantRepos() {
  const errors = await Promise.all(DEPENDANT_REPOS.map(checkDependantRepo))
  console.log(errors)
})()
