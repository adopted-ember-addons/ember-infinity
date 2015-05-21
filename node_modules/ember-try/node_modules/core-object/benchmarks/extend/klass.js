var Klass = require('klass');
var setup = require('./_setup');

var name = 'klass/extend';
var Person = Klass(function Person(firstName,  lastName, middleName, age, sex) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.middleName = middleName;
  this.age = age;
  this.sex = sex;
})


function fn() {
  return Person.extend(this.data);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
