import Ember from 'ember';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import BoundParamsMixin from 'ember-infinity/mixins/bound-params';
import Mixin from '@ember/object/mixin';
import { A } from '@ember/array';
import { computed, get, set } from '@ember/object';
import { deprecate } from '@ember/application/deprecations';
import { isEmpty, typeOf } from '@ember/utils';
import { run } from '@ember/runloop';
import { objectAssign, paramsCheck } from '../utils';

/**
  The Ember Infinity Route Mixin enables an application route to load paginated
  records for the route `model` as triggered by the controller (or Infinity Loader
  component).

  @class RouteMixin
  @namespace EmberInfinity
  @module ember-infinity/mixins/route
  @extends Ember.Mixin
*/
const RouteMixin = Mixin.create({

  // these are here for backwards compat
  _infinityModel: computed('_infinityModels.[]', function() {
    return get(this, '_infinityModels.firstObject');
  }).readOnly(),
  currentPage: computed.alias('_infinityModel.currentPage').readOnly(),

  actions: {
    /**
      determine if the passed infinityModel already exists on the infinityRoute and
      return boolean to tell infinity-loader component if it should make another request
      @method infinityLoad
      @param {Object} infinityModel
      @return {Boolean}
     */
    infinityLoad(infinityModel) {
      let matchingInfinityModel = this._infinityModels.find(model => model === infinityModel);
      if (matchingInfinityModel) {
        this._infinityLoad(matchingInfinityModel);
      } else {
        return true;
      }
    }
  },
  /**
    @private
    @property _store
    @type String
    @default 'store'
  */
  _store: 'store',

  /**
    The supported findMethod name for
    the developers Ember Data version.
    Provided here for backwards compat.
    @private
    @property _storeFindMethod
    @type {String}
    @default "query"
   */
  _storeFindMethod: 'query',

  /**
    Determine if Ember data is valid
    Ensure _store is set on route with a query method
    Ensure model passed to infinity model

    @method _ensureCompatibility
  */
  _ensureCompatibility() {
    if (isEmpty(this.get(this._store)) || isEmpty(this.get(this._store)[this._storeFindMethod])){
      throw new Ember.Error("Ember Infinity: Store is not available to infinityModel");
    }
  },

  /**
    If pass in custom store, ensure passed string
    Ensure query method exists, otherwise pass method (that returns a promise) in as storeFindMethod in options

    @method _ensureCustomStoreCompatibility
    @param {Option} options
  */
  _ensureCustomStoreCompatibility(options) {
    if (typeof options.store !== 'string') {
      throw new Ember.Error("Ember Infinity: Must pass custom data store as a string");
    }

    const store = this.get(options.store);
    if (!store[this.get('_storeFindMethod')]) {
      throw new Ember.Error("Ember Infinity: Custom data store must specify query method");
    }
  },

  /**
    Use the infinityModel method in the place of `this.store.query('model')` to
    initialize the Infinity Model for your route.

    @method infinityModel
    @param {String} modelName The name of the model.
    @param {Object} options - optional - the perPage and startingPage to load from.
    @param {Object} boundParamsOrInfinityModel - optional -
      params on route to be looked up on every route request or
      instance of InfinityModel
    @return {Ember.RSVP.Promise}
  */
  infinityModel(modelName, options, boundParamsOrInfinityModel) {

    let boundParams, ExtendedInfinityModel;
    if (typeOf(boundParamsOrInfinityModel) === "class") {
      if (!(boundParamsOrInfinityModel instanceof InfinityModel)) {
        throw new Ember.Error("Ember Infinity: You must pass an Infinity Model instance as the third argument");
      }
      ExtendedInfinityModel = boundParamsOrInfinityModel;
    } else if (typeOf(boundParamsOrInfinityModel) === "object") {
      boundParams = boundParamsOrInfinityModel;
    }

    if (modelName === undefined) {
      throw new Ember.Error("Ember Infinity: You must pass a Model Name to infinityModel");
    }

    if (!this._infinityModels) {
      this._infinityModels = A();
    }

    options = options ? objectAssign({}, options) : {};

    if (options.store) {
      if (options.storeFindMethod) {
        this.set('_storeFindMethod', options.storeFindMethod);
      }

      this._ensureCustomStoreCompatibility(options);

      this.set('_store', options.store);

      delete options.store;
      delete options.storeFindMethod;
    }

    const currentPage = options.startingPage === undefined ? 0 : options.startingPage-1;
    const perPage = options.perPage || 25;

    // check if user passed in param w/ infinityModel, else check if defined on the route (for backwards compat), else default
    const perPageParam = paramsCheck(options.perPageParam, get(this, 'perPageParam'), 'per_page');
    const pageParam = paramsCheck(options.pageParam, get(this, 'pageParam'), 'page');
    const totalPagesParam = paramsCheck(options.totalPagesParam, get(this, 'totalPagesParam'), 'meta.total_pages');

    delete options.startingPage;
    delete options.perPage;
    delete options.perPageParam;
    delete options.pageParam;
    delete options.totalPagesParam;

    let InfinityModelFactory;
    let didPassBoundParams = !isEmpty(boundParams);
    if (didPassBoundParams) {
      // if pass boundParamsOrInfinityModel, send to backwards compatible mixin that sets bound params on route
      // and subsequently looked up when user wants to load next page
      InfinityModelFactory = InfinityModel.extend(BoundParamsMixin);
    } else if (ExtendedInfinityModel) {
      // if custom InfinityModel, then use as base for creating an instance
      InfinityModelFactory = ExtendedInfinityModel;
    } else {
      InfinityModelFactory = InfinityModel;
    }

    let initParams = {
      currentPage,
      perPage,
      perPageParam,
      pageParam,
      totalPagesParam,
      _infinityModelName: modelName,
      extraParams: options,
      content: A()
    };

    if (didPassBoundParams) {
      initParams._deprecatedBoundParams = boundParams;
      initParams.route = this;
    }

    const infinityModel = InfinityModelFactory.create(initParams);
    this._ensureCompatibility();
    this._infinityModels.pushObject(infinityModel);

    return InfinityPromiseArray.create({ promise: this._loadNextPage(infinityModel) });
  },

  /**
    Update the infinity model with new objects
    Only called on the second page and following

    @deprecated
    @method updateInfinityModel
    @param {Ember.Enumerable} newObjects The new objects to add to the model
    @return {Ember.Array} returns the new objects
  */
  updateInfinityModel(newObjects) {
    deprecate('Ember Infinity: this method will be deprecated in the future.', {
      id: 'ember-infinity'
    });
    return this._doUpdate(newObjects);
  },

  /**
    Call additional functions after finding the infinityModel in the Ember store.
    @private
    @method _afterInfinityModel
    @param {Function} infinityModelPromise The resolved result of the Ember store find method. Passed in automatically.
    @return {Ember.RSVP.Promise}
  */
  _afterInfinityModel(_this) {
    return function(infinityModelPromiseResult, infinityModel) {
      if (typeof _this.afterInfinityModel === 'function') {
        let result = _this.afterInfinityModel(infinityModelPromiseResult, infinityModel);
        if (result) {
          return result;
        }
      }

      return infinityModelPromiseResult;
    };
  },

  /**
    Trigger a load of the next page of results.

    @private
    @method _infinityLoad
    @param {Ember.ArrayProxy} infinityModel
   */
  _infinityLoad(infinityModel) {
    if (get(infinityModel, '_loadingMore') || !get(infinityModel, '_canLoadMore')) {
      return;
    }

    this._loadNextPage(infinityModel);
  },

  /**
    load the next page from the adapter and update the model

    @private
    @method _loadNextPage
    @param {Ember.ArrayProxy} infinityModel
    @return {Ember.RSVP.Promise} A Promise that resolves the model
   */
  _loadNextPage(infinityModel) {
    set(infinityModel, '_loadingMore', true);

    const modelName = get(infinityModel, '_infinityModelName');
    const params    = infinityModel.buildParams();

    return this._requestNextPage(modelName, params)
      .then(newObjects => this._afterInfinityModel(this)(newObjects, infinityModel))
      .then(newObjects => this._doUpdate(newObjects, infinityModel))
      .then(infinityModel => {
        infinityModel.incrementProperty('currentPage');
        set(infinityModel, '_firstPageLoaded', true);
        const canLoadMore = get(infinityModel, '_canLoadMore');
        set(infinityModel, 'reachedInfinity', !canLoadMore);
        if (!canLoadMore) { this._notifyInfinityModelLoaded(); }
        return infinityModel;
      }).finally(() => set(infinityModel, '_loadingMore', false));
  },

  /**
    request the next page from the adapter

    @private
    @method _requestNextPage
    @param {String} modelName
    @param {Object} options
    @returns {Ember.RSVP.Promise} A Promise that resolves the next page of objects
   */
  _requestNextPage(modelName, params) {
    return this.get(this._store)[this._storeFindMethod](modelName, params);
  },

  /**
    set _totalPages param on infinityModel
    Update the infinity model with new objects

    @private
    @method _doUpdate
    @param {Ember.Enumerable} queryObject The new objects to add to the model
    @param {Ember.ArrayProxy} infinityModel
    @return {Ember.Array} returns the new objects
   */
  _doUpdate(queryObject, infinityModel) {
    const totalPages = queryObject.get(get(infinityModel, 'totalPagesParam'));
    set(infinityModel, '_totalPages', totalPages);
    set(infinityModel, 'meta', get(queryObject, 'meta'));
    return infinityModel.pushObjects(queryObject.toArray());
  },

  /**
    notify that the infinity model has been updated

    @private
    @method _notifyInfinityModelUpdated
   */
  _notifyInfinityModelUpdated(newObjects) {
    if (!this.infinityModelUpdated) {
      return;
    }

    deprecate('Ember Infinity: infinityModelUpdated will be deprecated in the future.', {
      id: 'ember-infinity'
    });
    run.scheduleOnce('afterRender', this, 'infinityModelUpdated', {
      lastPageLoaded: this.get('currentPage'),
      totalPages: this.get('_totalPages'),
      newObjects: newObjects
    });
  },

  /**
    finish the loading cycle by notifying that infinity has been reached

    @private
    @method _notifyInfinityModelLoaded
   */
  _notifyInfinityModelLoaded() {
    if (!this.infinityModelLoaded) {
      return;
    }

    const totalPages = this.get('_totalPages');
    run.scheduleOnce('afterRender', this, 'infinityModelLoaded', { totalPages: totalPages });
  }
});

export default RouteMixin;
