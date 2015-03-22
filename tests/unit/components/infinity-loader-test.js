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
  component.set('infiniteModel', infinityModelStub);
  this.render();

  assert.equal(component.get('destroyOnInfinity'), false);

  Ember.run(function() {
    component.set('infiniteModel.reachedInfinity', true);
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
  component.set('infiniteModel', infinityModelStub);
  this.render();

  componentText = $.trim(component.$().text());
  assert.equal(componentText, "Loading Infinite Model...");

  Ember.run(function() {
    component.set('infiniteModel.reachedInfinity', true);
  });

  componentText = $.trim(component.$().text());
  assert.equal(componentText, "Infinite Model Entirely Loaded.");
});

