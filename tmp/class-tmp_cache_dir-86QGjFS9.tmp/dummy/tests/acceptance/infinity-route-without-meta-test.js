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
    visit('/');

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