import Ember from 'ember';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

module('RouteMixin');

test('it works', function (assert) {
  var RouteObject = Ember.Route.extend(RouteMixin);
  var route = RouteObject.create();
  assert.ok(route);
});

test('it can not use infinityModel without Ember Data Store', function (assert) {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function model() {
      return this.infinityModel('post');
    }
  });
  var route = RouteObject.create();

  var infinityError;
  try {
    route.model();
  } catch (error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, 'Ember Data store is not available to infinityModel');
});

test('it can not use infinityModel without a Model Name', function (assert) {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function model() {
      return this.infinityModel();
    }
  });
  var route = RouteObject.create();
  route.store = {
    find: function find() {}
  };

  var infinityError;
  try {
    route.model();
  } catch (error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, 'You must pass a Model Name to infinityModel');
});

test('it sets state before it reaches the end', function (assert) {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find: function find() {
      var _this = this;

      return new Ember.RSVP.Promise(function (resolve) {
        Ember.run(_this, resolve, Ember.Object.create({
          items: [{ id: 1, name: 'Test' }],
          meta: {
            total_pages: 31
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(function () {
    route.model().then(function (result) {
      model = result;
    });
  });

  assert.equal(31, route.get('_totalPages'));
  assert.equal(1, route.get('_currentPage'));
  assert.equal(true, route.get('_canLoadMore'));
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')));
  assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
});

test('it allows customizations of request params', function (assert) {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    perPageParam: 'per',
    pageParam: 'p',
    model: function model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find: function find(modelType, findQuery) {
      var _this2 = this;

      assert.deepEqual(findQuery, { per: 25, p: 1 });
      return new Ember.RSVP.Promise(function (resolve) {
        Ember.run(_this2, resolve, Ember.Object.create({
          items: []
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(function () {
    route.model().then(function (result) {
      model = result;
    });
  });
});

test('it allows customizations of meta parsing params', function (assert) {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    totalPagesParam: 'pagination.total',
    model: function model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find: function find(modelType, findQuery) {
      var _this3 = this;

      return new Ember.RSVP.Promise(function (resolve) {
        Ember.run(_this3, resolve, Ember.Object.create({
          items: [{ id: 1, name: 'Walter White' }],
          pagination: {
            total: 22
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(function () {
    route.model().then(function (result) {
      model = result;
    });
  });

  assert.equal(22, route.get('_totalPages'));
});

test('it sets state  when it reaches the end', function (assert) {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function model() {
      return this.infinityModel('item', { startingPage: 31 });
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find: function find() {
      var _this4 = this;

      return new Ember.RSVP.Promise(function (resolve) {
        Ember.run(_this4, resolve, Ember.Object.create({
          items: [{ id: 1, name: 'Test' }],
          meta: {
            total_pages: 31
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(function () {
    route.model().then(function (result) {
      model = result;
    });
  });

  assert.equal(31, route.get('_totalPages'));
  assert.equal(31, route.get('_currentPage'));
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')));
  assert.equal(false, route.get('_canLoadMore'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses extra params when loading more data', function (assert) {

  assert.expect(8);

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function model() {
      return this.infinityModel('item', { extra: 'param' });
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find: function find(name, params) {
      var _this5 = this;

      assert.equal('param', params.extra);
      return new Ember.RSVP.Promise(function (resolve) {
        Ember.run(_this5, resolve, Ember.Object.create({
          items: [{ id: 1, name: 'Test' }],
          pushObjects: Ember.K,
          meta: {
            total_pages: 2
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(function () {
    route.model().then(function (result) {
      model = result;
    });
  });

  // The controller needs to be set so _infinityLoad() can call
  // pushObjects()
  var dummyController = Ember.Object.create({
    model: model
  });
  route.set('controller', dummyController);

  assert.equal('param', route.get('_extraParams.extra'));
  assert.equal(true, route.get('_canLoadMore'));

  // Load more
  Ember.run(function () {
    route._infinityLoad();
  });

  assert.equal('param', route.get('_extraParams.extra'));
  assert.equal(false, route.get('_canLoadMore'));
  assert.equal(2, route.get('_currentPage'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});