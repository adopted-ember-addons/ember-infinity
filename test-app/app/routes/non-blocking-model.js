import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NonBlockingModelRoute extends Route {
  @service infinity;

  model() {
    return {
      posts: this.infinity.model('post'),
    };
  }
}
