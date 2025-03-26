const $C = require('js-combinatorics')
const {
  colorContrastRatioCalculator
} = require('@mdhnpm/color-contrast-ratio-calculator')
const { pipe, map, sortBy, head, tap, filter, last, take } = require('rambda')
const { writeJson } = require('fs-extra')


function toArray (combinations){
	let result = []
	for (const combination of combinations) {
		result.push(combination)
	}
	return result
}

const getContrastReport = (combinations) => {
	return pipe(
		combinations,
		map(combination => {
			const color1 = combination[0]
			const color2 = combination[1]
			const score = colorContrastRatioCalculator(color1, color2)
			return {color1, color2, score}
		}),
		sortBy(x => x.score),
		x => ({
			lowestContrast: head(x),
			highestContrast: last(x),
			contrastSum: Math.round(x.reduce((acc, val) => acc + val.score, 0)),
		}),
	)
}

function fixColor (x){
	if (x.length === 4){
		return `#${x[1]}${x[1]}${x[2]}${x[2]}${x[3]}${x[3]}`
	}
	return x
}

function combinatoricsTheme ({
		colors,
		colorsCandidates
}){
	const result = pipe(
		colorsCandidates,
		map(fixColor),
		filter(x => x.length === 7),
		map(colorCandidate => ({colorCandidate, combinations: toArray(new $C.Combination([...colors, colorCandidate], 2))})),
		map(x => ({
			colorCandidate: x.colorCandidate,
			contrast: getContrastReport(x.combinations)
		})),
		filter(x => x.contrast.lowestContrast.score > 1.1),
		sortBy(x => -x.contrast.contrastSum),
		take(1000),
		sortBy(x => -x.contrast.lowestContrast.score),
		take(100),
		map(x => ({
			colorCandidate: x.colorCandidate,
			contrastSum: x.contrast.contrastSum,
			lowestContrast: x.contrast.lowestContrast.score,
		}))
	)
	return result
}

exports.combinatoricsTheme = combinatoricsTheme
