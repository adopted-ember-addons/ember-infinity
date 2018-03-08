import { module, test } from 'qunit';
import { visit, find, triggerEvent, currentURL, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';
import faker from 'faker';

let server;

module('Acceptance: Infinity Route - offset trigger', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.posts = [];

    for (let i = 0; i < 50; i++) {
      this.posts.push({id: i, name: faker.company.companyName()});
    }

    let posts = this.posts;
    server = new Pretender(function() {
      this.get('/posts', function(request) {
        let subset = posts;
        let perPage = parseInt(request.queryParams.per_page, 10);
        let startPage = parseInt(request.queryParams.page, 10);

        let pageCount = Math.ceil(subset.length / perPage);
        let offset = perPage * (startPage - 1);
        subset = subset.slice(offset, offset + perPage);

        let body = { posts: subset, meta: { total_pages: pageCount } };

        return [200, {'Content-Type': 'application/json'}, JSON.stringify(body)];
      });
    });

    document.getElementById('ember-testing-container').scrollTop = 0;
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  function postList() {
    return find('ul');
  }

  function infinityLoader() {
    return find('.infinity-loader-bottom');
  }

  function triggerOffset() {
    // find the top of the infinity-loader-bottom component
    let { top } = document.getElementsByClassName('infinity-loader-bottom')[0].getBoundingClientRect()
    return top;
  }

  function scrollIntoView() {
    document.getElementsByClassName('infinity-loader-bottom')[0].scrollIntoView(false);
  }

  function shouldBeItemsOnTheList(assert, amount) {
    assert.equal(postList().querySelectorAll('li').length, amount, `${amount} items should be in the list`);
  }

  function scrollTo(offset) {
    postList.scrollTop = offset;
  }

  function infinityShouldNotBeReached(assert) {
    assert.equal(infinityLoader().classList.contains('reached-infinity'), false, 'Infinity should not yet have been reached');
    assert.equal(infinityLoader().querySelector('span').textContent, 'loading');
  }

  function infinityShouldBeReached(assert) {
    assert.equal(infinityLoader().classList.contains('reached-infinity'), true, 'Infinity should have been reached');
    assert.equal(infinityLoader().querySelector('span').textContent, 'loaded');
  }

  test('it should start loading more items when the scroll is on the very bottom ' +
    'when triggerOffset is not set', async function(assert) {
    await visit('/test-scrollable');

    shouldBeItemsOnTheList(assert, 25);
    infinityShouldNotBeReached(assert);
    scrollTo(triggerOffset() - 100);

    await triggerEvent('ul', 'scroll');

    shouldBeItemsOnTheList(assert, 25);
    scrollIntoView();

    await triggerEvent('ul', 'scroll');

    shouldBeItemsOnTheList(assert, 50);
    infinityShouldBeReached(assert);
  });

  test('it should start loading more items before the scroll is on the very bottom ' +
    'when triggerOffset is set', async function(assert) {
    await visit('/test-scrollable?triggerOffset=200');

    shouldBeItemsOnTheList(assert, 25);
    infinityShouldNotBeReached(assert);
    scrollTo(triggerOffset() - 200 - 100);

    await triggerEvent('ul', 'scroll');

    shouldBeItemsOnTheList(assert, 25);
    scrollTo(triggerOffset() - 200);

    await triggerEvent('ul', 'scroll');

    shouldBeItemsOnTheList(assert, 25);
    scrollIntoView();

    await triggerEvent('ul', 'scroll');

    shouldBeItemsOnTheList(assert, 50);
    infinityShouldBeReached(assert);
  });

  test('it should load previous elements when start on page two', async function(assert) {
    await visit('/test-scrollable?page=2');

    shouldBeItemsOnTheList(assert, 50);
    assert.equal(document.querySelectorAll('ul.test-list li')[25].offsetTop, 12500, 'scrollable list has elements above (each 250px high * 25)');
  });

  module('Acceptance: Infinity Route - multiple pages fetched', function(hooks) {
    hooks.beforeEach(function() {
      for (let i = 0; i < 25; i++) {
        this.posts.push({id: i, name: faker.company.companyName()});
      }
      let posts = this.posts;
      // another pretender instance is needed b/c this test has 3 fetches (others have 2)
      // thus once exhausted, need to setup another one
      // Don't yet know why is happening.  I thought I figured it out, but forgot.
      server = new Pretender(function() {
        this.get('/posts', function(request) {
          let subset = posts;
          let perPage = parseInt(request.queryParams.per_page, 10);
          let startPage = parseInt(request.queryParams.page, 10);

          let pageCount = Math.ceil(subset.length / perPage);
          let offset = perPage * (startPage - 1);
          subset = subset.slice(offset, offset + perPage);

          let body = { posts: subset, meta: { total_pages: pageCount } };

          return [200, {'Content-Type': 'application/json'}, JSON.stringify(body)];
        });
      });
    });
    test('it should load previous elements when start on page three and scroll up', async function(assert) {
      await visit('/test-scrollable?page=3');

      shouldBeItemsOnTheList(assert, 50);
      assert.equal(currentURL(), '/test-scrollable?page=3');

      await triggerEvent('ul', 'scroll');

      document.getElementsByClassName('infinity-loader-above')[0].scrollIntoView(false);

      await waitUntil(() => {
        return postList().querySelectorAll('li').length === 75;
      });

      shouldBeItemsOnTheList(assert, 75);
    });
  });
});
