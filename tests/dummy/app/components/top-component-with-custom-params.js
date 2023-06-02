import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';

export default class TopComponentComponent extends Component {
  @service infinity;
  @service store;

  constructor() {
    super(...arguments);

    this.posts = this.infinity.model('post', {
      perPage: 5,
      startingPage: 2,
      store: this,
      storeFindMethod: 'findAll',
      totalPagesParam: 'meta.pageCount',
    });
  }

  async findAll(model, query) {
    const response = await this.store.query(model, query);
    const content = response.slice();

    return ArrayProxy.create({ content, meta: response.meta });
  }
}
