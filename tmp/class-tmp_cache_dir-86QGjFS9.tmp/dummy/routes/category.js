define('dummy/routes/category', ['exports', 'ember', 'ember-infinity/mixins/route'], function (exports, Ember, InfinityRoute) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
    model: function model(params) {
      return this.infinityModel('post', { category: params.category,
        perPage: 2 });
    }
  });

});