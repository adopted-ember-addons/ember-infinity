import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

const ExtendedInfinityModel =  InfinityModel.extend({
  buildParams() {
    let params = this._super(...arguments);
    params['categoryId'] = get(this, 'global').categoryId;
    return params;
  }
});

export default Route.extend(InfinityRoute, {
  global: service(),

  model() {
    let global = get(this, 'global');
    return this.infinityModel(
      'post',
      {},
      ExtendedInfinityModel.extend({ global })
    )
  }
});
