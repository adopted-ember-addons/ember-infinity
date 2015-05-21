var fs = require('fs');
var path = require('path');
var RSVP = require('rsvp');
var rimraf = RSVP.denodeify(require('rimraf'));
var mapSeries = require('promise-map-series');
var quickTemp = require('quick-temp');
var helpers = require('broccoli-kitchen-sink-helpers');
var symlinkOrCopy = require('symlink-or-copy');
var generateRandomString = require('./lib/generate-random-string');
var assign = require('lodash-node/modern/objects/assign');
var CoreObject = require('core-object');
var debug = require('debug')('broccoli-caching-writer');

var proto = {};

proto.init = function(inputTrees, options) {
  this._inputTreeCacheHash = [];
  this._lastKeys = [];
  this._shouldBeIgnoredCache = Object.create(null);
  this._destDir = path.resolve(path.join('tmp', 'caching-writer-dest-dir_' + generateRandomString(6) + '.tmp'));

  options = options || {};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key];
    }
  }

  if (Array.isArray(inputTrees)) {
    if (this.enforceSingleInputTree) {
      throw new Error('You passed an array of input trees, but only a single tree is allowed.');
    }

    this.inputTrees = inputTrees;
  } else {
    this.inputTrees = [inputTrees];
  }


  if (this.filterFromCache === undefined) {
    this.filterFromCache = {};
  }

  if (this.filterFromCache.include === undefined) {
    this.filterFromCache.include = [];
  }

  if (this.filterFromCache.exclude === undefined) {
    this.filterFromCache.exclude = [];
  }

  if (!Array.isArray(this.filterFromCache.include)) {
    throw new Error('Invalid filterFromCache.include option, it must be an array or undefined.');
  }

  if (!Array.isArray(this.filterFromCache.exclude)) {
    throw new Error('Invalid filterFromCache.exclude option, it must be an array or undefined.');
  }
};

proto.enforceSingleInputTree = false;

proto.getCacheDir = function () {
  return quickTemp.makeOrReuse(this, 'tmpCacheDir');
};

proto.getCleanCacheDir = function () {
  return quickTemp.makeOrRemake(this, 'tmpCacheDir');
};

proto.read = function (readTree) {
  var self = this;

  return mapSeries(this.inputTrees, readTree)
    .then(function(inputPaths) {
      var inputTreeHashes = [];
      var invalidateCache = false;
      var key, dir, updateCacheResult;
      var lastKeys = [];

      for (var i = 0, l = inputPaths.length; i < l; i++) {
        dir = inputPaths[i];

        key = self.keyForTree(dir);
        lastKey = self._lastKeys[i];
        lastKeys.push(key);

        if (!invalidateCache /* short circuit */ && !key.equal(lastKey)) {
          invalidateCache = true;
        }
      }

      if (invalidateCache) {
        var updateCacheSrcArg = self.enforceSingleInputTree ? inputPaths[0] : inputPaths;
        updateCacheResult = self.updateCache(updateCacheSrcArg, self.getCleanCacheDir());

        self._lastKeys = lastKeys;

        self._inputTreeCacheHash = inputTreeHashes;
      }

      return updateCacheResult;
    })
    .then(function() {
      return rimraf(self._destDir);
    })
    .then(function() {
      symlinkOrCopy.sync(self.getCacheDir(), self._destDir);
    })
    .then(function() {
      return self._destDir;
    });
};

proto.cleanup = function () {
  quickTemp.remove(this, 'tmpCacheDir');

  // sadly we must use sync removal for now
  if (this._destDir) {
    rimraf.sync(this._destDir);
  }
};

proto.updateCache = function (srcDir, destDir) {
  throw new Error('You must implement updateCache.');
};

