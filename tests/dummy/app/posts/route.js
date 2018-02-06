import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Route.extend(InfinityRoute, {
  model: function() {
    return this.infinityModel('post', {perPage: 1, startingPage: 1});
  }
});
