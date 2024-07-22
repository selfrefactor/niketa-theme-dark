const { createMultipleTheme } = require('./create-multiple-theme')
const { getSettings } = require('./themes-colors')
const { allLightThemes } = require('./themes-colors-light')
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
  createMultipleTheme(lightThemeInput)
})
