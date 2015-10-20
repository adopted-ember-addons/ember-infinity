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
    store: null,
    model() {
      return this.infinityModel('post');
    }
  });
  var route = RouteObject.create();

  assert.throws(() => {
    route.model();
  },
    /store is not available to infinityModel/,
    'It throws if a store property is not available to the Route.'
  );
});

test('it can not use infinityModel without the Store Property having the appropriate finder method', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    store: {
      notQuery() {
        return null;
      }
    },
    model() {
      return this.infinityModel('post');
    }
  });
  var route = RouteObject.create();

  assert.throws(() => {
    route.model();
  },
    /store is not available to infinityModel/,
    'It throws if the resolved store finder method is not availabe on the store.'
  );
});

test('it can not use infinityModel without a Model Name', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel();
    }
  });
  var route = RouteObject.create();
  route.store = {
    query() {}
  };

  assert.throws(() => {
    route.model();
  },
    /must pass a Model Name to infinityModel/,
    'It throws unless you pass a model name to the infinityModel function.'
  );
});

test('it sets state before it reaches the end', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    query() {
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

  route.set('store', dummyStore);

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(route.get('_totalPages'), 31, '_totalPages');
  assert.equal(route.get('currentPage'), 1, 'currentPage');
  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')), 'extra params are empty');
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
    query(modelType, findQuery) {
      assert.deepEqual(findQuery, {per: 25, p: 1});
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: []
        }));
      });
    }
  };

  route.set('store', dummyStore);

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
    query() {
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

  route.set('store', dummyStore);

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(route.get('_totalPages'), 22, '_totalPages');
});

test('it sets state  when it reaches the end', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {startingPage: 31});
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    query() {
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

  route.set('store', dummyStore);

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(route.get('_totalPages'), 31, '_totalPages');
  assert.equal(route.get('currentPage'), 31, 'currentPage');
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')), '_extraParams');
  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
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
    query(name, params) {
      assert.equal(params.extra, 'param', 'params.extra');
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

  route.set('store', dummyStore);

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

  assert.equal(route.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');

  // Load more
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

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    query() {
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

  route.set('store', dummyStore);

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

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    query() {
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

  route.set('store', dummyStore);

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

  assert.ok(route.get('_canLoadMore'), 'can load more');
  assert.equal(route.get('currentPage'), 1, 'currentPage');

  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(route.get('currentPage'), 1, 'currentPage');

  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('currentPage'), 2, 'currentPage');

  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(route.get('currentPage'), 1, 'currentPage');
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

  var expectedPageNumber;
  var dummyStore = {
    query(name, params) {
      assert.equal(1, params.testPerPage);
      assert.equal(params.testPage, expectedPageNumber);
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

  route.set('store', dummyStore);

  expectedPageNumber = 2;
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

  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');

  expectedPageNumber = 3;
  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(route.get('currentPage'), 3, 'currentPage');
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
    query(name, params) {
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

  route.set('store', dummyStore);

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

  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');

  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), true, 'can load even more data');
  route.set('test', 'hot');
  // Load even more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(route.get('currentPage'), 3, 'currentPage');
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
    query(modelType, findQuery) {
      var item = items[findQuery.page-1];
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.ArrayProxy.create({
          content: Ember.A([item]),
          meta: { total_pages: 2 }
        }));
      });
    }
  };

  route.set('store', dummyStore);

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

  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');
  assert.equal(model.get('content.length'), 1, 'content.length');
  assert.equal(model.get('content.lastObject.author'), 'F. Scott Fitzgerald', 'overrides to updateInfinityModel should take effect');

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
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {startingPage: 0});
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    query() {
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.Object.create({
          items: [{id: 1, name: 'Test'}],
          meta: {
            total_pages: 1
          }
        }));
      });
    }
  };

  route.set('store', dummyStore);

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(0, route.get('currentPage'));
  assert.equal(true, route.get('_canLoadMore'));
});

/*
 * Compatibility Tests
 */
var dummyStore = {
  _dummyFetch(modelType, findQuery) {
    var items = [
      { id: 1, title: 'The Great Gatsby' },
      { id: 2, title: 'The Last Tycoon' }
    ];
    var item = items[findQuery.page-1];
    return new Ember.RSVP.Promise(resolve => {
      Ember.run(this, resolve, Ember.ArrayProxy.create({
        content: Ember.A([item]),
        meta: { total_pages: 2 }
      }));
    });
  },
  query(modelType, findQuery) {
    return this._dummyFetch(modelType, findQuery);
  },
  find(modelType, findQuery) {
    return this._dummyFetch(modelType, findQuery);
  }
};

test('It uses Query for ED >= 1.13.4', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    store: dummyStore,
    model() {
      return this.infinityModel('item', { perPage: 1 });
    }
  });

  var route = RouteObject.create();

  DS.VERSION = "1.13.4";
  return route.model().then(function() {
    assert.equal(route.get('_storeFindMethod'), 'query');
  });
});

test('It uses Find for ED <= 1.0.0-beta.19.2', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    store: dummyStore,
    model() {
      return this.infinityModel('item', { perPage: 1 });
    }
  });

  var route = RouteObject.create();

  DS.VERSION = "1.0.0-beta.19.2";
  return route.model().then(function() {
    assert.equal(route.get('_storeFindMethod'), 'find');
  });
});

test('It explodes when using an unsupported ED', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    store: dummyStore,
    model() {
      return this.infinityModel('item', { perPage: 1 });
    }
  });

  var route = RouteObject.create();

  DS.VERSION = "1.0.0-beta.19.3";
  assert.throws(() => {
    route.model();
  },
    /unsupported version of Ember Data/,
    'Unsupported ember-data error message is shown for beta.19.3'
  );
});
