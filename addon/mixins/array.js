import Ember from 'ember';
import { emberDataVersionIs } from 'ember-version-is';
import InfinityMixin from 'ember-infinity/mixins/infinity';
const keys = Object.keys || Ember.keys;
const assign = Ember.assign || Ember.merge;
/**
  The Ember Infinity Route Mixin enables an application route to load paginated
  records for the route `model` as triggered by the controller (or Infinity Loader
  component).

  @class RouteMixin
  @namespace EmberInfinity
  @module ember-infinity/mixins/route
  @extends Ember.Mixin
*/
const InfinityArrayMixin = Ember.Mixin.create(InfinityMixin,{
  _modelPath: 'content',
  infinityModel(modelName, options, boundParams) {
    return this._super(modelName,options,boundParams).then(function(newObjects){
      this.set(this.get('_modelPath'),newObjects);
      return newObjects;
    }.bind(this));
  },
});

export default InfinityArrayMixin;