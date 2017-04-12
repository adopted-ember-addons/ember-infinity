import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

moduleForAcceptance('Acceptance: Infinity Route - custom store route', {
  beforeEach() {
    server = buildServer();
    this.customStore = this.application.__container__.lookup('service:custom-store');
    for (let x = 0; x <= 5; x++) {
      this.customStore.push('custom-model', { id: x });
    }
  },
  afterEach() {
    server.shutdown();
    delete this.customStore;
  }
});

test('it works with custom store', function(assert) {
  visit('/custom-store');

  andThen(() => {
    assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 6,
      reachedInfinity: true
    });
  });
});
