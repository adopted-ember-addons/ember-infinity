import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  infinity: service(),

  model() {
    return this.infinity.model('post', { perPage: 1, startingPage: 1 });
  }
});
