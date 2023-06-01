import Route from '@ember/routing/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { inject as service } from '@ember/service';

const ExtendedInfinityModel = InfinityModel.extend({
  buildParams() {
    let params = this._super(...arguments);
    return params;
  },

  afterInfinityModel(posts) {
    this.set('canLoadMore', posts.get('length') > 0);
  },
});

export default class ExtendedRoute extends Route {
  @service infinity;

  model() {
    return this.infinity.model('post', { perPage: 6 }, ExtendedInfinityModel);
  }
}
