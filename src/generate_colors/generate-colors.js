const { writeJson } = require('../lib/write-json');
const { getGradient } = require('../lib/get-gradient');

const { flatten, piped, uniq } = require('rambdax');

const base = 'src/generate_colors/colors'

function generateColors({ input, levels = 20, label = '' }){
  const [ first, second ] = input
  const OUTPUT = `${ base }/${ label }_COLORS.json`

  const colors = piped(getGradient(
    first, second, levels
  ), uniq)
  return writeJson(OUTPUT, flatten(colors))
}

exports.generateColors = generateColors
