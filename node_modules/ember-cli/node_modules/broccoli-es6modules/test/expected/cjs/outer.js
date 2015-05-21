'use strict';

var monster = require('npm:vendor/monster');
var Ember = require('ember');

exports['default'] = Ember['default'].Route.extend({
  actions: {
    checkCookie: function() {
      if (monster['default'].get('magical')) {
        alert('you have a magic cookie');
      }
    }
  }
});