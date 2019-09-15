import { get } from '@ember/object';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import EmberError from '@ember/error';

export let objectAssign = Object.assign || function objectAssign(target) {
  'use strict';
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  target = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};

/**
 * determine param to set on infinityModel
 * if user passes null, then don't send query param in request
 * if user passes option, use it
 * else set to default param
 *
 * @method paramsCheck
 * @param {String} key - param name
 * @param {Object} options - parameter overrides
 * @param {Object} extendedInfinityModel - custom infinity model
 * @return {String} parameter value
 */
export function paramsCheck(key, options, extendedInfinityModel) {
  const paramDefault = get(extendedInfinityModel, key);
  const paramOverride = options[key];

  if (paramOverride === null) {
    // allow user to set to null if passed into infinityRoute explicitly
    return null;

  } else if (paramOverride) {
    return paramOverride;

  } else {
    return paramDefault;

  }
}

/**
 * @method checkInstanceOf
 * @param {Ember.Array}
 * @return {Boolean}
 */
export function checkInstanceOf(infinityModel) {
  if (!(infinityModel instanceof InfinityModel)) {
    throw new EmberError("Ember Infinity: You must pass an Infinity Model instance as the first argument");
  }
  return true;
}

/**
 * @method convertToArray
 * @param {Ember.Array}
 * @return {Array}
 */
export function convertToArray(queryObject) {
  if (queryObject.toArray) {
    return queryObject.toArray();
  }
  return queryObject;
}

