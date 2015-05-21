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
    @property _currentPage
    @type Integer
    @default 0
  */
  _currentPage: 0,

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
    @private
    @property _canLoadMore
    @type Boolean
    @default false
  */
  _canLoadMore: Ember.computed('_totalPages', '_currentPage', function() {
    var totalPages  = this.get('_totalPages');
    var currentPage = this.get('_currentPage');
    return totalPages && currentPage ? currentPage < totalPages : false;
  }),

  /**
    Use the infinityModel method in the place of `this.store.find('model')` to
    initialize the Infinity Model for your route.

    @method infinityModel
    @param {String} modelName The name of the model.
    @param {Object} options Optional, the perPage and startingPage to load from.
    @return {Ember.RSVP.Promise}
  */
  infinityModel: function(modelName, options) {
    var _this = this;

    if (Ember.isEmpty(this.store) || Ember.isEmpty(this.store.find)){
      throw new Ember.Error("Ember Data store is not available to infinityModel");
    } else if (modelName === undefined) {
      throw new Ember.Error("You must pass a Model Name to infinityModel");
    }

    this.set('_infinityModelName', modelName);

    options = options ? Ember.merge({}, options) : {};
    var startingPage = options.startingPage || 1;
    var perPage      = options.perPage || this.get('_perPage');
    var modelPath    = options.modelPath || this.get('_modelPath');

    delete options.startingPage;
    delete options.perPage;
    delete options.modelPath;

    this.set('_perPage', perPage);
    this.set('_modelPath', modelPath);
    this.set('_extraParams', options);

    var params = Ember.merge({ page: startingPage, per_page: perPage }, options);
    var promise = this.store.find(modelName, params);

    promise.then(
      function(infinityModel) {
        var totalPages = infinityModel.get('meta.total_pages');
        _this.set('_currentPage', startingPage);
        _this.set('_totalPages', totalPages);
        infinityModel.set('reachedInfinity', !_this.get('_canLoadMore'));
        Ember.run.scheduleOnce('afterRender', _this, 'infinityModelUpdated', { lastPageLoaded: startingPage, totalPages: totalPages, newObjects: infinityModel });
      },
      function() {
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
  _infinityLoad: function() {
    var _this       = this;
    var nextPage    = this.get('_currentPage') + 1;
    var perPage     = this.get('_perPage');
    var totalPages  = this.get('_totalPages');
    var model       = this.get(this.get('_modelPath'));
    var modelName   = this.get('_infinityModelName');

    if (!this.get('_loadingMore') && this.get('_canLoadMore')) {
      this.set('_loadingMore', true);

      var params = Ember.merge({ page: nextPage, per_page: perPage }, this.get('_extraParams'));
      var promise = this.store.find(modelName, params);
      promise.then(
        function(infinityModel) {
          model.pushObjects(infinityModel.get('content'));
          _this.set('_loadingMore', false);
          _this.set('_currentPage', nextPage);
          Ember.run.scheduleOnce('afterRender', _this, 'infinityModelUpdated', { lastPageLoaded: nextPage, totalPages: totalPages, newObjects: infinityModel });
          if (!_this.get('_canLoadMore')) {
            _this.set(_this.get('_modelPath') + '.reachedInfinity', true);
            Ember.run.scheduleOnce('afterRender', _this, 'infinityModelLoaded', { totalPages: totalPages });
          }
        },
        function() {
          _this.set('_loadingMore', false);
          throw new Ember.Error("You must pass a Model Name to infinityModel");
        }
      );
    } else {
      if (!this.get('_canLoadMore')) {
        this.set(this.get('_modelPath') + '.reachedInfinity', true);
        Ember.run.scheduleOnce('afterRender', _this, 'infinityModelLoaded', { totalPages: totalPages });
      }
    }
    return false;
  },

  actions: {
    infinityLoad: function() {
      this._infinityLoad();
    }
  }
});
