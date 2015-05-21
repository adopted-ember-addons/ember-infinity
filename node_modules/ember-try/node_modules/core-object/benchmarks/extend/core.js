var CoreObject = require('../../core-object');
var setup = require('./_setup');

var name = 'core-object/extend';

function fn() {
  return CoreObject.extend(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
