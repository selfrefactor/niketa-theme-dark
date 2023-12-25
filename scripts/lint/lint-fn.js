const {exec, check} = require('../constants')

async function lintFileWithPrettier(filePath) {
  const command = `${PRETTIER} --write ${filePath} --print-width=80 --semi=true --jsx-single-quote ${
    filePath.endsWith('.scss') ? '' : '--single-quote'
  }`

  await exec(command)
}

async function lintFileWithEslint(filePath) {
  const command = `${ESLINT} --fix ${filePath} --config ${eslintConfig}`

  await exec(command)
}

async function lintFn(filePath) {
  if (check()) {
    console.log('eslint or prettier not found')
    process.exit(1)
  }

  await lintFileWithPrettier(filePath)
  await lintFileWithEslint(filePath)
}

exports.lintFn = lintFn
