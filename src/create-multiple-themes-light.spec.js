const { createMultipleThemes } = require('./create-multiple-themes.js')
const { getSettings } = require('./themes-colors.js')
const { allLightThemes } = require('./themes-colors-light.js')
const path = require('node:path')

const { getChromeColors } = require('../../niketa-theme-light/src/assets/chrome-colors.js')
const { PUNCTUATION_COLOR, SUBTLE_COLOR }  = require('../../niketa-theme-light/src/assets/themes-colors.js')

const BASE = path.resolve(__dirname, '../../niketa-theme-light')

const lightThemeInput = {
  getChromeColors,
  getSettings: () => getSettings(allLightThemes),
  punctuationColor: PUNCTUATION_COLOR,
  subtleColor: SUBTLE_COLOR,
  type: 'light',
  base: BASE
}

test('create dark theme', ()=> {
  createMultipleThemes(lightThemeInput)
})
