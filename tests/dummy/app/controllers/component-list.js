import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadMorePosts(posts) {
      this.send('infinityLoad', posts);
    }
  }
});
