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
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
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
    // avoid recursive func
    this._checkScrollableHeight = () => true;
  });

  test('it renders loading text if no block given', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @infinity={{this.infinityServiceMock}}
        @_checkScrollableHeight={{this._checkScrollableHeight}}
      />
    `);

    assert.equal(
      this.element.querySelector('.infinity-loader > span').textContent.trim(),
      'Loading Infinity Model...',
      'class name is present'
    );
    assert.equal(
      this.element.querySelector('[data-test-infinity-loader]').textContent.trim(),
      'Loading Infinity Model...',
      'data-test attr is present'
    );
  });

  test('hideOnInfinity works on first render', async function (assert) {
    assert.expect(1);

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
        @_checkScrollableHeight={{this._checkScrollableHeight}}
      />
    `);

    assert.notOk(find('[data-test-infinity-loader]'), 'Element is not found');
  });

  test('hideOnInfinity does not work if hideOnInfinity=false', async function (assert) {
    assert.expect(3);

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
        @_checkScrollableHeight={{this._checkScrollableHeight}}
      />
    `);

    assert.equal(this.element.querySelector('.infinity-loader > span').textContent, 'Loading Infinity Model...');
    assert.equal(this.element.querySelector('.infinity-loader').style.display, '', 'Element is not hidden');
    run(() => {
      set(this, 'infinityModel.reachedInfinity', true);
    });
    await waitUntil(() => {
      return this.element.querySelector('.infinity-loader').style.display === '';
    });
    assert.equal(this.element.querySelector('.infinity-loader').style.display, '', 'Element is not hidden');
  });

  test('it yields to the block if given', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <InfinityLoader
        @infinityModel={{this.infinityModel}}
        @infinity={{this.infinityServiceMock}}
        @_checkScrollableHeight={{this._checkScrollableHeight}}
      >
        <span>My custom block</span>
      </InfinityLoader>
    `);
    assert.equal(this.element.querySelector('.infinity-loader > span').textContent, 'My custom block');
  });
});
