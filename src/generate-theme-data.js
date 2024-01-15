const { map } = require('rambdax')

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
  const found = PUNCTUATIONS.find(x => tokenColorName.startsWith(x))

  return Boolean(found)
}

function isSubtle(tokenColorName) {
  const found = SUBTLE_LIST.find(x => tokenColorName.startsWith(x))

  return Boolean(found)
}

function getForeground(tokenColor, colors, punctuationColor, subtleColor) {
  if (isSubtle(tokenColor.name)) return subtleColor
  if (isPunctuation(tokenColor.name)) return punctuationColor

  return colors[tokenColor.settings.foreground]
}

function generateThemeData({
  chromeColors,
  palette,
  punctuationColor,
  subtleColor,
  themeColors,
  type,
}) {
  const tokenColors = map(
    tokenColor => ({
      ...tokenColor,
      settings: {
        ...tokenColor.settings,
        foreground: getForeground(
          tokenColor,
          themeColors,
          punctuationColor,
          subtleColor,
        ),
      },
    }),
    palette.tokenColors,
  )
  return {
    ...palette,
    colors: chromeColors,
    tokenColors,
    type,
  }
}

exports.generateThemeData = generateThemeData
