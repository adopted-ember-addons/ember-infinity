'use strict';

var assign = require('lodash-node/modern/objects/assign');

function CoreObject(options) {
  assign(this, options);
}

module.exports = CoreObject;

CoreObject.extend = function(options) {
  var constructor = this;

  function Class() {
    CoreObject.apply(this, arguments);
    if (this.init) {
      this.init.apply(this, arguments);
    }
  }

  Class.__proto__ = CoreObject;

  Class.prototype = Object.create(constructor.prototype);
  assign(Class.prototype, options);
  Class.prototype._super = constructor.prototype;

  return Class;
};
