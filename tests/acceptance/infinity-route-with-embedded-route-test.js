import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import buildServer from '../helpers/fake-album-server';

var App, server;

module('Acceptance: Infinity Route', {
  setup() {
    App = startApp();
    server = buildServer();
  },
  teardown() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

test('it works when embedded route is refreshed', assert => {
  visit('/posts/1');
  click('button.refreshRoute');

  andThen(() => {
    assert.equal(find('ul').find('li').length, 2);

    var testList = find('ul');
    testList.scrollTop(2000);
    triggerEvent('ul', 'scroll');

    andThen(() => {
      assert.equal(find('ul').find('li').length > 2, true);
    });
  });
});