// Takes in a path and { include, exclude }. Tests the path using regular expressions and
// returns true if the path does not match any exclude patterns AND matches atleast
// one include pattern.
proto.shouldBeIgnored = function (fullPath) {
  if (this._shouldBeIgnoredCache[fullPath] !== undefined) {
    return this._shouldBeIgnoredCache[fullPath];
  }

  var excludePatterns = this.filterFromCache.exclude;
  var includePatterns = this.filterFromCache.include;
  var i = null;

  // Check exclude patterns
  for (i = 0; i < excludePatterns.length; i++) {
    // An exclude pattern that returns true should be ignored
    if (excludePatterns[i].test(fullPath) === true) {
      return (this._shouldBeIgnoredCache[fullPath] = true);
    }
  }

  // Check include patterns
  if (includePatterns !== undefined && includePatterns.length > 0) {
    for (i = 0; i < includePatterns.length; i++) {
      // An include pattern that returns true (and wasn't excluded at all)
      // should _not_ be ignored
      if (includePatterns[i].test(fullPath) === true) {
        return (this._shouldBeIgnoredCache[fullPath] = false);
      }
    }

    // If no include patterns were matched, ignore this file.
    return (this._shouldBeIgnoredCache[fullPath] = true);
  }

  // Otherwise, don't ignore this file
  return (this._shouldBeIgnoredCache[fullPath] = false);
};

var EMPTY_ARRAY;
function Key(type, fullPath, path, stat, children) {
  this.type = type;
  this.fullPath = fullPath;
  this.path = path;
  this.stat = stat;
  this.children = children || EMPTY_ARRAY;
}

Key.prototype.toString = function() {
  return ' type: '       + this.type +
         ' fullPath: '   + this.fullPath +
         ' path: '       + this.path +
         ' stat.mode: '  + this.stat.mode +
         ' stat.size: '  + this.stat.size +
         ' stat.mtime: ' + this.stat.mtime.getTime();
};

Key.prototype.inspect = function() {
  return [
    this.type,
    this.path,
    this.stat.mode,
    this.stat.size,
    this.stat.size,
    this.stat.mtime.getTime()
  ].join(', ');
};

function logNotEqual(previous, next) {
  debug(" cache eviction due to: \n     - {%o} \n     - {%o}", previous, next);
}

Key.prototype.equal = function(otherKey) {
  if (otherKey === undefined) {
    logNotEqual(this, otherKey);
    return false;
  }

  if (this.type === otherKey.type && this.type === 'directory') {
    var children = this.children;
    var otherChildren = otherKey.children;

    if (children.length === otherChildren.length) {
      for (var i = 0; i < children.length; i++) {
        if (children[i].equal(otherChildren[i])) {
          // they are the same
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  // key represents a file, diff the file
  if (this.type       === otherKey.type &&
      this.path       === otherKey.path &&
      this.stat.mode  === otherKey.stat.mode &&
      this.stat.size  === otherKey.stat.size &&
      this.type === 'directory' ? true : this.stat.mtime.getTime() === otherKey.stat.mtime.getTime()) {
    return true;
  } else {
    logNotEqual(this, otherKey);
  }
};

proto.keyForTree = function (fullPath, initialRelativePath) {
  var relativePath = initialRelativePath || '.';
  var stats;
  var statKeys;
  var type;

  try {
    stats = fs.statSync(fullPath);
  } catch (err) {
    console.warn('Warning: failed to stat ' + fullPath);
    // fullPath has probably ceased to exist. Leave `stats` undefined and
    // proceed hashing.
  }

  var children;

  // has children;
  if (stats && stats.isDirectory()) {
    type = 'directory';

    var files;
    try {
      files = fs.readdirSync(fullPath).sort();
    } catch (err) {
      console.warn('Warning: Failed to read directory ' + fullPath);
      console.warn(err.stack);
    }

    if (files) {
      children = files.map(function(file) {
        return this.keyForTree(
          path.join(fullPath, file),
          path.join(relativePath, file)
        );
      }, this).filter(Boolean);
    }

  } else if (stats && stats.isFile()) {
    type = 'file';

    if (this.shouldBeIgnored(fullPath)) {
      return null;
    }
  }

  return new Key(type, fullPath, relativePath, stats, children);
};

function CachingWriter (inputTrees, options) {
  if (!(this instanceof CachingWriter)) return new CachingWriter(inputTrees, options);
  CoreObject.apply(this, arguments);
  if (this.init) {
    this.init.apply(this, arguments);
  }
}

CachingWriter.__proto__ = CoreObject;
CachingWriter.prototype = Object.create(CoreObject.prototype);
assign(CachingWriter.prototype, proto);

module.exports = CachingWriter;
