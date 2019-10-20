import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  infinity: service(),

  model(params) {
    return this.infinity.model('post', { category: params.category, perPage: 2 });
  }
});
