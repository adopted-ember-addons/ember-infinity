import { module, test } from 'qunit';
import { visit, find, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import defaultScenario from '../../mirage/scenarios/default';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Infinity Route - closure action', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  function postList() {
    return find('ul');
  }

  function infinityLoader() {
    return find('.list-items');
  }

  function triggerOffset() {
    // find the top of the list-items component
    let { top } = document.getElementsByClassName('list-items')[0].getBoundingClientRect()
    return top;
  }

  // function scrollIntoView() {
  //   document.querySelector('.list-items').scrollIntoView(false);
  // }

  function shouldBeItemsOnTheList(assert, amount) {
    assert.equal(postList().querySelectorAll('li').length, amount, `${amount} items should be in the list`);
  }

  function scrollTo(offset) {
    postList.scrollTop = offset;
  }

  function infinityShouldNotBeReached(assert) {
    assert.equal(infinityLoader().classList.contains('reached-infinity'), false, 'Infinity should not yet have been reached');
    assert.equal(infinityLoader().querySelector('span').textContent, 'Loading Infinite Model...');
  }

  // function infinityShouldBeReached(assert) {
  //   assert.equal(infinityLoader().classList.contains('reached-infinity'), true, 'Infinity should have been reached');
  //   assert.equal(infinityLoader().querySelector('span').textContent, 'loaded');
  // }

  test('scott load more with closure actions works', async function(assert) {
    defaultScenario(this.server);
    await visit('/nested');

    shouldBeItemsOnTheList(assert, 25);
    infinityShouldNotBeReached(assert);
    scrollTo(triggerOffset() - 100);

    await triggerEvent('ul', 'scroll');

    shouldBeItemsOnTheList(assert, 25);
    // scrollIntoView();

    // await triggerEvent('ul', 'scroll');

    // shouldBeItemsOnTheList(assert, 50);
    // infinityShouldBeReached(assert);
  });
});
