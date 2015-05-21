var CoreObject = require('backbone-metal').Class;
var setup = require('./_setup');

var name = 'backbone-metal/extend';

function fn() {
  return CoreObject.extend(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
