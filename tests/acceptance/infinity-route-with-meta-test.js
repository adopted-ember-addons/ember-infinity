import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

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

test('it works when meta is present in payload', assert => {
  visit('/test');

  andThen(() => {
    assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 6,
      reachedInfinity: true
    });
  });
});

test('it works with parameters', assert => {
  visit('/category/a?per_page=2');

  andThen(() => {
    assertDetails(assert, {
      title: "Listing Posts using Parameters",
      listLength: 2,
      reachedInfinity: false
    });

    var postList       = find('ul');

    assert.equal(postList.find('li:first-child').text(), "Squarepusher", "First item should be 'Squarepusher'");
  });
});
