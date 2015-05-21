var setup = require('./_setup');

var name = 'esnext/create';
var Person = function() {
  "use strict";

  function Person(firstName, lastName, middleName, sex, age) {
    var $__arguments0 = arguments;
    var $__arguments = $__arguments0;
    if ($__arguments.length === 0) { return; }

    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.sex = sex;
    this.age = age;
  }

  return Person;
}();

function fn() {
  var data = this.data || {};
  return new Person(data.firstName, data.lastName, data.middleName, data.age, data.sex);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
