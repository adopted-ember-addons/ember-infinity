import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Route.extend(InfinityRoute, {
  model(params) {
    return this.infinityModel('post', { category: params.category, perPage: 2 });
  }
});
