const { generateColors } = require('./generate-colors')

test('happy', () => {
  generateColors({
    input: ['#fe6629', '#F7EC11'],
    levels: 100,
  })
})
