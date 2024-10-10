const filePath = process.argv[2]
const { runJestFn } = require('./jest-fn.js')

void (async function runJest() {
  await runJestFn(filePath)
})()
