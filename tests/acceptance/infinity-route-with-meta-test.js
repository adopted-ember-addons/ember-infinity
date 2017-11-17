import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

moduleForAcceptance('Acceptance: Infinity Route', {
  beforeEach() {
    server = buildServer();
  },
  afterEach() {
    server.shutdown();
  }
});

test('it works when meta is present in payload', function(assert) {
  visit('/test');

  andThen(() => {
    assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 6,
      reachedInfinity: true
    });
  });
});

test('it works with parameters', function(assert) {
  visit('/category/a?per_page=2');

  andThen(() => {
    assertDetails(assert, {
      title: "Listing Posts using Parameters",
      listLength: 3,
      reachedInfinity: true
    });

    let postList = find('ul');

    assert.equal(postList.find('li:first-child').text(), "Squarepusher", "First item should be 'Squarepusher'");
  });
});
