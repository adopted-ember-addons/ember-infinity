import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  infinity: service(),

  model() {
    return {
      posts: this.infinity.model('post')
    }
  }
});
