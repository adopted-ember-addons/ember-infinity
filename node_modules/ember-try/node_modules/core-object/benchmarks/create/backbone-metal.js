var Class = require('backbone-metal').Class;
var setup = require('./_setup');

var name = 'backbone-metal/create';

var Person = Class.extend({
  initialize: function(options) {
    if (options === undefined) return;

    this.firstName  = options.firstName;
    this.lastName   = options.lastName;
    this.middleName = options.middleName;

    this.sex = options.sex;
    this.age = options.age;
  }
});

function fn() {
  return new Person(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
