const fs = require('fs-extra')
const path = require('node:path')

const BASE = path.resolve(__dirname, '../../')

function writeJson(filePath, obj, base = BASE) {
  const resolvedPath = path.resolve(base, filePath)

  fs.outputFileSync(resolvedPath, JSON.stringify(obj, null, 2))
}

exports.writeJson = writeJson
