import Route from '@ember/routing/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { inject as service } from '@ember/service';

const ExtendedInfinityModel = class extends InfinityModel {
  @service global;
  infinityModelUpdated() {
    this.global.isUpdated = true;
  }
};

export default class TestScrollableRoute extends Route {
  @service infinity;

  model({ page, perPage }) {
    return this.infinity.model('post', { startingPage: page, perPage }, ExtendedInfinityModel);
  }
}
