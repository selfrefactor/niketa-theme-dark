const { map, sortObject } = require('rambdax')
const { pascalCase } = require('string-fn')

const { readJson } = require('./lib/read-json')
const { generateThemeData } = require('./generate-theme-data')
const { saveToPackageJson } = require('./lib/save-to-package-json')
const { writeJson } = require('./lib/write-json')

function sortObjectPredicate(aProp, bProp) {
  return aProp > bProp ? 1 : -1
}

function createMultipleTheme(input) {
  const settings = {}
  const uiTheme = input.type === 'dark' ? 'vs-dark' : 'vs'

  map((x, i)=> {
    settings[i] = x
  }, input.getSettings())
  const allThemes = []

  map(val=> {
    const { _, name, ...colors } = val
    if (!colors.COLOR_4) throw new Error('All themes require 5 colors')
    const palette = readJson('src/palette.json', input.base)
    const chromeColors = input.getChromeColors()
    const sortedChromeColors = sortObject(sortObjectPredicate, chromeColors)

    const themeData = generateThemeData({
      chromeColors: sortedChromeColors,
      palette,
      punctuationColor: input.punctuationColor,
      subtleColor: input.subtleColor,
      themeColors: colors,
      type: input.type,
    })
    themeData.name = pascalCase(name)

    writeJson(`themes/${themeData.name}.json`, themeData, input.base)

    allThemes.push({
      label: themeData.name,
      path: `./themes/${themeData.name}.json`,
      uiTheme,
    })
  })(settings)

  saveToPackageJson(allThemes)
}

exports.createMultipleTheme = createMultipleTheme
