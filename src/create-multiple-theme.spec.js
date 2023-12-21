import { map } from 'rambdax'
import { pascalCase } from 'string-fn'

import { readJsonAnt } from './ants/readJson.js'
import { saveToPackageJsonAnt } from './ants/saveToPackageJson.js'
import { writeJsonAnt } from './ants/writeJson.js'
import { getChromeColors } from './assets/chrome-colors.js'
import { generateThemeData } from './generateThemeData.js'
import { SETTINGS } from './themes-colors.js'

const settings = {}

map((x, i) => {
  settings[ i ] = x
}, SETTINGS)

test('happy', () => {
  const allThemes = []

  map(val => {
    const { name, back, ...colors } = val
    if (!colors.COLOR_4){
      throw new Error('All themes require 5 colors')
    }
    const palette = readJsonAnt('src/palette.json')
    const themeData = generateThemeData({
      palette,
      chromeColors : getChromeColors(),
      themeColors  : colors,
    })
    themeData.name = pascalCase(name)

    writeJsonAnt(`themes/${ themeData.name }.json`, themeData)

    allThemes.push({
      label   : themeData.name,
      uiTheme : 'vs-dark',
      path    : `./themes/${ themeData.name }.json`,
    })
  })(settings)

  saveToPackageJsonAnt(allThemes)
})
