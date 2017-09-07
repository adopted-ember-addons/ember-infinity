import Ember from 'ember';
const { typeOf, deprecate } = Ember;

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
  @method typeOfCheck
  @param {String} value - param passed with infinityRoute
  @param {String} option - property defined on user route
  @param {String} - default
  @return {String} 
*/
export function typeOfCheck(optionParam, routeParam, defaultParam) {
  if (typeOf(optionParam) === 'null' || typeOf(routeParam) === 'null') {
    // allow user to set to null if passed into infinityRoute explicitly
    return;

  } else if (optionParam) {
    return optionParam;

  } else if (routeParam) {
    deprecate(`Ember Infinity: Please migrate route param - ${routeParam} - to be explicitly passed as second argument to infinityModel`);
    return routeParam;

  } else {
    return defaultParam;

  }
}
