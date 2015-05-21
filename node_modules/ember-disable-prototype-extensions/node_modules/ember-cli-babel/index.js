var checker   = require('ember-cli-version-checker');

module.exports = {
  name: 'ember-cli-babel',

  shouldSetupRegistryInIncluded: function() {
    return !checker.isAbove(this, '0.2.0');
  },

  setupPreprocessorRegistry: function(type, registry) {
    var addon = this;
    var plugin = {
      name: 'ember-cli-babel',
      ext: 'js',
      toTree: function(tree) {
        return require('broccoli-babel-transpiler')(tree, getOptions(addon));
      }
    };

    registry.add('js', plugin);
  },

  included: function(app) {
    this._super.included.apply(this, arguments);
    this.app = app;
    if (this.shouldSetupRegistryInIncluded()) {
      this.setupPreprocessorRegistry('parent', app.registry);
    }
  }
};

function getOptions(addonContext) {
  var baseOptions = (addonContext.parent && addonContext.parent.options) || (addonContext.app && addonContext.app.options),
      options = baseOptions && baseOptions['babel'] || {};
  // Ensure modules aren't compiled unless explicitly set to compile
  options.blacklist = options.blacklist || ['es6.modules'];

  if (options.compileModules === true) {
    if (options.blacklist.indexOf('es6.modules') >= 0) {
      options.blacklist.splice(options.blacklist.indexOf('es6.modules'), 1);
    }

    delete options.compileModules;
  } else {
    if (options.blacklist.indexOf('es6.modules') < 0) {
      options.blacklist.push('es6.modules');
    }
  }

  // Ember-CLI inserts its own 'use strict' directive
  options.blacklist.push('useStrict');

  return options;
}
