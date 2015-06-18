/* jshint ignore:start */

/* jshint ignore:end */

define('dummy/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'dummy/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('dummy/components/infinity-loader', ['exports', 'ember-infinity/components/infinity-loader'], function (exports, infinityLoader) {

	'use strict';

	exports['default'] = infinityLoader['default'];

});
define('dummy/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('dummy/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('dummy/ember-infinity/tests/modules/ember-infinity/components/infinity-loader.jshint', function () {

  'use strict';

  module('JSHint - modules/ember-infinity/components');
  test('modules/ember-infinity/components/infinity-loader.js should pass jshint', function () {
    ok(true, 'modules/ember-infinity/components/infinity-loader.js should pass jshint.');
  });

});
define('dummy/ember-infinity/tests/modules/ember-infinity/mixins/route.jshint', function () {

  'use strict';

  module('JSHint - modules/ember-infinity/mixins');
  test('modules/ember-infinity/mixins/route.js should pass jshint', function () {
    ok(true, 'modules/ember-infinity/mixins/route.js should pass jshint.');
  });

});
define('dummy/initializers/app-version', ['exports', 'dummy/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('dummy/initializers/ember-faker', ['exports'], function (exports) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {}

  ;

  exports['default'] = {
    name: 'ember-faker',
    initialize: initialize
  };
  /* container, application */
  // application.inject('route', 'foo', 'service:foo');

});
define('dummy/initializers/export-application-global', ['exports', 'ember', 'dummy/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('dummy/models/post', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr('string'),
    category: DS['default'].attr('string')
  });

});
define('dummy/router', ['exports', 'ember', 'dummy/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route('demo', { path: '/' });
    this.route('home', { path: 'test' });
    this.route('category', { path: '/category/:category' });
  });

  exports['default'] = Router;

});
define('dummy/routes/category', ['exports', 'ember', 'ember-infinity/mixins/route'], function (exports, Ember, InfinityRoute) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
    model: function model(params) {
      return this.infinityModel('post', { category: params.category,
        perPage: 2 });
    }
  });

});
define('dummy/routes/demo', ['exports', 'ember', 'ember-infinity/mixins/route', 'pretender', 'faker'], function (exports, Ember, InfinityRoute, Pretender, faker) {

  'use strict';

  function generateFakeData(qty) {
    var data = [];
    for (var i = 0; i < qty; i++) {
      data.push({ id: i, name: faker['default'].company.companyName() });
    }
    return data;
  }

  exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
    init: function init() {
      this._super.apply(this, arguments);
      var fakeData = generateFakeData(104);
      this.set('pretender', new Pretender['default']());
      this.get('pretender').get('/posts', function (request) {
        var queryParams = request.queryParams;
        var fd = fakeData;
        var page = parseInt(request.queryParams.page, 10);
        var per = parseInt(request.queryParams.per_page, 10);
        var payload = {
          posts: fd.slice((page - 1) * per, Math.min(page * per, fd.length)),
          meta: {
            total_pages: Math.ceil(fd.length / per)
          }
        };
        return [200, {}, JSON.stringify(payload)];
      }, 500 /*ms*/);
    },

    tearDownPretender: Ember['default'].observer('deactivate', function () {
      this.set('pretender', undefined);
    }),

    model: function model() {
      return this.infinityModel('post');
    }
  });

});
define('dummy/routes/home', ['exports', 'ember', 'ember-infinity/mixins/route'], function (exports, Ember, InfinityRoute) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
    model: function model() {
      return this.infinityModel('post');
    }
  });

});
define('dummy/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
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
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('dummy/templates/category', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
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
          set(env, context, "item", blockArguments[0]);
          content(env, morph0, context, "item.name");
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
        var el1 = dom.createElement("h2");
        dom.setAttribute(el1,"id","posts-title");
        var el2 = dom.createTextNode("Listing Posts using Parameters");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","test-list");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
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
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2]),0,-1);
        var morph1 = dom.createMorphAt(fragment,3,4,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "model")], {}, child0, null);
        inline(env, morph1, context, "infinity-loader", [], {"infinityModel": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('dummy/templates/demo', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode(". ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
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
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,-1,0);
          var morph1 = dom.createMorphAt(element0,0,-1);
          set(env, context, "item", blockArguments[0]);
          content(env, morph0, context, "item.id");
          content(env, morph1, context, "item.name");
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
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","demo-view");
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","fixed-to-top jumbo-header text-center");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"href","https://github.com/hhff/ember-infinity");
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"style","position: absolute; top: 0; right: 0; border: 0;");
        dom.setAttribute(el3,"src","https://camo.githubusercontent.com/52760788cde945287fbb584134c4cbc2bc36f904/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67");
        dom.setAttribute(el3,"alt","Fork me on GitHub");
        dom.setAttribute(el3,"data-canonical-src","https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        dom.setAttribute(el2,"id","title");
        var el3 = dom.createTextNode("ember-infinity");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","demo-items");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
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
        var element1 = dom.childAt(fragment, [3]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element1,1,2);
        block(env, morph0, context, "each", [get(env, context, "content")], {}, child0, null);
        inline(env, morph1, context, "infinity-loader", [], {"infinityModel": get(env, context, "content"), "loadingText": "Loading more awesome records...", "loadedText": "Loaded all the records!"});
        return fragment;
      }
    };
  }()));

});
define('dummy/templates/home', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
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
          set(env, context, "post", blockArguments[0]);
          content(env, morph0, context, "post.name");
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
        var el1 = dom.createElement("h2");
        dom.setAttribute(el1,"id","posts-title");
        var el2 = dom.createTextNode("Listing Posts");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","test-list");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
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
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2]),0,-1);
        var morph1 = dom.createMorphAt(fragment,3,4,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "model")], {}, child0, null);
        inline(env, morph1, context, "infinity-loader", [], {"infinityModel": get(env, context, "model")});
        return fragment;
      }
    };
  }()));

});
define('dummy/tests/acceptance/infinity-route-with-meta-test', ['ember', 'qunit', 'dummy/tests/helpers/start-app', 'pretender'], function (Ember, qunit, startApp, Pretender) {

  'use strict';

  var App, server;

  var posts = [{ id: 1, name: 'Squarepusher', category: 'a' }, { id: 2, name: 'Aphex Twin', category: 'b' }, { id: 3, name: 'Universal Indicator', category: 'a' }, { id: 4, name: 'Mike & Rich', category: 'b' }, { id: 5, name: 'Alroy Road Tracks', category: 'a' }, { id: 6, name: 'AFX', category: 'b' }];

  qunit.module('Acceptance: Infinity Route', {
    setup: function setup() {
      App = startApp['default']();
      server = new Pretender['default'](function () {
        this.get('/posts', function (request) {
          var body, subset, perPage, startPage, offset;

          if (request.queryParams.category) {
            subset = posts.filter(function (post) {
              return post.category === request.queryParams.category;
            });
          } else {
            subset = posts;
          }
          perPage = parseInt(request.queryParams.per_page, 10);
          startPage = parseInt(request.queryParams.page, 10);

          var pageCount = Math.ceil(subset.length / perPage);
          offset = perPage * (startPage - 1);
          subset = subset.slice(offset, offset + perPage);

          body = { posts: subset, meta: { total_pages: pageCount } };

          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(body)];
        });
      });
    },
    teardown: function teardown() {
      Ember['default'].run(App, 'destroy');
      server.shutdown();
    }
  });

  qunit.test('it works when meta is present in payload', function (assert) {
    visit('/test');

    andThen(function () {
      var postsTitle = find('#posts-title');
      var postList = find('ul');
      var infinityLoader = find('.infinity-loader');

      assert.equal(postsTitle.text(), 'Listing Posts');
      assert.equal(postList.find('li').length, 6);
      assert.equal(infinityLoader.hasClass('reached-infinity'), true);
    });
  });

  qunit.test('it works with parameters', function (assert) {
    visit('/category/a?per_page=2');

    andThen(function () {
      var postsTitle = find('#posts-title');
      var postList = find('ul');
      var infinityLoader = find('.infinity-loader');

      assert.equal(postsTitle.text(), 'Listing Posts using Parameters', 'Post title text is correct');
      assert.equal(postList.find('li').length, 2, 'Two items should be in the list');
      assert.equal(postList.find('li:first-child').text(), 'Squarepusher', 'First item should be \'Squarepusher\'');
      assert.equal(infinityLoader.hasClass('reached-infinity'), false, 'Infinity should not yet have been reached');
    });
  });

});
define('dummy/tests/acceptance/infinity-route-with-meta-test.jshint', function () {

  'use strict';

  module('JSHint - acceptance');
  test('acceptance/infinity-route-with-meta-test.js should pass jshint', function() { 
    ok(true, 'acceptance/infinity-route-with-meta-test.js should pass jshint.'); 
  });

});
define('dummy/tests/acceptance/infinity-route-without-meta-test', ['ember', 'qunit', 'dummy/tests/helpers/start-app', 'pretender'], function (Ember, qunit, startApp, Pretender) {

  'use strict';

  var App, server;

  qunit.module('Acceptance: Infinity Route', {
    setup: function setup() {
      App = startApp['default']();
      server = new Pretender['default'](function () {
        this.get('/posts', function (request) {
          var posts = [{ id: 1, name: 'Squarepusher' }, { id: 2, name: 'Aphex Twin' }];
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ posts: posts })];
        });
      });
    },
    teardown: function teardown() {
      Ember['default'].run(App, 'destroy');
      server.shutdown();
    }
  });

  qunit.test('it works when meta is not present in payload', function (assert) {
    visit('/test');

    andThen(function () {
      var postsTitle = find('#posts-title');
      var postList = find('ul');
      var infinityLoader = find('.infinity-loader');

      assert.equal(postsTitle.text(), 'Listing Posts');
      assert.equal(postList.find('li').length, 2);
      assert.equal(infinityLoader.hasClass('reached-infinity'), true);
    });
  });

});
define('dummy/tests/acceptance/infinity-route-without-meta-test.jshint', function () {

  'use strict';

  module('JSHint - acceptance');
  test('acceptance/infinity-route-without-meta-test.js should pass jshint', function() { 
    ok(true, 'acceptance/infinity-route-without-meta-test.js should pass jshint.'); 
  });

});
define('dummy/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('dummy/tests/helpers/resolver', ['exports', 'ember/resolver', 'dummy/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('dummy/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('dummy/tests/helpers/start-app', ['exports', 'ember', 'dummy/app', 'dummy/router', 'dummy/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('dummy/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('dummy/tests/models/post.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/post.js should pass jshint', function() { 
    ok(true, 'models/post.js should pass jshint.'); 
  });

});
define('dummy/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('dummy/tests/routes/category.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/category.js should pass jshint', function() { 
    ok(true, 'routes/category.js should pass jshint.'); 
  });

});
define('dummy/tests/routes/demo.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/demo.js should pass jshint', function() { 
    ok(true, 'routes/demo.js should pass jshint.'); 
  });

});
define('dummy/tests/routes/home.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/home.js should pass jshint', function() { 
    ok(true, 'routes/home.js should pass jshint.'); 
  });

});
define('dummy/tests/test-helper', ['dummy/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('dummy/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('dummy/tests/unit/components/infinity-loader-test', ['ember-qunit', 'ember', 'jquery'], function (ember_qunit, Ember, $) {

  'use strict';

  ember_qunit.moduleForComponent('infinity-loader');

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    var component = this.subject();
    assert.equal(component._state, 'preRender');
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  ember_qunit.test('it will not destroy on load unless set', function (assert) {
    assert.expect(3);

    var infinityModelStub = [{ id: 1, name: 'Tomato' }, { id: 2, name: 'Potato' }];

    var component = this.subject();
    component.set('infinityModel', infinityModelStub);
    this.render();

    assert.equal(component.get('destroyOnInfinity'), false);

    Ember['default'].run(function () {
      component.set('infinityModel.reachedInfinity', true);
    });

    assert.equal(component._state, 'inDOM');

    Ember['default'].run(function () {
      component.set('destroyOnInfinity', true);
    });

    assert.equal(component._state, 'destroying');
  });

  ember_qunit.test('it changes text property', function (assert) {
    assert.expect(2);

    var infinityModelStub = [{ id: 1, name: 'Tomato' }, { id: 2, name: 'Potato' }];

    var componentText;
    var component = this.subject();
    component.set('infinityModel', infinityModelStub);
    this.render();

    componentText = $['default'].trim(component.$().text());
    assert.equal(componentText, 'Loading Infinite Model...');

    Ember['default'].run(function () {
      component.set('infinityModel.reachedInfinity', true);
    });

    componentText = $['default'].trim(component.$().text());
    assert.equal(componentText, 'Infinite Model Entirely Loaded.');
  });

  ember_qunit.test('it uses the window as the scrollable element', function (assert) {
    assert.expect(1);
    var component = this.subject();
    this.render();
    var scrollable = component.get('scrollable');
    assert.equal(scrollable[0], window);
  });

  ember_qunit.test('it uses the provided scrollable element', function (assert) {
    assert.expect(1);
    $['default'](document.body).append('<div id=\'content\'/>');
    var component = this.subject({ scrollable: '#content' });
    this.render();
    var scrollable = component.get('scrollable');
    assert.equal(scrollable[0], $['default']('#content')[0]);
  });

  ember_qunit.test('it throws error when scrollable element is not found', function (assert) {
    assert.expect(1);
    var component = this.subject({ scrollable: '#notfound' });
    assert.throws(function () {
      this.render();
    }, Error, 'Should raise error');
  });

  ember_qunit.test('it throws error when multiple scrollable elements are found', function (assert) {
    assert.expect(1);
    $['default'](document.body).append('<div/><div/>');
    var component = this.subject({ scrollable: 'div' });
    assert.throws(function () {
      this.render();
    }, Error, 'Should raise error');
  });

});
define('dummy/tests/unit/components/infinity-loader-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/infinity-loader-test.js should pass jshint', function() { 
    ok(true, 'unit/components/infinity-loader-test.js should pass jshint.'); 
  });

});
define('dummy/tests/unit/mixins/route-test', ['ember', 'ember-infinity/mixins/route', 'qunit'], function (Ember, RouteMixin, qunit) {

  'use strict';

  qunit.module('RouteMixin');

  qunit.test('it works', function (assert) {
    var RouteObject = Ember['default'].Route.extend(RouteMixin['default']);
    var route = RouteObject.create();
    assert.ok(route);
  });

  qunit.test('it can not use infinityModel without Ember Data Store', function (assert) {
    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      model: function model() {
        return this.infinityModel('post');
      }
    });
    var route = RouteObject.create();

    var infinityError;
    try {
      route.model();
    } catch (error) {
      infinityError = error;
    }

    assert.ok(infinityError instanceof Error);
    assert.equal(infinityError.message, 'Ember Data store is not available to infinityModel');
  });

  qunit.test('it can not use infinityModel without a Model Name', function (assert) {
    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      model: function model() {
        return this.infinityModel();
      }
    });
    var route = RouteObject.create();
    route.store = {
      find: function find() {}
    };

    var infinityError;
    try {
      route.model();
    } catch (error) {
      infinityError = error;
    }

    assert.ok(infinityError instanceof Error);
    assert.equal(infinityError.message, 'You must pass a Model Name to infinityModel');
  });

  qunit.test('it sets state before it reaches the end', function (assert) {

    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      model: function model() {
        return this.infinityModel('item');
      }
    });
    var route = RouteObject.create();

    var dummyStore = {
      find: function find() {
        var _this = this;

        return new Ember['default'].RSVP.Promise(function (resolve) {
          Ember['default'].run(_this, resolve, Ember['default'].Object.create({
            items: [{ id: 1, name: 'Test' }],
            meta: {
              total_pages: 31
            }
          }));
        });
      }
    };

    route.store = dummyStore;

    var model;
    Ember['default'].run(function () {
      route.model().then(function (result) {
        model = result;
      });
    });

    assert.equal(31, route.get('_totalPages'));
    assert.equal(1, route.get('_currentPage'));
    assert.equal(true, route.get('_canLoadMore'));
    assert.ok(Ember['default'].$.isEmptyObject(route.get('_extraParams')));
    assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
  });

  qunit.test('it allows customizations of request params', function (assert) {
    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      perPageParam: 'per',
      pageParam: 'p',
      model: function model() {
        return this.infinityModel('item');
      }
    });
    var route = RouteObject.create();

    var dummyStore = {
      find: function find(modelType, findQuery) {
        var _this2 = this;

        assert.deepEqual(findQuery, { per: 25, p: 1 });
        return new Ember['default'].RSVP.Promise(function (resolve) {
          Ember['default'].run(_this2, resolve, Ember['default'].Object.create({
            items: []
          }));
        });
      }
    };

    route.store = dummyStore;

    var model;
    Ember['default'].run(function () {
      route.model().then(function (result) {
        model = result;
      });
    });
  });

  qunit.test('it allows customizations of meta parsing params', function (assert) {
    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      totalPagesParam: 'pagination.total',
      model: function model() {
        return this.infinityModel('item');
      }
    });
    var route = RouteObject.create();

    var dummyStore = {
      find: function find(modelType, findQuery) {
        var _this3 = this;

        return new Ember['default'].RSVP.Promise(function (resolve) {
          Ember['default'].run(_this3, resolve, Ember['default'].Object.create({
            items: [{ id: 1, name: 'Walter White' }],
            pagination: {
              total: 22
            }
          }));
        });
      }
    };

    route.store = dummyStore;

    var model;
    Ember['default'].run(function () {
      route.model().then(function (result) {
        model = result;
      });
    });

    assert.equal(22, route.get('_totalPages'));
  });

  qunit.test('it sets state  when it reaches the end', function (assert) {

    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      model: function model() {
        return this.infinityModel('item', { startingPage: 31 });
      }
    });
    var route = RouteObject.create();

    var dummyStore = {
      find: function find() {
        var _this4 = this;

        return new Ember['default'].RSVP.Promise(function (resolve) {
          Ember['default'].run(_this4, resolve, Ember['default'].Object.create({
            items: [{ id: 1, name: 'Test' }],
            meta: {
              total_pages: 31
            }
          }));
        });
      }
    };

    route.store = dummyStore;

    var model;
    Ember['default'].run(function () {
      route.model().then(function (result) {
        model = result;
      });
    });

    assert.equal(31, route.get('_totalPages'));
    assert.equal(31, route.get('_currentPage'));
    assert.ok(Ember['default'].$.isEmptyObject(route.get('_extraParams')));
    assert.equal(false, route.get('_canLoadMore'));
    assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
  });

  qunit.test('it uses extra params when loading more data', function (assert) {

    assert.expect(8);

    var RouteObject = Ember['default'].Route.extend(RouteMixin['default'], {
      model: function model() {
        return this.infinityModel('item', { extra: 'param' });
      }
    });
    var route = RouteObject.create();

    var dummyStore = {
      find: function find(name, params) {
        var _this5 = this;

        assert.equal('param', params.extra);
        return new Ember['default'].RSVP.Promise(function (resolve) {
          Ember['default'].run(_this5, resolve, Ember['default'].Object.create({
            items: [{ id: 1, name: 'Test' }],
            pushObjects: Ember['default'].K,
            meta: {
              total_pages: 2
            }
          }));
        });
      }
    };

    route.store = dummyStore;

    var model;
    Ember['default'].run(function () {
      route.model().then(function (result) {
        model = result;
      });
    });

    // The controller needs to be set so _infinityLoad() can call
    // pushObjects()
    var dummyController = Ember['default'].Object.create({
      model: model
    });
    route.set('controller', dummyController);

    assert.equal('param', route.get('_extraParams.extra'));
    assert.equal(true, route.get('_canLoadMore'));

    // Load more
    Ember['default'].run(function () {
      route._infinityLoad();
    });

    assert.equal('param', route.get('_extraParams.extra'));
    assert.equal(false, route.get('_canLoadMore'));
    assert.equal(2, route.get('_currentPage'));
    assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
  });

});
define('dummy/tests/unit/mixins/route-test.jshint', function () {

  'use strict';

  module('JSHint - unit/mixins');
  test('unit/mixins/route-test.js should pass jshint', function() { 
    ok(true, 'unit/mixins/route-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('dummy/config/environment', ['ember'], function(Ember) {
  var prefix = 'dummy';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("dummy/tests/test-helper");
} else {
  require("dummy/app")["default"].create({"name":"ember-infinity","version":"0.0.9.d34dcad7"});
}

/* jshint ignore:end */
//# sourceMappingURL=dummy.map