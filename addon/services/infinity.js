import Service from '@ember/service';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import BoundParamsMixin from 'ember-infinity/mixins/bound-params';
import EmberError from '@ember/error';
import { A } from '@ember/array';
import { isEmpty, typeOf } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { checkInstanceOf, convertToArray, objectAssign, paramsCheck } from '../utils';
import { assert } from '@ember/debug';
import { resolve } from 'rsvp';

/**
 * { 'products': { future_timestamp: infinityModel } }
 * contains an array of Array Proxies
 * only called when need to re-cache the collection
 *
 * @method cacheInfinityCollection
 * @param Ember.Array _cachedCollection
 * @param Object infinityModel
 * @param String identifier
 * @param String timestamp
 * @return Object
 */
let cacheInfinityCollection = (_cachedCollection, infinityModel, identifier, timestamp) => {
  if (_cachedCollection && _cachedCollection[identifier]) {
    // 1. first clear out elements from object since we are expired
    _cachedCollection[identifier] = {};
  }

  // 2. Set new timestamp for identifier
  let future_timestamp = new Date().getTime() + timestamp;
  return _cachedCollection[identifier] = { [future_timestamp]: infinityModel };
};

export default Service.extend({
  /**
    Data fetching/caching service pull off of user's route

    @public
    @property store
    @type Ember.Service
  */
  store: service(),

  /**
    Internal reference to manage collection throughout lifecycle of service

    @public
    @property infinityModels
    @type Ember.Service
  */
  infinityModels: null,

  /**
    @private
    @property _previousScrollHeight
    @type Integer
    @default 0
  */
  _previousScrollHeight: 0,

  init() {
    this._super(...arguments);
    this._cachedCollection = {};
    set(this, 'infinityModels', A());
  },

  /**
    @method pushObjects
    @param {EmberInfinity.InfinityModel} infinityModel
    @param {Array} queryObject - list of Store models
   */
  pushObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.pushObjects(convertToArray(queryObject));
    }
  },

  /**
    @method unshiftObjects
    @param {EmberInfinity.InfinityModel} infinityModel
    @param {Array} queryObject - list of Store models
   */
  unshiftObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.unshiftObjects(convertToArray(queryObject));
    }
  },

  /**
    - Useful for updating the infinity model with a new array
    - For example, you fetch a new array from your backend based on search criteria and need to swap out what currently
    exists with what was returned from your query
    - HOWEVER, note this method can be particularly dangerous, for example, when using to filter a list.  If you are not using queryParams or
    some other sort of state that is passed to your model hook, when your component goes to fetch the next page of documents, it will not include
    the filter param.  This will lead to a list that partly does not represent what the user filtered.

    @method replace
    @param {EmberInfinity.InfinityModel} infinityModel
    @param newCollection - Ember Data (or similar store) response
   */
  replace(infinityModel, newCollection) {
    if (checkInstanceOf(infinityModel)) {
      let len = infinityModel.get('length');
      infinityModel.replace(0, len, convertToArray(newCollection));
      return infinityModel;
    }
  },

  /**
    Useful for clearing out the collection

    @method flush
    @param {EmberInfinity.InfinityModel} infinityModel
   */
  flush(infinityModel) {
    if (checkInstanceOf(infinityModel)) {
      let len = infinityModel.get('length');
      infinityModel.replace(0, len, []);
      return infinityModel;
    }
  },

  /**
    Trigger a load of the next page of results while also checking if it can load more
    Subsequent fetching.  Not used for initial request

    @public
    @method infinityLoad
    @param {EmberInfinity.InfinityModel} infinityModel
    @param {Integer} increment - to increase page by 1 or -1
   */
  infinityLoad(infinityModel, increment = 1) {
    if (!infinityModel) {
      return;
    }

    infinityModel = get(this, 'infinityModels').find(model => model === infinityModel);
    let result;
    if (infinityModel) {
      // this is duplicated if this method is called from the route.
      set(infinityModel, '_increment', increment);

      if (get(infinityModel, '_loadingMore') || !get(infinityModel, '_canLoadMore')) {
        return resolve();
      }

      result = this.loadNextPage(infinityModel, increment);
    } else {
      result = true;
    }
    return resolve(result);
  },

  /**
    Use the model method in the place of `this.store.query('model')` to
    initialize the Infinity Model for your route.
    Main method used for initial load of infinity collection in route or top level component

    @method model
    @param {String} modelName The name of the model.
    @param {Object} options - optional - the perPage and startingPage to load from.
    @param {Object} boundParamsOrInfinityModel - optional -
      params on route to be looked up on every route request or
      instance of InfinityModel
    @return {Ember.RSVP.Promise}
  */
  model(modelName, options, boundParamsOrInfinityModel) {
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

    options = options ? objectAssign({}, options) : {};

    if (options.store) {
      get(this, '_ensureCustomStoreCompatibility')(options, options.store, options.storeFindMethod || 'query');
    }

    set(this, 'infinityModelLoaded', get(this, 'infinityModelLoaded'));
    set(this, 'afterInfinityModel', get(this, 'afterInfinityModel'));

    // default is to start at 0, request next page and increment
    const currentPage = options.startingPage === undefined ? 0 : options.startingPage - 1;
    // sets first page when route is loaded
    const firstPage = currentPage === 0 ? 1 : currentPage + 1;
    // chunk requests by indicated perPage param
    const perPage = options.perPage || 25;

    // store service methods (defaults to ember-data if nothing passed)
    const store = options.store || get(this, 'store');
    const storeFindMethod = options.storeFindMethod || 'query';

    // check if user passed in param w/ infinityModel, else check if defined on the route (for backwards compat), else default
    const perPageParam = paramsCheck(options.perPageParam, get(this, 'perPageParam'), 'per_page');
    const pageParam = paramsCheck(options.pageParam, get(this, 'pageParam'), 'page');
    const totalPagesParam = paramsCheck(options.totalPagesParam, get(this, 'totalPagesParam'), 'meta.total_pages');
    const countParam = paramsCheck(options.countParam, get(this, 'countParam'), 'meta.count');
    const infinityCache = paramsCheck(options.infinityCache);

    // create identifier for use in storing unique cached infinity model
    let identifier = '';
    Object.keys(options).forEach((key) => {
      identifier += '' + options[key];
    });

    delete options.startingPage;
    delete options.perPage;
    delete options.perPageParam;
    delete options.pageParam;
    delete options.totalPagesParam;
    delete options.countParam;
    delete options.infinityCache;
    delete options.store;
    delete options.storeFindMethod;

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
      countParam,
      extraParams: options,
      _infinityModelName: modelName,
      store,
      storeFindMethod,
      content: A()
    };

    if (didPassBoundParams) {
      initParams._deprecatedBoundParams = boundParams;
      initParams.route = this;
    }

    const infinityModel = InfinityModelFactory.create(initParams);
    get(this, '_ensureCompatibility')(get(infinityModel, 'store'), get(infinityModel, 'storeFindMethod'));

    // route specific (for backwards compat)
    get(this, 'infinityModels').pushObject(infinityModel);

    // internal service specific
    if (infinityCache) {
      assert('timestamp must be a positive integer in milliseconds', infinityCache > 0);

      // 1. create identifier for storage in _cachedCollection
      let uniqueIdentifier = modelName += identifier;
      let _cachedCollection = get(this, '_cachedCollection');
      let cachedModel = _cachedCollection[uniqueIdentifier];
      if (cachedModel) {
        // 2. If cachedModel, get future_timestamp (ms since 1970) and compare to now
        let future_timestamp = Object.keys(cachedModel)[0];
        if (future_timestamp > Date.now()) {
          return cachedModel[future_timestamp];
        } else {
          // 3. cache collection based on new timestamp
          cacheInfinityCollection(_cachedCollection, infinityModel, uniqueIdentifier, infinityCache);
        }
      } else {
        // 2. if we are expired (future_timestamp < Date.now()) or cachedModel doesn't exist, cache a new infinityModel + future timestamp
        cacheInfinityCollection(_cachedCollection, infinityModel, uniqueIdentifier, infinityCache);
      }
    }

    return InfinityPromiseArray.create({ promise: this['loadNextPage'](infinityModel) });
  },

  /**
    load the next page from the adapter and update the model
    set current height of elements.  If loadPrevious, we will use this value to scroll back down the page

    @public
    @method loadNextPage
    @param {EmberInfinity.InfinityModel} infinityModel
    @param {Integer} increment - to increase page by 1 or -1. Default to increase by one page
    @return {Ember.RSVP.Promise} A Promise that resolves the model
   */
  loadNextPage(infinityModel, increment = 1) {
    set(infinityModel, '_loadingMore', true);
    set(this, '_previousScrollHeight', this._calculateHeight(infinityModel));

    return this._requestNextPage(infinityModel, increment)
      .then(newObjects => this._afterInfinityModel(newObjects, infinityModel))
      .then(newObjects => this._doUpdate(newObjects, infinityModel))
      .then(infinityModel => {
        if (increment === 1) {
          // scroll down to load next page
          infinityModel.incrementProperty('currentPage');
        } else {
          if (typeof FastBoot === 'undefined') {
            let viewportElem = get(infinityModel, '_scrollable') ? document.querySelector(get(infinityModel, '_scrollable')) : document.documentElement;
            scheduleOnce('afterRender', this, '_updateScrollTop', { infinityModel, viewportElem });
            // scrolled up to load previous page
            infinityModel.decrementProperty('currentPage');
          }
        }
        set(infinityModel, '_firstPageLoaded', true);
        let canLoadMore = get(infinityModel, '_canLoadMore');
        set(infinityModel, 'reachedInfinity', !canLoadMore);
        if (!canLoadMore) {
          this._notifyInfinityModelLoaded();
        }
        return infinityModel;
      }).finally(() => set(infinityModel, '_loadingMore', false));
  },

  /**
    calculate the height of the scrollable viewport

    @private
    @method _calculateHeight
    @param {Object} infinityModel
    @return Integer
   */
  _calculateHeight(infinityModel) {
    if (typeof FastBoot === 'undefined') {
      let isScrollable = !!get(infinityModel, '_scrollable');
      let viewportElem = isScrollable ? document.querySelector(get(infinityModel, '_scrollable')) : document.documentElement;
      return viewportElem.scrollHeight;
    }
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
    @param {EmberInfinity.InfinityModel} infinityModel
    @param {String} increment
    @returns {Ember.RSVP.Promise} A Promise that resolves the next page of objects
   */
  _requestNextPage(infinityModel, increment) {
    const modelName = get(infinityModel, '_infinityModelName');
    const params    = infinityModel.buildParams(increment);

    return get(infinityModel, 'store')[get(infinityModel, 'storeFindMethod')](modelName, params);
  },

  /**
    set _totalPages && count param on infinityModel
    Update the infinity model with new objects with either adding to end or start of Array of objects

    @private
    @method _doUpdate
    @param {Ember.Enumerable} queryObject The new objects to add to the model
    @param {EmberInfinity.InfinityModel} infinityModel
    @return {Ember.Array} returns the new objects
   */
  _doUpdate(queryObject, infinityModel) {
    const totalPages = queryObject.get(get(infinityModel, 'totalPagesParam'));
    const count = queryObject.get(get(infinityModel, 'countParam'));
    set(infinityModel, '_totalPages', totalPages);
    set(infinityModel, '_count', count);
    set(infinityModel, 'meta', get(queryObject, 'meta'));

    if (infinityModel.get('_increment') === 1) {
      return infinityModel.pushObjects(queryObject.toArray());
    } else {
      return infinityModel.unshiftObjects(queryObject.toArray());
    }
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
  },

  /**
    hook to modify results from response

    @private
    @method _afterInfinityModel
   */
  _afterInfinityModel(newObjects, infinityModel) {
    if (!this.afterInfinityModel || typeof this.afterInfinityModel !== 'function') {
      return newObjects;
    }

    let result = this.afterInfinityModel(newObjects, infinityModel);
    if (result) {
      return result;
    }
    return newObjects;
  },

  /**
    If pass in custom store, ensure passed string
    Ensure query method exists, otherwise pass method (that returns a promise) in as storeFindMethod in options

    @method _ensureCustomStoreCompatibility
    @param {Option} options
  */
  _ensureCustomStoreCompatibility(options, store, storeFindMethod) {
    if (!store[storeFindMethod]) {
      throw new EmberError('Ember Infinity: Custom data store must specify query method');
    }
  },

  /**
    Determine if Ember data is valid
    Ensure _store is set on route with a query method
    Ensure model passed to infinity model

    @method _ensureCompatibility
  */
  _ensureCompatibility(store, storeFindMethod) {
    if (isEmpty(store) || isEmpty(store[storeFindMethod])){
      throw new EmberError('Ember Infinity: Store is not available to infinityModel');
    }
  }
});
