import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { map, sortObject } from 'rambdax'
import { BACK_COLOR } from './assets/back-color'
import { allThemes as allThemesInput } from './themes-colors'
import { allThemes as allThemesLight } from '../../../../niketa-theme/src/assets/themes-colors'
import { writeJson } from 'fs-extra'


async function evaluateContrast(allThemes = allThemesInput, label = 'dark', bgColor = BACK_COLOR){
  let max = Infinity
  let maxInfo
  let minInfo
  let min = 0
  const allContrasts = {}
  map((currentTheme, name) => {
    return map(color => {
      const score = colorContrastRatioCalculator(color, bgColor)
      allContrasts[ color ] = score
      if(score > min){
        min = score
        minInfo = `${ color } - ${ name } - ${score}`
      } 
      if(score < max){
        max = score
        maxInfo = `${ color } - ${ name } - ${score}`
      }
      return `${ color } - ${ score }`
    }, currentTheme)
  }, allThemes)
  const sorted = sortObject(
    (_, __, a, b) => a < b ? -1 : 1,
    allContrasts,
  )
  console.log({maxInfo, minInfo})

  await writeJson(
    `contrast-to-background-${label}.json`,{maxInfo, minInfo, allContrasts: sorted}, { spaces : 2 }
  )
}

test('dark', async () => {
  await evaluateContrast()
})
test('light', async () => {
  await evaluateContrast(allThemesLight, 'light', '#fafafa')
})
