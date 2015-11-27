import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Pretender from 'pretender';
import assertDetails from '../helpers/assert-acceptance-details';

var App, server;

module('Acceptance: Infinity Route', {
  setup() {
    App = startApp();
    server = new Pretender(function() {
      this.get('/posts', () => {
        var posts = [
          { id: 1, name: "Squarepusher" },
          { id: 2, name: "Aphex Twin" }
        ];
        return [200, {"Content-Type": "application/json"}, JSON.stringify({posts})];
      });
    });
  },
  teardown() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

test('it works when meta is not present in payload', assert => {
  visit('/test');

  andThen(() => {
    assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 2,
      reachedInfinity: true
    });
  });
});
