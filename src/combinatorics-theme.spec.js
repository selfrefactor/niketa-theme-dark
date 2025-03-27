const { allLightThemes } = require('./themes-colors-light.js')
const {
  pipe,
  replaceItemAtIndex,
  uniq,
  map,
  flatten,
  sortBy,
  uniqBy,
  groupBy,
	mapObject,
} = require('rambda')
const { allDarkThemes } = require('./themes-colors.js')
const { combinatoricsTheme } = require('./combinatorics-theme.js')
const { BACK_COLOR: darkBackground } = require('./assets/back-color.js')
const { writeJson } = require('fs-extra')
const generatedColors = require('./generate-colors/_COLORS.json')
const { BACK_COLOR: lightBackground } = require('./assets/chrome-colors-light.js')
const { getColors } = require('./assets/get-list-of-colors.js')

const SECONDS = 1000
jest.setTimeout(70 * SECONDS)

function generateResult({ index, allThemes, colorsCandidates, background }) {
  const allKeys = Object.keys(allThemes)
  const currentThemeColors = uniq(allThemes[allKeys[index]])
  return pipe(
    currentThemeColors,
    map((replacedColor, index) => ({
      replacedColor,
      colors: replaceItemAtIndex(index, () => background)(currentThemeColors),
    })),
    map(({ replacedColor, colors }) => ({
      replacedColor,
      result: combinatoricsTheme({
        colors,
        colorsCandidates,
        background,
      }),
    })),
    map(({ replacedColor, result }) =>
      result.map(x => ({
        ...x,
        replacedColor,
      })),
    ),
    flatten,
    uniqBy(x => x.colorCandidate),
    sortBy(x => -x.contrastSum),
    sortBy(x => -x.contrastSum),
    groupBy(x => x.replacedColor),
    mapObject(x => x.map(xx => xx.colorCandidate)),
  )
}
const flag = 0
const colorsCandidates = flag ? generatedColors : getColors()
test.skip('dark', async () => {
  const finalResult = generateResult({
    index: 0,
    allThemes: allDarkThemes,
    colorsCandidates,
    background: darkBackground,
  })

  await writeJson('combinatoricsTheme-report.json', finalResult, { spaces: 2 })
})

test('light', async () => {
  const finalResult = generateResult({
    index: 8,
    allThemes: allLightThemes,
    colorsCandidates,
    background: lightBackground,
  })

  await writeJson('combinatoricsTheme-reportLight.json', finalResult, {
    spaces: 2,
  })
})

