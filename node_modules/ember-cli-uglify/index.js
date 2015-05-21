/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-uglify',
  included: function(app) {
    this._super.included.apply(this,arguments);

    this.options = app.options;
  },
  postprocessTree: function(type, tree) {
    if(this.options.minifyJS.enabled === true && type === 'all') {
      var options = this.options.minifyJS.options || {};
      options.sourceMapConfig = this.options.sourcemaps;
      return require('broccoli-uglify-sourcemap')(tree, options);
    } else {
      return tree;
    }
  }
};
