import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  shouldBackgroundReloadRecord() { return false; }
});
