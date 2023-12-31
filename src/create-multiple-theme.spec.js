let {createMultipleTheme} = require('./create-multiple-theme')
const { PUNCTUATION_COLOR, SUBTLE_COLOR } = require('./assets/back-color')
const { getSettings } = require('./themes-colors')
const { getChromeColors } = require('./assets/chrome-colors')

const darkThemeInput= {
  getSettings,
  getChromeColors,
  type: 'dark',
  punctuationColor: PUNCTUATION_COLOR,
  subtleColor: SUBTLE_COLOR,
}

test('create dark theme', () => {
  createMultipleTheme(darkThemeInput)
})