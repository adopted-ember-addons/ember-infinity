import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Ember from 'ember';
import $ from 'jquery';

moduleForComponent('infinity-loader', {
  unit: true
});

test('it renders', function(assert) {
  assert.expect(2);

  var component = this.subject();
  assert.equal(component._state, 'preRender');
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('it changes text property', function(assert) {
  assert.expect(2);

  var infinityModelStub = [
    {id: 1, name: 'Tomato'},
    {id: 2, name: 'Potato'}
  ];

  var componentText;
  var component = this.subject({ infinityModel: infinityModelStub });
  this.render();

  componentText = $.trim(component.$().text());
  assert.equal(componentText, "Loading Infinite Model...");

  Ember.run(function() {
    component.set('infinityModel.reachedInfinity', true);
  });

  componentText = $.trim(component.$().text());
  assert.equal(componentText, "Infinite Model Entirely Loaded.");
});

test('it uses the window as the scrollable element', function(assert) {
  assert.expect(1);
  var component = this.subject();
  this.render();
  var scrollable = component.get("_scrollable");
  assert.equal(scrollable[0], window);
});

test('it uses the provided scrollable element', function(assert) {
  assert.expect(1);
  $(document.body).append("<div id='content'/>");
  var component = this.subject({scrollable: "#content"});
  this.render();
  var scrollable = component.get("_scrollable");
  assert.equal(scrollable[0], $("#content")[0]);
});

test('it throws error when scrollable element is not found', function(assert) {
  assert.expect(1);

  const component = this.subject({scrollable: "#nonexistent"});
  try {
    component.didInsertElement();
  } catch(e) {
    return assert.ok(e.message.indexOf('Ember Infinity: No scrollable element found for') > -1);
  }
});

test('it throws error when multiple scrollable elements are found', function(assert) {
  assert.expect(1);
  $(document.body).append("<div class='hello'><div/>");
  $(document.body).append("<div class='hello'><div/>");

  const component = this.subject({scrollable: ".hello"});
  try {
    component.didInsertElement();
  } catch(e) {
    return assert.ok(e.message.indexOf('Ember Infinity: Multiple scrollable elements found for') > -1);
  }
});

test('it throws error when scrollable is something other than nothing or string', function(assert) {
  assert.expect(1);
  $(document.body).append("<div id='content'/>");
  const component = this.subject({scrollable: $("#content")});

  try {
    component.didInsertElement();
  } catch(e) {
    return assert.ok(e.message.indexOf('Ember Infinity: Scrollable must either be a css selector string or left empty to default to window') > -1);
  }
});

test('it checks if in view on the scroll event', function(assert) {
  assert.expect(1);
  var done = assert.async();

  var component = this.subject();

  var isAfterRender = false;
  component.set('_loadMoreIfNeeded', function() {
    if (isAfterRender) {
      assert.ok(true);
      done();
    }
  });

  this.render();

  isAfterRender = true;
  $(window).trigger('scroll');
});

test('it checks if in view on the resize event', function(assert) {
  assert.expect(1);
  var done = assert.async();

  var component = this.subject();

  var isAfterRender = false;
  component.set('_loadMoreIfNeeded', function() {
    if (isAfterRender) {
      assert.ok(true);
      done();
    }
  });

  this.render();

  isAfterRender = true;
  $(window).trigger('resize');
});

test('it checks if in view after model is pushed', function(assert) {
  assert.expect(4);

  var infinityModelStub = Ember.A();
  function pushModel() {
    infinityModelStub.pushObject({});
  }
  pushModel();

  var component = this.subject({ infinityModel: infinityModelStub });
  component.set('_loadMoreIfNeeded', function() {
    assert.ok(true);
  });
  this.render();

  var done = assert.async();
  var count = 3;
  var pushModelAsynchronously = () => {
    Ember.run(pushModel);
    if (!--count) {
      done();
    }
  };
  for (var i = 0; i < 3; i++) {
    setTimeout(pushModelAsynchronously);
  }
});

test('hideOnInfinity => true : it will hide itself when inifinity is reached', function(assert) {
  assert.expect(2);

  var infinityModelStub = [
    {id: 1, name: 'Tomato'},
    {id: 2, name: 'Potato'}
  ];

  var component = this.subject({
    infinityModel: infinityModelStub,
    hideOnInfinity: true,
  });

  this.render();

  assert.ok(component.get('isVisible'));

  Ember.run(function() {
    component.set('infinityModel.reachedInfinity', true);
    assert.notOk(component.get('isVisible'));
  });
});

test('hideOnInfinity : will default to false and not hide the loader', function(assert) {
  assert.expect(3);

  var infinityModelStub = [
    {id: 1, name: 'Tomato'},
    {id: 2, name: 'Potato'}
  ];

  var component = this.subject({
    infinityModel: infinityModelStub,
  });

  this.render();

  assert.ok(component.get('isVisible'));

  assert.notOk(component.get('hideOnInfinity'));

  Ember.run(function() {
    component.set('infinityModel.reachedInfinity', true);
    assert.ok(component.get('isVisible'));
  });
});
