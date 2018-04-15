import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Route.extend(InfinityRoute, {
  model({ page, perPage }) {
    return this.infinityModel('post', { startingPage: page, perPage });
  }
});
