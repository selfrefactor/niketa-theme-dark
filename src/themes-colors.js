const { forEach } = require('rambdax')

const BLUE_DARK = '#00A6FB'
const BLUE_LIGHT = '#0fc2f9'
const BLUE_SKY = '#36F9F6'
const BRICK = '#DB7B75'
const BRICK_RED = '#eb5c5f'
const BROWN = '#DF8618'
const GREEN = '#70D342'
const GREEN_DARK = '#5B9C71'
const GREEN_LIGHT = '#7FDBCA'
const GREY = '#a9b5cf'
const ORANGE = '#E6844F'
const PINK = '#ff7ebc'
const PINK_RED = '#e34ba9'
const PURPLE = '#bf7af0'
const TEAL = '#279CB2'
const WHITE = '#fdfdfd'
const YELLOW = '#F7ECB4'

const allThemes = {
  AmericanDad: [GREEN_DARK, PINK_RED, BROWN, BLUE_SKY, WHITE],
  // harmony
  AquaTeenHungerForce: ['#eeb5ff', '#fe5dce', TEAL, '#5dfe8d', '#5d7dfe'],
  Archer: [BROWN, BLUE_LIGHT, '#E85B87', WHITE, WHITE],
  ClevelandShow: [BRICK, TEAL, GREY, ORANGE, ORANGE],
  Dilbert: [TEAL, PINK, YELLOW, YELLOW, TEAL, YELLOW],
  HomeMovies: [GREY, PINK_RED, TEAL, PINK_RED, BROWN],
  SouthPark: [BLUE_LIGHT, YELLOW, GREEN, BRICK_RED, GREEN],
  TripTank: [BLUE_DARK, BRICK, BLUE_DARK, BRICK, WHITE],
  UglyAmericans: [PINK_RED, GREY, GREEN_LIGHT, PURPLE, GREEN_LIGHT],
}

const getSettings = () => {
  const settings = {}
  let i = 0
  forEach((currentTheme, name) => {
    settings[i++] = {
      COLOR_0: currentTheme[0],
      COLOR_1: currentTheme[1],
      COLOR_2: currentTheme[2],
      COLOR_3: currentTheme[3],
      COLOR_4: currentTheme[4],
      name,
    }
  }, allThemes)

  return settings
}

exports.allThemes = allThemes
exports.getSettings = getSettings
