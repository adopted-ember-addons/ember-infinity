import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CategoryRoute extends Route {
  @service infinity;

  model(params) {
    return this.infinity.model('post', {
      category: params.category,
      perPage: 2,
    });
  }
}
