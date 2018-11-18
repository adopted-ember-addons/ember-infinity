import Route from '@ember/routing/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

const ExtendedInfinityModel =  InfinityModel.extend({
  infinityModelUpdated() {
    set(get(this, 'global'), 'isUpdated', true);
  }
});

export default Route.extend({
  global: service(),
  infinity: service(),

  model({ page, perPage }) {
    let global = get(this, 'global');
    return get(this, 'infinity').model(
      'post',
      { startingPage: page, perPage },
      ExtendedInfinityModel.extend({ global })
    );
  }
});
