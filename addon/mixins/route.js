import Ember from 'ember';
const { Mixin, computed, RSVP, } = Ember;
import { objectAssign } from '../utils';

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

  /**
    @private
    @property _perPage
    @type Integer
    @default 25
  */
  _perPage: 25,

  /**
    @private
    @property currentPage
    @type Integer
    @default 0
  */
  currentPage: 0,

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
    @property _store
    @type String
    @default 'store'
  */
  _store: 'store',

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
    infinityLoad(infinityModel) {
      return RSVP.hash({
          infinityModel,
          _infinityModel: this._infinityModel(),
        }).then((result) => {
          if(result.infinityModel === result._infinityModel) {
            return this._infinityLoad();
          } else {
            return true;
          }
        });
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

  _firstPageLoaded: false,

  /**
    @private
    @property _canLoadMore
    @type Boolean
    @default false
  */
  _canLoadMore: computed('_totalPages', 'currentPage', function() {
    const totalPages  = this.get('_totalPages');
    const currentPage = this.get('currentPage');

    return (totalPages && currentPage !== undefined) ? (currentPage < totalPages) : false;
  }).readOnly(),

  /**
   @private
   @method _infinityModel
   @return {Ember.RSVP.Promise} for the model
  */
  _infinityModel() {
    return RSVP.resolve(this.get(this.get('_modelPath')));
  },

  /**
    Determine if Ember data is valid
    Ensure _store is set on route with a query method
    Ensure model passed to infinity model

    @method _ensureCompatibility
  */
  _ensureCompatibility() {
    if (Ember.isEmpty(this.get(this._store)) || Ember.isEmpty(this.get(this._store)[this._storeFindMethod])){
      throw new Ember.Error("Ember Infinity: Store is not available to infinityModel");
    }

    if (this.get('_infinityModelName') === undefined) {
      throw new Ember.Error("Ember Infinity: You must pass a Model Name to infinityModel");
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
    @param {Object} options Optional, the perPage and startingPage to load from.
    @param {Object} boundParams Optional, any route properties to be included as additional params.
    @return {Ember.RSVP.Promise}
  */
  infinityModel(modelName, options, boundParams) {
    options = options ? objectAssign({}, options) : {};

    this.set('_infinityModelName', modelName);

    if (options.store) {
      if (options.storeFindMethod) {
        this.set('_storeFindMethod', options.storeFindMethod);
      }

      this._ensureCustomStoreCompatibility(options);

      this.set('_store', options.store);

      delete options.store;
      delete options.storeFindMethod;
    }

    const startingPage = options.startingPage === undefined ? 0 : options.startingPage-1;
    const perPage      = options.perPage || this.get('_perPage');
    const modelPath    = options.modelPath || this.get('_modelPath');

    delete options.startingPage;
    delete options.perPage;
    delete options.modelPath;

    this.setProperties({
      currentPage: startingPage,
      _firstPageLoaded: false,
      _perPage: perPage,
      _modelPath: modelPath,
      _extraParams: options
    });

    this._ensureCompatibility();

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
  _infinityLoad() {
    if (this.get('_loadingMore') || !this.get('_canLoadMore')) {
      return;
    }

    return this._loadNextPage();
  },

  /**
   load the next page from the adapter and update the model

   @private
   @method _loadNextPage
   @return {Ember.RSVP.Promise} A Promise that resolves the model
   */
  _loadNextPage() {
    this.set('_loadingMore', true);

    return this._requestNextPage()
      .then((newObjects) => {
        return this._nextPageLoaded(newObjects);
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
  _requestNextPage() {
    const modelName   = this.get('_infinityModelName');
    const nextPage    = this.incrementProperty('currentPage');
    const params      = this._buildParams(nextPage);

    return this.get(this._store)[this._storeFindMethod](modelName, params).then(
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

    if(this.get('perPageParam')){
      pageParams[this.get('perPageParam')] = this.get('_perPage');
    }

    if(this.get('pageParam')){
      pageParams[this.get('pageParam')] = nextPage;
    }

    const params = objectAssign(pageParams, this.get('_extraParams'));

    const boundParams = this.get('_boundParams');
    if (!Ember.isEmpty(boundParams)) {
      Object.keys(boundParams).forEach(k => params[k] = this.get(boundParams[k]));
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

  _doUpdate(newObjects) {
    return this._infinityModel()
      .then((_infinityModel) => _infinityModel.pushObjects(newObjects.get('content')));
  },

  /**

   @method _nextPageLoaded
   @param {Ember.Enumerable} newObjects The new objects to add to the model
   @return {DS.RecordArray} returns the updated infinity model
   @private
   */
  _nextPageLoaded(newObjects) {
    const totalPages = newObjects.get(this.get('totalPagesParam'));
    this.set('_totalPages', totalPages);

    let updatePromise = RSVP.resolve(newObjects);

    if (this.get('_firstPageLoaded')) {
      if (typeof this.updateInfinityModel === 'function' &&
          (this.updateInfinityModel !==
           Ember.Object.extend(RouteMixin).create().updateInfinityModel)) {
        Ember.deprecate("EmberInfinity.updateInfinityModel is deprecated. "+
                        "Please use EmberInfinity.afterInfinityModel.",
                        false,
                        {id: 'ember-infinity.updateInfinityModel', until: '2.1'}
                       );

        updatePromise = updatePromise.then((newObjects) => this.updateInfinityModel(newObjects));
      } else {
        updatePromise = updatePromise.then((newObjects) => this._doUpdate(newObjects));
      }
    }

    return updatePromise
      .then((infinityModel) => {
        this.set('_firstPageLoaded', true);
        this._notifyInfinityModelUpdated(newObjects);

        const canLoadMore = this.get('_canLoadMore');
        infinityModel.set('reachedInfinity', !canLoadMore);

        if (!canLoadMore) {
          this._notifyInfinityModelLoaded();
        }

        return infinityModel;
      });
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

    Ember.run.scheduleOnce('afterRender', this, 'infinityModelUpdated', {
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
    Ember.run.scheduleOnce('afterRender', this, 'infinityModelLoaded', { totalPages: totalPages });
  }
});

export default RouteMixin;
