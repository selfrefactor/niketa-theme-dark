const { map } = require('rambdax')
const { PUNCTUATION_COLOR, SUBTLE_COLOR } = require('./assets/back-color')

const PUNCTUATIONS = [
  'meta.group.braces.round.function.arguments',
  'function.brace',
  'meta.brace',
  'meta.brace.round',
  'meta.brace.square',
  'meta.group.braces.curly',
]

const SUBTLE_LIST = [
  'comment',
  'comment.block',
  'comment.block.documentation',
  'comment.line.double-slash',
  'punctuation.definition.comment',
]

function isPunctuation(tokenColorName) {
  if (tokenColorName.startsWith('punctuation.')) return true
  const found = PUNCTUATIONS.find((x) => tokenColorName.startsWith(x))

  return Boolean(found)
}

function isSubtle(tokenColorName) {
  const found = SUBTLE_LIST.find((x) => tokenColorName.startsWith(x))

  return Boolean(found)
}

function getForeground(tokenColor, colors) {
  if (isSubtle(tokenColor.name)) return SUBTLE_COLOR
  if (isPunctuation(tokenColor.name)) return PUNCTUATION_COLOR

  return colors[tokenColor.settings.foreground]
}

function generateThemeData({ chromeColors, palette, themeColors }) {
  const tokenColors = map(
    (tokenColor) => ({
      ...tokenColor,
      settings: {
        ...tokenColor.settings,
        foreground: getForeground(tokenColor, themeColors),
      },
    }),
    palette.tokenColors,
  )
  return {
    ...palette,
    colors: chromeColors,
    tokenColors,
    type: 'dark',
  }
}

exports.generateThemeData = generateThemeData
