define('ember-infinity/mixins/route', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({

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
     * @default  "meta.total_pages"
     */
    totalPagesParam: 'meta.total_pages',

    /**
      @private
      @property _canLoadMore
      @type Boolean
      @default false
    */
    _canLoadMore: Ember['default'].computed('_totalPages', '_currentPage', function () {
      var totalPages = this.get('_totalPages');
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
    infinityModel: function infinityModel(modelName, options) {
      var _this = this;

      if (Ember['default'].isEmpty(this.store) || Ember['default'].isEmpty(this.store.find)) {
        throw new Ember['default'].Error('Ember Data store is not available to infinityModel');
      } else if (modelName === undefined) {
        throw new Ember['default'].Error('You must pass a Model Name to infinityModel');
      }

      this.set('_infinityModelName', modelName);

      options = options ? Ember['default'].merge({}, options) : {};
      var startingPage = options.startingPage || 1;
      var perPage = options.perPage || this.get('_perPage');
      var modelPath = options.modelPath || this.get('_modelPath');

      delete options.startingPage;
      delete options.perPage;
      delete options.modelPath;

      this.set('_perPage', perPage);
      this.set('_modelPath', modelPath);
      this.set('_extraParams', options);

      var requestPayloadBase = {};
      requestPayloadBase[this.get('perPageParam')] = perPage;
      requestPayloadBase[this.get('pageParam')] = startingPage;

      var params = Ember['default'].merge(requestPayloadBase, options);
      var promise = this.store.find(modelName, params);

      promise.then(function (infinityModel) {
        var totalPages = infinityModel.get(_this.get('totalPagesParam'));
        _this.set('_currentPage', startingPage);
        _this.set('_totalPages', totalPages);
        infinityModel.set('reachedInfinity', !_this.get('_canLoadMore'));
        Ember['default'].run.scheduleOnce('afterRender', _this, 'infinityModelUpdated', {
          lastPageLoaded: startingPage,
          totalPages: totalPages,
          newObjects: infinityModel
        });
      }, function () {
        throw new Ember['default'].Error('Could not fetch Infinity Model. Please check your serverside configuration.');
      });

      return promise;
    },

    /**
     Trigger a load of the next page of results.
      @method infinityLoad
     @return {Boolean}
     */
    _infinityLoad: function _infinityLoad() {
      var _this2 = this;

      var nextPage = this.get('_currentPage') + 1;
      var perPage = this.get('_perPage');
      var totalPages = this.get('_totalPages');
      var model = this.get(this.get('_modelPath'));
      var modelName = this.get('_infinityModelName');

      if (!this.get('_loadingMore') && this.get('_canLoadMore')) {
        this.set('_loadingMore', true);

        var params = Ember['default'].merge({ page: nextPage, per_page: perPage }, this.get('_extraParams'));
        var promise = this.store.find(modelName, params);

        promise.then(function (infinityModel) {
          model.pushObjects(infinityModel.get('content'));
          _this2.set('_loadingMore', false);
          _this2.set('_currentPage', nextPage);
          Ember['default'].run.scheduleOnce('afterRender', _this2, 'infinityModelUpdated', {
            lastPageLoaded: nextPage,
            totalPages: totalPages,
            newObjects: infinityModel
          });
          if (!_this2.get('_canLoadMore')) {
            _this2.set(_this2.get('_modelPath') + '.reachedInfinity', true);
            Ember['default'].run.scheduleOnce('afterRender', _this2, 'infinityModelLoaded', {
              totalPages: totalPages
            });
          }
        }, function () {
          _this2.set('_loadingMore', false);
          throw new Ember['default'].Error('You must pass a Model Name to infinityModel');
        });
      } else {
        if (!this.get('_canLoadMore')) {
          this.set(this.get('_modelPath') + '.reachedInfinity', true);
          Ember['default'].run.scheduleOnce('afterRender', this, 'infinityModelLoaded', { totalPages: totalPages });
        }
      }
      return false;
    },

    actions: {
      infinityLoad: function infinityLoad() {
        this._infinityLoad();
      }
    }
  });

});