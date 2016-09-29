import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('infinity-loader', 'Integration | Component | infinity loader', {
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

test('it throws when the scrollable element is not found', function(assert) {
  this.on('infinityLoad', function() {});

  assert.throws(() => {
    this.render(hbs`{{infinity-loader scrollable='#piggies'}}`);
  }, Error);
});

test('it throws when multiple scrollable elements are found', function(assert) {
  this.on('infinityLoad', function() {});

  assert.throws(() => {
    this.render(hbs`
      <div class='piggies'></div>
      <div class='piggies'></div>
      {{infinity-loader scrollable='.piggies'}}
    `);
  }, Error);
});

test('it throws when scrollable is not a string or empty', function(assert) {
  this.on('infinityLoad', function() {});

  assert.throws(() => {
    this.render(hbs`
      {{infinity-loader scrollable=1}}
    `);
  }, Error);
});

test('it checks if in view on the scroll event', function(assert) {
  let didLoadMore = false;

  this.on('infinityLoad', function() {
    didLoadMore = true;
  });

  this.render(hbs`{{infinity-loader}}`);

  this.$(window).trigger('scroll');

  return wait().then(function() {
    assert.ok(didLoadMore);
  });
});

test('it checks if in view on the resize event', function(assert) {
  let didLoadMore = false;

  this.on('infinityLoad', function() {
    didLoadMore = true;
  });

  this.render(hbs`{{infinity-loader}}`);

  this.$(window).trigger('resize');

  return wait().then(function() {
    assert.ok(didLoadMore);
  });
});
