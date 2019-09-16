import ArrayProxy from "@ember/array/proxy"
import { addEvented } from "../-private/evented"
import { DEFAULTS } from "../-private/defaults"
import { get, set, setProperties } from '@ember/object';
import { objectAssign } from '../utils';
import { resolve } from 'rsvp';

/**
  @class InfinityModel
  @namespace EmberInfinity
  @module ember-infinity/lib/infinity-model
  @extends Ember.ArrayProxy
*/
export default class InfinityModel extends addEvented(ArrayProxy) {
  init(...args) {
    super.init(...args);

    setProperties(this, { ...DEFAULTS });
  }

  /**
    determines if can load next page or previous page (if applicable)

    @public
    @property canLoadMore
    @type Boolean
    @default false
    @overridable
  */
  get canLoadMore() {
    if (typeof this._canLoadMore === 'boolean') {
      return this._canLoadMore;
    }

    let { _count, _totalPages , currentPage, perPage, _increment } = this;
    let shouldCheck = _increment === 1 && currentPage !== undefined;
    if (shouldCheck) {
      if (_totalPages) {
        return (currentPage < _totalPages) ? true : false;
      } else if (_count) {
        return (currentPage < _count / perPage) ? true : false;
      }
    }
    if (this.firstPage > 1) {
      // load previous page if starting page was not 1.  Otherwise ignore this block
      return this.firstPage > 1 ? true : false;
    }
    return false;
  }

  set canLoadMore(value) {
    set(this, '_canLoadMore', value);
  }

  /**
    build the params for the next page request
    if param does not exist (user set to null or not defined) it will not be sent with request
    @private
    @method buildParams
    @return {Object} The query params for the next page of results
   */
  buildParams(increment) {
    const pageParams = {};
    let { perPageParam, pageParam } = this;
    if (typeof perPageParam === 'string') {
      pageParams[perPageParam] = get(this, 'perPage');
    }
    if (typeof pageParam === 'string' ) {
      pageParams[pageParam] = get(this, 'currentPage') + increment;
    }

    return objectAssign(pageParams, get(this, 'extraParams'));
  }

  /**
    abstract after-model hook, can be overridden in subclasses
    Used to keep shape for optimization

    @method afterInfinityModel
    @param {Ember.Array} newObjects the new objects added to the model
    @param {Ember.ArrayProxy} infinityModel (self)
    @return {Ember.RSVP.Promise} A Promise that resolves the new objects
    @return {Ember.Array} the new objects
   */
  afterInfinityModel(newObjects/*, infinityModel*/) {
    // override in your subclass to customize
    return resolve(newObjects);
  }

  /**
    lifecycle hooks

    @method infinityModelLoaded
   */
  infinityModelLoaded() {}

  /**
    lifecycle hooks

    @method infinityModelUpdated
   */
  infinityModelUpdated() {}
}
