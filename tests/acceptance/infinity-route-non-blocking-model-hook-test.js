import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

moduleForAcceptance('Acceptance: Infinity Route Non Blocking Model Hook', {
  beforeEach() {
    server = buildServer();
  },
  afterEach() {
    server.shutdown();
  }
});

function postList() {
  return find('.test-list');
}

function scrollTo(offset) {
  postList().scrollTop(offset);
}

test('it works when the model hook is non blocking', function(assert) {
  visit('/non-blocking-model-hook');

  andThen(() => {
    assertDetails(assert, {
      title: 'Non Blocking Model Hook',
      listLength: 10,
      reachedInfinity: false
    });

    scrollTo(100000);
    triggerEvent('.test-list', 'scroll');
  });

  andThen(() => {
    assertDetails(assert, {
      title: 'Non Blocking Model Hook',
      listLength: 20,
      reachedInfinity: false
    });
  });
});
