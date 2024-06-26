const {
  check,
  ESLINT,
  eslintConfig,
  exec,
  OUTPUT_LINT_FILE,
  PRETTIER,
} = require('../constants')
const { readFileSync } = require('node:fs')

const ALLOWED = {
  BIOME: 1,
  ESLINT: 1,
  PRETTIER: 1,
}

async function lintFileWithPrettier(filePath) {
  if (!ALLOWED.PRETTIER) return false
  const command = `${PRETTIER} --write ${filePath} --print-width=80 --semi=false --jsx-single-quote ${
    filePath.endsWith('.scss') ? '' : '--single-quote'
  }`
  await exec(command)
}

async function lintFileWithEslint(filePath) {
  if (!ALLOWED.ESLINT) return false
  const label = `${filePath} - eslint`
  const baseCommand = `${ESLINT} --fix ${filePath} --config ${eslintConfig}`
  const command = `${baseCommand} > ${OUTPUT_LINT_FILE}`
  await exec(command)
  console.time(label)
  const output = readFileSync(OUTPUT_LINT_FILE, 'utf8')
  console.timeEnd(label)
  console.log(`\nLint command:  ${baseCommand}\n`)
  return output ?? false
}

async function biome(filePath) {
  if (!ALLOWED.BIOME) return false
  const label = `${filePath} - biome`
  console.time(label)
  const command = `node_modules/@biomejs/biome/bin/biome check --apply-unsafe ${filePath}`
  const formatCommand = `node_modules/@biomejs/biome/bin/biome format --write --indent-style=space --indent-width=2 ${filePath}`
  await exec(formatCommand)

  const { errorMessage } = await exec(command)
  console.timeEnd(label)
  return errorMessage ?? false
}

async function lintFn(filePath) {
  if (!(await check())) process.exit(1)

  const biomeOutput = await biome(filePath)
  await lintFileWithPrettier(filePath)
  const lintOutput = await lintFileWithEslint(filePath)

  return [biomeOutput, lintOutput]
}

exports.lintFn = lintFn
exports.ALLOWED = ALLOWED
