import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  infinity: service(),

  model() {
    return this.infinity.model('post', {
      perPage		: 25, perPageParam: 'page[size]',
      startingPage: 0, pageParam: 'page[number]',
      countParam	: 'meta.count'
    });
  }
});
