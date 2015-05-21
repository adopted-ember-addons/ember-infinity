var CoreObject = require('../../core-object');
var setup = require('./_setup');

var name = 'raw/create';

function Person(firstName,  lastName, middleName, age, sex) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.middleName = middleName;
  this.age = age;
  this.sex = sex;
}

function fn() {
  var data = this.data || {};
  return new Person(data.firstName, data.lastName, data.middleName, data.age, data.sex);
}

module.exports.fn    = fn;
module.exports.name  = name;
module.exports.setup = setup;
