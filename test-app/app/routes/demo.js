import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DemoRoute extends Route {
  @service infinity;

  model() {
    return this.infinity.model('post');
  }
}
