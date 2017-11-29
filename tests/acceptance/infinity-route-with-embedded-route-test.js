import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import buildServer from '../helpers/fake-album-server';

moduleForAcceptance('Acceptance: Infinity Route', {
  beforeEach() {
    this.server = buildServer();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it works when embedded route is refreshed', function(assert) {
  visit('/posts/1');

  andThen(() => {
    assert.equal(find('ul.test-list').find('li.test-list-item').length, 1);
  });

  click('button.refreshRoute');

  andThen(() => {
    document.getElementsByClassName('infinity-loader')[0].scrollIntoView();
  });

  triggerEvent('ul.test-list', 'scroll');

  andThen(() => {
    assert.equal(find('ul.test-list').find('li.test-list-item').length, 2);
  });
});