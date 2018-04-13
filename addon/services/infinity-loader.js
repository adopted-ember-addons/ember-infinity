import Service from '@ember/service';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import EmberError from '@ember/error';
import { isEmpty } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';
import { get, set } from '@ember/object';

let checkInstanceOf = (infinityModel) => {
  if (!(infinityModel instanceof InfinityModel)) {
    throw new EmberError("Ember Infinity: You must pass an Infinity Model instance as the first argument");
  }
  return true;
};

let convertToArray = (queryObject) => {
  if (queryObject.toArray) {
    return queryObject.toArray();
  }
  return queryObject;
};

export default Service.extend({
  infinityModels: null,

  /**
    Data fetching/caching service pull off of user's route

    @public
    @property store
    @type Ember.Service
  */
  store: null,
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
    @method pushObjects
    @param {ArrayProxy} infinityModel
    @param {Array} queryObject - list of Store models
   */
  pushObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.pushObjects(convertToArray(queryObject));
    }
  },

  /**
    @method unshiftObjects
    @param {ArrayProxy} infinityModel
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
    @param {ArrayProxy} infinityModel
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
    @param {ArrayProxy} infinityModel
   */
  flush(infinityModel) {
    if (checkInstanceOf(infinityModel)) {
      let len = infinityModel.get('length');
      infinityModel.replace(0, len, []);
      return infinityModel;
    }
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
    Trigger a load of the next page of results while also checking if it can load more

    @public
    @method infinityLoad
    @param {Ember.ArrayProxy} infinityModel
    @param {Integer} increment - to increase page by 1 or -1
   */
  infinityLoad(infinityModel, increment) {
    if (get(infinityModel, '_loadingMore') || !get(infinityModel, '_canLoadMore')) {
      return;
    }

    return this.loadNextPage(infinityModel, increment);
  },

  /**
    load the next page from the adapter and update the model
    set current height of elements.  If loadPrevious, we will use this value to scroll back down the page

    @public
    @method loadNextPage
    @param {Ember.ArrayProxy} infinityModel
    @param {Integer} increment - to increase page by 1 or -1. Default to increase by one page
    @return {Ember.RSVP.Promise} A Promise that resolves the model
   */
  loadNextPage(infinityModel, increment = 1) {
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
    @private
    @method _calculateHeight
    @param {Object} infinityModel
    @return Integer
   */
  _calculateHeight(infinityModel) {
    if (typeof FastBoot === 'undefined') {
      let viewportElem = get(infinityModel, '_scrollable') ? document.querySelector(get(infinityModel, '_scrollable')) : document.documentElement;
      return get(infinityModel, '_scrollable') ? viewportElem.scrollHeight : viewportElem.scrollHeight;
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
    @param {String} modelName
    @param {Object} options
    @returns {Ember.RSVP.Promise} A Promise that resolves the next page of objects
   */
  _requestNextPage(modelName, params) {
    return get(this, 'store')[this._storeFindMethod](modelName, params);
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
