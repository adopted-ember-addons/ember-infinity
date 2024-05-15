import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CustomStoreRoute extends Route {
  @service customStore;
  @service infinity;

  model() {
    return this.infinity.model('custom-model', {
      store: this.customStore,
      storeFindMethod: 'findAll',
    });
  }
}
