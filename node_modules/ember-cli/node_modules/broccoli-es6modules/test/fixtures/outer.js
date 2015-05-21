import monster from 'npm:vendor/monster';
import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    checkCookie: function() {
      if (monster.get('magical')) {
        alert('you have a magic cookie');
      }
    }
  }
});
