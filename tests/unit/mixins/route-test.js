import Ember from 'ember';
const { Route, RSVP, run, get } = Ember;
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test, skip } from 'qunit';
import InfinityModel from 'ember-infinity/lib/infinity-model';

module('RouteMixin');

const assign = Ember.assign || Ember.merge;

let EA = function (content, meta={}) {
  meta = meta; // get around jshint warnings until eslint
  return Ember.ArrayProxy.create({ 
    content: Ember.A(content), 
    // jshint ignore:start
    ...meta
    // jshint ignore:end
  }); 
};

test('it works', function(assert) {
  let RouteObject = Route.extend(RouteMixin);
  let route = RouteObject.create();
  assert.ok(route);
});

function createRoute(infinityModelArgs, routeProperties={}) {
  let RouteObject = Route.extend(RouteMixin, assign(routeProperties, {
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

      return RSVP.resolve(resolution);
    }
  };
}

function callModelHook(route) {
  let model;
  run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  route.set('controller', Ember.Object.create({ model }));

  return model;
}

test('it can not use infinityModel without Ember Data Store', function(assert) {
  let route = createRoute(['post'], {store: null});

  try {
    route.model();
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: Store is not available to infinityModel');
  }
});

// not sure how to test deps
skip('it throws deprecate warning for passing bound params', function(assert) {
  let route = createRoute(['post', { store: 23 }, { country: 'Ukraine' } ]);

  try {
    route.model();
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: Bound params are now deprecated. Please pass explicitly as second param to the infinityModel method');
  }
});

test('it can use infinityModel with a custom data store', function(assert) {
  let item = { id: 1, title: 'The Great Gatsby' };
  let route = createRoute(['post', { store: 'simpleStore' }], {
    simpleStore: createMockStore(EA([item]))
  });

  try {
    route.model();
    assert.ok(route.get(route._store).query, 'custom store works');
  } catch(e) {
    assert.ok(false, 'something failed');
  }
});

test('custom data store can specify custom query method', function(assert) {
  let route = createRoute(['post', { store: 'simpleStore', storeFindMethod: 'findAll' }], {
    simpleStore: {
      findAll() {
        let item = { id: 1, title: 'The Great Gatsby' };
        return RSVP.resolve(EA([item]));
      }
    }
  });

  try {
    route.model();
    assert.ok(true, 'custom store with specified query method works');
  } catch(e) {
    assert.ok(false, 'something failed');
  }
});

test('custom data store must specify custom query method', function(assert) {
  let route = createRoute(['post', { store: 'simpleStore' }], {
    simpleStore: {
      findAll() {
        return RSVP.resolve();
      }
    }
  });

  try {
    route.model();
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: Custom data store must specify query method');
  }
});

test('it can not use infinityModel without passing a string for custom data store', function(assert) {
  let route = createRoute(['post', { store: 23 }]);

  try {
    route.model();
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: Must pass custom data store as a string');
  }
});

test('it can not use infinityModel without the Store Property having the appropriate finder method', function(assert) {
  let route = createRoute(['post'], {
    store: {
      notQuery() {
        return null;
      }
    }
  });

  try {
    route.model();
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: Store is not available to infinityModel');
  }
});

test('it can not use infinityModel without a Model Name', function(assert) {
  let route = createRoute([], {
    store: {
      query() {}
    }
  });
 
  try {
    route.model();
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: You must pass a Model Name to infinityModel');
  }
});

test('it sets state before it reaches the end', function(assert) {
  let route = createRoute(['item'], {
    store: createMockStore(EA([{id: 1, name: 'Test'}], { meta: { total_pages: 31 } } ))
  });

  let model = callModelHook(route);

  assert.equal(model.get('_totalPages'), 31, '_totalPages');
  assert.equal(model.get('currentPage'), 1, 'currentPage');
  assert.equal(model.get('_canLoadMore'), true, '_canLoadMore');
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')), 'extra params are empty');
  assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
});

test('it allows customizations of request params', function(assert) {
  let store = createMockStore(
    EA([]), 
    (modelType, findQuery) => {
      assert.deepEqual(findQuery, { per: 25, p: 1 }, 'findQuery');
    }
  );

  let route = createRoute(['item', { 
    perPageParam: 'per', pageParam: 'p'
  }], { store });

  callModelHook(route);
});

test('It allows to set startingPage as 0', function(assert) {
  let store = createMockStore( EA([{id: 1, name: 'Test'}], { total_pages: 1 }) );
  let route = createRoute(['item', {
    startingPage: 0
  }], { store });

  let model = callModelHook(route);

  assert.equal(route.get('currentPage'), 0);
  assert.equal(model.get('_canLoadMore'), false);
});

test('it skips request params when set to null', function(assert) {
  let store = createMockStore(
    EA([]), 
    (modelType, findQuery) => {
      assert.deepEqual(findQuery, {}, 'findQuery');
  });

  let route = createRoute(['item', { 
    perPageParam: null, pageParam: null
  }], { store });

  callModelHook(route);
});

test('it allows customizations of meta parsing params', function(assert) {
  let store = createMockStore(
    EA([{id: 1, name: 'Walter White'}], { pagination: { total: 22 } })
  );

  let route = createRoute(['item', {
    totalPagesParam: 'pagination.total',
  }], { store });

  let model = callModelHook(route);

  assert.equal(model.get('totalPagesParam'), 'pagination.total', 'totalPagesParam');
  assert.equal(model.get('_totalPages'), 22, '_totalPages');
});

module('RouteMixin - reaching the end', {
  beforeEach() {
    this.store = createMockStore(EA([{id: 1, name: 'Test'}], { meta: { total_pages: 2 } }));

    this.createRoute = (extras, boundParams) => {
      this.route = createRoute(['item', extras, boundParams],
        { store: this.store }
      );

      this.callModelHook();
    };

    this.callModelHook = () => {
      this.model = callModelHook(this.route);
    };

    this.loadMore = () => {
      run(() => {
        this.route._infinityLoad(this.model);
      });
    };
  }
});

test('it sets state when it reaches the end', function (assert) {
  assert.expect(4);

  this.createRoute({ startingPage: 2 });

  assert.equal(this.model.get('_totalPages'), 2, '_totalPages');
  assert.equal(this.model.get('currentPage'), 2, 'currentPage');
  assert.equal(this.model.get('_canLoadMore'), false, '_canLoadMore');
  // assert.ok(Ember.$.isEmptyObject(this.route.get('_extraParams')), '_extraParams');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses extra params when loading more data', function (assert) {
  assert.expect(4);

  this.createRoute({ extra: 'param' });

  // assert.equal(this.model.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(this.model.get('_canLoadMore'), true, '_canLoadMore');

  this.loadMore();

  // assert.equal(this.model.get('_extraParams.extra'), 'param', '_extraParams.extra');
  assert.equal(this.model.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(this.model.get('currentPage'), 2, 'currentPage');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

test('route accepts bound params and sets on infinity model to be passed on subsequent requests', function (assert) {
  assert.expect(3);

  const boundParam = { category: 'myCategory' };
  this.createRoute({ extra: 'param' }, boundParam);

  assert.deepEqual(this.model.get('_deprecatedBoundParams'), boundParam, '_deprecatedBoundParams');

  this.loadMore();

  assert.deepEqual(this.model.get('_deprecatedBoundParams'), boundParam, '_deprecatedBoundParams');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

test('route accepts an instance of InfinityModel as the third argument', function (assert) {
  assert.expect(3);

  const ExtendedInfinityModel = InfinityModel.extend({
    customId: 2,
    buildParams() {
      let params = this._super(...arguments);
      params['custom_id'] = get(this, 'customId');
      return params;
    }
  });
  this.createRoute({ extra: 'param' }, ExtendedInfinityModel);

  assert.equal(this.model instanceof ExtendedInfinityModel, true, 'model is instance of extended infinity model');

  this.loadMore();

  assert.equal(this.model instanceof ExtendedInfinityModel, true, 'model is instance of extended infinity model');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

test('route does not accept class that is not an instance of InfinityModel', function (assert) {
  assert.expect(1);

  const ExtendedEmberObject = Ember.Object.extend({
    customId: 2,
    buildParams() {
      let params = this._super(...arguments);
      params['custom_id'] = get(this, 'customId');
      return params;
    }
  });

  try {
    this.createRoute({ extra: 'param' }, ExtendedEmberObject);
  } catch(e) {
    assert.equal(e.message, 'Ember Infinity: You must pass an Infinity Model instance as the third argument');
  }
});

test('route does not detect boundParams when no boundParams passed', function (assert) {
  assert.expect(1);

  this.createRoute({ extra: 'param' });

  assert.equal(this.model.get('_deprecatedBoundParams'), undefined, 'bound params is not detected');
});

test("It doesn't request more pages once _canLoadMore is false", function (assert) {
  assert.expect(6);

  this.createRoute();

  assert.ok(this.model.get('_canLoadMore'), 'can load more');
  assert.equal(this.model.get('currentPage'), 1, 'currentPage');

  this.loadMore();

  assert.notOk(this.model.get('_canLoadMore'), 'can load more');
  assert.equal(this.model.get('currentPage'), 2, 'currentPage');

  this.loadMore();

  assert.notOk(this.model.get('_canLoadMore'), 'can load more');
  assert.equal(this.model.get('currentPage'), 2, 'currentPage');
});

test("It resets the currentPage when the model hook is called again", function (assert) {
  assert.expect(5);

  this.createRoute();

  assert.ok(this.model.get('_canLoadMore'), 'can load more');
  assert.equal(this.model.get('currentPage'), 1, 'currentPage');

  this.callModelHook();
  assert.equal(this.model.get('currentPage'), 1, 'currentPage');

  this.loadMore();

  assert.equal(this.model.get('currentPage'), 2, 'currentPage');

  this.callModelHook();

  assert.equal(this.model.get('currentPage'), 1, 'currentPage');
});

module('RouteMixin - loading more data', {
  beforeEach(assert) {
    let store = createMockStore(
      // return response for model hook
      EA([{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}], { meta: { testTotalPages: 3 } }),
      // for query method in model hook
      (modelType, findQuery) => {
        assert.equal(findQuery.testPerPage, 1);
        assert.equal(findQuery.testPage, this.expectedPageNumber);
      }
    );

    this.route = createRoute(
      ['item', {
        // explicit params passed to infinityModel hook
        perPage: 1, startingPage: 2, 
        totalPagesParam: 'meta.testTotalPages', perPageParam: 'testPerPage', pageParam: 'testPage' 
      }], 
      {
        // route properties
        store,
      }
    );

    this.expectedPageNumber = 2;

    this.model = callModelHook(this.route);
  }
});

test('it uses overridden params when loading more data', function (assert) {
  assert.expect(4);

  this.expectedPageNumber = 2;

  assert.equal(this.model.get('_canLoadMore'), true, '_canLoadMore');
  assert.equal(this.model.get('currentPage'), 2, 'currentPage');
});

test('it uses overridden params when reaching the end', function (assert) {
  assert.expect(7);

  this.expectedPageNumber = 3;

  const infinityModel = this.route._infinityModels.objectAt(0);
  run(() => {
    this.route._infinityLoad(infinityModel);
  });

  assert.equal(this.model.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(this.model.get('currentPage'), 3, 'currentPage');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

module('RouteMixin.afterInfinityModel', {
  beforeEach() {
    let item = { id: 1, title: 'The Great Gatsby' };
    this.route = createRoute(['item'], {
      store: createMockStore(EA([item]))
    });

    this.assertAfterInfinityWorks = function (assert) {
      let model = callModelHook(this.route);

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
    return new RSVP.Promise(function (resolve) {
      resolve(items.setEach('author', 'F. Scott Fitzgerald'));
    });
  };

  this.assertAfterInfinityWorks(assert);
});
