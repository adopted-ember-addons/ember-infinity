import config from '../config/environment';
import Ember from 'ember';

var classify = Ember.String.classify;
var registered = false;

export default {
  name: 'App Version',
  initialize: function(container, application) {
    if (!registered) {
      var appName = classify(application.toString());
      Ember.libraries.register(appName, config.APP.version);
      registered = true;
    }
  }
}
