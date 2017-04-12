import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import buildServer from '../helpers/fake-album-server';

let server;

moduleForAcceptance('Acceptance: Infinity Route', {
  beforeEach() {
    server = buildServer();
  },
  afterEach() {
    server.shutdown();
  }
});

test('it works when embedded route is refreshed', function(assert) {
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
