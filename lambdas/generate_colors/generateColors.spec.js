import {generateColors} from './generateColors'

test('happy', () => {
  const input = [ '#a7b3ce', '#fff']

  expect(() =>
    generateColors({
      input,
      label: '_HAPPY',
      levels: 100,
    })
  ).not.toThrow()
})
