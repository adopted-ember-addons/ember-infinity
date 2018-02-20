import { module, test } from 'qunit';
import { visit, click, triggerEvent, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import buildServer from '../helpers/fake-album-server';

module('Acceptance: Infinity Route', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.server = buildServer();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it works when embedded route is refreshed', async function(assert) {
    await visit('/posts/1');

    assert.equal(find('ul.test-list').querySelectorAll('li.test-list-item').length, 1);

    await click('button.refreshRoute');

    document.getElementsByClassName('infinity-loader')[0].scrollIntoView();

    await triggerEvent('ul.test-list', 'scroll');

    assert.equal(find('ul.test-list').querySelectorAll('li.test-list-item').length, 2);
  });
});
