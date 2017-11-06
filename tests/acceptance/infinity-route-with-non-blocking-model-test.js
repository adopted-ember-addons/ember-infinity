import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;
moduleForAcceptance('Acceptance: Infinity Route - non blocking model route', {
  beforeEach() {
    server = buildServer();
  },
  afterEach() {
    server.shutdown();
  }
});

test('it renders items with non-blocking model', function(assert) {
  visit('/non-blocking-model');

  andThen(() => {
    assertDetails(assert, {
      title: 'Non Blocking Model Test',
      listLength: 6,
      reachedInfinity: true
    });
  });
});
