const {
  exec,
  check,
  PRETTIER,
  ESLINT,
  eslintConfig,
  OUTPUT_LINT_FILE,
} = require('../constants')
const {readFileSync} = require('fs')


async function runJestWithFile(filePath) {
  let label = `${ filePath } - jest`
  const command = `${ESLINT} --fix ${filePath} --config ${eslintConfig} > ${OUTPUT_LINT_FILE}`
  await exec(command)
  console.time(label)
  let output = readFileSync(OUTPUT_LINT_FILE, 'utf8')
  // console.log(command)
  console.timeEnd(label)
  if(output === ''){
    console.log('ESLINT: OK')
    return
  }
  console.log(output)
}

async function runJestFn(filePath) {
  if (!check()) process.exit(1)

}

exports.lintFn = lintFn
