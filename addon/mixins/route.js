import { alias } from '@ember/object/computed';
import EmberError from '@ember/error';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import BoundParamsMixin from 'ember-infinity/mixins/bound-params';
import Mixin from '@ember/object/mixin';
import { A } from '@ember/array';
import { computed, get, set } from '@ember/object';
import { deprecate } from '@ember/application/deprecations';
import { isEmpty, typeOf } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';
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
  currentPage: alias('_infinityModel.currentPage').readOnly(),

  actions: {
    /**
      determine if the passed infinityModel already exists on the infinityRoute and
      return boolean to tell infinity-loader component if it should make another request
      @method infinityLoad
      @param {Object} infinityModel
      @param {Integer} increment - to increase page by 1 or -1. Default to increase by one page
      @return {Boolean}
     */
    infinityLoad(infinityModel, increment = 1) {
      let matchingInfinityModel = this._infinityModels.find(model => model === infinityModel);
      if (matchingInfinityModel) {
        set(infinityModel, '_increment', increment);
        this._infinityLoad(matchingInfinityModel, increment);
      } else {
        return true;
      }
    }
  },

  /**
    @private
    @property _previousScrollHeight
    @type Integer
    @default 0
  */
  _previousScrollHeight: 0,
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
    if (isEmpty(get(this, this._store)) || isEmpty(get(this, this._store)[this._storeFindMethod])){
      throw new EmberError("Ember Infinity: Store is not available to infinityModel");
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
      throw new EmberError("Ember Infinity: Must pass custom data store as a string");
    }

    const store = get(this, options.store);
    if (!store[get(this, '_storeFindMethod')]) {
      throw new EmberError("Ember Infinity: Custom data store must specify query method");
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
      if (!(boundParamsOrInfinityModel.prototype instanceof InfinityModel)) {
        throw new EmberError("Ember Infinity: You must pass an Infinity Model instance as the third argument");
      }
      ExtendedInfinityModel = boundParamsOrInfinityModel;
    } else if (typeOf(boundParamsOrInfinityModel) === "object") {
      boundParams = boundParamsOrInfinityModel;
    }

    if (modelName === undefined) {
      throw new EmberError("Ember Infinity: You must pass a Model Name to infinityModel");
    }

    if (!this._infinityModels) {
      this._infinityModels = A();
    }

    options = options ? objectAssign({}, options) : {};

    if (options.store) {
      if (options.storeFindMethod) {
        set(this, '_storeFindMethod', options.storeFindMethod);
      }

      this._ensureCustomStoreCompatibility(options);

      set(this, '_store', options.store);

      delete options.store;
      delete options.storeFindMethod;
    }

    // default is to start at 0, request next page and increment
    const currentPage = options.startingPage === undefined ? 0 : options.startingPage - 1;
    // sets first page when route is loaded
    const firstPage = currentPage === 0 ? 1 : currentPage + 1;
    // chunk requests by indicated perPage param
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
      firstPage,
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
    deprecate('Ember Infinity: this method will be deprecated in the future.', false, {
      id: 'ember-infinity',
      until: '1.0.0'
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
    @param {Integer} increment - to increase page by 1 or -1
   */
  _infinityLoad(infinityModel, increment) {
    if (get(infinityModel, '_loadingMore') || !get(infinityModel, '_canLoadMore')) {
      return;
    }

    this._loadNextPage(infinityModel, increment);
  },

  /**
    load the next page from the adapter and update the model
    set current height of elements.  If loadPrevious, we will use this value to scroll back down the page

    @private
    @method _loadNextPage
    @param {Ember.ArrayProxy} infinityModel
    @param {Integer} increment - to increase page by 1 or -1. Default to increase by one page
    @return {Ember.RSVP.Promise} A Promise that resolves the model
   */
  _loadNextPage(infinityModel, increment = 1) {
    set(infinityModel, '_loadingMore', true);
    set(this, '_previousScrollHeight', this._calculateHeight(infinityModel));

    const modelName = get(infinityModel, '_infinityModelName');
    const params    = infinityModel.buildParams(increment);

    return this._requestNextPage(modelName, params)
      .then(newObjects => this._afterInfinityModel(this)(newObjects, infinityModel))
      .then(newObjects => this._doUpdate(newObjects, infinityModel))
      .then(infinityModel => {
        if (increment === 1) {
          // scroll down to load next page
          infinityModel.incrementProperty('currentPage');
        } else {
          let viewportElem = get(infinityModel, '_scrollable') ? document.querySelector(get(infinityModel, '_scrollable')) : window;
          scheduleOnce('afterRender', this, '_updateScrollTop', { infinityModel, viewportElem });
          // scrolled up to load previous page
          infinityModel.decrementProperty('currentPage');
        }
        set(infinityModel, '_firstPageLoaded', true);
        let canLoadMore = get(infinityModel, '_canLoadMore');
        set(infinityModel, 'reachedInfinity', !canLoadMore);
        if (!canLoadMore) { this._notifyInfinityModelLoaded(); }
        return infinityModel;
      }).finally(() => set(infinityModel, '_loadingMore', false));
  },

  /**
    @private
    @method _calculateHeight
    @param {Object} infinityModel
    @return Integer
   */
  _calculateHeight(infinityModel) {
    let viewportElem = get(infinityModel, '_scrollable') ? document.querySelector(get(infinityModel, '_scrollable')) : window;
    return get(infinityModel, '_scrollable') ? viewportElem.scrollHeight : viewportElem.innerHeight;
  },

  /**
    This method calculates the difference if loadPrevious=true
    The browser by default will scroll to the top of the element list when the previous page
    loads.  As a result, we need to scroll back down the page.
    The math behind this is as follows:
    (height after loading previous elems) - (old height)
    So 150px - 100px === 150px
    178px - 100px = 78px
    120px - 10px = 110px
    @private
    @method _updateScrollTop
    @return Integer
   */
  _updateScrollTop({ infinityModel, viewportElem }) {
    let scrollDiff = this._calculateHeight(infinityModel) - get(this, '_previousScrollHeight');
    viewportElem.scrollTop += scrollDiff;
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
    return get(this, this._store)[this._storeFindMethod](modelName, params);
  },

  /**
    set _totalPages param on infinityModel
    Update the infinity model with new objects with either adding to end or start of Array of objects

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

    if (infinityModel.get('_increment') === 1) {
      return infinityModel.pushObjects(queryObject.toArray());
    } else {
      // TODO: this will lead to problems b/c unshift will focus viewport to first item after unshift
      return infinityModel.unshiftObjects(queryObject.toArray());
    }
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

    deprecate('Ember Infinity: infinityModelUpdated will be deprecated in the future.', false, {
      id: 'ember-infinity',
      until: '1.0.0'
    });
    scheduleOnce('afterRender', this, 'infinityModelUpdated', {
      lastPageLoaded: get(this, 'currentPage'),
      totalPages: get(this, '_totalPages'),
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

    const totalPages = get(this, '_totalPages');
    scheduleOnce('afterRender', this, 'infinityModelLoaded', { totalPages: totalPages });
  }
});

export default RouteMixin;
