const { createMultipleThemes } = require('./create-multiple-themes.js')
const { getSettings } = require('./themes-colors.js')
const { allLightThemes } = require('./themes-colors-light.js')

const { getChromeColors } = require('../../niketa-theme/src/assets/chrome-colors.js')
const { PUNCTUATION_COLOR, SUBTLE_COLOR }  = require('../../niketa-theme/src/assets/themes-colors.js')

const darkThemeInput = {
  getChromeColors,
  punctuationColor: PUNCTUATION_COLOR,
  settings: getSettings(allLightThemes),
  subtleColor: SUBTLE_COLOR,
  type: 'light',
}

test('create light theme', ()=> {
  createMultipleThemes(darkThemeInput)
})
