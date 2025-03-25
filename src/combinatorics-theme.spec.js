// const {
//   allThemes: allThemesLight,
// } = require('../../niketa-theme/src/assets/themes-colors.js')
const { allDarkThemes } = require('./themes-colors.js')

test('dark', async () => {
	let background = `#1F2023`
	let index = 0
	let allKeys = Object.keys(allDarkThemes)
	let currentTheme = allDarkThemes[allKeys[index]]
  combinatoricsTheme({
		colors,
		colorsCandidates
	})
})
