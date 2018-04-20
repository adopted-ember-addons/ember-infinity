import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  infinity: service(),

  actions: {
    /**
      Use service to load more posts if you can't get at the route

      @method loadMorePosts
      @param {ArrayProxy} - posts - existing infinityModels
     */
    loadMorePosts(posts) {
      get(this, 'infinity').loadNextPage(posts);
    },
    /**
      Use service to load more posts if you can't get at the route

      @method loadMorePostsPrevious
      @param {ArrayProxy} - posts - existing infinityModels
     */
    loadMorePostsPrevious(posts, increment) {
      get(this, 'infinity').loadNextPage(posts, increment);
    },
    /**
      Use service to replace the current collection with a new collection

      @method filterPosts
      @param {ArrayProxy} posts - example payload from this.store.query('post', { name: 'Allen' })
     */
    filterPosts(posts) {
      let arr = posts.toArray();
      let splitPosts = arr.filter(x => x.get('name').includes('a'));
      get(this, 'infinity').replace(get(this, 'model'), splitPosts);
    },
    /**
      Use service to replace the current collection with a new collection

      @method flushPosts
      @param {ArrayProxy} posts - example payload from this.store.query('post', { name: 'Allen' })
     */
    flushPosts(posts) {
      get(this, 'infinity').flush(posts);
    }
  }
});
