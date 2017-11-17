import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import Pretender from 'pretender';
import faker from 'faker';

let server;

moduleForAcceptance('Acceptance: Infinity Route - offset trigger', {
  beforeEach() {
    var posts = [];

    for (var i = 0; i < 50; i++) {
      posts.push({id: i, name: faker.company.companyName()});
    }

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
  afterEach() {
    server.shutdown();
  }
});

function postList() {
  return find('ul');
}

function infinityLoader() {
  return find('.infinity-loader');
}

function triggerOffset() {
  let { top } = document.getElementsByClassName('infinity-loader')[0].getBoundingClientRect()
  return top - Ember.$(window).height();
}

function shouldBeItemsOnTheList(assert, amount) {
  assert.equal(postList().find('li').length, amount, `${amount} items should be in the list`);
}

function scrollTo(offset) {
  postList().scrollTop(offset);
}

function infinityShouldNotBeReached(assert) {
  assert.equal(infinityLoader().hasClass('reached-infinity'), false, "Infinity should not yet have been reached");
  assert.equal(find('span').text(), 'loading');
}

function infinityShouldBeReached(assert) {
  assert.equal(infinityLoader().hasClass('reached-infinity'), true, "Infinity should have been reached");
  assert.equal(find('span').text(), 'loaded');
}

test('it should start loading more items when the scroll is on the very bottom ' +
  'when triggerOffset is not set', function(assert) {
  visit('/test-scrollable');

  andThen(() => {
    shouldBeItemsOnTheList(assert, 25);
    infinityShouldNotBeReached(assert);
    scrollTo(triggerOffset() - 100);
  });

  triggerEvent('ul', 'scroll');

  andThen(() => {
    shouldBeItemsOnTheList(assert, 25);
    document.getElementsByClassName('infinity-loader')[0].scrollIntoView();
  });

  triggerEvent('ul', 'scroll');

  andThen(() => {
    shouldBeItemsOnTheList(assert, 50);
    infinityShouldBeReached(assert);
  });
});

test('it should start loading more items before the scroll is on the very bottom ' +
  'when triggerOffset is set', function(assert) {
  visit('/test-scrollable?triggerOffset=200');

  andThen(() => {
    shouldBeItemsOnTheList(assert, 25);
    infinityShouldNotBeReached(assert);
    scrollTo(triggerOffset() - 200 - 150);
  });

  triggerEvent('ul', 'scroll');

  andThen(() => {
    shouldBeItemsOnTheList(assert, 25);
    document.getElementsByClassName('infinity-loader')[0].scrollIntoView();
  });

  triggerEvent('ul', 'scroll');

  andThen(() => {
    shouldBeItemsOnTheList(assert, 50);
    infinityShouldBeReached(assert);
  });
});
