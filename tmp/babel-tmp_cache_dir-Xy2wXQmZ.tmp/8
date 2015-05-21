import Ember from "ember";
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Route.extend(InfinityRoute, {
  model: function model(params) {
    return this.infinityModel("post", { category: params.category,
      perPage: 2 });
  }
});