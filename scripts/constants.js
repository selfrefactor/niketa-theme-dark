const {execSafe} = require('helpers-fn')
let {resolve} = require('path')

const PRETTIER = 'node_modules/prettier/bin/prettier.cjs'
const ESLINT = 'node_modules/eslint/bin/eslint.js'
const cwd = resolve(__dirname, '../../')

let eslintConfig = `${cwd}/.eslintrc.js`

async function exec(command) {
  try {
    await execSafe({cwd, command})
  } catch (error) {
    console.log(error.stdout, error.stderr)
  }
}

async function check() {
  if (existsSync(`${cwd}/${ESLINT}`)) {
    console.log('eslint found')
    return false
  }

  if (existsSync(`${cwd}/${PRETTIER}`)) {
    console.log('prettier found')
    return false
  }
  if (existsSync(eslintConfig)) {
    console.log('eslint config found')
    return false
  }
  return true
}

exports.exec = exec
exports.cwd = cwd
exports.check = check
exports.PRETTIER = PRETTIER
exports.ESLINT = ESLINT
