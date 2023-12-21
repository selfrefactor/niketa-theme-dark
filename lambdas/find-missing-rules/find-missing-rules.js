import { outputJson, readJson } from 'fs-extra'
import { filter } from 'rambdax'
import { resolve } from 'path'

const MISSING_COLORS = `${ __dirname }/missingColors.json`
const DIR = resolve(__dirname, '../../')

export async function findMissingRules(label){
  const foreign = await readJson(`${ __dirname }/assets/${ label }.json`)
  const local = await readJson(`${DIR}/themes/AmericanDad.json`)

  const currentMissingColors = await readJson(MISSING_COLORS)

  const allColors = {
    ...currentMissingColors.missingColors,
    ...local.colors,
  }
  const missingColors = filter((x, prop) => {
    if (allColors[ prop ]) return false

    return x
  })(foreign.colors)

  console.log(Object.keys(local.colors).length)
  console.log(Object.keys(foreign.colors).length)
  console.log(Object.keys(missingColors).length)

  if (Object.keys(missingColors).length > 1){
    await outputJson(
      MISSING_COLORS,
      {
        missingColors : {
          ...currentMissingColors.missingColors,
          ...missingColors,
        },
      },
      { spaces : 2 }
    )
  }
}
