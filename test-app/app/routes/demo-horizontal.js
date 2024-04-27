import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DemoHorizontalRoute extends Route {
  @service infinity;

  model() {
    return this.infinity.model('post');
  }
}
