const { generateColors } = require('./generate-colors')

test('happy', ()=> {
  generateColors({
    input: ['#62b97c', '#F7ECB3'],
    levels: 10,
  })
})
