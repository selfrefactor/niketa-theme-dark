require('./grad-stop.js');
const { map, replace, split } = require('rambdax');
const { rgbHex } = require('./rgb-hex');

const parseGradient = input => {
  const str = replace(
    /rgb\(|\)/g, '', input
  );

  return map(val => Number(val.trim()), split(',', str));
}

function getGradientBee(
  from, to, levels = 5
){
  let gradient;
  try {
    gradient = gradStop({
      stops       : levels,
      inputFormat : 'hex',
      colorArray  : [ from, to ],
    });
    gradient = gradient.map(val => parseGradient(val));
    gradient = gradient.map(val => `#${ rgbHex(...val) }`);
  } catch (e){
    console.log({
      from,
      to,
    });
    throw e;
  }

  return gradient;
}

exports.getGradient = getGradientBee;