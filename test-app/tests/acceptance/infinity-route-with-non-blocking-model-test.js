import { module, test } from 'qunit';
import { visit, teardownContext } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import assertDetails from '../helpers/assert-acceptance-details';

module('Acceptance: Infinity Route - non blocking', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.createList('post', 15);
    document.getElementById('ember-testing-container').scrollTop = 0;
  });

  test('it renders items with non-blocking model', async function (assert) {
    assert.expect(3);
    await visit('/non-blocking-model');

    await assertDetails(assert, {
      title: 'Non Blocking Model Test',
      listLength: 15,
      reachedInfinity: true,
    });
  });

  test('it renders items with non-blocking component', async function (assert) {
    assert.expect(3);
    this.server.createList('post', 35);
    await visit('/nested-component');

    await assertDetails(assert, {
      title: 'Non Blocking Component Test',
      listLength: 15,
      reachedInfinity: false,
    });
  });

  test('it renders items with non-blocking component 2', async function (assert) {
    assert.expect(3);
    this.server.createList('post', 35);
    await visit('/nested-component');

    await assertDetails(assert, {
      title: 'Non Blocking Component Test',
      listLength: 15,
      reachedInfinity: false,
    });
  });

  test('it renders items with non-blocking component with custom meta params', async function (assert) {
    assert.expect(3);
    visit('/nested-component-with-custom-params');

    await assertDetails(assert, {
      title: 'Non Blocking Component Test',
      listLength: 10,
      reachedInfinity: false,
    });

    await teardownContext(this);
  });
});
