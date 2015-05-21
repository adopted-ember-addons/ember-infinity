'use strict';

var path = require('path');
var fs = require('fs');
function readFile(path){
  if (fs.existsSync(path)) {
    return fs.readFileSync(path);
  }
}

module.exports = function readPackageJSON(projectRoot) {
  var filePath = path.join(projectRoot, 'package.json');
  try {
    return JSON.parse(readFile(filePath));
  } catch (e) {
    return null;
  }
};
