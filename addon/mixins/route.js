import Ember from 'ember';
import { emberDataVersionIs } from 'ember-version-is';

const keys = Object.keys || Ember.keys;
const assign = Ember.assign || Ember.merge;
/**
  The Ember Infinity Route Mixin enables an application route to load paginated
  records for the route `model` as triggered by the controller (or Infinity Loader
  component).

  @class RouteMixin
  @namespace EmberInfinity
  @module ember-infinity/mixins/route
  @extends Ember.Mixin
*/
const RouteMixin = Ember.Mixin.create({

  /**
    @private
    @property _perPage
    @type Integer
    @default 25
  */
  _perPage: 25,

  /**
    @private
    @property firstPage
    @type Integer
    @default 0
  */
  firstPage: 0,

  /**
    @private
    @property lastPage
    @type Integer
    @default 0
  */
  lastPage: 0,

  /**
    @private
    @property _extraParams
    @type Object
    @default {}
  */
  _extraParams: {},

  /**
    @private
    @property _boundParams
    @type Object
    @default {}
  */
  _boundParams: {},

  /**
    @private
    @property _loadingMore
    @type Boolean
    @default false
  */
  _loadingMore: false,

  /**
    @private
    @property _totalPages
    @type Integer
    @default 0
  */
  _totalPages: 0,

  /**
    @private
    @property _infinityModelName
    @type String
    @default null
  */
  _infinityModelName: null,

  /**
    @private
    @property _modelPath
    @type String
    @default 'controller.model'
  */
  _modelPath: 'controller.model',

  /**
   * Name of the "per page" param in the
   * resource request payload
   * @type {String}
   * @default  "per_page"
   */
  perPageParam: 'per_page',

  /**
   * Name of the "page" param in the
   * resource request payload
   * @type {String}
   * @default "page"
   */
  pageParam: 'page',

  /**
   * Path of the "total pages" param in
   * the HTTP response
   * @type {String}
   * @default "meta.total_pages"
   */
  totalPagesParam: 'meta.total_pages',

  actions: {
    infinityLoad(infinityModel, loadPrevious) {
      if (infinityModel === this._infinityModel()) {
        this._infinityLoad(loadPrevious);
      } else {
        return true;
      }
    }
  },

  /**
   * The supported findMethod name for
   * the developers Ember Data version.
   * Provided here for backwards compat.
   * @type {String}
   * @default "query"
   */
  _storeFindMethod: 'query',

  _initialPageLoaded: false,

  /**
    @private
    @property _canLoadMore
    @type Boolean
    @default false
  */
  _canLoadMore: Ember.computed('_totalPages', 'lastPage', function() {
    const totalPages  = this.get('_totalPages');
    const lastPage = this.get('lastPage');

    return (totalPages && lastPage !== undefined) ? (lastPage < totalPages) : false;
  }),

  /**
    @private
    @property _canLoadMorePrevious
    @type Boolean
    @default false
  */
  _canLoadPrevious: Ember.computed('firstPage', function() {
    const firstPage = this.get('firstPage');

    return firstPage !== undefined ? (firstPage > 1) : false;
  }),

  /**
   @private
   @method _infinityModel
   @return {DS.RecordArray} the model
  */
  _infinityModel() {
    return this.get(this.get('_modelPath'));
  },

  _ensureCompatibility() {
    if (emberDataVersionIs('greaterThan', '1.0.0-beta.19.2') && emberDataVersionIs('lessThan', '1.13.4')) {
      throw new Ember.Error("Ember Infinity: You are using an unsupported version of Ember Data.  Please upgrade to at least 1.13.4 or downgrade to 1.0.0-beta.19.2");
    }

    if (Ember.isEmpty(this.get('store')) || Ember.isEmpty(this.get('store')[this._storeFindMethod])){
      throw new Ember.Error("Ember Infinity: Ember Data store is not available to infinityModel");
    }

    if (this.get('_infinityModelName') === undefined) {
      throw new Ember.Error("Ember Infinity: You must pass a Model Name to infinityModel");
    }
  },

  /**
    Use the infinityModel method in the place of `this.store.find('model')` to
    initialize the Infinity Model for your route.

    @method infinityModel
    @param {String} modelName The name of the model.
    @param {Object} options Optional, the perPage and startingPage to load from.
    @param {Object} boundParams Optional, any route properties to be included as additional params.
    @return {Ember.RSVP.Promise}
  */
  infinityModel(modelName, options, boundParams) {
    if (emberDataVersionIs('lessThan', '1.13.0')) {
      this.set('_storeFindMethod', 'find');
    }

    this.set('_infinityModelName', modelName);

    this._ensureCompatibility();

    options = options ? assign({}, options) : {};
    const startingPage = options.startingPage === undefined ? 0 : options.startingPage-1;

    const perPage      = options.perPage || this.get('_perPage');
    const modelPath    = options.modelPath || this.get('_modelPath');

    delete options.startingPage;
    delete options.perPage;
    delete options.modelPath;

    this.setProperties({
      lastPage: startingPage,
      _initialPageLoaded: false,
      _perPage: perPage,
      _modelPath: modelPath,
      _extraParams: options
    });

    if (typeof boundParams === 'object') {
      this.set('_boundParams', boundParams);
    }

    return this._loadNextPage();
  },

  /**
   Call additional functions after finding the infinityModel in the Ember data store.
   @private
   @method _afterInfinityModel
   @param {Function} infinityModelPromise The resolved result of the Ember store find method. Passed in automatically.
   @return {Ember.RSVP.Promise}
  */
  _afterInfinityModel(_this) {
    return function(infinityModelPromiseResult) {
      if (typeof _this.afterInfinityModel === 'function') {
        let result = _this.afterInfinityModel(infinityModelPromiseResult);
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
   */
  _infinityLoad(loadPrevious) {
    if (this.get('_loadingMore') ||
      !loadPrevious && !this.get('_canLoadMore') ||
      loadPrevious && !this.get('_canLoadPrevious')
    ) {
      return;
    }

    this._loadNextPage(loadPrevious);
  },

  /**
   load the next page from the adapter and update the model

   @private
   @method _loadNextPage
   @return {Ember.RSVP.Promise} A Promise that resolves the model
   */
  _loadNextPage(loadPrevious) {
    this.set('_loadingMore', true);

    return this._requestPage(loadPrevious)
      .then((newObjects) => {
        this._pageLoaded(newObjects, loadPrevious);

        return newObjects;
      })
      .finally(() => {
        this.set('_loadingMore', false);
      });
  },

  /**
   request the next page from the adapter

   @private
   @method _requestNextPage
   @returns {Ember.RSVP.Promise} A Promise that resolves the next page of objects
   */
  _requestPage(loadPrevious) {
    const modelName = this.get('_infinityModelName');
    const nextPage = loadPrevious ?
      this.decrementProperty('firstPage') :
      this.incrementProperty('lastPage');

    const params = this._buildParams(nextPage);

    return this.get('store')[this._storeFindMethod](modelName, params).then(
      this._afterInfinityModel(this));
  },

  /**
   build the params for the next page request

   @private
   @method _buildParams
   @param {Number} nextPage the page number for the current request
   @return {Object} The query params for the next page of results
   */
  _buildParams(nextPage) {
    const pageParams = {};
    pageParams[this.get('perPageParam')] = this.get('_perPage');
    pageParams[this.get('pageParam')] = nextPage;

    const params = assign(pageParams, this.get('_extraParams'));

    const boundParams = this.get('_boundParams');
    if (!Ember.isEmpty(boundParams)) {
      keys(boundParams).forEach(k => params[k] = this.get(boundParams[k]));
    }

    return params;
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
    return this._doUpdate(newObjects);
  },

  _doUpdate(newObjects, loadPrevious) {
    let infinityModel = this._infinityModel();

    if (loadPrevious) {
      return infinityModel.unshiftObjects(newObjects.get('content'));
    }

    return infinityModel.pushObjects(newObjects.get('content'));
  },

  /**

   @method _nextPageLoaded
   @param {Ember.Enumerable} newObjects The new objects to add to the model
   @return {DS.RecordArray} returns the updated infinity model
   @private
   */
  _pageLoaded(newObjects, loadPrevious) {
    const totalPages = newObjects.get(this.get('totalPagesParam'));
    const currentPage = loadPrevious ? this.get('firstPage') : this.get('lastPage');

    this.set('_totalPages', totalPages);

    let infinityModel = newObjects;

    if (this.get('_initialPageLoaded')) {
      if (typeof this.updateInfinityModel === 'function' &&
          (this.updateInfinityModel !==
           Ember.Object.extend(RouteMixin).create().updateInfinityModel)) {
        Ember.deprecate("EmberInfinity.updateInfinityModel is deprecated. "+
                        "Please use EmberInfinity.afterInfinityModel.",
                        false,
                        {id: 'ember-infinity.updateInfinityModel', until: '2.1'}
                       );

        infinityModel = this.updateInfinityModel(newObjects);
      } else {
        infinityModel = this._doUpdate(newObjects, loadPrevious);
      }
    } else {
      this.set('firstPage', this.get('lastPage'));
    }

    this.set('_initialPageLoaded', true);
    this._notifyInfinityModelUpdated(newObjects, currentPage);

    const canLoadMore = this.get('_canLoadMore');
    const canLoadPrevious = this.get('_canLoadPrevious');

    infinityModel.set('reachedInfinity', !canLoadMore);
    infinityModel.set('reachedHead', !canLoadPrevious);

    if (!canLoadMore && !canLoadPrevious) {
      this._notifyInfinityModelLoaded();
    }

    return infinityModel;
  },

  /**
   notify that the infinity model has been updated

   @private
   @method _notifyInfinityModelUpdated
   */
  _notifyInfinityModelUpdated(newObjects, currentPage) {
    if (!this.infinityModelUpdated) {
      return;
    }

    Ember.run.scheduleOnce('afterRender', this, 'infinityModelUpdated', {
      lastPageLoaded: currentPage,
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
    Ember.run.scheduleOnce('afterRender', this, 'infinityModelLoaded', { totalPages: totalPages });
  }
});

export default RouteMixin;
