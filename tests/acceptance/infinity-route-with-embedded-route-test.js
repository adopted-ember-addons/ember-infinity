import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Pretender from 'pretender';

var App, server;

var posts = [
  { id: 1, name: "Squarepusher", category: "a" },
  { id: 2, name: "Aphex Twin", category: "b" },
  { id: 3, name: "Universal Indicator", category: "a" },
  { id: 4, name: "Mike & Rich", category: "b" },
  { id: 5, name: "Alroy Road Tracks", category: "a" },
  { id: 6, name: "AFX", category: "b" }
];

module('Acceptance: Infinity Route', {
  setup() {
    App = startApp();
    server = new Pretender(function() {
      this.get('/posts', function(request) {
        var body, subset, perPage, startPage, offset;

        if (request.queryParams.category) {
          subset = posts.filter(post => {
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

        return [200, {"Content-Type": "application/json"}, JSON.stringify(body)];
      });
    });
  },
  teardown() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

test('it works when embedded route is refreshed', assert => {
  visit('/posts/1');
  click('button.refreshRoute');

  andThen(() => {
    assert.equal(find('ul').find('li').length, 2);

    var testList = find('ul');
    testList.scrollTop(2000);
    triggerEvent('ul', 'scroll');

    andThen(() => {
      assert.equal(find('ul').find('li').length > 2, true);
    });
  });
});
