const { generateColors } = require('./generate-colors')

test('happy', () => {
  generateColors({
    input: ['#7fffd4', '#000000'],
    levels: 100,
  })
})
