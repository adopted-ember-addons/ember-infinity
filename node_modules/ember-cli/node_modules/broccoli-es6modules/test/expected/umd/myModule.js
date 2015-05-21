(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('something')) :
  typeof define === 'function' && define.amd ? define(['something'], factory) :
  global.myModule = factory(global.Something)
}(this, function (Something) { 'use strict';

  function meaningOfLife() {
    new Something();
    throw new Error(42);
  }

  function boom() {
    throw new Error('boom');
  }

  var x = meaningOfLife + 42;


  var bundle = x;

  return bundle;

}));