const {
  colorContrastRatioCalculator,
} = require('@mdhnpm/color-contrast-ratio-calculator')
const { map, sortObject } = require('rambdax')
const { BACK_COLOR } = require('./assets/back-color')
const { allThemes: allThemesInput } = require('./themes-colors')
const {
  allThemes: allThemesLight,
} = require('../../niketa-theme/src/assets/themes-colors.js')
const { writeJson } = require('fs-extra')

async function evaluateContrast(
  allThemes = allThemesInput,
  label = 'dark',
  bgColor = BACK_COLOR,
) {
  let max = Number.POSITIVE_INFINITY
  let maxInfo
  let minInfo
  let min = 0
  const allContrasts = {}
  map((currentTheme, name) => {
    return map(color => {
      const score = colorContrastRatioCalculator(color, bgColor)
      allContrasts[color] = score
      if (score > min) {
        min = score
        minInfo = `${color} - ${name} - ${score}`
      }
      if (score < max) {
        max = score
        maxInfo = `${color} - ${name} - ${score}`
      }
      return `${color} - ${score}`
    }, currentTheme)
  }, allThemes)
  const sorted = sortObject((_, __, a, b) => (a < b ? -1 : 1), allContrasts)
  console.log({ maxInfo, minInfo })

  await writeJson(
    `${__dirname}/outputs/contrast-to-background-${label}.json`,
    { allContrasts: sorted, maxInfo, minInfo },
    { spaces: 2 },
  )
}

test('dark', async () => {
  try {
    await evaluateContrast()
  } catch (err) {
    console.log(err)
  }
})

test('light', async () => {
  try {
    await evaluateContrast(allThemesLight, 'light', '#fafafa')
  } catch (err) {
    console.log(err)
  }
})
