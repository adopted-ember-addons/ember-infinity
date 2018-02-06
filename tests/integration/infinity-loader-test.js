import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

module('infinity-loader', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders loading text if no block given', async function(assert) {
    assert.expect(1);
    this.send = function () {};
    this.actions.infinityLoad = function () {};

    await render(hbs`{{infinity-loader}}`);
    assert.equal(this.$('.infinity-loader > span').text(), "Loading Infinite Model...");
  });

  test('it yields to the block if given', async function(assert) {
    assert.expect(1);
    this.send = function () {};
    this.actions.infinityLoad = function () {};

    await render(hbs`
                {{#infinity-loader}}
                  <span>My custom block</span>
                {{/infinity-loader}}
                `);
    assert.equal(this.$('.infinity-loader > span').text(), "My custom block");
  });
});
