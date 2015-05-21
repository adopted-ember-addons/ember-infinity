'use strict';

var path = require('path');
var fs   = require('fs');
var jshintTrees = require('broccoli-jshint');

module.exports = {
  name: 'Ember CLI QUnit',

  buildConsole: function() {
    var ui = this.ui;

    if (!ui) {
      this.console = console;
      return;
    }

    this.console = {
      log: function(data) {
        ui.writeLine(data);
      },

      error: function(data) {
        ui.writeLine(data, 'ERROR');
      }
    }
  },

  init: function() {
    this.buildConsole();
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function included(app, parentAddon) {
    var target = (parentAddon || app);
    this._super.included(target);

    var testSupportPath = target.options.outputPaths.testSupport.js;
    testSupportPath = testSupportPath.testSupport || testSupportPath;
    testSupportPath = path.dirname(testSupportPath) || 'assets';

    if (app.tests) {
      var fileAssets = [
        app.bowerDirectory + '/qunit/qunit/qunit.js',
        app.bowerDirectory + '/qunit/qunit/qunit.css'
      ];

      var imgAssets = [];

      var qunitNotificationsPath = app.bowerDirectory + '/qunit-notifications/index.js';
      if (fs.existsSync(qunitNotificationsPath)) {
        fileAssets.push(qunitNotificationsPath);
        imgAssets.push(
          app.bowerDirectory + '/ember-qunit-notifications/passed.png',
          app.bowerDirectory + '/ember-qunit-notifications/failed.png'
        );
      }

      fileAssets.push(
        'vendor/ember-cli-qunit/qunit-configuration.js',
        'vendor/ember-cli-qunit/test-loader.js'
      );

      var addonOptions = target.options['ember-cli-qunit'];
      if (addonOptions && !addonOptions.disableContainerStyles) {
        fileAssets.push('vendor/ember-cli-qunit/test-container-styles.css');
      }

      var emberQunitPath = app.bowerDirectory + '/ember-qunit/ember-qunit.amd.js';
      if (!fs.existsSync(emberQunitPath)) {
        emberQunitPath = app.bowerDirectory + '/ember-qunit/named-amd/main.js';
      }

      app.import(emberQunitPath, {
        type: 'test',
        exports: {
          'qunit': [
            'default',
            'module',
            'test'
          ],

          'ember-qunit': [
            'globalize',
            'moduleFor',
            'moduleForComponent',
            'moduleForModel',
            'test',
            'setResolver'
          ]
        }
      });

      fileAssets.forEach(function(file){
        app.import(file, {
          type: 'test'
        });
      });

      imgAssets.forEach(function(img){
        app.import(img, {
          type: 'test',
          destDir: testSupportPath
        });
      });
    }

    this.jshintrc = app.options.jshintrc;
  },

  contentFor: function(type) {
    if (type === 'test-body') {
      return this._readTemplate('test-body');
    }
  },

  _readTemplate: function(name) {
    return fs.readFileSync(path.join(__dirname, 'templates', name + '.html'));
  },

  lintTree: function(type, tree) {
    var ui = this.ui;

    return jshintTrees(tree, {
      jshintrcPath: this.jshintrc[type],
      description: 'JSHint ' +  type + '- QUnit',
      console: this.console
    });
  }
};
