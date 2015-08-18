import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  shouldBackgroundReloadRecord: function() { return false; }
});
