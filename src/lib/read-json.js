const { readJsonSync } = require('fs-extra')
const { resolve } = require('node:path')

const BASE = resolve(__dirname, '../../')

function readJson(filePath, base = BASE) {
  const resolvedPath = `${base}/${filePath}`
  return readJsonSync(resolvedPath)
}

exports.readJson = readJson
