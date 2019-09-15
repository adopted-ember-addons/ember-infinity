import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  customStore: service(),
  infinity: service(),

  model() {
    this.customStore.push('custom-model', { name: 'Zooloo' })
    return get(this, 'infinity').model('custom-model', { store: this.customStore, storeFindMethod: 'findAll' });
  }
});
