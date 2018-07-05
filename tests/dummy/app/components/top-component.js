import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  infinity: service(),

  classNames: ['list-items'],

  init() {
    this._super(...arguments);

    this.posts = this.get('infinity').model('post', { perPage: 5 });
  }
});
