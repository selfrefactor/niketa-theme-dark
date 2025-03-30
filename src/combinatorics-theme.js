const $C = require('js-combinatorics')
const {
  colorContrastRatioCalculator
} = require('@mdhnpm/color-contrast-ratio-calculator')
const { pipe, map, sortBy, head, filter, last, take, mapObject, sortByDescending, sortByPathDescending } = require('rambda')
const { toDecimal } = require('rambdax')


function toArray (combinations){
	let result = []
	for (const combination of combinations) {
		result.push(combination)
	}
	return result
}

const getContrastReport = ({combinations, colorCandidate, background}) => {
	return pipe(
		combinations,
		map(combination => {
			const color1 = combination[0]
			const color2 = combination[1]
			const score = colorContrastRatioCalculator(color1, color2)
			return {color1, color2, score, includesColorCandidate: color1 === colorCandidate || color2 === colorCandidate, 
				includesBackground: color1 === background || color2 === background
			}
		}),
		sortBy(x => x.score),
		x => ({
			lowestContrast: head(x),
			highestContrast: last(x),
			contrastSum: Math.round(x.reduce((acc, val) => acc + val.score, 0)),
			contrastSumOfCandidate: x.filter(y => y.includesColorCandidate).reduce((acc, val) => acc + val.score, 0),
			contrastSumOfBackground: x.filter(y => y.includesBackground).reduce((acc, val) => acc + val.score, 0),
		}),
		mapObject((val, prop) => {
			if(prop.startsWith('contrastSum')){
				return toDecimal(val, 2)
			}
			return val
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
		colorsCandidates,
		background
}){
	const result = pipe(
		colorsCandidates,
		map(fixColor),
		filter(x => x.length === 7),
		map(colorCandidate => ({colorCandidate, combinations: toArray(new $C.Combination([...colors, colorCandidate], 2))})),
		map(x => ({
			colorCandidate: x.colorCandidate,
			contrast: getContrastReport({
				combinations: x.combinations,
				colorCandidate: x.colorCandidate,
				background
			}),
		})),
		filter(x => x.contrast.lowestContrast.score > 1.1),
		sortByPathDescending('contrast.contrastSum'),
		take(300),
		sortByPathDescending('contrast.lowestContrast.score'),
		take(200),
		sortByPathDescending('contrast.contrastSumOfCandidate'),
		take(100),
		map(x => ({
			colorCandidate: x.colorCandidate,
			contrastSum: x.contrast.contrastSum,
			contrastSumOfCandidate: x.contrast.contrastSumOfCandidate,
			contrastSumOfBackground: x.contrast.contrastSumOfBackground,
			lowestContrast: x.contrast.lowestContrast.score,
		})),
		
	)
	return result
}

exports.combinatoricsTheme = combinatoricsTheme
