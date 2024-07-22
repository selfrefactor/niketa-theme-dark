const { createMultipleThemes } = require('./create-multiple-themes')
const { PUNCTUATION_COLOR, SUBTLE_COLOR } = require('./assets/back-color')
const { getSettings, allDarkThemes } = require('./themes-colors')
const { getChromeColors } = require('./assets/chrome-colors')

const darkThemeInput = {
  getChromeColors,
  settings: getSettings(allDarkThemes),
  punctuationColor: PUNCTUATION_COLOR,
  subtleColor: SUBTLE_COLOR,
  type: 'dark',
}

test('create dark theme', ()=> {
  createMultipleThemes(darkThemeInput)
})
