import { module, test } from 'qunit';
import { visit, find, triggerEvent} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';
import faker from 'faker';

let server;

module('Acceptance: Infinity Route - offset trigger', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    let posts = [];

    for (let i = 0; i < 50; i++) {
      posts.push({id: i, name: faker.company.companyName()});
    }

    server = new Pretender(function() {
      this.get('/posts', function(request) {
        let body, subset, perPage, startPage, offset;

        if (request.queryParams.category) {
          subset = posts.filter(post => {
            return post.category === request.queryParams.category;
          });
        } else {
          subset = posts;
        }
        perPage = parseInt(request.queryParams.per_page, 10);
        startPage = parseInt(request.queryParams.page, 10);

        let pageCount = Math.ceil(subset.length / perPage);
        offset = perPage * (startPage - 1);
        subset = subset.slice(offset, offset + perPage);

        body = { posts: subset, meta: { total_pages: pageCount } };

        return [200, {"Content-Type": "application/json"}, JSON.stringify(body)];
      });
    });
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  function postList() {
    return find('ul');
  }

  function infinityLoader() {
    return find('.infinity-loader');
  }

  function triggerOffset() {
    // find the top of the infinity-loader component
    let { top } = document.getElementsByClassName('infinity-loader')[0].getBoundingClientRect()
    return top;
  }

  function scrollIntoView() {
    document.getElementsByClassName('infinity-loader')[0].scrollIntoView();
  }

  function shouldBeItemsOnTheList(assert, amount) {
    assert.equal(postList().querySelectorAll('li').length, amount, `${amount} items should be in the list`);
  }

  function scrollTo(offset) {
    postList.scrollTop = offset;
  }

  function infinityShouldNotBeReached(assert) {
    assert.equal(infinityLoader().classList.contains('reached-infinity'), false, "Infinity should not yet have been reached");
    assert.equal(find('span').textContent, 'loading');
  }

  function infinityShouldBeReached(assert) {
    assert.equal(infinityLoader().classList.contains('reached-infinity'), true, "Infinity should have been reached");
    assert.equal(find('span').textContent, 'loaded');
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
});
