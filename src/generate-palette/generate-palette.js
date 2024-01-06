let { baseData }= require('./base-palette.js')

const { outputJson } = require('fs-extra')
const { resolve } = require('path')
const { maybe, remove, replace } = require('rambdax')


const UNDERLINE = '.UNDERLINE'
const ITALIC = '.ITALIC'
const BOLD = '.BOLD'
const extensions = [ '.jsx', '.ts', '.tsx' ]

async function save(data){
  let output = resolve(__dirname, '../palette.json')
  await outputJson(
    output
    , data, { spaces : 2 }
  )
}

function pushToTokenColors({ syntaxInstance, fontStyle, tokenColors, color }){
  const tokenColor = {
    name     : syntaxInstance,
    scope    : syntaxInstance,
    settings : {
      ...fontStyle,
      foreground : color,
    },
  }

  tokenColors.push(tokenColor)

  if (syntaxInstance.endsWith('.js')){
    const plainSyntaxInstance = remove('.js', syntaxInstance)

    extensions.forEach(extension => {
      const tokenColorExtension = {
        name     : `${ plainSyntaxInstance }${ extension }`,
        scope    : `${ plainSyntaxInstance }${ extension }`,
        settings : {
          ...fontStyle,
          foreground : color,
        },
      }
      tokenColors.push(tokenColorExtension)
    })
  }
  if (syntaxInstance.endsWith('.begin.js')){
    const endSyntaxInstance = replace(
      '.begin.js', '.end.js', syntaxInstance
    )
    pushToTokenColors({
      syntaxInstance : endSyntaxInstance,
      fontStyle,
      tokenColors,
      color,
    })
  }
}

function generatePalette(type){
  const baseBase = {
    name   : '_Palette',
    type   : type,
    colors : {},
  }
  const tokenColors = []

  Object.entries(baseData).forEach(([ color, syntaxInstances ]) => {
    syntaxInstances.forEach(syntaxInstanceRaw => {
      const syntaxInstance = remove([ UNDERLINE, ITALIC, BOLD ],
        syntaxInstanceRaw)
      const fontStyle = maybe(
        syntaxInstanceRaw.endsWith(UNDERLINE),
        { fontStyle : 'underline' },
        syntaxInstanceRaw.endsWith(ITALIC) ?
          { fontStyle : 'italic' } :
          syntaxInstanceRaw.endsWith(BOLD) ?
            { fontStyle : 'bold' } :
            {}
      )

      pushToTokenColors({
        syntaxInstance,
        fontStyle,
        color,
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
