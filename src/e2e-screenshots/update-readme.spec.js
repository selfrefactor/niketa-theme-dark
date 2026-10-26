/**
 * Keeps README.md in sync with package.json contributes.themes.
 *
 * Fails when the committed "## Screens" section differs from what
 * update-readme.js would generate (missing theme, renamed theme, stale path).
 */

const { readFileSync } = require('fs')
const {
  README_PATH,
  renderScreensSection,
  replaceScreensSection,
  themeImage,
  themeTitle,
} = require('./update-readme')

const pkg = require('../../package.json')

test('theme labels map to README titles', () => {
  expect(themeTitle('AquaTeenHungerForce')).toBe('Aqua Teen Hunger Force')
  expect(themeTitle('AmericanDad')).toBe('American Dad')
  expect(themeImage('AmericanDad')).toBe(
    '![VSCode theme screen](screens/american.dad.png)',
  )
})

test('README screens section matches package.json themes', () => {
  const themes = pkg.contributes?.themes
  expect(Array.isArray(themes)).toBe(true)

  const readme = readFileSync(README_PATH, 'utf-8')
  const section = renderScreensSection(themes)

  expect(replaceScreensSection(readme, section)).toBe(readme)
  expect(readme).toContain(section)
})

test('every theme screenshot is referenced', () => {
  const readme = readFileSync(README_PATH, 'utf-8')

  for (const { label } of pkg.contributes.themes) {
    expect(readme).toContain(themeImage(label))
  }
})
