const { scanFolder } = require('helpers-fn')
const { resolve } = require('path')
// check gitignore
// check package.json
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

const DEPENDANT_REPOS = ['../../niketa-theme']

async function checkDependantRepo(relativePath) {
  const directoryPath = resolve(__dirname, relativePath)
  console.log(directoryPath)
  if (!existsSync(directoryPath)) {
    return { error: `Directory ${directoryPath} does not exist` }
  }
  const files = await scanFolder({
    filterFn: (x) => x.endsWith('.js'),
    folder: `${directoryPath}/scripts`,
  })
  console.log(files)
}

void (async function checkDependantRepos() {
  const errors = await Promise.all(DEPENDANT_REPOS.map(checkDependantRepo))
  console.log(errors)
})()
