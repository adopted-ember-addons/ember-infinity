import Ember from 'ember';


export default Ember.Controller.extend({
  actions: {
    refreshRoute: function() {
      this.get('target.router').refresh();
    }
  }
});
