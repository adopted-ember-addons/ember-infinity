import Ember from 'ember';
import RouteMixin from 'ember-infinity/mixins/route';
import { module, test } from 'qunit';

module('RouteMixin');

test('it works', function(assert) {
  var RouteObject = Ember.Route.extend(RouteMixin);
  var route = RouteObject.create();
  assert.ok(route);
});

test('it can not use infinityModel without Ember Data Store', function(assert) {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function() {
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

test('it can not use infinityModel without a Model Name', function(assert) {
  var RouteObject = Ember.Route.extend(RouteMixin, {
    model: function() {
      return this.infinityModel();
    }
  });
  var route = RouteObject.create();
  route.store = {};

  var infinityError;
  try {
    route.model();
  } catch(error) {
    infinityError = error;
  }

  assert.ok(infinityError instanceof Error);
  assert.equal(infinityError.message, "You must pass a Model Name to infinityModel");
});

