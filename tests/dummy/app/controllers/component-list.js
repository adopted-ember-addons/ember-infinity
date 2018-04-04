import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  infinityLoader: service(),

  actions: {
    loadMorePosts(posts) {
      /**
       * still need to work on this
        1. this.send('infinityLoad', posts);
        2. use infinity-loader service
       */
      // get(this, 'infinityLoader').pushObjects(get(this, 'model'), posts);
      this.send('infinityLoad', posts);
    }
  }
});
