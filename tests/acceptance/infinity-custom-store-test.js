import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

module('Acceptance: Infinity Route - custom store route', function (hooks) {
  setupApplicationTest(hooks);

  hooks.afterEach(function () {
    server.shutdown();
    delete this.customStore;
  });

  test('it works with custom store', async function (assert) {
    server = buildServer();
    this.customStore = this.owner.lookup('service:custom-store');
    for (let x = 0; x <= 5; x++) {
      this.customStore.push('custom-model', { id: x });
    }

    await visit('/custom-store');

    await assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 6,
      reachedInfinity: true,
    });
  });

  test('it works with custom store', async function (assert) {
    server = buildServer();
    this.customStore = this.owner.lookup('service:custom-store');
    for (let x = 0; x <= 50; x++) {
      this.customStore.push('custom-model', { id: x });
    }

    await visit('/custom-store');

    await assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 25,
      reachedInfinity: true,
    });
  });
});
