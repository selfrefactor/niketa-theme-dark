const { map } = require('rambdax');
const { pascalCase } = require('string-fn');
const { readJson } = require('./lib/read-json');
const { generateThemeData } = require('./generate-theme-data');
const { getSettings } = require('./themes-colors');
const { getChromeColors } = require('./assets/chrome-colors');
const { saveToPackageJson } = require('./lib/save-to-package-json');
const { writeJson } = require('./lib/write-json');

test('happy', () => {
  const settings = {}
  
  map((x, i) => {
    settings[ i ] = x
  }, getSettings())
  const allThemes = []

  map(val => {
    const { name, back, ...colors } = val
    if (!colors.COLOR_4){
      throw new Error('All themes require 5 colors')
    }
    const palette = readJson('src/palette.json')
    const themeData = generateThemeData({
      palette,
      chromeColors : getChromeColors(),
      themeColors  : colors,
    })
    themeData.name = pascalCase(name)

    writeJson(`themes/${ themeData.name }.json`, themeData)

    allThemes.push({
      label   : themeData.name,
      uiTheme : 'vs-dark',
      path    : `./themes/${ themeData.name }.json`,
    })
  })(settings)

  saveToPackageJson(allThemes)
})
