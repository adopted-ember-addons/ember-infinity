import Ember from 'ember';
import DS from 'ember-data';
import ArrayMixin from '../mixins/array';

export const InfiniteArray = Ember.ArrayProxy.extend(ArrayMixin);
