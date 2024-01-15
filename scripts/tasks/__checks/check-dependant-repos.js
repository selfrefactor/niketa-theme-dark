const DEPENDANT_REPOS = [
  'codesignal-tasks',
  'niketa-theme-light',
  'movies-database',
  'services/packages/magic-beans',
].map(x => `../${x}`)

const { existsSync } = require('fs')
const {
  copy,
  emptyDir,
  readFile,
  readJson,
  remove,
  writeFile,
  writeJson,
} = require('fs-extra')
const { log, scanFolder } = require('helpers-fn')
const { resolve } = require('path')
const { endsWith, pick } = require('rambdax')

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

const EXPECTED_GIT_IGNORE = `
scripts/tasks/outputs/eslint-output-file.txt
scripts/tasks/outputs/jest-output-file.txt
scripts/tasks/outputs/eslint-all-output-file.txt
`.trim()

const EXPECTED_SCRIPTS = ['lint:file', 'lint:all', 'jest:file']

const CHECK_CONTENT = ['.eslintrc.js']

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
  const source = resolve(__dirname, '../')
  const destination = `${directoryPath}/scripts/tasks`
  await emptyDir(destination)
  await copy(source, destination, { overwrite: true })

  const directoryToDelete = `${directoryPath}/scripts/tasks/__checks`

  await remove(directoryToDelete)
}

async function syncLaunchJson(directoryPath) {
  const namesToPick = ['Test File', 'Nodejs File']
  const source = resolve(__dirname, '../../../.vscode/launch.json')
  const destination = `${directoryPath}/.vscode/launch.json`
  const { configurations } = await readJson(source)
  const filteredSource = configurations.filter(x =>
    namesToPick.includes(x.name),
  )
  if (existsSync(destination)) {
    const { configurations: configurationsInDestination }
			= await readJson(destination)
    const filteredDestination = configurationsInDestination.filter(
      x => !namesToPick.includes(x.name),
    )

    const final = {
      configurations: [...filteredSource, ...filteredDestination],
      version: '0.2.0',
    }
    return writeJson(destination, final, { spaces: 2 })
  }
  await writeJson(
    destination,
    {
      configurations: filteredSource,
      version: '0.2.0',
    },
    { spaces: 2 },
  )
}

async function syncGitIgnore(directoryPath) {
  const destination = `${directoryPath}/.gitignore`
  if (!existsSync(destination)) {
    throw new Error(`File ${destination} does not exist`)
  }
  const content = (await readFile(destination)).toString()
  if (content.includes(EXPECTED_GIT_IGNORE)) return

  await writeFile(destination, `${EXPECTED_GIT_IGNORE}\n${content}`)
}

async function syncPackageJson(directoryPath) {
  const { devDependencies, niketaScripts, scripts } = await readJson(
		`${BASE}/package.json`,
  )
  const requiredDevDependencies = pick(
    EXPECTED_DEV_DEPENDENCIES,
    devDependencies,
  )
  const requiredScripts = pick(EXPECTED_SCRIPTS, scripts)
  const projectPackageJson = await readJson(`${directoryPath}/package.json`)
  const projectRequiredDevDependencies = pick(
    EXPECTED_DEV_DEPENDENCIES,
    projectPackageJson.devDependencies,
  )
  const finalPackageJson = {
    ...projectPackageJson,
    devDependencies: {
      ...(projectPackageJson.devDependencies ?? {}),
      ...requiredDevDependencies,
    },
    niketaScripts: projectPackageJson.niketaScripts ?? niketaScripts,
    scripts: {
      ...(projectPackageJson.scripts ?? {}),
      ...requiredScripts,
    },
  }

  if (
    Object.keys(projectRequiredDevDependencies).length
    !== EXPECTED_DEV_DEPENDENCIES.length
  ) {
    log('Please run `yarn install`', 'warning')
  }

  await writeJson(`${directoryPath}/package.json`, finalPackageJson, {
    spaces: 2,
  })
}

async function checkDependantRepo(relativePath) {
  try {
    const directoryPath = resolve(BASE, relativePath)
    await syncGitIgnore(directoryPath)
    await syncFiles(directoryPath)

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
        const expectedContent = (await readFile(`${BASE}/${filePath}`))
          .toString()
          .trim()

        if (!existsSync(`${directoryPath}/${filePath}`)) {
          await writeFile(`${directoryPath}/${filePath}`, expectedContent)
          return false
        }
        const content = (await readFile(`${directoryPath}/${filePath}`))
          .toString()
          .trim()

        if (content !== expectedContent) {
          console.log('unexpected content', filePath)
          return true
        }
        return false
      }),
    )
    if (wrongContent.includes(true)) {
      return { error: 'Content is not correct for strict check' }
    }

    await syncPackageJson(directoryPath)
    await syncLaunchJson(directoryPath)

    return { data: directoryPath, success: true }
  }
  catch (err) {
    return { data: 'in try/catch', error: err.message }
  }
}

exports.DEPENDANT_REPOS = DEPENDANT_REPOS
exports.checkDependantRepo = checkDependantRepo
