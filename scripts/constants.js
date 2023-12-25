const {existsSync} = require('fs')
const {execSafe} = require('helpers-fn')
let {resolve} = require('path')

const PRETTIER = 'node_modules/prettier/bin/prettier.cjs'
const ESLINT = 'node_modules/eslint/bin/eslint.js'
const cwd = resolve(__dirname, '../')

let eslintConfig = `${cwd}/.eslintrc.js`

async function exec(command) {
  try {
    await execSafe({cwd, command})
  } catch (error) {
    console.log(error.stdout, error.stderr)
  }
}

async function check() {
  if (!existsSync(`${cwd}/${ESLINT}`)) {
    console.log('eslint not found', `${cwd}/${ESLINT}`)
    return false
  }

  if (!existsSync(`${cwd}/${PRETTIER}`)) {
    console.log('prettier not found', `${cwd}/${PRETTIER}`)
    return false
  }
  if (!existsSync(eslintConfig)) {
    console.log('eslint config found', eslintConfig)
    return false
  }
  return true
}

let OUTPUT_COMMAND_FILE_NAME = `eslint-output-file.txt`;
let OUTPUT_LINT_FILE = `${__dirname}/outputs/${OUTPUT_COMMAND_FILE_NAME}`;

exports.exec = exec
exports.cwd = cwd
exports.check = check
exports.PRETTIER = PRETTIER
exports.ESLINT = ESLINT
exports.eslintConfig = eslintConfig
exports.OUTPUT_LINT_FILE = OUTPUT_LINT_FILE
