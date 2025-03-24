const $C = require('js-combinatorics')
const {
  colorContrastRatioCalculator,
} = require('@mdhnpm/color-contrast-ratio-calculator')
const { range, uniq } = require('rambdax')
const { writeJson } = require('fs-extra')

function getContrastReport(theme) {
  const uniqueColors = uniq(theme)
  const themeIndexes = range(0, uniqueColors.length).join('')
  const combinations = new $C.Combination(themeIndexes, 2)
  let minContrast = Number.POSITIVE_INFINITY
  let minContrastColors = ''
  let maxContrast = Number.NEGATIVE_INFINITY
  let maxContrastColors = ''

  for (const combination of combinations) {
    const color1 = uniqueColors[Number(combination[0])]
    const color2 = uniqueColors[Number(combination[1])]
    const score = colorContrastRatioCalculator(color1, color2)
    if (score < minContrast) {
      minContrast = score
      minContrastColors = `${color1} - ${color2} - ${score}`
    } else if (score > maxContrast) {
      maxContrast = score
      maxContrastColors = `${color1} - ${color2} - ${score}`
    }
  }

  return {
    maxContrast,
    maxContrastColors,
    minContrast,
    minContrastColors,
  }
}

async function generateContrastReport(allThemes, label) {
  const report = {}

  Object.keys(allThemes).forEach(themeName => {
    const theme = allThemes[themeName]
    const themeReport = getContrastReport(theme)
    report[themeName] = themeReport
  })
  const maxContrastList = Object.values(report)
    .map(x => x.maxContrast)
    .sort()
  const maxContrast = [
    maxContrastList[0],
    maxContrastList[maxContrastList.length - 1],
  ]
  const minContrastList = Object.values(report)
    .map(x => x.minContrast)
    .sort()
  const minContrast = [
    minContrastList[0],
    minContrastList[minContrastList.length - 1],
  ]
  console.log(report)
  await writeJson(
    `${__dirname}/outputs/contrast-report-${label}.json`,
    { maxContrast, minContrast, report },
    { spaces: 2 },
  )
}

exports.generateContrastReport = generateContrastReport
