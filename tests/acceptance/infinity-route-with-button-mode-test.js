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

test('it works with button mode', assert => {
  visit('/button-demo/a?per_page=2');

  andThen(() => {
    assertDetails(assert, {
      title: "Listing Posts using button mode",
      listLength: 2,
      reachedInfinity: false
    });

    var postList       = find('ul');

    assert.equal(postList.find('li:first-child').text(), "Squarepusher", "First item should be 'Squarepusher'");
    click('.infinity-loader > button');
    andThen(() => {
      assertDetails(assert, {
        title: "Listing Posts using button mode",
        listLength: 3,
        reachedInfinity: true
      });
    });
  });
});
