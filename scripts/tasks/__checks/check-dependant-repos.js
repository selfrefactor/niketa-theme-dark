const DEPENDANT_REPOS = [
  '../niketa-theme-light', 
  '../jazz-database'
]

const { existsSync } = require('fs')
const { readJson, readFile,emptyDir, copy, remove } = require('fs-extra')
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
  'scripts/tasks/outputs/eslint-output-file.txt',
  'scripts/tasks/outputs/jest-output-file.txt',
  'scripts/tasks/outputs/eslint-all-output-file.txt',
]
const EXPECTED_SCRIPTS = ['lint:file', 'lint:all', 'jest:file']

const CHECK_CONTENT = [
  '.eslintrc.js',
]

const EXPECTED_DEV_DEPENDENCIES = [
  '@biomejs/biome',
  '@stylistic/eslint-plugin',
  'eslint',
  'eslint-plugin-babel',
  'eslint-plugin-jest',
  'eslint-plugin-node',
  'eslint-plugin-perfectionist',
  'eslint-plugin-sonarjs',
  'eslint-plugin-unused-imports',
  'fs-extra',
  'helpers-fn',
  'jest',
  'prettier',
  'rambdax',
]

const BASE = resolve(__dirname, '../../../')

async function syncFiles(directoryPath) {
  let source = resolve( __dirname, '../',)
  let destination = `${directoryPath}/scripts/tasks`
  await emptyDir(destination)
  await copy(
    source,
    destination,
    { overwrite: true }
  )

  const directoryToDelete = `${directoryPath}/scripts/tasks/__checks` 

  await remove(directoryToDelete)
}

function checkPackageJson({ devDependencies, scripts }) {
  const correctScripts = filter((_, prop) => EXPECTED_SCRIPTS.includes(prop))(
    scripts ?? {},
  )
  if (Object.keys(correctScripts).length !== EXPECTED_SCRIPTS.length) {
    return {
      error: 'Scripts are not correct',
      errorData: { correctScripts, scripts },
    }
  }
  const devDependenciesKeys = Object.keys(devDependencies ?? {})
  const wrongDevDependencies = filter(
    prop => !devDependenciesKeys.includes(prop),
  )(EXPECTED_DEV_DEPENDENCIES)

  if (wrongDevDependencies.length > 0) {
    return {
      error: 'devDependencies are not correct',
      errorData: `Run: yarn add -D ${wrongDevDependencies.join(' ')}`,
    }
  }

  return { success: true }
}

async function checkDependantRepo(relativePath) {
  try {
    const directoryPath = resolve(BASE, relativePath)
    const gitIgnoreContent = (
      await readFile(`${directoryPath}/.gitignore`)
    ).toString()

    if (!EXPECTED_GIT_IGNORE.every(x => gitIgnoreContent.includes(x))) {
      return { error: 'gitignore is not correct' }
    }
    await syncFiles(
      directoryPath
    )

    if (!existsSync(directoryPath)) {
      return { error: `Directory ${directoryPath} does not exist` }
    }
    const files = await scanFolder({
      filterFn: x => x.endsWith('.js'),
      folder: `${directoryPath}/scripts`,
    })
    const wrongFiles = EXPECTED_FILES.filter(
      filePath => files.find(endsWith(filePath)) === undefined,
    )

    if (wrongFiles.length > 0) {
      return { error: 'Files are not correct', errorData: wrongFiles }
    }
    const wrongContent = await Promise.all(
      CHECK_CONTENT.map(async (filePath) => {
        const content = (await readFile(`${directoryPath}/${filePath}`))
          .toString()
          .trim()
        const expectedContent = (await readFile(`${BASE}/${filePath}`))
          .toString()
          .trim()
        if (content !== expectedContent)
          console.log('unexpected content', filePath)

        return content !== expectedContent
      }),
    )
    if (wrongContent.includes(true)) {
      return { error: 'Content is not correct for strict check' }
    }

    const { devDependencies, scripts } = await readJson(
			`${directoryPath}/package.json`,
    )
    return checkPackageJson({ devDependencies, scripts })
  }
  catch (err) {
    return { data: 'in try/catch', error: err.message }
  }
}
// Start simple
// on too many changes, then introduce script that syncs
void (async function checkDependantRepos() {
  const errors = await Promise.all(DEPENDANT_REPOS.map(checkDependantRepo))
  console.log(errors, 'final')
})()
