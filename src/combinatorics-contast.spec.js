const { combinatoricsContast } = require('./combinatorics-contast')
const {
  allThemes: allThemesLight,
} = require('../../niketa-theme/src/assets/themes-colors.js')

test.skip('dark', async () => {
  await combinatoricsContast()
})

test('light', async () => {
  await combinatoricsContast(allThemesLight, 'light')
})
