import Ember from 'ember';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

module('RouteMixin');

test('it works', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin);
  var route = RouteObject.create();
  assert.ok(route);
});

function createRoute(modelName, routeProperties={}, extraParams={}, boundParams={}) {
  var RouteObject = Ember.Route.extend(RouteMixin, Ember.merge(routeProperties, {
    model() {
      return this.infinityModel(modelName, extraParams, boundParams);
    }
  }));

  return RouteObject.create();
}

function createDummyStore(resolution, assertion) {
  return {
    query() {
      if (assertion) {
        assertion.apply(this, arguments);
      }

      return Ember.RSVP.resolve(
        Ember.Object.create(resolution)
      );
    }
  };
}

function createArrayStore(resolution) {
  return {
    query() {
      return Ember.RSVP.resolve(
        Ember.ArrayProxy.create({content: Ember.A(resolution)})
      );
    }
  };
}

function captureModel(route) {
  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  route.set('controller', Ember.Object.create({ model }));

  return model;
}

test('it can not use infinityModel without Ember Data Store', assert => {
  var route = createRoute('post', {store: null});

  assert.throws(() => {
    route.model();
  },
    /store is not available to infinityModel/,
    'It throws if a store property is not available to the Route.'
  );
});

test('it can not use infinityModel without the Store Property having the appropriate finder method', assert => {
  var route = createRoute('post', {
    store: {
      notQuery() {
        return null;
      }
    }
  });

  assert.throws(() => {
    route.model();
  },
    /store is not available to infinityModel/,
    'It throws if the resolved store finder method is not availabe on the store.'
  );
});

test('it can not use infinityModel without a Model Name', assert => {
  var route = createRoute(undefined, {
    store: {
      query() {}
    }
  });

  assert.throws(() => {
    route.model();
  },
    /must pass a Model Name to infinityModel/,
    'It throws unless you pass a model name to the infinityModel function.'
  );
});

test('it sets state before it reaches the end', assert => {
  var route = createRoute('item', {
    store: createDummyStore({
      items: [{id: 1, name: 'Test'}],
      meta: {
        total_pages: 31
      }
    })
  });

  var model = captureModel(route);

  assert.equal(route.get('_totalPages'), 31, '_totalPages');
  assert.equal(route.get('currentPage'), 1, 'currentPage');
  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')), 'extra params are empty');
  assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
});

test('it allows customizations of request params', assert => {
  var store = createDummyStore(
    { items: [] },
    function (modelType, findQuery) {
      assert.deepEqual(findQuery, {per: 25, p: 1}, 'findQuery');
  });

  var route = createRoute('item', {
    perPageParam: 'per',
    pageParam: 'p',
    store
  });

  captureModel(route);
});

test('it allows customizations of meta parsing params', assert => {
  var store = createDummyStore({
    items: [{id: 1, name: 'Walter White'}],
    pagination: {
      total: 22
    }
  });

  var route = createRoute('item', {
    totalPagesParam: 'pagination.total',
    store
  });

  captureModel(route);

  assert.equal(route.get('_totalPages'), 22, '_totalPages');
});

