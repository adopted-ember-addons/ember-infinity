import Ember from 'ember';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

module('RouteMixin');

let EO = Ember.Object.create.bind(Ember.Object);
let EA = function (content, meta={}) {
  return Ember.ArrayProxy.create({ content: Ember.A(content), meta });
};

test('it works', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin);
  var route = RouteObject.create();
  assert.ok(route);
});

function createRoute(infinityModelArgs, routeProperties={}) {
  var RouteObject = Ember.Route.extend(RouteMixin, Ember.merge(routeProperties, {
    model() {
      return this.infinityModel(...infinityModelArgs);
    }
  }));

  return RouteObject.create();
}

function createMockStore(resolution, assertion) {
  return {
    query() {
      if (assertion) {
        assertion.apply(this, arguments);
      }

      return Ember.RSVP.resolve(resolution);
    }
  };
}

function callModelHook(route) {
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
  var route = createRoute(['post'], {store: null});

  assert.throws(() => {
    route.model();
  },
    /store is not available to infinityModel/,
    'It throws if a store property is not available to the Route.'
  );
});

test('it can not use infinityModel without the Store Property having the appropriate finder method', assert => {
  var route = createRoute(['post'], {
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
    'It throws if the resolved store finder method is not available on the store.'
  );
});

test('it can not use infinityModel without a Model Name', assert => {
  var route = createRoute([], {
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
  var route = createRoute(['item'], {
    store: createMockStore(EO({
      items: [{id: 1, name: 'Test'}],
      meta: {
        total_pages: 31
      }
    }))
  });

  var model = callModelHook(route);

  assert.equal(route.get('_totalPages'), 31, '_totalPages');
  assert.equal(route.get('currentPage'), 1, 'currentPage');
  assert.equal(route.get('_canLoadMore'), true, '_canLoadMore');
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')), 'extra params are empty');
  assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
});

test('it allows customizations of request params', assert => {
  var store = createMockStore(
    EO({ items: [] }),
    function (modelType, findQuery) {
      assert.deepEqual(findQuery, {per: 25, p: 1}, 'findQuery');
  });

  var route = createRoute(['item'], {
    perPageParam: 'per',
    pageParam: 'p',
    store
  });

  callModelHook(route);
});

test('it allows customizations of meta parsing params', assert => {
  var store = createMockStore(EO({
    items: [{id: 1, name: 'Walter White'}],
    pagination: {
      total: 22
    }
  }));

  var route = createRoute(['item'], {
    totalPagesParam: 'pagination.total',
    store
  });

  callModelHook(route);

  assert.equal(route.get('_totalPages'), 22, '_totalPages');
});

module('RouteMixin - reaching the end', {
  setup() {
    this.store = createMockStore(EO({
      items: [{id: 1, name: 'Test'}],
      pushObjects: Ember.K,
      meta: {
        total_pages: 2
      }
    }));

    this.createRoute = (extras) => {
      this.route = createRoute(['item', extras],
        { store: this.store }
      );

      this.callModelHook();
    };

    this.callModelHook = () => {
      this.model = callModelHook(this.route);
    };

    this.loadMore = () => {
      Ember.run(() => {
        this.route._infinityLoad();
      });
    };
  }
});

test('it sets state when it reaches the end', function (assert) {
  assert.expect(5);

  this.createRoute({ startingPage: 2 });

  assert.equal(this.route.get('_totalPages'), 2, '_totalPages');
  assert.equal(this.route.get('currentPage'), 2, 'currentPage');
  assert.equal(this.route.get('_canLoadMore'), false, '_canLoadMore');
  assert.ok(Ember.$.isEmptyObject(this.route.get('_extraParams')), '_extraParams');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses extra params when loading more data', function (assert) {
  assert.expect(6);

  this.createRoute({ extra: 'param' });

  assert.equal(this.route.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(this.route.get('_canLoadMore'), true, '_canLoadMore');

  this.loadMore();

  assert.equal(this.route.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(this.route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(this.route.get('currentPage'), 2, 'currentPage');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

test("It doesn't request more pages once _canLoadMore is false", function (assert) {
  assert.expect(6);

  this.createRoute();

  assert.ok(this.route.get('_canLoadMore'), 'can load more');
  assert.equal(this.route.get('currentPage'), 1, 'currentPage');

  this.loadMore();

  assert.notOk(this.route.get('_canLoadMore'), 'can load more');
  assert.equal(this.route.get('currentPage'), 2, 'currentPage');

  this.loadMore();

  assert.notOk(this.route.get('_canLoadMore'), 'can load more');
  assert.equal(this.route.get('currentPage'), 2, 'currentPage');
});

test("It resets the currentPage when the model hook is called again", function (assert) {
  assert.expect(5);

  this.createRoute();

  assert.ok(this.route.get('_canLoadMore'), 'can load more');
  assert.equal(this.route.get('currentPage'), 1, 'currentPage');

  this.callModelHook();
  assert.equal(this.route.get('currentPage'), 1, 'currentPage');

  this.loadMore();

  assert.equal(this.route.get('currentPage'), 2, 'currentPage');

  this.callModelHook();

  assert.equal(this.route.get('currentPage'), 1, 'currentPage');
});

module('RouteMixin - loading more data', {
  setup(assert) {
    var store = createMockStore(EO({
        items: [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}],
        pushObjects: Ember.K,
        meta: {
          testTotalPages: 3
        }
      }),
      (modelType, findQuery) => {
        assert.equal(findQuery.testPerPage, 1);
        assert.equal(findQuery.testPage, this.expectedPageNumber);
    });

    this.route = createRoute(['item', {perPage: 1, startingPage: 2}], {
        store,
        perPageParam: 'testPerPage',
        pageParam: 'testPage',
        totalPagesParam: 'meta.testTotalPages'
      }
    );

    this.expectedPageNumber = 2;

    this.model = callModelHook(this.route);
  }
});

test('it uses overridden params when loading more data', function (assert) {
  assert.expect(4);

  this.expectedPageNumber = 2;

  assert.equal(this.route.get('_canLoadMore'), true, '_canLoadMore');
  assert.equal(this.route.get('currentPage'), 2, 'currentPage');
});

test('it uses overridden params when reaching the end', function (assert) {
  assert.expect(7);

  this.expectedPageNumber = 3;

  Ember.run(() => {
    this.route._infinityLoad();
  });

  assert.equal(this.route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(this.route.get('currentPage'), 3, 'currentPage');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

module('RouteMixin - bound params', {
  setup(assert) {
    var store = createMockStore(EO({
        items: [
          {id: 1, name: 'Test'},
          {id: 2, name: 'New Test'}
        ],
        pushObjects: Ember.K,
        meta: {
          total_pages: 3
        }
      }),
      (modelType, findQuery) => {
        assert.equal(
          this.route.get('test'),
          findQuery.category,
          'dynamic param is equal to the value of the computed property'
        );
    });

    this.route = createRoute(['item',
        {perPage: 1, startingPage: 1},
        {category: 'feature'}
      ],
      {
        feature: Ember.computed.alias('test'),
        test: 'new',
        store
      }
    );

    this.model = callModelHook(this.route);

    this.loadMore = () => {
      Ember.run(() => {
        this.route._infinityLoad();
      });
    };
  }
});

test('it uses bound params when loading more data', function (assert) {
  assert.expect(2);

  assert.equal(this.route.get('_canLoadMore'), true, '_canLoadMore');
});

test('it uses bound params when loading even more data', function (assert) {
  this.loadMore();

  assert.equal(this.route.get('_canLoadMore'), true, 'can load even more data');
});

test('it uses bound params when reaching the end', function (assert) {
  this.loadMore();
  this.loadMore();

  assert.equal(this.route.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(this.route.get('currentPage'), 3, 'currentPage');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

module('RouteMixin.updateInfinityModel', {
  setup(assert) {
    var items = [
      { id: 1, title: 'The Great Gatsby' },
      { id: 2, title: 'The Last Tycoon' }
    ];

    var store = {
      query(modelType, findQuery) {
        var item = items[findQuery.page-1];
        return Ember.RSVP.resolve(
          EA([item], {total_pages: 2})
        );
      }
    };

    this.route = createRoute(['item', {perPage: 1}], {
        store,
        updateInfinityModel(newObjects) {
          return this._super(newObjects.setEach('author', 'F. Scott Fitzgerald'));
        }
      }
    );

    this.model = callModelHook(this.route);

    this.testPage = ({canLoadMore, contentLength}) => {
      assert.equal(this.route.get('_canLoadMore'), canLoadMore, '_canLoadMore');
      assert.equal(this.model.get('content.length'), contentLength, 'content.length');
    };

    this.loadMore = () => {
      Ember.run(() => {
        this.route._infinityLoad();
      });
    };

    this.getLastAuthor = () => {
      return this.model.get('content.lastObject.author');
    };
  }
});

test('does not invoke updateInfinityModel on the first page', function (assert) {
  this.testPage({canLoadMore: true, contentLength: 1});

  assert.notEqual(
    this.getLastAuthor(),
    'F. Scott Fitzgerald',
    'overrides to updateInfinityModel should not take effect'
  );
});

test('it invokes updateInfinityModel after the first page', function (assert) {
  this.loadMore();

  this.testPage({canLoadMore: false, contentLength: 2});
  assert.equal(
    this.getLastAuthor(),
    'F. Scott Fitzgerald',
    'overrides to updateInfinityModel should take effect'
  );
});

test('it allows manual invocations of updateInfinityModel', function (assert) {
  assert.expect(3);

  this.loadMore();

  Ember.run(() => {
    this.route.updateInfinityModel(EA([
      { id: 3, title: 'Tender Is the Night' }
    ]));
  });

  this.testPage({canLoadMore: false, contentLength: 3});
  assert.equal(
    this.model.get('content.lastObject.title'),
    'Tender Is the Night',
    'updateInfinityModel can be invoked manually'
  );
});

test('It allows to set startingPage as 0', assert => {
  var route = createRoute(['item', {startingPage: 0}], {
    store: createMockStore(EO({
      items: [{id: 1, name: 'Test'}],
      meta: {
        total_pages: 1
      }
    }))
  });

  callModelHook(route);

  assert.equal(0, route.get('currentPage'));
  assert.equal(true, route.get('_canLoadMore'));
});

module('RouteMixin.afterInfinityModel', {
  beforeEach() {
    var item = { id: 1, title: 'The Great Gatsby' };
    this.route = createRoute(['item'], {
      store: createMockStore(EA([item]))
    });

    this.assertAfterInfinityWorks = function (assert) {
      var model = callModelHook(this.route);

      assert.equal(
        model.get('content.firstObject.author'),
        'F. Scott Fitzgerald',
        'updates made in afterInfinityModel should take effect'
      );
    };
  }
});

test('it calls the afterInfinityModel method on objects fetched from the store', function (assert) {
  this.route.afterInfinityModel = (items) => {
    return items.setEach('author', 'F. Scott Fitzgerald');
  };

  this.assertAfterInfinityWorks(assert);
});

test('it does not require a return value to work', function (assert) {
  this.route.afterInfinityModel = (items) => {
    items.setEach('author', 'F. Scott Fitzgerald');
  };

  this.assertAfterInfinityWorks(assert);
});

test('it resolves a promise returned from afterInfinityModel', function (assert) {
  this.route.afterInfinityModel = (items) => {
    return new Ember.RSVP.Promise(function (resolve) {
      resolve(items.setEach('author', 'F. Scott Fitzgerald'));
    });
  };

  this.assertAfterInfinityWorks(assert);
});


/*
 * Compatibility Tests
 */
module('RouteMixin Compatibility', {
  beforeEach: function () {
    var store = {
      _dummyFetch() {
        return Ember.RSVP.resolve(EA([]));
      },
      query() {
        return this._dummyFetch();
      },
      find() {
        return this._dummyFetch();
      }
    };

    this.route = createRoute(['item'], { store });
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
