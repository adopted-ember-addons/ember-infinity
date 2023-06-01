import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import assertDetails from '../helpers/assert-acceptance-details';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Infinity Route - non blocking', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.createList('post', 15);
    document.getElementById('ember-testing-container').scrollTop = 0;
  });

  test('it renders items with non-blocking model', async function (assert) {
    await visit('/non-blocking-model');

    await assertDetails(assert, {
      title: 'Non Blocking Model Test',
      listLength: 15,
      reachedInfinity: true,
    });
  });

  test('it renders items with non-blocking component', async function (assert) {
    this.server.createList('post', 35);
    await visit('/nested-component');

    await assertDetails(assert, {
      title: 'Non Blocking Component Test',
      listLength: 15,
      reachedInfinity: false,
    });
  });
});
