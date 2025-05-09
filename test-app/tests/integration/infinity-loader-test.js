import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, waitUntil } from '@ember/test-helpers';
import { set } from '@ember/object';
import { A } from '@ember/array';
import { resolve } from 'rsvp';

module('infinity-loader', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.actions = {};
    this.send = (actionName, ...args) =>
      this.actions[actionName].apply(this, args);
    this.infinityServiceMock = {
      infinityModels: A(),
      infinityLoad: () => resolve(),
    };
    this.infinityModel = {
      name: 'dot',
      canLoadMore: false,
      on: () => {},
      off: () => {},
    };
  });

  test('it renders loading text if no block given', async function (assert) {
    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @infinity={{this.infinityServiceMock}}
      />
    `);

    assert.strictEqual(
      this.element.querySelector('.infinity-loader > span').textContent.trim(),
      'Loading Infinity Model...',
      'class name is present',
    );
    assert.strictEqual(
      this.element
        .querySelector('[data-test-infinity-loader]')
        .textContent.trim(),
      'Loading Infinity Model...',
      'data-test attr is present',
    );
  });

  test('hideOnInfinity works on first render', async function (assert) {
    this.infinityModel = {
      name: 'dot',
      reachedInfinity: true,
      on: () => {},
      off: () => {},
    };
    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @hideOnInfinity={{true}}
        @infinity={{this.infinityServiceMock}}
      />
    `);

    assert.notOk(find('[data-test-infinity-loader]'), 'Element is not found');
  });

  test('hideOnInfinity works when reached infinity and changing model', async function (assert) {
    this.infinityModel = {
      name: 'dot',
      reachedInfinity: true,
      on: () => {},
      off: () => {},
    };
    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @hideOnInfinity={{true}}
        @infinity={{this.infinityServiceMock}}
      />
    `);

    assert.notOk(find('[data-test-infinity-loader]'), 'Loader is not shown');

    run(() => {
      set(this, 'infinityModel', {
        name: 'dot2',
        reachedInfinity: false,
        on: () => {},
        off: () => {},
      });
    });

    await waitUntil(
      () => {
        return find('[data-test-infinity-loader]') != null;
      },
      { timeoutMessage: 'Loader is shown' },
    );
  });

  test('hideOnInfinity does not work if hideOnInfinity=false', async function (assert) {
    this.infinityModel = {
      name: 'dot',
      on: () => {},
      off: () => {},
    };
    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @hideOnInfinity={{false}}
        @infinity={{this.infinityServiceMock}}
      />
    `);

    assert.strictEqual(
      this.element.querySelector('.infinity-loader > span').textContent,
      'Loading Infinity Model...',
    );
    assert.strictEqual(
      this.element.querySelector('.infinity-loader').style.display,
      '',
      'Element is not hidden',
    );
    run(() => {
      set(this, 'infinityModel.reachedInfinity', true);
    });
    await waitUntil(() => {
      return (
        this.element.querySelector('.infinity-loader').style.display === ''
      );
    });
    assert.strictEqual(
      this.element.querySelector('.infinity-loader').style.display,
      '',
      'Element is not hidden',
    );
  });

  test('it yields to the block if given', async function (assert) {
    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @infinity={{this.infinityServiceMock}}
      >
        <span>My custom block</span>
      </InfinityLoader>
    `);
    assert.strictEqual(
      this.element.querySelector('.infinity-loader > span').textContent,
      'My custom block',
    );
  });
});
