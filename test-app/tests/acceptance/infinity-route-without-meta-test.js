import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';
import assertDetails from '../helpers/assert-acceptance-details';
import json from '../helpers/json';

let server;

module('Acceptance: Infinity Route', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    server = new Pretender(function () {
      this.get('/posts', () => {
        var posts = [
          { id: 1, name: 'Squarepusher' },
          { id: 2, name: 'Aphex Twin' },
        ];
        return json(200, { posts });
      });
    });
  });

  hooks.afterEach(function () {
    server.shutdown();
  });

  test('it works when meta is not present in payload', async function (assert) {
    await visit('/test');

    await assertDetails(assert, {
      title: 'Listing Posts',
      listLength: 2,
      reachedInfinity: true,
    });
  });
});
