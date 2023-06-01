import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NestedRoute extends Route {
  @service infinity;

  model() {
    return this.infinity.model('post');
  }
}
