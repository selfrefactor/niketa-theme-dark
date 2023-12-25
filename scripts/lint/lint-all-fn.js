const { mapAsync } = require('rambdax')
const { lintFn } = require('./lint-fn.js')
const { scanFolder } = require('helpers-fn')
const { writeFileSync } = require('fs-extra')

let filterFn = (filePath) => filePath.endsWith('.js')

async function lintFolder(folder) {
  console.log(`Linting ${folder}`)
  const files = await scanFolder({
    filterFn,
    folder,
  })
  const result = await mapAsync(lintFn, files)
  writeFileSync(OUTPUT_LINT_ALL_FILE, result, 'utf8')
}

async function lintAllFn() {
  const { lintAllFolders: lintAllFoldersInit } = require('../../package.json')
  const lintAllFolders = lintAllFoldersInit || ['src']

  await mapAsync(lintFolder, lintAllFolders)
}

exports.lintAllFn = lintAllFn
