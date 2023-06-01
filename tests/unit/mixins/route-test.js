import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import EmberObject, { get } from '@ember/object';
import { module, test } from 'qunit';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { setupTest } from 'ember-qunit';

module('Unit | RouteMixin', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.EA = (content, meta = {}) => {
      return ArrayProxy.create({ content: A(content), ...meta });
    };

    // create mock store first
    this.createMockStore = (resolution, assertion) => {
      return {
        query() {
          if (assertion) {
            assertion.apply(this, arguments);
          }

          return RSVP.resolve(resolution);
        },
      };
    };

    // then create the route with the infinity service patched store
    this.createRoute = (infinityModelArgs = [null], store = null) => {
      if (store) {
        infinityModelArgs[1] = { ...infinityModelArgs[1], ...store };
      }
      store = store || { store: this.createMockStore() };
      const infinity = this.owner.factoryFor('service:infinity').create(store);
      this.infinity = infinity;

      const RouteClass = class extends Route {
        infinity = infinity;
        model() {
          return this.infinity.model(...infinityModelArgs);
        }
      };

      return RouteClass.create();
    };

    this.callModelHook = (route) => {
      let model;
      run(() => {
        route.model().then((result) => {
          model = result;
        });
      });

      route.set('controller', EmberObject.create({ model }));

      return model;
    };
  });

  module('basics', function () {
    test('it works', function (assert) {
      const RouteObject = class extends Route {};
      const route = RouteObject.create();
      assert.ok(route);
    });

    test('it can not use infinityModel that is not an instance of InfinityModel', function (assert) {
      assert.expect(1);

      const ExtendedEmberObject = class extends EmberObject {
        customId = 2;
        buildParams() {
          const params = super.buildParams(...arguments);
          params['custom_id'] = this.customId;
          return params;
        }
      };

      let item = { id: 1, title: 'The Great Gatsby' };
      let route = this.createRoute([
        'post',
        { store: this.createMockStore(this.EA([item])) },
        ExtendedEmberObject,
      ]);

      try {
        route.model();
      } catch (e) {
        assert.equal(
          e.message,
          'Ember Infinity: You must pass an Infinity Model instance as the third argument',
          'wat'
        );
      }
    });

    test('it can use infinityModel with a custom data store', function (assert) {
      let item = this.EA([{ id: 1, title: 'The Great Gatsby' }]);
      let mockStore = {
        query() {
          return RSVP.resolve(item);
        },
      };
      let route = this.createRoute(['post'], {
        store: mockStore,
      });

      try {
        route.model();
        assert.ok(route.get('infinity.store').query, 'custom store works');
      } catch (e) {
        assert.ok(false, 'something failed');
      }
    });

    test('custom data store can specify custom query method', function (assert) {
      let EA = this.EA;
      let mockStore = {
        findAll() {
          let item = { id: 1, title: 'The Great Gatsby' };
          return RSVP.resolve(EA([item]));
        },
      };
      let route = this.createRoute(['post'], {
        store: mockStore,
        storeFindMethod: 'findAll',
      });

      try {
        route.model();
        assert.ok(true, 'custom store with specified query method works');
      } catch (e) {
        assert.ok(false, 'something failed');
      }
    });

    test('custom data store must specify custom query method', function (assert) {
      let simpleStore = {
        findAll() {
          return RSVP.resolve();
        },
      };
      let route = this.createRoute(['post'], { store: simpleStore });

      try {
        route.model();
      } catch (e) {
        assert.equal(e.message, 'Ember Infinity: Custom data store must specify query method');
      }
    });

    test('it can not use infinityModel without passing a string for custom data store', function (assert) {
      let route = this.createRoute(['post'], { store: 234 });

      try {
        route.model();
      } catch (e) {
        assert.equal(e.message, 'Ember Infinity: Custom data store must specify query method');
      }
    });

    test('it can not use infinityModel without a Model Name', function (assert) {
      let route = this.createRoute();

      try {
        route.model();
      } catch (e) {
        assert.equal(e.message, 'Ember Infinity: You must pass a Model Name to infinityModel');
      }
    });

    test('it sets state before it reaches the end', function (assert) {
      let store = this.createMockStore(
        this.EA([{ id: 1, name: 'Test' }], { meta: { total_pages: 31 } })
      );
      let route = this.createRoute(['item'], { store });

      let model = this.callModelHook(route);

      assert.equal(model.get('_totalPages'), 31, '_totalPages');
      assert.equal(model.get('currentPage'), 1, 'currentPage');
      assert.equal(model.get('canLoadMore'), true, 'canLoadMore');
      assert.notOk(route.get('_extraParams'), 'extra params are empty');
      assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
    });

    test('it sets count state before it reaches the end', function (assert) {
      let store = this.createMockStore(this.EA([{ id: 1, name: 'Test' }], { meta: { count: 31 } }));
      let route = this.createRoute(['item'], { store });

      let model = this.callModelHook(route);

      assert.equal(model.get('_count'), 31, '_count');
      assert.equal(model.get('currentPage'), 1, 'currentPage');
      assert.equal(model.get('canLoadMore'), true, 'canLoadMore');
      assert.notOk(route.get('_extraParams'), 'extra params are empty');
      assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
    });

    test('it allows customizations of request params', function (assert) {
      let store = this.createMockStore(this.EA([]), (modelType, findQuery) => {
        assert.deepEqual(findQuery, { per: 25, p: 1 }, 'findQuery');
      });

      let route = this.createRoute(
        [
          'item',
          {
            perPageParam: 'per',
            pageParam: 'p',
          },
        ],
        { store }
      );

      this.callModelHook(route);
    });

    test('It allows to set startingPage as 0', function (assert) {
      let store = this.createMockStore(this.EA([{ id: 1, name: 'Test' }], { total_pages: 1 }));
      let route = this.createRoute(
        [
          'item',
          {
            startingPage: 0,
          },
        ],
        { store }
      );

      let model = this.callModelHook(route);

      assert.equal(model.get('currentPage'), 0);
      assert.equal(model.get('canLoadMore'), false);
    });

    test('it skips request params when set to null', function (assert) {
      let store = this.createMockStore(this.EA([]), (modelType, findQuery) => {
        assert.deepEqual(findQuery, {}, 'findQuery');
      });

      let route = this.createRoute(
        [
          'item',
          {
            perPageParam: null,
            pageParam: null,
          },
        ],
        { store }
      );

      this.callModelHook(route);
    });

    test('it allows customizations of meta parsing params', function (assert) {
      let store = this.createMockStore(
        this.EA([{ id: 1, name: 'Walter White' }], {
          pagination: { total: 22 },
        })
      );

      let route = this.createRoute(
        [
          'item',
          {
            totalPagesParam: 'pagination.total',
          },
        ],
        { store }
      );

      let model = this.callModelHook(route);

      assert.equal(model.get('totalPagesParam'), 'pagination.total', 'totalPagesParam');
      assert.equal(model.get('_totalPages'), 22, '_totalPages');
    });

    test('it allows customizations of meta count params', function (assert) {
      let store = this.createMockStore(
        this.EA([{ id: 1, name: 'Walter White' }], {
          pagination: { records: 22 },
        })
      );

      let route = this.createRoute(['item', { countParam: 'pagination.records' }], { store });

      let model = this.callModelHook(route);

      assert.equal(model.get('countParam'), 'pagination.records', 'countParam');
      assert.equal(model.get('_count'), 22, '_count');
    });

    test('it copies arbitrary model hook meta from route request to the infinityModel', function (assert) {
      let store = this.createMockStore(
        this.EA([{ id: 1, name: 'Walter White' }], {
          meta: { meaningOfLife: 42 },
        })
      );

      let route = this.createRoute(['item', {}], { store });

      let model = this.callModelHook(route);

      assert.equal(model.get('meta.meaningOfLife'), 42, 'meta');
    });
  });

  module('RouteMixin - reaching the end', function (hooks) {
    hooks.beforeEach(function () {
      this.createRouteWithStore = (extras, boundParamsOrInfinityModel) => {
        let store = this.createMockStore(
          this.EA([{ id: 1, name: 'Test' }], { meta: { total_pages: 2 } })
        );
        this.route = this.createRoute(['item', extras, boundParamsOrInfinityModel], { store });

        this.callModelHookWithStore();
      };

      this.callModelHookWithStore = () => {
        this.model = this.callModelHook(this.route);
      };

      this.loadMore = () => {
        run(() => {
          this.route.infinity.infinityLoad(this.model);
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

    test('route accepts an instance of InfinityModel as the third argument', function (assert) {
      assert.expect(3);

      let ExtendedInfinityModel = InfinityModel.extend({
        customId: 2,
        buildParams() {
          let params = this._super(...arguments);
          params['custom_id'] = get(this, 'customId');
          return params;
        },
      });
      this.createRouteWithStore({ extra: 'param' }, ExtendedInfinityModel);

      assert.equal(
        this.model instanceof InfinityModel,
        true,
        'model is instance of extended infinity model'
      );

      this.loadMore();

      assert.equal(
        this.model instanceof InfinityModel,
        true,
        'model is instance of extended infinity model'
      );
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
        },
      });
      // imagine 'custom' being some type of service that holds state
      this.createRouteWithStore(
        { extra: 'param' },
        ExtendedInfinityModel.extend({ custom: { id: 2 } })
      );

      this.loadMore();
    });

    test('route does not detect boundParams when no boundParams passed', function (assert) {
      assert.expect(1);

      this.createRouteWithStore({ extra: 'param' });

      assert.equal(
        this.model.get('_deprecatedBoundParams'),
        undefined,
        'bound params is not detected'
      );
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

    test('It resets the currentPage when the model hook is called again', function (assert) {
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

  module('RouteMixin - loading more data', function (hooks) {
    hooks.beforeEach(function (assert) {
      let store = this.createMockStore(
        // return response for model hook
        this.EA(
          [
            { id: 1, name: 'Test' },
            { id: 2, name: 'Test 2' },
          ],
          { meta: { testTotalPages: 3 } }
        ),
        // for query method in model hook
        (modelType, findQuery) => {
          assert.equal(findQuery.testPerPage, 1);
          assert.equal(findQuery.testPage, this.expectedPageNumber);
        }
      );

      this.route = this.createRoute(
        [
          'item',
          {
            // explicit params passed to infinityModel hook
            perPage: 1,
            startingPage: 2,
            totalPagesParam: 'meta.testTotalPages',
            perPageParam: 'testPerPage',
            pageParam: 'testPage',
          },
        ],
        { store: store }
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
        this.route.infinity.infinityLoad(infinityModel);
      });

      assert.equal(this.model.get('canLoadMore'), false, 'canLoadMore');
      assert.equal(this.model.get('currentPage'), 3, 'currentPage');
      assert.ok(this.model.get('reachedInfinity'), 'Should reach infinity');
    });
  });
});
