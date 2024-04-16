const { createMultipleTheme } = require('./create-multiple-theme')
const { PUNCTUATION_COLOR, SUBTLE_COLOR } = require('./assets/back-color')
const { getSettings } = require('./themes-colors')
const { getChromeColors } = require('./assets/chrome-colors')

const darkThemeInput = {
  getChromeColors,
  getSettings,
  punctuationColor: PUNCTUATION_COLOR,
  subtleColor: SUBTLE_COLOR,
  type: 'dark',
}

test('create dark theme', ()=> {
  createMultipleTheme(darkThemeInput)
})
