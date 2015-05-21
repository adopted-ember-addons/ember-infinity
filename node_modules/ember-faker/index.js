'use strict';
var path = require('path');

module.exports = {
  name: 'ember-faker',

  included: function included(app) {
    this.app = app;
    var addonConfig = this.app.project.config(app.env)['ember-faker'];

    if (app.env !== 'production' || addonConfig.enabled) {
      app.import(app.bowerDirectory + '/Faker/build/build/faker.js');
      app.import('vendor/ember-faker/shim.js', {
        type: 'vendor',
        exports: { 'faker': ['default'] }
      });
    }
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  }
};
