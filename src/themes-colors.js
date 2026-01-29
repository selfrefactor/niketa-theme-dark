const { forEach } = require('rambdax')

const BLUE_LIGHT = '#0fc2f9'
const BRICK = '#DB7B75'
const BRICK_RED = '#eb5c5f'
const BROWN = '#DF8618'
const GREY = '#a9b5cf'
const ORANGE = '#E6844F'
const PINK = '#ff7eba'
const PINK_RED = '#e34ba9'
const PURPLE = '#bf7af0'
const TEAL = '#279CB2'
const WHITE = '#fdfdfd'
const YELLOW = '#F7ECB1'
const GREEN_DARK = '#5B9C71'
const BLUE_SKY = '#36F9F6'

const allDarkThemes = {
  AmericanDad: [GREEN_DARK, `#e0b0ff`, BROWN, BLUE_SKY, WHITE],
	AquaTeenHungerForce: ['#e5cc96', '#fe5dce', TEAL, '#5dfe8d', '#5d7dfe'],
  Archer: [BROWN, BLUE_LIGHT, '#E85B87', WHITE, `#ace1af`],
  ClevelandShow: [`#7fffd4`, TEAL, GREY, ORANGE, ORANGE],
  Dilbert: [`#ff6900`, PINK, YELLOW, `#0D98BA`, `#29AB87`, YELLOW],
  HomeMovies: [`#93ccea`, `#987654`, TEAL, PINK_RED, BROWN],
  SouthPark: [BRICK_RED,`#CC99FF`, `#dfa535`, `#7fbb9e`, `#dfa535`],
  TripTank: [`#48b5ff`, BRICK, `#9fb70a`, BRICK, WHITE],
	UglyAmericans: [`#CD5B45`, `#CC9900`, `#cdb1ab`, PURPLE, `#40d47e`],
}

const getSettings = input => {
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
  }, input)

  return settings
}

exports.allDarkThemes = allDarkThemes
exports.getSettings = getSettings
exports.WHITE = WHITE
