const { execSafe } = require('helpers-fn')
const { resolve } = require('node:path')

const cwd = resolve(__dirname, '../../')
const JEST = 'node_modules/jest/bin/jest.js'

async function exec(command) {
  try {
    await execSafe({ command, cwd })
    return { success: true }
  }
  catch (error) {
    return {
      errorMessage: error?.message ?? JSON.stringify(error, null, 2),
      success: false,
    }
  }
}

let OUTPUT_JEST_FILE = `${__dirname}/outputs/jest-output-file.txt`

async function runJestWithFile(filePath) {
  const label = `${filePath} - jest`
  const command = `${JEST} ${filePath} > ${OUTPUT_JEST_FILE}`
  console.time(label)
  console.log(command)
  const { errorMessage, success } = await exec(command)
  if (success) {
    const output = readFileSync(OUTPUT_JEST_FILE, 'utf8')
    if (!output) {
      console.log('JEST: OK')
    }
    else {
      console.log(output)
    }
  }
  else {
    console.log('JEST: ERROR', errorMessage)
  }
  console.timeEnd(label)
}

async function runJestFn(filePath) {
  await runJestWithFile(filePath)
}

exports.runJestFn = runJestFn
