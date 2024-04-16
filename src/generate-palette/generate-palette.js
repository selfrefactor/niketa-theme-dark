const { baseData } = require('./base-palette.js')

const { outputJson } = require('fs-extra')
const { resolve } = require('node:path')
const { maybe, remove, replace } = require('rambdax')

const UNDERLINE = '.UNDERLINE'
const ITALIC = '.ITALIC'
const BOLD = '.BOLD'
const extensions = ['.jsx', '.ts', '.tsx']

async function save(data) {
  const output = resolve(__dirname, '../palette.json')
  await outputJson(output, data, { spaces: 2 })
}

function pushToTokenColors({ color, fontStyle, syntaxInstance, tokenColors }) {
  const tokenColor = {
    name: syntaxInstance,
    scope: syntaxInstance,
    settings: {
      ...fontStyle,
      foreground: color,
    },
  }

  tokenColors.push(tokenColor)

  if (syntaxInstance.endsWith('.js')) {
    const plainSyntaxInstance = remove('.js', syntaxInstance)

    extensions.forEach((extension)=> {
      const tokenColorExtension = {
        name: `${plainSyntaxInstance}${extension}`,
        scope: `${plainSyntaxInstance}${extension}`,
        settings: {
          ...fontStyle,
          foreground: color,
        },
      }
      tokenColors.push(tokenColorExtension)
    })
  }
  if (syntaxInstance.endsWith('.begin.js')) {
    const endSyntaxInstance = replace('.begin.js', '.end.js', syntaxInstance)
    pushToTokenColors({
      color,
      fontStyle,
      syntaxInstance: endSyntaxInstance,
      tokenColors,
    })
  }
}

function generatePalette(type) {
  const baseBase = {
    colors: {},
    name: '_Palette',
    type: type,
  }
  const tokenColors = []

  Object.entries(baseData).forEach(([color, syntaxInstances])=> {
    syntaxInstances.forEach((syntaxInstanceRaw)=> {
      const syntaxInstance = remove(
        [UNDERLINE, ITALIC, BOLD],
        syntaxInstanceRaw,
      )
      const fontStyle = maybe(
        syntaxInstanceRaw.endsWith(UNDERLINE),
        { fontStyle: 'underline' },
        syntaxInstanceRaw.endsWith(ITALIC)
          ? { fontStyle: 'italic' }
          : syntaxInstanceRaw.endsWith(BOLD)
					  ? { fontStyle: 'bold' }
					  : {},
      )

      pushToTokenColors({
        color,
        fontStyle,
        syntaxInstance,
        tokenColors,
      })
    })
  })

  const themeBase = {
    ...baseBase,
    tokenColors,
  }

  save(themeBase)
}

exports.generatePalette = generatePalette
