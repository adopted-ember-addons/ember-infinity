'use strict';

exports.meaningOfLife = meaningOfLife;
exports.boom = boom;

var Something = require('../something');

function meaningOfLife() {
  new Something['default']();
  throw new Error(42);
}

function boom() {
  throw new Error('boom');
}