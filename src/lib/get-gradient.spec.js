const { getGradient } = require('./get-gradient')

test('get gradient', ()=> {
  const expected = ['#fafafa', '#cecece', '#a2a2a2', '#767676', '#4a4a4a']
  const result = getGradient('#fafafa', '#4a4a4a')
  console.log(result)
  expect(result).toEqual(expected)
})
