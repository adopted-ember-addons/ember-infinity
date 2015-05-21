var Filter = require('broccoli-filter');

module.exports = ES3SafeFilter;

ES3SafeFilter.prototype = Object.create(Filter.prototype);
ES3SafeFilter.prototype.constructor = ES3SafeFilter;

function ES3SafeFilter (inputTree, options) {
  if (!(this instanceof ES3SafeFilter)) {
    return new ES3SafeFilter(inputTree, options);
  }

  Filter.call(this, inputTree, options);
  this.options = options || {};
}

ES3SafeFilter.prototype.extensions = ['js'];
ES3SafeFilter.prototype.targetExtension = 'js';
var es3safe = require('es3-safe-recast');

ES3SafeFilter.prototype.processString = function (string) {
  return es3safe.compile(string);
};

