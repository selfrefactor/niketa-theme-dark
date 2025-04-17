const { generateColors } = require('./generate-colors')

test('happy', () => {
  generateColors({
    input: ['#b19cd9', '#000000'],
    levels: 100,
  })
})
