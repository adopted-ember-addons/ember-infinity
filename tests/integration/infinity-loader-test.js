import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('infinity-loader', {
  integration: true
});

test('it renders loading text if no block given', function(assert) {
  assert.expect(1);
  this.send = function () {};
  this.on('infinityLoad', function () {});

  this.render(hbs`{{infinity-loader}}`);
  assert.equal(this.$('.infinity-loader > span').text(), "Loading Infinite Model...");
});

test('it yields to the block if given', function(assert) {
  assert.expect(1);
  this.send = function () {};
  this.on('infinityLoad', function () {});

  this.render(hbs`
              {{#infinity-loader}}
                <span>My custom block</span>
              {{/infinity-loader}}
              `);
  assert.equal(this.$('.infinity-loader > span').text(), "My custom block");
});
