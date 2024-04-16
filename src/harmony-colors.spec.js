const { colord, extend } = require('colord')
const harmoniesPlugin = require('colord/plugins/harmonies')
const { writeJsonAnt } = require('./ants/writeJson')

const inputColor = '#fe5dce'

extend([harmoniesPlugin])

const allColorMethods = [
  'analogous',
  'complementary',
  'double-split-complementary',
  'rectangle',
  'split-complementary',
  'tetradic',
  'triadic',
]

test('happy', async ()=> {
  const report = {}
  const color = colord(inputColor)
  allColorMethods.forEach(method=> {
    report[method] = color.harmonies(method).map(c=> c.toHex())
  })

  await writeJsonAnt('harmony-colors.json', report)
})
