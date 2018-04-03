import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A } from '@ember/array';

module('Unit | Service | infinity-loader', function(hooks) {
  setupTest(hooks);

  test('it works with empty pushObjects', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A();
    let newArray = A();
    assert.deepEqual(service.pushObjects(originalArray, newArray), []);
  });

  test('it works with pushObjects', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1]);
    let newArray = A();
    assert.deepEqual(service.pushObjects(originalArray, newArray), [1]);
  });

  test('it works with pushObjects again', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1]);
    let newArray = A([1]);
    assert.deepEqual(service.pushObjects(originalArray, newArray), [1,1]);
  });

  test('it works with empty unshiftObjects', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A();
    let newArray = A();
    assert.deepEqual(service.unshiftObjects(originalArray, newArray), []);
  });

  test('it works with unshiftObjects', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1]);
    let newArray = A();
    assert.deepEqual(service.unshiftObjects(originalArray, newArray), [1]);
  });

  test('it works with unshiftObjects again', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1]);
    let newArray = A([1]);
    assert.deepEqual(service.unshiftObjects(originalArray, newArray), [1,1]);
  });

  test('it works with unshiftObjects again', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1]);
    let newArray = A([3, 2]);
    assert.deepEqual(service.unshiftObjects(originalArray, newArray), [3,2,1]);
  });

  test('it works with empty array', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A();
    let newArray = A();
    assert.deepEqual(service.replace(originalArray, newArray), []);
  });

  test('can clear out array', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1, 2]);
    let newArray = A();
    assert.deepEqual(service.replace(originalArray, newArray), []);
  });

  test('it works with original array and new array', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([1, 2]);
    let newArray = A([1]);
    assert.deepEqual(service.replace(originalArray, newArray), [1]);
  });

  test('it works with empty original array', function(assert) {
    let service = this.owner.lookup('service:infinity-loader');

    let originalArray = A([]);
    let newArray = A([1]);
    assert.deepEqual(service.replace(originalArray, newArray), [1]);
  });
});