test('it sets state  when it reaches the end', assert => {
  var store = createDummyStore({
    items: [{id: 1, name: 'Test'}],
    meta: {
      total_pages: 31
    }
  });

  var route = createRoute('item',
    { store },
    { startingPage: 31 }
  );

  var model = captureModel(route);

  assert.equal(route.get('_totalPages'), 31, '_totalPages');
  assert.equal(route.get('currentPage'), 31, 'currentPage');
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')), '_extraParams');
  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses extra params when loading more data', assert => {

  assert.expect(8);

  var store = createDummyStore({
      items: [{id: 1, name: 'Test'}],
      pushObjects: Ember.K,
      meta: {
        total_pages: 2
      }
    },
    function (modelType, findQuery) {
      assert.equal(findQuery.extra, 'param', 'params.extra');
  });

  var route = createRoute('item', {store}, {extra: 'param'});

  var model = captureModel(route);

  assert.equal(route.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(route.get('currentPage'), 2, 'currentPage');
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test("It doesn't request more pages once _canLoadMore is false", assert => {
  assert.expect(6);

  var store = createDummyStore({
    items: [{id: 1, name: 'Test'}],
    pushObjects: Ember.K,
    meta: {
      total_pages: 2
    }
  });

  var route = createRoute('item', { store });

  captureModel(route);

  assert.ok(route.get('_canLoadMore'), 'can load more');
  assert.equal(route.get('currentPage'), 1, 'currentPage');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.notOk(route.get('_canLoadMore'), 'can load more');
  assert.equal(route.get('currentPage'), 2, 'currentPage');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.notOk(route.get('_canLoadMore'), 'can load more');
  assert.equal(route.get('currentPage'), 2, 'currentPage');
});

test("It resets the currentPage when the model hook is called again", assert => {
  assert.expect(5);

  var store = createDummyStore({
    items: [{id: 1, name: 'Test'}],
    pushObjects: Ember.K,
    meta: {
      total_pages: 2
    }
  });

  var route = createRoute('item', { store });

  var model = captureModel(route);

  assert.ok(route.get('_canLoadMore'), 'can load more');
  assert.equal(route.get('currentPage'), 1, 'currentPage');

  model = captureModel(route);
  assert.equal(route.get('currentPage'), 1, 'currentPage');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('currentPage'), 2, 'currentPage');

  model = captureModel(route);

  assert.equal(route.get('currentPage'), 1, 'currentPage');
});

test('it uses overridden params when loading more data', assert => {

  assert.expect(8);

  var store = createDummyStore({
      items: [{id: 1, name: 'Test'}],
      pushObjects: Ember.K,
      meta: {
        testTotalPages: 3
      }
    },
    function (modelType, findQuery) {
      assert.equal(findQuery.testPerPage, 1);
      assert.equal(findQuery.testPage, expectedPageNumber);
  });

  var route = createRoute('item', {
      store,
      perPageParam: 'testPerPage',
      pageParam: 'testPage',
      totalPagesParam: 'meta.testTotalPages'
    },
    {perPage: 1, startingPage: 2}
  );

  var expectedPageNumber = 2;
  var model = captureModel(route);

  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');

  expectedPageNumber = 3;

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(route.get('currentPage'), 3, 'currentPage');
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses bound params when loading more data', assert => {

  assert.expect(8);

  var store = createDummyStore({
      items: [{id: 1, name: 'Test'}, {id: 2, name: 'New Test'}],
      pushObjects: Ember.K,
      meta: {
        total_pages: 3
      }
    },
    function (modelType, findQuery) {
      assert.equal(route.get('test'), findQuery.category, 'dynamic param is equal to the value of the computed property');
  });

  var route = createRoute('item', {
      feature: Ember.computed.alias('test'),
      test: 'new',
      store
    },
    {perPage: 1, startingPage: 1},
    {category: 'feature'}
  );

  var model = captureModel(route);

  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), true, 'can load even more data');
  route.set('test', 'hot');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(route.get('currentPage'), 3, 'currentPage');
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it allows overrides/manual invocations of updateInfinityModel', assert => {
  var items = [
    { id: 1, title: 'The Great Gatsby' },
    { id: 2, title: 'The Last Tycoon' }
  ];

  var store = {
    query(modelType, findQuery) {
      var item = items[findQuery.page-1];
      return Ember.RSVP.resolve(
        Ember.ArrayProxy.create({
          content: Ember.A([item]),
          meta: { total_pages: 2 }
      }));
    }
  };

  var route = createRoute('item', {
      store,
      updateInfinityModel(newObjects) {
        return this._super(newObjects.setEach('author', 'F. Scott Fitzgerald'));
      }
    },
    {perPage: 1}
  );

  var model = captureModel(route);

  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');
  assert.equal(model.get('content.length'), 1, 'content.length');
  assert.notEqual(model.get('content.lastObject.author'), 'F. Scott Fitzgerald', 'overrides to updateInfinityModel should take effect');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(model.get('content.length'), 2, 'content.length');
  assert.equal(model.get('content.lastObject.author'), 'F. Scott Fitzgerald', 'overrides to updateInfinityModel should take effect');

  var newObjects = Ember.ArrayProxy.create({
    content: Ember.A([
      { id: 3, title: 'Tender Is the Night' }
    ])
  });

  Ember.run(() => {
    route.updateInfinityModel(newObjects);
  });

  assert.equal(model.get('content.length'), 3, 'content.length');
  assert.equal(model.get('content.lastObject.title'), 'Tender Is the Night', 'updateInfinityModel can be invoked manually');
});

