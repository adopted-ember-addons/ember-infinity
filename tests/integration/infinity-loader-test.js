import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil } from '@ember/test-helpers';
import { set } from '@ember/object';
import { A } from '@ember/array';
import { resolve } from 'rsvp';

module('infinity-loader', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
    this.infinityServiceMock = {
      infinityModels: A(),
      infinityLoad: () => resolve()
    };
    this.infinityModel = {
      name: 'dot',
      _canLoadMore: false
    };
    // avoid recursive func
    this._checkScrollableHeight = () => true;
  });

  test('it renders loading text if no block given', async function(assert) {
    assert.expect(1);

    await render(hbs`{{infinity-loader infinityModel=infinityModel infinity=infinityServiceMock _checkScrollableHeight=_checkScrollableHeight}}`);
    assert.equal(this.element.querySelector('.infinity-loader > span').textContent, "Loading Infinite Model...");
  });

  test('hideOnInfinity works', async function(assert) {
    assert.expect(3);

    this.infinityModel = {
      name: 'dot'
    };
    await render(hbs`{{infinity-loader infinityModel=infinityModel hideOnInfinity=true infinity=infinityServiceMock _checkScrollableHeight=_checkScrollableHeight}}`);
    assert.equal(this.element.querySelector('.infinity-loader > span').textContent, "Loading Infinite Model...");
    assert.equal(this.element.querySelector('.infinity-loader').style.display, '', 'Element is not hidden');
    run(() => {
      set(this, 'infinityModel.reachedInfinity', true);
    });
    await waitUntil(() => {
      return this.element.querySelector('.infinity-loader').style.display === 'none';
    });
    assert.equal(this.element.querySelector('.infinity-loader').style.display, 'none', 'Element is hidden');
  });

  test('hideOnInfinity does not work if hideOnInfinity=false', async function(assert) {
    assert.expect(3);

    this.infinityModel = {
      name: 'dot'
    };
    await render(hbs`{{infinity-loader infinityModel=infinityModel hideOnInfinity=false infinity=infinityServiceMock _checkScrollableHeight=_checkScrollableHeight}}`);
    assert.equal(this.element.querySelector('.infinity-loader > span').textContent, "Loading Infinite Model...");
    assert.equal(this.element.querySelector('.infinity-loader').style.display, '', 'Element is not hidden');
    run(() => {
      set(this, 'infinityModel.reachedInfinity', true);
    });
    await waitUntil(() => {
      return this.element.querySelector('.infinity-loader').style.display === '';
    });
    assert.equal(this.element.querySelector('.infinity-loader').style.display, '', 'Element is not hidden');
  });

  test('it yields to the block if given', async function(assert) {
    assert.expect(1);

    await render(hbs`
                {{#infinity-loader infinityModel=infinityModel infinity=infinityServiceMock _checkScrollableHeight=_checkScrollableHeight}}
                  <span>My custom block</span>
                {{/infinity-loader}}
                `);
    assert.equal(this.element.querySelector('.infinity-loader > span').textContent, "My custom block");
  });
});
