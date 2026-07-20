/**
 * Populate screens: copy raw_screens/*.png → screens/*.png
 * with correct theme names from package.json contributes.themes.
 *
 * This replaces the old files/populate_screens/populateScreens.js approach.
 * Raw screens come from generate-screenshots.js.
 *
 * Usage: node src/e2e-screenshots/populate-screens.js
 */

const { readdirSync, copyFileSync, existsSync, mkdirSync } = require('fs')
const { resolve } = require('node:path')
const { sort } = require('rambdax')
const { dotCase } = require('string-fn')

const ROOT = resolve(__dirname, '../..')
const SCREENS_DIR = resolve(ROOT, 'screens')
const RAW_SCREENS_DIR = resolve(SCREENS_DIR, 'raw_screens')
const PACKAGE_JSON = resolve(ROOT, 'package.json')

function main() {
  const pkg = require(PACKAGE_JSON)
  const themes = pkg.contributes?.themes

  if (!themes || themes.length === 0) {
    console.error('No themes found in package.json contributes.themes')
    process.exit(1)
  }

  // Get theme names in dot_case format (e.g., AmericanDad → american.dad)
  const themeNames = themes.map(({ label }) => dotCase(label))
  const sortFn = (a, b) => (a > b ? 1 : -1)
  const sortedThemeNames = sort(sortFn, themeNames)

  // Get raw screenshots
  if (!existsSync(RAW_SCREENS_DIR)) {
    console.error(`Raw screens directory not found: ${RAW_SCREENS_DIR}`)
    console.error('Run "yarn screenshots" first')
    process.exit(1)
  }

  const rawFiles = readdirSync(RAW_SCREENS_DIR)
    .filter(f => f.endsWith('.png'))
    .sort()

  if (rawFiles.length === 0) {
    console.error('No PNG files found in raw_screens/')
    process.exit(1)
  }

  if (rawFiles.length !== sortedThemeNames.length) {
    console.warn(
      `Warning: ${rawFiles.length} raw screens but ${sortedThemeNames.length} themes`,
    )
  }

  if (!existsSync(SCREENS_DIR)) {
    mkdirSync(SCREENS_DIR, { recursive: true })
  }

  // Copy each raw screen to its destination
  rawFiles.forEach((rawFile, i) => {
    const sourcePath = resolve(RAW_SCREENS_DIR, rawFile)
    const destName = sortedThemeNames[i]
    if (!destName) {
      console.warn(`  Skipping ${rawFile}: no matching theme`)
      return
    }
    const destPath = resolve(SCREENS_DIR, `${destName}.png`)
    copyFileSync(sourcePath, destPath)
    console.log(`  ${rawFile} → ${destName}.png`)
  })

  console.log(`\nCopied ${Math.min(rawFiles.length, sortedThemeNames.length)} screenshots`)
}

main()
