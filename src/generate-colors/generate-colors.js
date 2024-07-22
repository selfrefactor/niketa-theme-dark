const { flatten, piped, uniq } = require('rambdax')
const { getGradient } = require('../lib/get-gradient')
const { writeJson } = require('fs-extra')

function generateColors({ input, levels = 20 }) {
  const [first, second] = input
  const a = 12
  const OUTPUT = `${__dirname}/_COLORS.json`

  const colors = piped(getGradient(first, second, levels), uniq)

  return writeJson(OUTPUT, flatten(colors))
}

exports.generateColors = generateColors
