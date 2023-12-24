const readJson = require('./read-json').readJson;
const writeJson = require('./write-json').writeJson;

function saveToPackageJson(partialJson){
  const packageJson = readJson('package.json');
  const newPackageJson = {
    ...packageJson,
    contributes : { themes : partialJson },
  };
  writeJson('package.json', newPackageJson);
}

exports.saveToPackageJson = saveToPackageJson;