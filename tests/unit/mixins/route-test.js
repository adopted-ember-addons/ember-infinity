import Ember from 'ember';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

module('RouteMixin');

test('it works', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin);
  var route = RouteObject.create();
  assert.ok(route);
});

test('it can not use infinityModel without Ember Data Store', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('post');
    }
  });
  var route = RouteObject.create();

  var infinityError;
  try {
    route.model();
  } catch(error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, "Ember Data store is not available to infinityModel");
});

test('it can not use infinityModel without a Model Name', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel();
    }
  });
  var route = RouteObject.create();
  route.store = {
    find() {}
  };

  var infinityError;
  try {
    route.model();
  } catch(error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, "You must pass a Model Name to infinityModel");
});

test('it sets state before it reaches the end', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find() {
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Test'}],
          meta: {
            total_pages: 31
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(31, route.get('_totalPages'));
  assert.equal(1, route.get('currentPage'));
  assert.equal(true, route.get('_canLoadMore'));
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')));
  assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
});

test('it allows customizations of request params', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    perPageParam: 'per',
    pageParam: 'p',
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(modelType, findQuery) {
      assert.deepEqual(findQuery, {per: 25, p: 1});
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: []
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });
});

test('it allows customizations of meta parsing params', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    totalPagesParam: 'pagination.total',
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(modelType, findQuery) {
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Walter White'}],
          pagination: {
            total: 22
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(22, route.get('_totalPages'));
});

test('it sets state  when it reaches the end', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {startingPage: 31});
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find() {
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Test'}],
          meta: {
            total_pages: 31
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(31, route.get('_totalPages'));
  assert.equal(31, route.get('currentPage'));
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')));
  assert.equal(false, route.get('_canLoadMore'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses extra params when loading more data', assert => {

  assert.expect(8);

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {extra: 'param'});
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(name, params) {
      assert.equal('param', params.extra);
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Test'}],
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
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  // The controller needs to be set so _infinityLoad() can call
  // pushObjects()
  var dummyController = Ember.Object.create({
    model
  });
  route.set('controller', dummyController);

  assert.equal('param', route.get('_extraParams.extra'));
  assert.equal(true, route.get('_canLoadMore'));

  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal('param', route.get('_extraParams.extra'));
  assert.equal(false, route.get('_canLoadMore'));
  assert.equal(2, route.get('currentPage'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');

});

test('it uses overridden params when loading more data', assert => {

  assert.expect(8);

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {perPage: 1, startingPage: 2});
    },

    perPageParam: 'testPerPage',
    pageParam: 'testPage',
    totalPagesParam: 'meta.testTotalPages'
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(name, params) {
      assert.equal(1, params.testPerPage);
      assert.ok(params.testPage);
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Test'}],
          pushObjects: Ember.K,
          meta: {
            testTotalPages: 3
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  // The controller needs to be set so _infinityLoad() can call
  // pushObjects()
  var dummyController = Ember.Object.create({
    model
  });
  route.set('controller', dummyController);

  assert.equal(true, route.get('_canLoadMore'));

  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(false, route.get('_canLoadMore'));
  assert.equal(3, route.get('currentPage'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');

});

test('it uses bound params when loading more data', assert => {

  assert.expect(8);

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {perPage: 1, startingPage: 1}, {category: 'feature'});
    },

    feature: Ember.computed.alias('test'),
    test: 'new'
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(name, params) {
      assert.equal(route.get('test'), params.category, 'dynamic param is equal to the value of the computed property');
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Test'}, {id: 2, name: 'New Test'}],
          pushObjects: Ember.K,
          meta: {
            total_pages: 3
          }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  // The controller needs to be set so _infinityLoad() can call
  // pushObjects()
  var dummyController = Ember.Object.create({
    model
  });
  route.set('controller', dummyController);

  assert.equal(true, route.get('_canLoadMore'));

  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(true, route.get('_canLoadMore'), 'can load even more data');
  route.set('test', 'hot');
  // Load even more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(false, route.get('_canLoadMore'));
  assert.equal(3, route.get('currentPage'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it allows overrides/manual invocations of updateInfinityModel', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {perPage: 1});
    },
    updateInfinityModel(newObjects) {
      return this._super(newObjects.setEach('author', 'F. Scott Fitzgerald'));
    }
  });
  var route = RouteObject.create();

  var items = [
    { id: 1, title: 'The Great Gatsby' },
    { id: 2, title: 'The Last Tycoon' }
  ];

  var dummyStore = {
    find(modelType, findQuery) {
      var item = items[findQuery.page-1];
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.ArrayProxy.create({
          content: Ember.A([item]),
          meta: { total_pages: 2 }
        }));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  var dummyController = Ember.Object.create({
    model
  });
  route.set('controller', dummyController);

  assert.equal(route.get('_canLoadMore'), true);
  assert.equal(model.get('content.length'), 1);

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), false);
  assert.equal(model.get('content.length'), 2);
  assert.equal(model.get('content.lastObject.author'), 'F. Scott Fitzgerald', 'overrides to updateInfinityModel should take effect');

  var newObjects = Ember.ArrayProxy.create({
    content: Ember.A([
      { id: 3, title: 'Tender Is the Night' }
    ])
  });

  Ember.run(() => {
    route.updateInfinityModel(newObjects);
  });

  assert.equal(model.get('content.length'), 3);
  assert.equal(model.get('content.lastObject.title'), 'Tender Is the Night', 'updateInfinityModel can be invoked manually');
});
