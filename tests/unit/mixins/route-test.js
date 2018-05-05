import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import { assign } from '@ember/polyfills';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import EmberObject, { get } from '@ember/object';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test, skip } from 'qunit';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { setupTest } from 'ember-qunit';

module('RouteMixin', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.EA = (content, meta={}) => {
      return ArrayProxy.create(assign({ content: A(content) }, meta));
    };

    let infinity = this.owner.lookup('service:infinity');
    this.createRoute = (infinityModelArgs, routeProperties={}) => {
      let RouteObject = Route.extend(RouteMixin, assign(routeProperties, {
        infinity,
        model() {
          return this.infinityModel(...infinityModelArgs);
        }
      }));

      return RouteObject.create();
    }

    this.createMockStore = (resolution, assertion) => {
      return {
        query() {
          if (assertion) {
            assertion.apply(this, arguments);
          }

          return RSVP.resolve(resolution);
        }
      };
    }

    this.callModelHook = (route) => {
      let model;
      run(() => {
        route.model().then(result => {
          model = result;
        });
      });

      route.set('controller', EmberObject.create({ model }));

      return model;
    }
  });

  module('basics', function() {
    test('it works', function(assert) {
      let RouteObject = Route.extend(RouteMixin);
      let route = RouteObject.create();
      assert.ok(route);
    });

    test('it can not use infinityModel without Ember Data Store', function(assert) {
      let route = this.createRoute(['post'], { store: null });

      try {
        route.model();
      } catch(e) {
        assert.equal(e.message, 'Ember Infinity: Store is not available to infinityModel');
      }
    });

    test('it can not use infinityModel that is not an instance of InfinityModel', function (assert) {
      assert.expect(1);

      const ExtendedEmberObject = EmberObject.extend({
        customId: 2,
        buildParams() {
          let params = this._super(...arguments);
          params['custom_id'] = get(this, 'customId');
          return params;
        }
      });

      let item = { id: 1, title: 'The Great Gatsby' };
      let route = this.createRoute(['post', { store: 'simpleStore' }, ExtendedEmberObject],
        { extra: 'param', simpleStore: this.createMockStore(this.EA([item])) });

      try {
        route.model();
      } catch(e) {
        assert.equal(e.message, 'Ember Infinity: You must pass an Infinity Model instance as the third argument', "wat");
      }
    });

    // not sure how to test deps
    skip('it throws deprecate warning for passing bound params', function(assert) {
      let route = this.createRoute(['post', { store: 23 }, { country: 'Ukraine' } ]);

      try {
        route.model();
      } catch(e) {
        assert.equal(e.message, 'Ember Infinity: Bound params are now deprecated. Please pass explicitly as second param to the infinityModel method');
      }
    });

    test('it can use infinityModel with a custom data store', function(assert) {
      let item = { id: 1, title: 'The Great Gatsby' };
      let route = this.createRoute(['post', { store: 'simpleStore' }], {
        simpleStore: this.createMockStore(this.EA([item]))
      });

      try {
        route.model();
        assert.ok(route.get('infinity.store').query, 'custom store works');
      } catch(e) {
        assert.ok(false, 'something failed');
      }
    });

    test('custom data store can specify custom query method', function(assert) {
      let EA = this.EA;
      let route = this.createRoute(['post', { store: 'simpleStore', storeFindMethod: 'findAll' }], {
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
      let route = this.createRoute(['post', { store: 'simpleStore' }], {
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
      let route = this.createRoute(['post', { store: 23 }]);

      try {
        route.model();
      } catch(e) {
        assert.equal(e.message, 'Ember Infinity: Must pass custom data store as a string');
      }
    });

    test('it can not use infinityModel without the Store Property having the appropriate finder method', function(assert) {
      let route = this.createRoute(['post'], {
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
      let route = this.createRoute([], {
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
      let route = this.createRoute(['item'], {
        store: this.createMockStore(this.EA([{id: 1, name: 'Test'}], { meta: { total_pages: 31 } } ))
      });

      let model = this.callModelHook(route);

      assert.equal(model.get('_totalPages'), 31, '_totalPages');
      assert.equal(model.get('currentPage'), 1, 'currentPage');
      assert.equal(model.get('canLoadMore'), true, 'canLoadMore');
      assert.notOk(route.get('_extraParams'), 'extra params are empty');
      assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
    });

    test('it allows customizations of request params', function(assert) {
      let store = this.createMockStore(
        this.EA([]),
        (modelType, findQuery) => {
          assert.deepEqual(findQuery, { per: 25, p: 1 }, 'findQuery');
        }
      );

      let route = this.createRoute(['item', {
        perPageParam: 'per', pageParam: 'p'
      }], { store });

      this.callModelHook(route);
    });

    test('It allows to set startingPage as 0', function(assert) {
      let store = this.createMockStore( this.EA([{id: 1, name: 'Test'}], { total_pages: 1 }) );
      let route = this.createRoute(['item', {
        startingPage: 0
      }], { store });

      let model = this.callModelHook(route);

      assert.equal(route.get('currentPage'), 0);
      assert.equal(model.get('canLoadMore'), false);
    });

    test('it skips request params when set to null', function(assert) {
      let store = this.createMockStore(
        this.EA([]),
        (modelType, findQuery) => {
          assert.deepEqual(findQuery, {}, 'findQuery');
      });

      let route = this.createRoute(['item', {
        perPageParam: null, pageParam: null
      }], { store });

      this.callModelHook(route);
    });

    test('it allows customizations of meta parsing params', function(assert) {
      let store = this.createMockStore(
        this.EA([{id: 1, name: 'Walter White'}], { pagination: { total: 22 } })
      );

      let route = this.createRoute(['item', {
        totalPagesParam: 'pagination.total',
      }], { store });

      let model = this.callModelHook(route);

      assert.equal(model.get('totalPagesParam'), 'pagination.total', 'totalPagesParam');
      assert.equal(model.get('_totalPages'), 22, '_totalPages');
    });

    test('it copies arbitrary model hook meta from route request to the infinityModel', function(assert) {
      let store = this.createMockStore(
        this.EA([{id: 1, name: 'Walter White'}], { meta: { meaningOfLife: 42 }})
      );

      let route = this.createRoute(['item', {}],  { store });

      let model = this.callModelHook(route);

      assert.equal(model.get('meta.meaningOfLife'), 42, 'meta');
    });
  });

  module('RouteMixin - reaching the end', function(hooks) {
    hooks.beforeEach(function() {
      this.store = this.createMockStore(this.EA([{id: 1, name: 'Test'}], { meta: { total_pages: 2 } }));

      this.createRouteWithStore = (extras, boundParamsOrInfinityModel) => {
        this.route = this.createRoute(['item', extras, boundParamsOrInfinityModel],
          { store: this.store }
        );

        this.callModelHookWithStore();
      };

      this.callModelHookWithStore = () => {
        this.model = this.callModelHook(this.route);
      };

      this.loadMore = () => {
        run(() => {
          this.route.infinityLoad(this.model);
        });
      };
    });

    test('it sets state when it reaches the end', function (assert) {
      assert.expect(4);

      this.createRouteWithStore({ startingPage: 2 });

      assert.equal(this.model.get('_totalPages'), 2, '_totalPages');
      assert.equal(this.model.get('currentPage'), 2, 'currentPage');
      assert.equal(this.model.get('canLoadMore'), false, 'canLoadMore');
      assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
    });

    test('it uses extra params when loading more data', function (assert) {
      assert.expect(4);

      this.createRouteWithStore({ extra: 'param' });

      // assert.equal(this.model.get('_extraParams.extra'), 'param', '_extraParams.extra');
      assert.equal(this.model.get('canLoadMore'), true, 'canLoadMore');

      this.loadMore();

      // assert.equal(this.model.get('_extraParams.extra'), 'param', '_extraParams.extra');
      assert.equal(this.model.get('canLoadMore'), false, 'canLoadMore');
      assert.equal(this.model.get('currentPage'), 2, 'currentPage');
      assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
    });

    test('route accepts bound params and sets on infinity model to be passed on subsequent requests', function (assert) {
      assert.expect(3);

      const boundParam = { category: 'myCategory' };
      this.createRouteWithStore({ extra: 'param' }, boundParam);

      assert.deepEqual(this.model.get('_deprecatedBoundParams'), boundParam, '_deprecatedBoundParams');

      this.loadMore();

      assert.deepEqual(this.model.get('_deprecatedBoundParams'), boundParam, '_deprecatedBoundParams');
      assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
    });

    test('route accepts an instance of InfinityModel as the third argument', function (assert) {
      assert.expect(3);

      let ExtendedInfinityModel = InfinityModel.extend({
        customId: 2,
        buildParams() {
          let params = this._super(...arguments);
          params['custom_id'] = get(this, 'customId');
          return params;
        }
      });
      this.createRouteWithStore({ extra: 'param' }, ExtendedInfinityModel);

      assert.equal(this.model instanceof InfinityModel, true, 'model is instance of extended infinity model');

      this.loadMore();

      assert.equal(this.model instanceof InfinityModel, true, 'model is instance of extended infinity model');
      assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
    });

    test('route accepts an instance of InfinityModel as the third argument with passed in param', function (assert) {
      assert.expect(2);

      let ExtendedInfinityModel = InfinityModel.extend({
        buildParams() {
          let params = this._super(...arguments);
          params['custom_id'] = get(this, 'custom.id');
          assert.equal(params['custom_id'], 2);
          return params;
        }
      });
      // imagine 'custom' being some type of service that holds state
      this.createRouteWithStore({ extra: 'param' }, ExtendedInfinityModel.extend({ custom: { id : 2 } }));

      this.loadMore();
    });

    test('route does not detect boundParams when no boundParams passed', function (assert) {
      assert.expect(1);

      this.createRouteWithStore({ extra: 'param' });

      assert.equal(this.model.get('_deprecatedBoundParams'), undefined, 'bound params is not detected');
    });

    test("It doesn't request more pages once canLoadMore is false", function (assert) {
      assert.expect(6);

      this.createRouteWithStore();

      assert.ok(this.model.get('canLoadMore'), 'can load more');
      assert.equal(this.model.get('currentPage'), 1, 'currentPage');

      this.loadMore();

      assert.notOk(this.model.get('canLoadMore'), 'can load more');
      assert.equal(this.model.get('currentPage'), 2, 'currentPage');

      this.loadMore();

      assert.notOk(this.model.get('canLoadMore'), 'can load more');
      assert.equal(this.model.get('currentPage'), 2, 'currentPage');
    });

    test("It resets the currentPage when the model hook is called again", function (assert) {
      assert.expect(5);

      this.createRouteWithStore();

      assert.ok(this.model.get('canLoadMore'), 'can load more');
      assert.equal(this.model.get('currentPage'), 1, 'currentPage');

      this.callModelHookWithStore();
      assert.equal(this.model.get('currentPage'), 1, 'currentPage');

      this.loadMore();

      assert.equal(this.model.get('currentPage'), 2, 'currentPage');

      this.callModelHookWithStore();

      assert.equal(this.model.get('currentPage'), 1, 'currentPage');
    });
  });

  module('RouteMixin - loading more data', function(hooks) {
    hooks.beforeEach(function(assert) {
      let store = this.createMockStore(
        // return response for model hook
        this.EA([{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}], { meta: { testTotalPages: 3 } }),
        // for query method in model hook
        (modelType, findQuery) => {
          assert.equal(findQuery.testPerPage, 1);
          assert.equal(findQuery.testPage, this.expectedPageNumber);
        }
      );

      this.route = this.createRoute(
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

      this.model = this.callModelHook(this.route);
    });

    test('it uses overridden params when loading more data', function (assert) {
      assert.expect(4);

      this.expectedPageNumber = 2;

      assert.equal(this.model.get('canLoadMore'), true, 'canLoadMore');
      assert.equal(this.model.get('currentPage'), 2, 'currentPage');
    });

    test('it uses overridden params when reaching the end', function (assert) {
      assert.expect(7);

      this.expectedPageNumber = 3;

      const infinityModel = this.route.get('infinity.infinityModels').objectAt(0);
      run(() => {
        this.route.infinityLoad(infinityModel);
      });

      assert.equal(this.model.get('canLoadMore'), false, 'canLoadMore');
      assert.equal(this.model.get('currentPage'), 3, 'currentPage');
      assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
    });
  });

  module('RouteMixin.afterInfinityModel', function(hooks) {
    hooks.beforeEach(function() {
      let item = { id: 1, title: 'The Great Gatsby' };
      this.route = this.createRoute(['item'], {
        store: this.createMockStore(this.EA([item]))
      });

      this.assertAfterInfinityWorks = function (assert) {
        let model = this.callModelHook(this.route);

        assert.equal(
          model.get('content.firstObject.author'),
          'F. Scott Fitzgerald',
          'updates made in afterInfinityModel should take effect'
        );
      };
    });

    test('it calls the afterInfinityModel method on objects fetched from the store', function (assert) {
      this.route.infinity.afterInfinityModel = (items) => {
        return items.setEach('author', 'F. Scott Fitzgerald');
      };

      this.assertAfterInfinityWorks(assert);
    });

    test('it does not require a return value to work', function (assert) {
      this.route.infinity.afterInfinityModel = (items) => {
        items.setEach('author', 'F. Scott Fitzgerald');
      };

      this.assertAfterInfinityWorks(assert);
    });

    test('it resolves a promise returned from afterInfinityModel', function (assert) {
      this.route.infinity.afterInfinityModel = (items) => {
        return new RSVP.Promise(function (resolve) {
          resolve(items.setEach('author', 'F. Scott Fitzgerald'));
        });
      };

      this.assertAfterInfinityWorks(assert);
    });
  });
});

