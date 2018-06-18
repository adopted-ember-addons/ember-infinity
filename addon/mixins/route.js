import { readOnly } from '@ember/object/computed';
import EmberError from '@ember/error';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import BoundParamsMixin from 'ember-infinity/mixins/bound-params';
import Mixin from '@ember/object/mixin';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
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

  infinity: service(),

  _infinityModels: readOnly('infinity.infinityModels'),

  // these are here for backwards compat
  _infinityModel: computed('_infinityModels.[]', '_infinityModels', function() {
    return get(this, '_infinityModels.firstObject');
  }).readOnly(),
  currentPage: readOnly('_infinityModel.currentPage'),

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
      let matchingInfinityModel = get(this, '_infinityModels').find(model => model === infinityModel);
      if (matchingInfinityModel) {
        set(matchingInfinityModel, '_increment', increment);
        get(this, 'infinity')['infinityLoad'](matchingInfinityModel, increment);
      } else {
        return true;
      }
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
    deprecate('Ember Infinity: Route Mixin will be deprecated in the future. We have implemented a Service-Component interaction as shown in the docs.', false, {
      id: 'ember-infinity',
      until: '1.1.0'
    });

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

    let service = get(this, 'infinity');
    if (!get(service, 'infinityModels')) {
      set(service, 'infinityModels', A());
    }

    options = options ? objectAssign({}, options) : {};

    if (options.store) {
      get(this, 'infinity._ensureCustomStoreCompatibility')(options, options.store, options.storeFindMethod || 'query');
    }

    set(service, 'infinityModelLoaded', get(this, 'infinityModelLoaded'));
    set(service, 'afterInfinityModel', get(this, 'afterInfinityModel'));

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
      _infinityModelName: modelName,
      store,
      storeFindMethod,
      extraParams: options,
      content: A()
    };

    if (didPassBoundParams) {
      initParams._deprecatedBoundParams = boundParams;
      initParams.route = this;
    }

    const infinityModel = InfinityModelFactory.create(initParams);
    get(this, 'infinity._ensureCompatibility')(get(infinityModel, 'store'), get(infinityModel, 'storeFindMethod'));
    get(this, 'infinity.infinityModels').pushObject(infinityModel);

    return InfinityPromiseArray.create({ promise: service['loadNextPage'](infinityModel) });
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
  }
});

export default RouteMixin;
