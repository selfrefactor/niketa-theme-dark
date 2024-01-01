let {
  generateColors,
} = require('./generate-colors')

test('happy', () => {
  generateColors({
    input  : [ '#2d3e4c', '#000' ],
    levels : 40,
  })
})
