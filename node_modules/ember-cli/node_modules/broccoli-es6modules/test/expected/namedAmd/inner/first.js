define('inner/first', ['exports', 'something'], function (exports, Something) {

  'use strict';

  exports.meaningOfLife = meaningOfLife;
  exports.boom = boom;

  function meaningOfLife() {
    new Something['default']();
    throw new Error(42);
  }

  function boom() {
    throw new Error('boom');
  }

});