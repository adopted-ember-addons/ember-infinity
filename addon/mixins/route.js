import Ember from 'ember';

/**
  The Ember Infinity Route Mixin enables an application route to load paginated
  records for the route `model` as triggered by the controller (or Infinity Loader
  component).

  @class RouteMixin
  @namespace EmberInfinity
  @module ember-infinity/mixins/route
  @extends Ember.Mixin
*/
export default Ember.Mixin.create({

  /**
    @private
    @property _perPage
    @type Integer
    @default 25
  */
  _perPage: 25,

  /**
    @private
    @property _extraParams
    @type Object
    @default {}
  */
  _extraParams: {},

  /**
    @private
    @property _loadingMore
    @type Boolean
    @default false
  */
  _loadingMore: false,

  /**
    @private
    @property _minId
    @type Integer
    @default 0
  */
  _minId: 0,

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
   * name of the "page" param in the
   * resource request payload
   * @type {string}
   * @default "min_id"
   */
  minIdParam: 'min_id',

  /**
    @private
    @property _canLoadMore
    @type Boolean
    @default true 
  */
  _canLoadMore: true,

  /**
    Use the infinityModel method in the place of `this.store.find('model')` to
    initialize the Infinity Model for your route.

    @method infinityModel
    @param {String} modelName The name of the model.
    @param {Object} options Optional, the perPage and startingPage to load from.
    @return {Ember.RSVP.Promise}
  */
  infinityModel(modelName, options) {
    if (Ember.isEmpty(this.store) || Ember.isEmpty(this.store.find)){
      throw new Ember.Error("Ember Data store is not available to infinityModel");
    } else if (modelName === undefined) {
      throw new Ember.Error("You must pass a Model Name to infinityModel");
    }

    this.set('_infinityModelName', modelName);

    options = options ? Ember.merge({}, options) : {};
    var perPage      = options.perPage || this.get('_perPage');
    var modelPath    = options.modelPath || this.get('_modelPath');

    delete options.perPage;
    delete options.modelPath;

    this.set('_perPage', perPage);
    this.set('_modelPath', modelPath);
    this.set('_extraParams', options);

    var requestPayloadBase = {};
    requestPayloadBase[this.get('perPageParam')] = perPage;

    var params = Ember.merge(requestPayloadBase, options);
    var promise = this.store.find(modelName, params);

    promise.then(
      infinityModel => {
        this.set('_minId', infinityModel.get('lastObject.id'));
        infinityModel.set('reachedInfinity', !this.get('_canLoadMore'));
        Ember.run.scheduleOnce('afterRender', this, 'infinityModelUpdated', {
          minIdLastLoaded: this.get('_minId'),
          newObjects: infinityModel
        });
      },
      () => {
        throw new Ember.Error("Could not fetch Infinity Model. Please check your serverside configuration.");
      }
    );

    return promise;
  },

  /**
   Trigger a load of the next page of results.

   @method infinityLoad
   @return {Boolean}
   */
  _infinityLoad() {
    var minId       = this.get('_minId');
    var perPage     = this.get('_perPage');
    var model       = this.get(this.get('_modelPath'));
    var modelName   = this.get('_infinityModelName');

    if (!this.get('_loadingMore') && this.get('_canLoadMore')) {
      this.set('_loadingMore', true);

      var requestPayloadBase = {};
      requestPayloadBase[this.get('perPageParam')] = perPage;
      requestPayloadBase[this.get('minIdParam')] = minId;

      var params = Ember.merge(requestPayloadBase, this.get('_extraParams'));
      var promise = this.store.find(modelName, params);

      promise.then(
        infinityModel => {
          model.pushObjects(infinityModel.get('content'));
          this.set('_loadingMore', false);

          if(infinityModel.get('length')) {
            this.set('_minId', infinityModel.get('lastObject.id'));
          } else {
            this.set('_canLoadMore', false);
          }
          Ember.run.scheduleOnce('afterRender', this, 'infinityModelUpdated', {
            minIdLastLoaded: minId,
            newObjects: infinityModel
          });
          
          if (!this.get('_canLoadMore')) {
            this.set(this.get('_modelPath') + '.reachedInfinity', true);
            Ember.run.scheduleOnce('afterRender', this, 'infinityModelLoaded', {
              minIdLastLoaded: minId
            });
          }
        },
        () => {
          this.set('_loadingMore', false);
          throw new Ember.Error("Could not fetch Infinity Model. Please check your serverside configuration.");
        }
      );
    } else {
      if (!this.get('_canLoadMore')) {
        this.set(this.get('_modelPath') + '.reachedInfinity', true);
        Ember.run.scheduleOnce('afterRender', this, 'infinityModelLoaded', { 
          minIdLastLoaded: minId
        });
      }
    }
    return false;
  },

  actions: {
    infinityLoad() {
      this._infinityLoad();
    }
  }
});
