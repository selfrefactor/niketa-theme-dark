const fs = require('fs-extra');
const path = require('path');

const BASE = path.resolve(__dirname, '../../');

function writeJson(filePath, obj){
  const resolvedPath = path.resolve(BASE, filePath);

  fs.outputFileSync(resolvedPath, JSON.stringify(
    obj, null, 2
  ));
}

exports.writeJson = writeJson;