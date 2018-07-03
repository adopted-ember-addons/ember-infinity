import { typeOf } from '@ember/utils';
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
  determine param to set on infinityModel
  if user passes null, then don't send query param in request
  if user does not pass anything for value, then see if defined on route
  else set to default param
  @method paramsCheck
  @param {String} value - param passed with infinityRoute
  @param {String} option - property defined on user route
  @param {String} - default
  @return {String}
*/
export function paramsCheck(optionParam, defaultParam) {
  if (typeOf(optionParam) === 'null') {
    // allow user to set to null if passed into infinityRoute explicitly
    return;

  } else if (optionParam) {
    return optionParam;

  } else {
    return defaultParam;

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

