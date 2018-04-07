import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';
import { set } from '@ember/object';

export default Route.extend(InfinityRoute, {
  model() {
    return this.infinityModel('post');
  },

  actions: {
    /**
      Use service to replace the current collection with a new collection

      @method infinityFilterPosts
      @param {String} query
     */
    async infinityFilterPosts(query) {
      let filteredPosts = await this.infinityModel('post', { query });
      set(this.controllerFor('nested'), 'model', filteredPosts);
    },
  }
});
