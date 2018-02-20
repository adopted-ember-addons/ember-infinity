import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.find('post', params.post);
  },
  actions: {
    refreshRoute() {
      this.refresh();
    }
  }
});
