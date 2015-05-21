var CoreObject = require('../../core-object');
var setup = require('./_setup');

var name = 'core-object/create (default init)';

var Person = CoreObject.extend({

});

function fn() {
  return new Person(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
