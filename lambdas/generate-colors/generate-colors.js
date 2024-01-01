let {
  flatten,
  piped,
  uniq,
} = require('rambdax')

function generateColors({ input, levels = 20}){
  const [ first, second ] = input
  const OUTPUT = `${ __dirname }/_COLORS.json`

  const colors = piped(getGradient(
    first, second, levels
  ), uniq)

  return writeJson(OUTPUT, flatten(colors))
}

exports.generateColors = generateColors