function giveMethodSuper(superclass, name, fn) {
  var superFn = superclass[name];

  if (typeof superFn !== 'function') {
    superFn = function() {};
  }

  // jgwhite: Compatibility hack to allow `this._super.foo`
  superFn[name] = function() {
    console.warn('DEPRECATION: Calling this._super.' + name +
                 ' is deprecated. Please use this._super(args).');
    return superFn.apply(this, arguments);
  }

  return function() {
    var previous = this._super;
    this._super = superFn;
    var ret = fn.apply(this, arguments);
    this._super = previous;
    return ret;
  };
}

var sourceAvailable = (function() {
  return this;
}).toString().indexOf('return this;') > -1;

var hasSuper;
if (sourceAvailable) {
  hasSuper = function(fn) {
    if (fn.__hasSuper === undefined) {
     return fn.__hasSuper = fn.toString().indexOf('_super') > -1;
    } else {
     return fn.__hasSuper;
    }
  }
} else {
  hasSuper = function(target, fn) {
    return true;
  }
}

function assignProperties(target, options) {
  var value;

  for (var key in options) {
    value = options[key];

    if (typeof value === 'function' && hasSuper(value)) {
      target[key] = giveMethodSuper(target, key, value);
    } else {
      target[key] = value;
    }
  }
}

module.exports = assignProperties;
