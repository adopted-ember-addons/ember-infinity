define('outer', ['exports', 'npm:vendor/monster', 'ember'], function (exports, monster, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    actions: {
      checkCookie: function() {
        if (monster['default'].get('magical')) {
          alert('you have a magic cookie');
        }
      }
    }
  });

});