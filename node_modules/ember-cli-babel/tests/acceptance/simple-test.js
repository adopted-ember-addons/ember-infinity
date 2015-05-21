import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

let App;

module('Simple Acceptance Test', {
  beforeEach() {
    App = startApp();
  },

  afterEach() {
    Ember.run(App, 'destroy');
  }
});

test('value of input', function(assert) {
  visit('/');

  andThen(() => {
    assert.equal('Test Value', find('#test-input').val());
  });
});