test('It allows to set startingPage as 0', assert => {
  var route = createRoute('item', {
    store: createDummyStore({
      items: [{id: 1, name: 'Test'}],
      meta: {
        total_pages: 1
      }
    })
  }, {startingPage: 0});

  captureModel(route);

  assert.equal(0, route.get('currentPage'));
  assert.equal(true, route.get('_canLoadMore'));
});

module('RouteMixin.afterInfinityModel', {
  beforeEach() {
    var item = { id: 1, title: 'The Great Gatsby' };
    this.route = createRoute('item', {
      store: createArrayStore([item])
    });
  }
});

test('it calls the afterInfinityModel method on objects fetched from the store', function (assert) {
  this.route.afterInfinityModel = (items) => {
    return items.setEach('author', 'F. Scott Fitzgerald');
  };

  var model = captureModel(this.route);

  assert.equal(model.get('content.firstObject.author'), 'F. Scott Fitzgerald', 'updates made in afterInfinityModel should take effect');
});

test('it does not require a return value to work', function (assert) {
  this.route.afterInfinityModel = (items) => {
    items.setEach('author', 'F. Scott Fitzgerald');
  };

  var model = captureModel(this.route);

  assert.equal(model.get('content.firstObject.author'), 'F. Scott Fitzgerald', 'updates made in afterInfinityModel should take effect');
});

test('it resolves a promise returned from afterInfinityModel', function (assert) {
  this.route.afterInfinityModel = (items) => {
    return new Ember.RSVP.Promise(function (resolve) {
      resolve(items.setEach('author', 'F. Scott Fitzgerald'));
    });
  };

  var model = captureModel(this.route);

  assert.equal(model.get('content.firstObject.author'), 'F. Scott Fitzgerald', 'updates made in afterInfinityModel should take effect');
});



/*
 * Compatibility Tests
 */
module('RouteMixin Compatibility', {
  beforeEach: function () {
    var store = {
      _dummyFetch() {
        var result = Ember.ArrayProxy.create({
          content: Ember.A([])
        });
        return Ember.RSVP.resolve(result);
      },
      query() {
        return this._dummyFetch();
      },
      find() {
        return this._dummyFetch();
      }
    };

    this.route = createRoute('item', { store });
  }
});

test('It uses Query for ED >= 1.13.4', function (assert) {
  DS.VERSION = "1.13.4";
  this.route.model();
  assert.equal(this.route.get('_storeFindMethod'), 'query');
});

test('It uses Find for ED <= 1.0.0-beta.19.2', function (assert) {
  DS.VERSION = "1.0.0-beta.19.2";
  this.route.model();
  assert.equal(this.route.get('_storeFindMethod'), 'find');
});

test('It explodes when using an unsupported ED', function (assert) {
  DS.VERSION = "1.0.0-beta.19.3";
  assert.throws(() => {
    this.route.model();
  },
    /unsupported version of Ember Data/,
    'Unsupported ember-data error message is shown for beta.19.3'
  );
});
