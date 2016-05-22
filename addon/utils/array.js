import Ember from 'ember';
import DS from 'ember-data';
import ArrayMixin from '../mixins/array';

export const InfiniteArray = DS.RecordArray.extend(ArrayMixin,{store: Ember.inject.service()});
