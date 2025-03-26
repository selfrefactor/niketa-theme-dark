const { generateColors } = require('./generate-colors')

test('happy', () => {
  generateColors({
    input: ['#efbbcc', '#872657'],
    levels: 1000,
  })
})
