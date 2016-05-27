import Ember from 'ember';
import DS from 'ember-data';
import ArrayMixin from '../mixins/array';

export default Ember.ArrayProxy.extend(ArrayMixin,{content: Ember.A([])});