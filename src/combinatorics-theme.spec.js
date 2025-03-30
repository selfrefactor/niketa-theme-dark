const { allLightThemes } = require('./themes-colors-light.js')
const {
  pipe,
  modifyItemAtIndex,
  uniq,
  map,
  flatten,
  uniqBy,
  groupBy,
	mapObject,
} = require('rambda')
const { allDarkThemes } = require('./themes-colors.js')
const { combinatoricsTheme } = require('./combinatorics-theme.js')
const { BACK_COLOR: darkBackground } = require('./assets/back-color.js')
const { writeJson } = require('fs-extra')
const { BACK_COLOR: lightBackground } = require('./assets/chrome-colors-light.js')
const { getColors } = require('./assets/get-list-of-colors.js')
const {
  colorContrastRatioCalculator
} = require('@mdhnpm/color-contrast-ratio-calculator')

const SECONDS = 1000
jest.setTimeout(70 * SECONDS)

function filterCandidatesAgainstReplacedColor (
	{ replacedColor, colorsCandidates }
) {
	return colorsCandidates.filter(
		x => x.length === 7
	).filter(x => isNearColor(x, replacedColor))
}

function isNearColor (a, b) {
	const score = colorContrastRatioCalculator(a, b)
	return score < 1.2
}

function generateResult({ index, allThemes, colorsCandidates, background, nearColorFlag }) {
  const allKeys = Object.keys(allThemes)
  const currentThemeColors = uniq(allThemes[allKeys[index]])
  return pipe(
    currentThemeColors,
    map((replacedColor, index) => ({
      replacedColor,
      colors: modifyItemAtIndex(index, () => background)(currentThemeColors),
    })),
    map(({ replacedColor, colors }) => {
			let filteredCandidates = nearColorFlag ? filterCandidatesAgainstReplacedColor({
				replacedColor,
				colorsCandidates,
			}) : colorsCandidates
			
			return {
				replacedColor,
				result: combinatoricsTheme({
					colors,
					colorsCandidates: filteredCandidates,
					background,
				}),
			}
		}),
    map(({ replacedColor, result }) =>
      result.map(x => ({
        ...x,
        replacedColor,
      })),
    ),
    flatten,
    uniqBy(x => x.colorCandidate),
    groupBy(x => x.replacedColor),
    mapObject(x => x.map(xx => xx.colorCandidate)),
  )
}
const colorsCandidates = getColors()

test('dark', async () => {
  const finalResult = generateResult({
    index: 8,
    allThemes: allDarkThemes,
    colorsCandidates,
    background: darkBackground,
		nearColorFlag: true,
  })

  await writeJson('combinatoricsTheme-report.json', finalResult, { spaces: 2 })
})

test.skip('light', async () => {
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

