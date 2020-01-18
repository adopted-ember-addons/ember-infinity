import { module, test } from 'qunit';
import { visit, find, settled, triggerEvent, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import defaultScenario from '../../mirage/scenarios/default';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Infinity Route - load previous', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    document.getElementById('ember-testing-container').scrollTop = 0;
  });

  function postList() {
    return find('.posts');
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

  async function shouldBeItemsOnTheList(assert, amount) {
    await waitUntil(() => {
      return postList().querySelectorAll('p').length === amount;
    });

    assert.equal(postList().querySelectorAll('p').length, amount, `${amount} items should be in the list`);
  }

  function scrollTo(offset) {
    postList.scrollTop = offset;
  }

  function infinityShouldNotBeReached(assert) {
    assert.equal(infinityLoader().classList.contains('reached-infinity'), false, 'Infinity should not yet have been reached');
    assert.equal(infinityLoader().querySelector('span').textContent, 'loading');
  }

  test('it should start loading more items when the scroll is on the very bottom ' +
    'when triggerOffset is not set', async function(assert) {
    defaultScenario(this.server);
    await visit('/load-previous');

    await shouldBeItemsOnTheList(assert, 25);
    infinityShouldNotBeReached(assert);
    scrollTo(triggerOffset() - 100);

    await triggerEvent(window, 'scroll');

    await shouldBeItemsOnTheList(assert, 25);
    scrollIntoView();

    await triggerEvent(window, 'scroll');

    await shouldBeItemsOnTheList(assert, 50);
  });

  test('it should load previous elements when start on page two', async function(assert) {
    defaultScenario(this.server);
    await visit('/load-previous?page=2');

    await settled();
    await shouldBeItemsOnTheList(assert, 50);
    // This is difficult b/c of #ember-testing-container
    // assert.equal(document.querySelectorAll('.posts p')[25].offsetTop, 12500, 'scrollable list has elements above (each 250px high * 25)');
  });
});
