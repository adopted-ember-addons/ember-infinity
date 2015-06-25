import Ember from 'ember';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

module('RouteMixin');

test('it works', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin);
  var route = RouteObject.create();
  assert.ok(route);
});

test('it can not use infinityModel without Ember Data Store', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('post');
    }
  });
  var route = RouteObject.create();

  var infinityError;
  try {
    route.model();
  } catch(error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, "Ember Data store is not available to infinityModel");
});

test('it can not use infinityModel without a Model Name', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel();
    }
  });
  var route = RouteObject.create();
  route.store = {
    find() {}
  };

  var infinityError;
  try {
    route.model();
  } catch(error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, "You must pass a Model Name to infinityModel");
});

test('it sets state before it reaches the end', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find() {
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.A([{id: 1, name: 'Test'}]));
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.equal(1, route.get('_minId'));
  assert.equal(true, route.get('_canLoadMore'));
  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')));
  assert.ok(!model.get('reachedInfinity'), 'Should not reach infinity');
});

test('it allows customizations of request params', assert => {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    perPageParam: 'per',
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(modelType, findQuery) {
      assert.deepEqual(findQuery, {per: 25});
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.A());
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });
});

test('it sets state  when it reaches the end', assert => {

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item');
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find() {
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, Ember.A());
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  assert.ok(Ember.$.isEmptyObject(route.get('_extraParams')));
  assert.equal(false, route.get('_canLoadMore'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');
});

test('it uses extra params when loading more data', assert => {

  assert.expect(7);

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {extra: 'param'});
    }
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(name, params) {
      assert.equal('param', params.extra);
      var resolution = Ember.A([{id: 1, name: 'Test'}]);
      if (params.min_id) {
        resolution = Ember.Object.create({ content: resolution });
      }
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, resolution);
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  // The controller needs to be set so _infinityLoad() can call
  // pushObjects()
  var dummyController = Ember.Object.create({
    model
  });
  route.set('controller', dummyController);

  assert.equal('param', route.get('_extraParams.extra'));
  assert.equal(true, route.get('_canLoadMore'));

  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal('param', route.get('_extraParams.extra'));
  assert.equal(false, route.get('_canLoadMore'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');

});

test('it uses overridden params when loading more data', assert => {

  assert.expect(5);

  var RouteObject = Ember.Route.extend(RouteMixin, {
    model() {
      return this.infinityModel('item', {perPage: 1});
    },

    perPageParam: 'testPerPage'
  });
  var route = RouteObject.create();

  var dummyStore = {
    find(name, params) {
      var resolution = Ember.A([{id: 1, name: 'Test'}]);
      assert.equal(1, params.testPerPage);
      if (params.min_id) {
        resolution = Ember.Object.create({ content: resolution });
      }
      return new Ember.RSVP.Promise(resolve => {
        Ember.run(this, resolve, resolution);
      });
    }
  };

  route.store = dummyStore;

  var model;
  Ember.run(() => {
    route.model().then(result => {
      model = result;
    });
  });

  // The controller needs to be set so _infinityLoad() can call
  // pushObjects()
  var dummyController = Ember.Object.create({
    model
  });
  route.set('controller', dummyController);

  assert.equal(true, route.get('_canLoadMore'));

  // Load more
  Ember.run(() => {
    route._infinityLoad();
  });

  assert.equal(false, route.get('_canLoadMore'));
  assert.ok(model.get('reachedInfinity'), 'Should reach infinity');

});
