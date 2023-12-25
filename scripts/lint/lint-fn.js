const {
  exec,
  check,
  PRETTIER,
  ESLINT,
  eslintConfig,
  OUTPUT_LINT_FILE,
} = require('../constants')
const {readFileSync} = require('fs')

async function lintFileWithPrettier(filePath) {
  const command = `${PRETTIER} --write ${filePath} --print-width=80 --semi=false --jsx-single-quote ${
    filePath.endsWith('.scss') ? '' : '--single-quote'
  }`

  await exec(command)
}

async function lintFileWithEslint(filePath) {
  const command = `${ESLINT} --fix ${filePath} --config ${eslintConfig} > ${OUTPUT_LINT_FILE}`
  await exec(command)
  let output = readFileSync(OUTPUT_LINT_FILE, 'utf8')

  console.log(output)
}

async function lintFn(filePath) {
  if (!check()) process.exit(1)

  await lintFileWithPrettier(filePath)
  await lintFileWithEslint(filePath)
}

exports.lintFn = lintFn
