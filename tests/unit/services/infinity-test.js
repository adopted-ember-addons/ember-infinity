import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A } from '@ember/array';
import RSVP from 'rsvp';
import ArrayProxy from '@ember/array/proxy';
import InfinityModel from 'ember-infinity/lib/infinity-model';

module('Unit | Service | infinity', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.EA = (content) => {
      return ArrayProxy.create({ content: A(content) });
    };
    this.item = { id: 1, title: 'The Great Gatsby' };
  });

  test('it works with empty pushObjects', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A() });
    let newArray = this.EA();
    let result = service.pushObjects(originalArray, newArray);
    assert.equal(result.get('length'), 0);
  });

  test('pushObjects: it works with empty array', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A() });
    let newArray = this.EA([this.item]);
    let result = service.pushObjects(originalArray, newArray);
    assert.equal(result.get('length'), 1);
  });

  test('pushObjects: it works with non empty array', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A([this.item]) });
    let newArray = this.EA([this.item]);
    let result = service.pushObjects(originalArray, newArray);
    assert.equal(result.get('length'), 2);
  });

  test('unshiftObjects: it works with empty original array', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A() });
    let newArray = this.EA();
    let result = service.unshiftObjects(originalArray, newArray);
    assert.equal(result.get('length'), 0);
  });

  test('unshiftObjects: it works', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A([this.item]) });
    let newArray = this.EA();
    let result = service.unshiftObjects(originalArray, newArray);
    assert.equal(result.get('length'), 1);
  });

  test('unshiftObjects: it works non empty new array', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A([this.item]) });
    let newArray = this.EA([{id: 'wat'}]);
    let result = service.unshiftObjects(originalArray, newArray);
    assert.equal(result.get('length'), 2);
    assert.equal(result.get('firstObject').id, 'wat');
  });

  test('replace: it works', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A([this.item]) });
    let newArray = this.EA([{id: 'wat'}]);
    let result = service.replace(originalArray, newArray);
    assert.equal(result.get('length'), 1);
    assert.equal(result.get('firstObject').id, 'wat');
  });

  test('replace: it works with empty array', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A([this.item]) });
    let newArray = this.EA();
    let result = service.replace(originalArray, newArray);
    assert.equal(result.get('length'), 0);
  });

  test('flush: it clears array', function(assert) {
    let service = this.owner.lookup('service:infinity');
    let originalArray = InfinityModel.create({ content: A([this.item]) });
    let newArray = this.EA();
    let result = service.flush(originalArray, newArray);
    assert.equal(result.get('length'), 0);
  });

  test('model hook will always return promise when no cache in options', function(assert) {
    let service = this.owner.lookup('service:infinity');
    service.loadNextPage = () => new RSVP.Promise((resolve) => { resolve(); });
    let model = service.model('post');
    assert.ok(typeof(model.then) === 'function');
    assert.deepEqual(service.get('_cachedCollection'), {}, 'default of _cachedCollection');
    model = service.model('post');
    assert.ok(typeof(model.then) === 'function');
    assert.notOk(model instanceof InfinityModel, 'returns cached model');
  });

  test('model hook can return cached infinity model if pass "cache" with future timestamp', function(assert) {
    let service = this.owner.lookup('service:infinity');
    service.loadNextPage = () => new RSVP.Promise((resolve) => { resolve(); });
    let date = 3600;
    let model = service.model('post', { infinityCache: date });
    assert.ok(typeof(model.then) === 'function');
    assert.ok(Object.keys(service.get('_cachedCollection')['post3600'])[0] > Date.now(), 'collection has correct key');
    model = service.model('post', { infinityCache: date });
    assert.ok(model instanceof InfinityModel, 'returns cached model');
    model = service.model('post', { infinityCache: date });
    assert.ok(model instanceof InfinityModel, 'returns cached model again');
  });

  test('model hook can return cached infinity model with unique identifier', function(assert) {
    let service = this.owner.lookup('service:infinity');
    service.loadNextPage = () => new RSVP.Promise((resolve) => { resolve(); });
    let date = 3600;
    let model = service.model('post', { infinityCache: date, startingPage: 3 });
    assert.ok(typeof(model.then) === 'function');
    assert.ok(Object.keys(service.get('_cachedCollection')['post36003'])[0] > Date.now(), 'collection has correct key');
    model = service.model('post', { infinityCache: date, startingPage: 3 });
    assert.ok(model instanceof InfinityModel, 'returns cached model');
    model = service.model('post', { infinityCache: date, startingPage: 10 });
    assert.ok(typeof(model.then) === 'function', 'diff identifier will return thennable');
    model = service.model('post', { infinityCache: date, startingPage: 3 });
    assert.ok(model instanceof InfinityModel, 'returns cached model again');
  });

  // TODO: set up mirage so a request with `?limit=25` works
  skip('model instance can be customized by extending InfinityModel', function(assert) {
    const service = this.owner.lookup('service:infinity');
    const perPageParam = 'limit';
    const CustomizedInfinityModel = InfinityModel.extend({ perPageParam });
    const model = service.model('post', {}, CustomizedInfinityModel);

    service.loadNextPage = () => new RSVP.Promise((resolve) => { resolve(); });

    assert.equal(model.get('perPageParam'), perPageParam, 'model has configured param');
  });

  test('pushObjects will maintain sync with underlying infinityModel', function(assert) {
    let service = this.owner.lookup('service:infinity');
    service.loadNextPage = () => new RSVP.Promise((resolve) => { resolve(); });
    let date = 3600;
    service.model('post', { infinityCache: date, startingPage: 3 });
    assert.equal(service.get('infinityModels')[0].get('length'), 0, 'length of infinityModel content array is 0');

    let cachedModel = service.get('_cachedCollection')['post36003'];
    let cachedTimestamp = Object.keys(cachedModel)[0];
    let newArray = this.EA([this.item]);
    service.pushObjects(cachedModel[cachedTimestamp], newArray);

    assert.equal(service.get('infinityModels')[0].get('length'), 1, 'length of infinityModel content array is 1');
    cachedModel = service.get('_cachedCollection')['post36003'];
    cachedTimestamp = Object.keys(cachedModel)[0];
    assert.equal(cachedModel[cachedTimestamp].get('length'), 1, 'cached infinityModel content array is 1');
  });

  skip('model hook can break cache', function(assert) {
    let service = this.owner.lookup('service:infinity');
    service.loadNextPage = () => new RSVP.Promise((resolve) => { resolve(); });
    // let past_timestamp = Date.now();
    let date = 1;
    let model = service.model('post', { infinityCache: date });
    assert.ok(typeof(model.then) === 'function');
    // assert.ok(Object.keys(service.get('_cachedCollection')['post'])[0] >= past_timestamp, 'collection has updated timestamp');
    model = service.model('post', { infinityCache: date });
    assert.ok(typeof(model.then) === 'function');
  });
});

