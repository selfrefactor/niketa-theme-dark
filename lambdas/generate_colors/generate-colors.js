import { writeJson } from '../../src/lib/write-json';
import { getGradient } from '../../src/lib/get-gradient';

const { flatten, piped, uniq } = require('rambdax');

const base = 'lambdas/generate_colors/colors'

function generateColors({ input, levels = 20, label = '' }){
  const [ first, second ] = input
  const OUTPUT = `${ base }/${ label }_COLORS.json`

  const colors = piped(getGradient(
    first, second, levels
  ), uniq)

  return writeJson(OUTPUT, flatten(colors))
}

exports.generateColors = generateColors
