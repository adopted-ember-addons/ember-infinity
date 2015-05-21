define('dummy/tests/unit/components/infinity-loader-test', ['ember-qunit', 'ember', 'jquery'], function (ember_qunit, Ember, $) {

  'use strict';

  ember_qunit.moduleForComponent('infinity-loader');

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    var component = this.subject();
    assert.equal(component._state, 'preRender');
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  ember_qunit.test('it will not destroy on load unless set', function (assert) {
    assert.expect(3);

    var infinityModelStub = [{ id: 1, name: 'Tomato' }, { id: 2, name: 'Potato' }];

    var component = this.subject();
    component.set('infinityModel', infinityModelStub);
    this.render();

    assert.equal(component.get('destroyOnInfinity'), false);

    Ember['default'].run(function () {
      component.set('infinityModel.reachedInfinity', true);
    });

    assert.equal(component._state, 'inDOM');

    Ember['default'].run(function () {
      component.set('destroyOnInfinity', true);
    });

    assert.equal(component._state, 'destroying');
  });

  ember_qunit.test('it changes text property', function (assert) {
    assert.expect(2);

    var infinityModelStub = [{ id: 1, name: 'Tomato' }, { id: 2, name: 'Potato' }];

    var componentText;
    var component = this.subject();
    component.set('infinityModel', infinityModelStub);
    this.render();

    componentText = $['default'].trim(component.$().text());
    assert.equal(componentText, 'Loading Infinite Model...');

    Ember['default'].run(function () {
      component.set('infinityModel.reachedInfinity', true);
    });

    componentText = $['default'].trim(component.$().text());
    assert.equal(componentText, 'Infinite Model Entirely Loaded.');
  });

  ember_qunit.test('it uses the window as the scrollable element', function (assert) {
    assert.expect(1);
    var component = this.subject();
    this.render();
    var scrollable = component.get('scrollable');
    assert.equal(scrollable[0], window);
  });

  ember_qunit.test('it uses the provided scrollable element', function (assert) {
    assert.expect(1);
    $['default'](document.body).append('<div id=\'content\'/>');
    var component = this.subject({ scrollable: '#content' });
    this.render();
    var scrollable = component.get('scrollable');
    assert.equal(scrollable[0], $['default']('#content')[0]);
  });

  ember_qunit.test('it throws error when scrollable element is not found', function (assert) {
    assert.expect(1);
    var component = this.subject({ scrollable: '#notfound' });
    assert.throws(function () {
      this.render();
    }, Error, 'Should raise error');
  });

  ember_qunit.test('it throws error when multiple scrollable elements are found', function (assert) {
    assert.expect(1);
    $['default'](document.body).append('<div/><div/>');
    var component = this.subject({ scrollable: 'div' });
    assert.throws(function () {
      this.render();
    }, Error, 'Should raise error');
  });

});