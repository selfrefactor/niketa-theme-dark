const { createMultipleThemes } = require('./create-multiple-themes.js')
const { getSettings } = require('./themes-colors.js')
const { allLightThemes } = require('./themes-colors-light.js')
const path = require('node:path')

const { getChromeColors } = require('./assets/chrome-colors-light.js')
const {
  PUNCTUATION_COLOR,
  SUBTLE_COLOR,
} = require('./themes-colors-light.js')

const BASE = path.resolve(__dirname, '../../niketa-theme')

const lightThemeInput = {
  getChromeColors,
  punctuationColor: PUNCTUATION_COLOR,
  settings: getSettings(allLightThemes),
  subtleColor: SUBTLE_COLOR,
  type: 'light',
  base: BASE,
}

test('create light theme', () => {
  createMultipleThemes(lightThemeInput)
})
