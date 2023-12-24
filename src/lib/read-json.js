const { readFileSync } = require('fs')
const { resolve: resolveMethod } = require('path')

const BASE = resolveMethod(__dirname, '../../')

const resolve = filePath => resolveMethod(BASE, filePath)

function readJson(filePath){
  const resolvedPath = resolve(filePath)
  const content = readFileSync(resolvedPath).toString()

  return JSON.parse(content)
}

exports.readJson = readJson
exports.resolve = resolve
