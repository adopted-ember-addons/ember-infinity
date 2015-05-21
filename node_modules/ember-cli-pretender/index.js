'use strict';
var path = require('path');

module.exports = {
  name: 'ember-cli-pretender',

  included: function included(app) {
    if (app.app) {
      app = app.app;
    }
    this.app = app;

    if (app.env !== 'production') {
      app.import(app.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js');
      app.import(app.bowerDirectory + '/route-recognizer/dist/route-recognizer.js');
      app.import(app.bowerDirectory + '/pretender/pretender.js');
      app.import('vendor/ember-cli-pretender/shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
    }
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  }

};
