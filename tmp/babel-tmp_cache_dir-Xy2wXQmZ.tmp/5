

export { initialize as initialize };import Ember from "ember";
import config from "../config/environment";
function initialize(container, application) {
  var classifiedName = Ember.String.classify(config.modulePrefix);

  if (config.exportApplicationGlobal && !window[classifiedName]) {
    window[classifiedName] = application;
  }
}

;

export default {
  name: "export-application-global",

  initialize: initialize
};