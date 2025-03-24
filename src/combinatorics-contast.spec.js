const { generateContrastReport } = require('./combinatorics-contast')
const {
  allThemes: allThemesLight,
} = require('../../niketa-theme/src/assets/themes-colors.js')
const { allDarkThemes } = require('./themes-colors.js')

test('dark', async () => {
  await generateContrastReport(allDarkThemes, 'dark')
})

test('light', async () => {
  await generateContrastReport(allThemesLight, 'light')
})
