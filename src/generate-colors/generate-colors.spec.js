const { generateColors } = require('./generate-colors')

test('happy', () => {
  generateColors({
    input: ['#111', '#3daaa5'],
    levels: 100,
  })
})
