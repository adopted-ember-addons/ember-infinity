'use strict';

var path = require('path');
var checker = require('ember-cli-version-checker');
var htmlbarsCompile = require('./index');

module.exports = {
  name: 'ember-cli-htmlbars',

  init: function() {
    checker.assertAbove(this, '0.1.2');
  },

  parentRegistry: null,

  shouldSetupRegistryInIncluded: function() {
    return !checker.isAbove(this, '0.2.0');
  },

  setupPreprocessorRegistry: function(type, registry) {
    var self = this;

    // ensure that broccoli-ember-hbs-template-compiler is not processing hbs files
    registry.remove('template', 'broccoli-ember-hbs-template-compiler');

    registry.add('template', {
      name: 'ember-cli-htmlbars',
      ext: 'hbs',
      toTree: function(tree) {

        return htmlbarsCompile(tree, self.htmlbarsOptions());
      }
    });

    if (type === 'parent') {
      this.parentRegistry = registry;
    }
  },

  included: function (app) {
    this._super.included.apply(this, arguments);

    if (this.shouldSetupRegistryInIncluded()) {
      this.setupPreprocessorRegistry('parent', app.registry);
    }
  },

  projectConfig: function () {
    return this.project.config(process.env.EMBER_ENV);
  },

  templateCompilerPath: function() {
    var config = this.projectConfig();
    var templateCompilerPath = config['ember-cli-htmlbars'] && config['ember-cli-htmlbars'].templateCompilerPath;

    if (!templateCompilerPath) {
      templateCompilerPath = this.project.bowerDirectory + '/ember/ember-template-compiler';
    }

    return path.resolve(this.project.root, templateCompilerPath);
  },

  htmlbarsOptions: function() {
    var projectConfig = this.projectConfig() || {};
    var EmberENV = projectConfig.EmberENV || {};

    var htmlbarsOptions = {
      isHTMLBars: true,
      FEATURES: EmberENV.FEATURES,
      templateCompiler: require(this.templateCompilerPath()),

      plugins: {
        ast: this.astPlugins()
      }
    };

    return htmlbarsOptions;
  },

  astPlugins: function() {
    var pluginWrappers = this.parentRegistry.load('htmlbars-ast-plugin');
    var plugins = pluginWrappers.map(function(wrapper) {
      return wrapper.plugin;
    });

    return plugins;
  }
};
