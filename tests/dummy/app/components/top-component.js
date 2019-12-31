import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  infinity: service(),

  tagName: '',

  init() {
    this._super(...arguments);

    this.posts = this.infinity.model('post', { perPage: 5 });
  }
});
