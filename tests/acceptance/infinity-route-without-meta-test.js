import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import Pretender from 'pretender';
import assertDetails from '../helpers/assert-acceptance-details';
import json from '../helpers/json';

let server;

moduleForAcceptance('Acceptance: Infinity Route', {
  beforeEach() {
    server = new Pretender(function() {
      this.get('/posts', () => {
        var posts = [
          { id: 1, name: "Squarepusher" },
          { id: 2, name: "Aphex Twin" }
        ];
        return json(200, {posts});
      });
    });
  },
  afterEach() {
    server.shutdown();
  }
});

test('it works when meta is not present in payload', function(assert) {
  visit('/test');

  andThen(() => {
    assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 2,
      reachedInfinity: true
    });
  });
});
