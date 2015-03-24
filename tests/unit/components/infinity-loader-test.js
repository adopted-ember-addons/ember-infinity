import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Ember from 'ember';
import $ from 'jquery';

moduleForComponent('infinity-loader');

test('it renders', function(assert) {
  assert.expect(2);

  var component = this.subject();
  assert.equal(component._state, 'preRender');
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('it will not destroy on load unless set', function(assert) {
  assert.expect(3);

  var infinityModelStub = [
    {id: 1, name: 'Tomato'},
    {id: 2, name: 'Potato'}
  ];

  var component = this.subject();
  component.set('infinityModel', infinityModelStub);
  this.render();

  assert.equal(component.get('destroyOnInfinity'), false);

  Ember.run(function() {
    component.set('infinityModel.reachedInfinity', true);
  });

  assert.equal(component._state, 'inDOM');

  Ember.run(function() {
    component.set('destroyOnInfinity', true);
  });

  assert.equal(component._state, 'destroying');
});

test('it changes text property', function(assert) {
  assert.expect(2);

  var infinityModelStub = [
    {id: 1, name: 'Tomato'},
    {id: 2, name: 'Potato'}
  ];

  var componentText;
  var component = this.subject();
  component.set('infinityModel', infinityModelStub);
  this.render();

  componentText = $.trim(component.$().text());
  assert.equal(componentText, "Loading Infinite Model...");

  Ember.run(function() {
    component.set('infinityModel.reachedInfinity', true);
  });

  componentText = $.trim(component.$().text());
  assert.equal(componentText, "Infinite Model Entirely Loaded.");
});

test('it uses the window as the scrollable element', function(assert) {
  assert.expect(1);
  var component = this.subject();
  this.render();
  var scrollable = component.get("scrollable");
  assert.equal(scrollable, window);
});

test('it uses the provided scrollable element', function(assert) {
  assert.expect(1);
  $(document.body).append("<div id='content'/>");
  var component = this.subject({scrollable: "#content"});
  this.render();
  var scrollable = component.get("scrollable");
  assert.equal(scrollable, $("#content")[0]);
});

test('it throws error when scrollable element is not found', function(assert) {
  assert.expect(1);
  var component = this.subject({scrollable: "#notfound"});
  assert.throws(function() {
    this.render();
  }, Error, "Should raise error");
});

test('it throws error when multiple scrollable elements are found', function(assert) {
  assert.expect(1);
  $(document.body).append("<div/><div/>");
  var component = this.subject({scrollable: "div"});
  assert.throws(function() {
    this.render();
  }, Error, "Should raise error");
});
