import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Ember.Route.extend(InfinityRoute, {
  model: function() {
    return this.infinityModel('post', {perPage: 1, startingPage: 1});
  }
});
