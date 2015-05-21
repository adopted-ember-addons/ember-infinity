define('myModule', ['something'], function (Something) {

  'use strict';

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

});