define("ember-infinity", ["ember-infinity/index","exports"], function(__index__, __exports__) {
  "use strict";
  Object.keys(__index__).forEach(function(key){
    __exports__[key] = __index__[key];
  });
});

define('ember-infinity/components/infinity-loader', ['exports', 'ember', 'ember-infinity/templates/components/infinity-loader'], function (exports, Ember, layout) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    layout: layout['default'],
    classNames: ["infinity-loader"],
    classNameBindings: ["infinityModel.reachedInfinity"],
    guid: null,
    scrollDebounce: 10,
    loadMoreAction: 'infinityLoad',
    loadingText: 'Loading Infinite Model...',
    loadedText: 'Infinite Model Entirely Loaded.',
    destroyOnInfinity: false,
    developmentMode: false,
    scrollable: null,

    didInsertElement: function() {
      this._setupScrollable();
      this.set('guid', Ember['default'].guidFor(this));
      this._bindScroll();
      this._checkIfInView();
    },

    willDestroyElement: function() {
      this._unbindScroll();
    },

    _bindScroll: function() {
      var _this = this;
      this.get("scrollable").on("scroll."+this.get('guid'), function() {
        Ember['default'].run.debounce(_this, _this._checkIfInView, _this.get('scrollDebounce'));
      });
    },

    _unbindScroll: function() {
      this.get("scrollable").off("scroll."+this.get('guid'));
    },

    _checkIfInView: function() {
      var selfOffset       = this.$().offset().top;
      var scrollable       = this.get("scrollable");
      var scrollableBottom = scrollable.height() + scrollable.scrollTop();

      var inView = selfOffset < scrollableBottom ? true : false;

      if (inView && !this.get('developmentMode')) {
        this.sendAction('loadMoreAction');
      }
    },

    _setupScrollable: function() {
      var scrollable = this.get('scrollable');
      if (Ember['default'].$.type(scrollable) === 'string') {
        var items = Ember['default'].$(scrollable);
        if (items.length === 1) {
          this.set('scrollable', items.eq(0));
        } else if (items.length > 1) {
          throw new Error("Multiple scrollable elements found for: " + scrollable);
        } else {
          throw new Error("No scrollable element found for: " + scrollable);
        }
      } else {
        this.set('scrollable', Ember['default'].$(window));
      }
    },

    loadedStatusDidChange: Ember['default'].observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function() {
      if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) { this.destroy(); }
    })
  });

});
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
      @private
      @property _canLoadMore
      @type Boolean
      @default false
    */
    _canLoadMore: Ember['default'].computed('_totalPages', '_currentPage', function() {
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

      if (this.store === undefined){
        throw new Ember['default'].Error("Ember Data store is not available to infinityModel");
      } else if (modelName === undefined) {
        throw new Ember['default'].Error("You must pass a Model Name to infinityModel");
      }

      this.set('_infinityModelName', modelName);

      options = options ? Ember['default'].merge({}, options) : {};
      var startingPage = options.startingPage || 1;
      var perPage      = options.perPage || this.get('_perPage');
      var modelPath    = options.modelPath || this.get('_modelPath');

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

      promise.then(
        function(infinityModel) {
          var totalPages = infinityModel.get('meta.total_pages');
          _this.set('_currentPage', startingPage);
          _this.set('_totalPages', totalPages);
          infinityModel.set('reachedInfinity', !_this.get('_canLoadMore'));
          Ember['default'].run.scheduleOnce('afterRender', _this, 'infinityModelUpdated', { lastPageLoaded: startingPage, totalPages: totalPages, newObjects: infinityModel });
        },
        function() {
          throw new Ember['default'].Error("Could not fetch Infinity Model. Please check your serverside configuration.");
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

        var params = Ember['default'].merge({ page: nextPage, per_page: perPage }, this.get('_extraParams'));
        var promise = this.store.find(modelName, params);
        promise.then(
          function(infinityModel) {
            model.pushObjects(infinityModel.get('content'));
            _this.set('_loadingMore', false);
            _this.set('_currentPage', nextPage);
            Ember['default'].run.scheduleOnce('afterRender', _this, 'infinityModelUpdated', { lastPageLoaded: nextPage, totalPages: totalPages, newObjects: infinityModel });
            if (!_this.get('_canLoadMore')) {
              _this.set(_this.get('_modelPath') + '.reachedInfinity', true);
              Ember['default'].run.scheduleOnce('afterRender', _this, 'infinityModelLoaded', { totalPages: totalPages });
            }
          },
          function() {
            _this.set('_loadingMore', false);
            throw new Ember['default'].Error("You must pass a Model Name to infinityModel");
          }
        );
      } else {
        if (!this.get('_canLoadMore')) {
          this.set(this.get('_modelPath') + '.reachedInfinity', true);
          Ember['default'].run.scheduleOnce('afterRender', _this, 'infinityModelLoaded', { totalPages: totalPages });
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

});
define('ember-infinity/templates/components/infinity-loader', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
          content(env, morph0, context, "loadedText");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
          content(env, morph0, context, "loadingText");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "infinityModel.reachedInfinity")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});//# sourceMappingURL=addons.map