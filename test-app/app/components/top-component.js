import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TopComponentComponent extends Component {
  @service infinity;

  constructor() {
    super(...arguments);

    this.posts = this.infinity.model('post', { perPage: 5 });
  }
}
