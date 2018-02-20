import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

module('Acceptance: Infinity Route - custom store route', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    server = buildServer();
    this.customStore = this.owner.lookup('service:custom-store');
    for (let x = 0; x <= 5; x++) {
      this.customStore.push('custom-model', { id: x });
    }
  });

  hooks.afterEach(function() {
    server.shutdown();
    delete this.customStore;
  });

  test('it works with custom store', async function(assert) {
    await visit('/custom-store');

    assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 6,
      reachedInfinity: true
    });
  });
});
