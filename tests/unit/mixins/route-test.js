import Ember from 'ember';
const { Route, RSVP, run } = Ember;
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

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

// let EA = function (content, meta) {
//   // can use meta={} and ...meta when get eslint in to avoid 
//   let key = null;
//   let val = null;
//   for (let x in meta) {
//     key = x;
//     val = meta[x];
//   }
//   return Ember.ArrayProxy.create({ content: Ember.A(content), [key]: val });
// };

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

module('RouteMixin - bound params', {
  beforeEach(assert) {
    let store = createMockStore(EA([{id: 1, name: 'Test'}, {id: 2, name: 'New Test'}], { meta: { total_pages: 3 } }),
      (modelType, findQuery) => {
        assert.equal(
          this.route.get('test'),
          findQuery.category,
          'dynamic param is equal to the value of the computed property'
        );
    });

    this.route = createRoute(
      ['item', {perPage: 1, startingPage: 1}, {category: 'feature'}],
      {
        feature: Ember.computed.alias('test'),
        test: 'new',
        store
      }
    );

    this.model = callModelHook(this.route);

    this.loadMore = () => {
      run(() => {
        this.route._infinityLoad(this.model);
      });
    };
  }
});

test('it uses bound params when loading more data', function (assert) {
  assert.expect(2);

  assert.equal(this.model.get('_canLoadMore'), true, '_canLoadMore');
});

test('it uses bound params when loading even more data', function (assert) {
  this.loadMore();

  assert.equal(this.model.get('_canLoadMore'), true, 'can load even more data');
});

test('it uses bound params when reaching the end', function (assert) {
  this.loadMore();
  this.loadMore();

  assert.equal(this.model.get('_canLoadMore'), false, '_canLoadMore');
  assert.equal(this.route.get('currentPage'), 3, 'currentPage');
  assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
});

// module('RouteMixin.updateInfinityModel', {
//   beforeEach(assert) {
//     let items = [
//       { id: 1, title: 'The Great Gatsby' },
//       { id: 2, title: 'The Last Tycoon' }
//     ];
//     let store = createMockStore( EA([items[1]], { total_pages: 2 }) );

//     // let store = {
//     //   query(modelType, findQuery) {
//     //     let item = items[findQuery.page-1];
//     //     return RSVP.resolve(
//     //       EA([item], {total_pages: 2})
//     //     );
//     //   }
//     // };

//     this.route = createRoute(['item', { perPage: 1, totalPagesParam: 'total_pages' }], {
//         store,
//         updateInfinityModel(newObjects) {
//           debugger;
//           return this._super(newObjects.setEach('author', 'F. Scott Fitzgerald'));
//         }
//       }
//     );

//     this.model = callModelHook(this.route);

//     this.testPage = ({canLoadMore, contentLength}) => {
//       assert.equal(this.model.get('_canLoadMore'), canLoadMore, '_canLoadMore');
//       assert.equal(this.model.get('content.length'), contentLength, 'content.length');
//     };

//     this.loadMore = () => {
//       run(() => {
//         this.route._infinityLoad(this.model);
//       });
//     };

//     this.getLastAuthor = () => {
//       return this.model.get('content.lastObject.author');
//     };
//   }
// });

// test('does not invoke updateInfinityModel on the first page', function (assert) {
//   this.testPage({canLoadMore: true, contentLength: 1});

//   assert.notEqual(
//     this.getLastAuthor(),
//     'F. Scott Fitzgerald',
//     'overrides to updateInfinityModel should not take effect'
//   );
// });

// test('scott it invokes updateInfinityModel after the first page', function (assert) {
//   this.loadMore();

//   this.testPage({canLoadMore: false, contentLength: 2});
//   assert.equal(
//     this.getLastAuthor(),
//     'F. Scott Fitzgerald',
//     'overrides to updateInfinityModel should take effect'
//   );
// });

// test('it allows manual invocations of updateInfinityModel', function (assert) {
//   assert.expect(3);

//   this.loadMore();

//   run(() => {
//     this.route.updateInfinityModel(EA([
//       { id: 3, title: 'Tender Is the Night' }
//     ]));
//   });

//   this.testPage({canLoadMore: false, contentLength: 3});
//   assert.equal(
//     this.model.get('content.lastObject.title'),
//     'Tender Is the Night',
//     'updateInfinityModel can be invoked manually'
//   );
// });

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
