const { generateColors } = require('./generate-colors')

test('happy', () => {
  generateColors({
    input: ['#ace1af', '#800080'],
    levels: 100,
  })
})
