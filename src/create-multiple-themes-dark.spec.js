const { createMultipleThemes } = require('./create-multiple-themes')
const { PUNCTUATION_COLOR, SUBTLE_COLOR } = require('./assets/back-color')
const { allDarkThemes, getSettings } = require('./themes-colors')
const { getChromeColors } = require('./assets/chrome-colors')
const path = require('node:path')

const BASE = path.resolve(__dirname, '../')

const darkThemeInput = {
  getChromeColors,
  punctuationColor: PUNCTUATION_COLOR,
  settings: getSettings(allDarkThemes),
  subtleColor: SUBTLE_COLOR,
  type: 'dark',
	base: BASE,
}

test('create dark theme', () => {
  createMultipleThemes(darkThemeInput)
})
