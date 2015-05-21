'use strict';

var path = require('path');
var fs   = require('fs');

function EmberCLIICAjax(project) {
  this.project = project;
  this.name    = 'Ember CLI ic-ajax';
}

function unwatchedTree(dir) {
  return {
    read:    function() { return dir; },
    cleanup: function() { }
  };
}

EmberCLIICAjax.prototype.treeFor = function treeFor(name) {
  if (name !== 'vendor') { return; }

  var treePath =  path.join('node_modules', 'ember-cli-ic-ajax', 'node_modules');

  return unwatchedTree(treePath);
};

EmberCLIICAjax.prototype.included = function included(app) {
  this.app = app;
  var options = this.app.options.icAjaxOptions || {enabled: true};

  if (options.enabled) {
    this.app.import('vendor/ic-ajax/dist/named-amd/main.js', {
      exports: {
        'ic-ajax': [
          'default',
          'defineFixture',
          'lookupFixture',
          'raw',
          'request',
        ]
      }
    });
  }
};

module.exports = EmberCLIICAjax;
