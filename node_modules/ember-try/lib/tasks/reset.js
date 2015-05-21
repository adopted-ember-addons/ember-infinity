'use strict';
var CoreObject      = require('core-object');
var BowerHelpers    = require('../utils/bower-helpers');

module.exports = CoreObject.extend({
  run: function(){
    return BowerHelpers.cleanup(this.project.root);
  }
});
