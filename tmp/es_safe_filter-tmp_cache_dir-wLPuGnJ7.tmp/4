import config from '../config/environment';
import Ember from 'ember';

var classify = Ember.String.classify;

export default {
  name: 'App Version',
  initialize: function(container, application) {
    var appName = classify(application.toString());
    Ember.libraries.register(appName, config.APP.version);
  }
}
