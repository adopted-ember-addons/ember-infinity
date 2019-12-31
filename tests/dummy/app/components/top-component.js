import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default class TopComponent extends Component {
  @service infinity

  tagName = '';

  init() {
    super.init(...arguments);

    this.posts = this.infinity.model('post', { perPage: 5 });
  }
}
