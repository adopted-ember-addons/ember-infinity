import Ember from 'ember';

export default Ember.Controller.extend({
  // Just a very roundabout way of using some ES6 features
  value: ((test = 'Test') => `${test} ${'Value'}`)() // jshint ignore:line
});