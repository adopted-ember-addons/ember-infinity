import RESTAdapter from '@ember-data/adapter/rest';

export default RESTAdapter.extend({
  shouldBackgroundReloadRecord() { return false; }
});
