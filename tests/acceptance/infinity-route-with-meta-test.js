import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import buildServer from '../helpers/fake-album-server';
import assertDetails from '../helpers/assert-acceptance-details';

let server;

module('Acceptance: Infinity Route', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    server = buildServer();
    document.getElementById('ember-testing-container').scrollTop = 0;
  });

  hooks.afterEach(function () {
    server.shutdown();
  });

  test('it works when meta is present in payload', async function (assert) {
    await visit('/test');

    await assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 6,
      reachedInfinity: true,
    });
  });

  test('it works with parameters', async function (assert) {
    await visit('/category/a?per_page=2');

    await assertDetails(assert, {
      title: 'Listing Posts using Parameters',
      listLength: 2,
      reachedInfinity: false,
    });

    let postList = find('ul');

    assert.equal(postList.querySelector('li').textContent, 'Squarepusher', "First item should be 'Squarepusher'");
    assert.equal(postList.querySelectorAll('li').length, 2, 'List length is 2');
  });
});
