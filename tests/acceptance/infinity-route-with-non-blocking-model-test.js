import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

module('Acceptance: Infinity Route - non blocking model route', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    server = buildServer();
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('it renders items with non-blocking model', async function(assert) {
    await visit('/non-blocking-model');

    assertDetails(assert, {
      title: 'Non Blocking Model Test',
      listLength: 6,
      reachedInfinity: true
    });
  });
});
