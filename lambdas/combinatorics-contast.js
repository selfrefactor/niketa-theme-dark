const $C = require('js-combinatorics')
const { allThemes } = require('../src/themes-colors.js')
const { colorContrastRatioCalculator } = require('@mdhnpm/color-contrast-ratio-calculator')
const { range, uniq } = require('rambdax')
const { writeJson } = require('fs-extra')

function getReport(theme){
  const colors = uniq(theme)
  const themeIndexes = range(0, colors.length).join('')
  const it = new $C.Combination(themeIndexes, 2)
  let minContrast = Infinity
  let minContastColor = ''
  let maxContrast = -Infinity
  let maxContastColor = ''

  for (const elem of it){
    const color1 = colors[ Number(elem[ 0 ]) ]
    const color2 = colors[ Number(elem[ 1 ]) ]
    const score = colorContrastRatioCalculator(color1, color2)
    if (score < minContrast){
      minContrast = score
      minContastColor = `${ color1 } - ${ color2 } - ${ score }`
    } else if (score > maxContrast){
      maxContrast = score
      maxContastColor = `${ color1 } - ${ color2 } - ${ score }`
    }
  }

  return {
    maxContastColor,
    maxContrast,
    minContastColor,
    minContrast,
  }
}

async function combinatoricsContast(){
  const report = {}
  Object.keys(allThemes).forEach(themeName => {
    const theme = allThemes[ themeName ]
    const themeReport = getReport(theme)
    report[ themeName ] = themeReport
  })
  const maxContrastList = Object.values(report).map(x => x.maxContrast).sort()
  const maxContrast = [maxContrastList[0], maxContrastList[ maxContrastList.length - 1 ]]
  const minContrastList = Object.values(report).map(x => x.minContrast).sort()
  const minContrast = [minContrastList[0], minContrastList[ minContrastList.length - 1 ]]
  console.log(report)
  await writeJson(
    'contrast-report.json', {report, minContrast, maxContrast}, { spaces : 2 }
  )
}

exports.combinatoricsContast = combinatoricsContast
