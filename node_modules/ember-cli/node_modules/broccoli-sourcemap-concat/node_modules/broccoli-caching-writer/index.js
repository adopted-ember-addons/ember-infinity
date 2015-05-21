var fs = require('fs');
var path = require('path');
var RSVP = require('rsvp');
var rimraf = RSVP.denodeify(require('rimraf'));
var mapSeries = require('promise-map-series');
var quickTemp = require('quick-temp')
var helpers = require('broccoli-kitchen-sink-helpers');
var symlinkOrCopy = require('symlink-or-copy');
var generateRandomString = require('./lib/generate-random-string');
var CoreObject = require('core-object');

function CachingWriter (inputTrees, options) {
  if (!(this instanceof CachingWriter)) return new CachingWriter(inputTrees, options);

  this._inputTreeCacheHash = [];
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
    throw new Error('Invalid filterFromCache.include option, it must be an array or undefined.')
  }

  if (!Array.isArray(this.filterFromCache.exclude)) {
    throw new Error('Invalid filterFromCache.exclude option, it must be an array or undefined.')
  }
};
CachingWriter.__proto__ = CoreObject;
CachingWriter.prototype.constructor = CachingWriter;

CachingWriter.prototype.enforceSingleInputTree = false;

CachingWriter.prototype.getCacheDir = function () {
  return quickTemp.makeOrReuse(this, 'tmpCacheDir');
};

CachingWriter.prototype.getCleanCacheDir = function () {
  return quickTemp.makeOrRemake(this, 'tmpCacheDir');
};

CachingWriter.prototype.read = function (readTree) {
  var self = this;

  return mapSeries(this.inputTrees, readTree)
    .then(function(inputPaths) {
      var inputTreeHashes = [];
      var invalidateCache = false;
      var keys, dir, updateCacheResult;

      for (var i = 0, l = inputPaths.length; i < l; i++) {
        dir = inputPaths[i];
        keys = self.keysForTree(dir);
        inputTreeHashes[i] = helpers.hashStrings(keys);

        if (self._inputTreeCacheHash[i] !== inputTreeHashes[i]) {
          invalidateCache = true;
        }
      }

      if (invalidateCache) {
        var updateCacheSrcArg = self.enforceSingleInputTree ? inputPaths[0] : inputPaths;
        updateCacheResult = self.updateCache(updateCacheSrcArg, self.getCleanCacheDir());

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

CachingWriter.prototype.cleanup = function () {
  quickTemp.remove(this, 'tmpCacheDir');

  // sadly we must use sync removal for now
  if (this._destDir) {
    rimraf.sync(this._destDir);
  }
};

CachingWriter.prototype.updateCache = function (srcDir, destDir) {
  throw new Error('You must implement updateCache.');
};

// Takes in a path and { include, exclude }. Tests the path using regular expressions and
// returns true if the path does not match any exclude patterns AND matches atleast
// one include pattern.
CachingWriter.prototype.shouldBeIgnored = function (fullPath) {
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
      return this._shouldBeIgnoredCache[fullPath] = true;
    }
  }

  // Check include patterns
  if (includePatterns !== undefined && includePatterns.length > 0) {
    for (i = 0; i < includePatterns.length; i++) {
      // An include pattern that returns true (and wasn't excluded at all)
      // should _not_ be ignored
      if (includePatterns[i].test(fullPath) === true) {
        return this._shouldBeIgnoredCache[fullPath] = false;
      }
    }

    // If no include patterns were matched, ignore this file.
    return this._shouldBeIgnoredCache[fullPath] = true;
  }

  // Otherwise, don't ignore this file
  return this._shouldBeIgnoredCache[fullPath] = false;
}


CachingWriter.prototype.keysForTree = function (fullPath, initialRelativePath) {
  var relativePath = initialRelativePath || '.';
  var stats;
  var statKeys;

  try {
    stats = fs.statSync(fullPath);
  } catch (err) {
    console.warn('Warning: failed to stat ' + fullPath);
    // fullPath has probably ceased to exist. Leave `stats` undefined and
    // proceed hashing.
  }
  var childKeys = [];
  if (stats) {
    statKeys = ['stats', stats.mode];
  } else {
    statKeys = ['stat failed'];
  }
  if (stats && stats.isDirectory()) {
    var fileIdentity = stats.dev + '\x00' + stats.ino;
    var entries;
    try {
      entries = fs.readdirSync(fullPath).sort();
    } catch (err) {
      console.warn('Warning: Failed to read directory ' + fullPath);
      console.warn(err.stack);
      childKeys = ['readdir failed'];
      // That's all there is to say about this directory.
    }
    if (entries != null) {
      for (var i = 0; i < entries.length; i++) {

        var keys = this.keysForTree(
          path.join(fullPath, entries[i]),
          path.join(relativePath, entries[i])
        );
        childKeys = childKeys.concat(keys);
      }
    }
  } else if (stats && stats.isFile()) {
    if (this.shouldBeIgnored(fullPath)) {
      return [];
    }
    statKeys.push(stats.mtime.getTime(), stats.size);
  }

  // Perhaps we should not use basename to infer the file name
  return ['path', relativePath]
    .concat(statKeys)
    .concat(childKeys);
}

module.exports = CachingWriter;
