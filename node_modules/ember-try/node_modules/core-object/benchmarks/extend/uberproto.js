var Proto = require('uberproto');
var setup = require('./_setup');

var name = 'uberproto/extend';

function fn() {
  return Proto.extend(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
