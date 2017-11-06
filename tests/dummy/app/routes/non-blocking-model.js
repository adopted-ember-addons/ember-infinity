import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

const { Route } = Ember;

export default Route.extend(InfinityRoute, {
  model: function() {
    return {
      posts: this.infinityModel('post')
    }
  }
});
