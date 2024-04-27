import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NestedController extends Controller {
  @service infinity;

  /**
  Use service to load more posts if you can't get at the route

  @method loadMorePosts
  @param {ArrayProxy} - posts - existing infinityModels
  */
  @action
  loadMorePosts(posts) {
    this.infinity.loadNextPage(posts);
  }
  /**
  Use service to load more posts if you can't get at the route

  @method loadMorePostsPrevious
  @param {ArrayProxy} - posts - existing infinityModels
  */
  @action
  loadMorePostsPrevious(posts, increment) {
    this.infinity.loadNextPage(posts, increment);
  }
  /**
  Use service to replace the current collection with a new collection

  @method filterPosts
  @param {ArrayProxy} posts - example payload from this.store.query('post', { name: 'Allen' })
  */
  @action
  filterPosts(posts) {
    let arr = posts.toArray();
    let splitPosts = arr.filter((x) => x.get('name').includes('a'));
    this.infinity.replace(this.model, splitPosts);
  }
  /**
  Use service to replace the current collection with a new collection

  @method flushPosts
  @param {ArrayProxy} posts - example payload from this.store.query('post', { name: 'Allen' })
  */
  @action
  flushPosts(posts) {
    this.infinity.flush(posts);
  }
}
