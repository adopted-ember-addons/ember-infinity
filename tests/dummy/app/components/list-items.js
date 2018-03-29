import Component from '@ember/component';
import { get } from '@ember/object';
import layout from '../templates/components/list-items';

export default Component.extend({
  layout,

  actions: {
    infinityLoad(posts) {
      get(this, 'loadMorePosts')(posts);
    }
  }
});
