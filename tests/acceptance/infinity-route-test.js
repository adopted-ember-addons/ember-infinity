import { module, test } from 'qunit';
import {
  currentRouteName,
  visit,
  find,
  triggerEvent,
  currentURL,
  waitUntil,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Infinity Route - infinity routes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    document.getElementById('ember-testing-container').scrollTop = 0;
  });

  function postList() {
    return find('ul');
  }

  function infinityLoader() {
    return find('.infinity-loader-bottom');
  }

  function triggerOffset() {
    // find the top of the infinity-loader-bottom component
    let { top } = document
      .getElementsByClassName('infinity-loader-bottom')[0]
      .getBoundingClientRect();
    return top;
  }

  function scrollIntoView() {
    document.getElementsByClassName('infinity-loader-bottom')[0].scrollIntoView(false);
  }

  async function shouldBeItemsOnTheList(assert, amount) {
    await waitUntil(() => {
      return postList().querySelectorAll('li').length === amount;
    });
    assert.equal(
      postList().querySelectorAll('li').length,
      amount,
      `${amount} items should be in the list`
    );
  }

  function scrollTo(offset) {
    postList.scrollTop = offset;
  }

  function infinityShouldNotBeReached(assert) {
    assert.equal(
      infinityLoader().classList.contains('reached-infinity'),
      false,
      'Infinity should not yet have been reached'
    );
    assert.equal(infinityLoader().querySelector('span').textContent, 'loading');
  }

  function infinityShouldBeReached(assert) {
    assert.equal(
      infinityLoader().classList.contains('reached-infinity'),
      true,
      'Infinity should have been reached'
    );
    assert.equal(infinityLoader().querySelector('span').textContent, 'loaded');
  }

  test(
    'it should start loading more items when the scroll is on the very bottom ' +
      'when triggerOffset is not set',
    async function (assert) {
      this.server.createList('post', 50);
      await visit('/test-scrollable');

      await shouldBeItemsOnTheList(assert, 25);
      infinityShouldNotBeReached(assert);
      scrollTo(triggerOffset() - 100);

      await triggerEvent('ul', 'scroll');

      await shouldBeItemsOnTheList(assert, 25);
      scrollIntoView();

      await triggerEvent('ul', 'scroll');

      await shouldBeItemsOnTheList(assert, 50);
      infinityShouldBeReached(assert);

      const global = this.owner.lookup('service:global');
      assert.equal(global.isUpdated, true);
    }
  );

  test(
    'it should start loading more items before the scroll is on the very bottom ' +
      'when triggerOffset is set',
    async function (assert) {
      this.server.createList('post', 50);
      await visit('/test-scrollable?triggerOffset=200');

      await shouldBeItemsOnTheList(assert, 25);
      infinityShouldNotBeReached(assert);
      scrollTo(triggerOffset() - 200 - 100);

      await triggerEvent('ul', 'scroll');

      await shouldBeItemsOnTheList(assert, 25);
      scrollTo(triggerOffset() - 200);

      await triggerEvent('ul', 'scroll');

      await shouldBeItemsOnTheList(assert, 25);
      scrollIntoView();

      await triggerEvent('ul', 'scroll');

      await shouldBeItemsOnTheList(assert, 50);
      infinityShouldBeReached(assert);
    }
  );

  test('it should load previous elements when start on page two', async function (assert) {
    this.server.createList('post', 50);
    await visit('/test-scrollable?page=2');

    await shouldBeItemsOnTheList(assert, 50);
    // assert.equal(document.querySelectorAll('ul.test-list-scrollable li')[25].offsetTop, 1250, 'scrollable list has elements above (each 250px high * 25)');
  });

  test('it should load elements until page is filled', async function (assert) {
    this.server.createList('post', 50);
    await visit('/test-scrollable?perPage=3');

    await waitUntil(() => {
      return postList().querySelectorAll('li').length === 12;
    });

    await shouldBeItemsOnTheList(assert, 12);
  });

  module('Acceptance: Infinity Route - multiple pages fetched', function (/*hooks*/) {
    test('it should load previous elements when start on page three and scroll up', async function (assert) {
      this.server.createList('post', 75);
      await visit('/test-scrollable?page=3');

      await waitUntil(() => {
        return postList().querySelectorAll('li').length === 50;
      });

      await shouldBeItemsOnTheList(assert, 50);
      assert.equal(currentURL(), '/test-scrollable?page=3');

      await triggerEvent('ul', 'scroll');

      document.getElementsByClassName('infinity-loader-above')[0].scrollIntoView(false);

      await waitUntil(() => {
        return postList().querySelectorAll('li').length === 75;
      });

      await shouldBeItemsOnTheList(assert, 75);
    });
  });

  module('Acceptance: Infinity Route - extended infinity model', function (/*hooks*/) {
    test('it should load all pages after scrolling', async function (assert) {
      this.server.createList('post', 15);
      await visit('/extended');

      await shouldBeItemsOnTheList(assert, 6);
      assert.equal(currentURL(), '/extended');

      await triggerEvent('ul', 'scroll');
      document.querySelector('.infinity-loader').scrollIntoView(false);

      await waitUntil(() => {
        return postList().querySelectorAll('li').length === 12;
      });

      await shouldBeItemsOnTheList(assert, 12);

      await triggerEvent('ul', 'scroll');
      document.querySelector('.infinity-loader').scrollIntoView(false);

      await waitUntil(() => {
        return postList().querySelectorAll('li').length === 15;
      });

      await shouldBeItemsOnTheList(assert, 15);
    });
  });

  module('Acceptance: Infinity Route - error', function (/*hooks*/) {
    test('throws error 500', async function (assert) {
      // TODO: improve this so dont log our error
      this.server.get('posts', { errors: ['There was an error'] }, 500);
      await visit('/test-scrollable');

      assert.equal(find('h1').textContent.trim(), 'Error', 'Displays error template');
      assert.equal(currentRouteName(), 'error', 'Redirects to error route');
    });
  });

  module('Acceptance: Infinity Route - nested with closure actions', function (/*hooks*/) {
    test('load more with closure actions works', async function (assert) {
      this.server.createList('post', 50);
      await visit('/nested');

      assert.equal(
        find('ul').querySelectorAll('li').length,
        25,
        `${25} items should be in the list`
      );
      assert.equal(
        find('.infinity-loader').classList.contains('reached-infinity'),
        false,
        'Infinity should not yet have been reached'
      );
      assert.equal(
        find('.list-items').querySelector('span').textContent,
        'Loading Infinity Model...'
      );
      let { top } = document.querySelector('.list-items').getBoundingClientRect();
      scrollTo(top - 100);

      await triggerEvent('ul', 'scroll');

      assert.equal(
        find('ul').querySelectorAll('li').length,
        25,
        `${25} items should be in the list`
      );
      document.querySelector('.list-items').scrollIntoView(false);

      await triggerEvent('ul', 'scroll');

      await waitUntil(() => {
        return find('ul').querySelectorAll('li').length === 50;
      });

      assert.equal(
        find('ul').querySelectorAll('li').length,
        50,
        `${50} items should be in the list`
      );
      assert.equal(
        find('.infinity-loader').classList.contains('reached-infinity'),
        true,
        'Infinity should have been reached'
      );
    });
  });
});
