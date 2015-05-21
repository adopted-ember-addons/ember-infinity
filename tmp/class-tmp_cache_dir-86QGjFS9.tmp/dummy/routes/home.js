define('dummy/routes/home', ['exports', 'ember', 'ember-infinity/mixins/route'], function (exports, Ember, InfinityRoute) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
    model: function model() {
      return this.infinityModel('post');
    }
  });

});