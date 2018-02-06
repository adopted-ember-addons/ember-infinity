import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Route.extend(InfinityRoute, {
  customStore: service(),
  model() {
    return this.infinityModel('custom-model', { store: 'customStore', storeFindMethod: 'findAll' });
  }
});
