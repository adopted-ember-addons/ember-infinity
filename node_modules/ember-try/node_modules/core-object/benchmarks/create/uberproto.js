var Proto = require('uberproto');
var setup = require('./_setup');

var name = 'uberproto/create';

var Person = Proto.extend({

});

function fn() {
  return Person.create(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
