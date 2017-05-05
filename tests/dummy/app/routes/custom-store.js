import Ember from 'ember';
const { Route, inject: { service } } = Ember;
import InfinityRoute from 'ember-infinity/mixins/route';

export default Route.extend(InfinityRoute, {
  customStore: service(),
  model() {
    return this.infinityModel('custom-model', { store: 'customStore', storeFindMethod: 'findAll' });
  }
});
