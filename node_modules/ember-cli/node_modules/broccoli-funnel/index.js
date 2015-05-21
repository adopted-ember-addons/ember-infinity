'use strict';

var fs = require('fs');
var RSVP = require('rsvp');
var path = require('path');
var rimraf = RSVP.denodeify(require('rimraf'));
var mkdirp = require('mkdirp');
var walkSync = require('walk-sync');
var Minimatch = require('minimatch').Minimatch;
var CoreObject = require('core-object');
var symlinkOrCopy = require('symlink-or-copy');
var generateRandomString = require('./lib/generate-random-string');


function makeDictionary() {
  var cache = Object.create(null);

  cache['_dict'] = null;
  delete cache['_dict'];
  return cache;
}

function Funnel(inputTree, options) {
  if (!(this instanceof Funnel)) { console.error(new Error('You must use \'new Funnel\' to instantiate a broccoli-funnel item.')); }

  this.inputTree = inputTree;

  this._includeFileCache = makeDictionary();
  this._destinationPathCache = makeDictionary();

  this._tmpDir = path.resolve(path.join(this.tmpRoot, 'funnel-dest_' + generateRandomString(6) + '.tmp'));

  var keys = Object.keys(options || {});
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    this[key] = options[key];
  }

  this.setupDestPaths();

  if (this.files && !Array.isArray(this.files)) {
    throw new Error('Invalid files option, it must be an array.');
  }

  this._setupFilter('include');
  this._setupFilter('exclude');

  this._instantiatedStack = (new Error()).stack;
}

Funnel.__proto__ = CoreObject;
Funnel.prototype.constructor = Funnel;

Funnel.prototype.tmpRoot = 'tmp';

Funnel.prototype.setupDestPaths = function() {
  this.destDir = this.destDir || '/';
  this.destPath = path.join(this._tmpDir, this.destDir);

  if (this.destPath[this.destPath.length -1] === '/') {
    this.destPath = this.destPath.slice(0, -1);
  }
};

Funnel.prototype._setupFilter = function(type) {
  var filters = this[type];

  if (!filters) {
    return;
  }

  if (!Array.isArray(filters)) {
    throw new Error('Invalid ' + type + ' option, it must be an array. You specified `' + typeof filters + '`.');
  }

  for (var i = 0, l = filters.length; i < l; i++) {
    filters[i] = this._processPattern(filters[i]);
  }
};

Funnel.prototype._processPattern = function(pattern) {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  var type = typeof pattern;

  if (type === 'string') {
    return new Minimatch(pattern);
  }

  if (type === 'function') {
    return pattern;
  }

  throw new Error('include/exclude patterns can be a RegExp, glob string, or function. You supplied `' + typeof pattern +'`.');
};

Funnel.prototype.shouldLinkRoots = function() {
  return !this.files && !this.include && !this.exclude && !this.getDestinationPath;
};

Funnel.prototype.read = function(readTree) {
  var inputTree = this.inputTree;

  return RSVP.Promise.resolve()
    .then(this.cleanup.bind(this))
    .then(function() {
      return readTree(inputTree);
    })
    .then(this.handleReadTree.bind(this));
};

Funnel.prototype.handleReadTree = function(inputTreeRoot) {
  var inputPath = inputTreeRoot;
  if (this.srcDir) {
    inputPath = path.join(inputTreeRoot, this.srcDir);
  }

  if (this.shouldLinkRoots()) {
    if (fs.existsSync(inputPath)) {
      this._copy(inputPath, this.destPath);
    } else if (this.allowEmpty) {
      mkdirp.sync(this.destPath);
    }
  } else {
    mkdirp.sync(this._tmpDir);

    this.processFilters(inputPath);
  }

  return this._tmpDir;
};

Funnel.prototype.cleanup = function() {
  return rimraf(this._tmpDir);
};

Funnel.prototype.processFilters = function(inputPath) {
  var files = walkSync(inputPath);
  var relativePath, destRelativePath, fullInputPath, fullOutputPath;

  for (var i = 0, l = files.length; i < l; i++) {
    relativePath = files[i];

    if (this.includeFile(relativePath)) {
      fullInputPath    = path.join(inputPath, relativePath);
      destRelativePath = this.lookupDestinationPath(relativePath);
      fullOutputPath   = path.join(this.destPath, destRelativePath);

      this.processFile(fullInputPath, fullOutputPath, relativePath);
    }
  }
};

Funnel.prototype.lookupDestinationPath = function(relativePath) {
  if (this._destinationPathCache[relativePath] !== undefined) {
    return this._destinationPathCache[relativePath];
  }

  if (this.getDestinationPath) {
    return this._destinationPathCache[relativePath] = this.getDestinationPath(relativePath);
  }

  return this._destinationPathCache[relativePath] = relativePath;
};

Funnel.prototype.includeFile = function(relativePath) {
  var includeFileCache = this._includeFileCache;

  if (includeFileCache[relativePath] !== undefined) {
    return includeFileCache[relativePath];
  }

  // do not include directories, only files
  if (relativePath[relativePath.length - 1] === '/') {
    return includeFileCache[relativePath] = false;
  }

  var i, l, pattern;

  // Check for specific files listing
  if (this.files) {
    return includeFileCache[relativePath] = this.files.indexOf(relativePath) > -1;
  }

  // Check exclude patterns
  if (this.exclude) {
    for (i = 0, l = this.exclude.length; i < l; i++) {
      // An exclude pattern that returns true should be ignored
      pattern = this.exclude[i];

      if (this._matchesPattern(pattern, relativePath)) {
        return includeFileCache[relativePath] = false;
      }
    }
  }

  // Check include patterns
  if (this.include && this.include.length > 0) {
    for (i = 0, l = this.include.length; i < l; i++) {
      // An include pattern that returns true (and wasn't excluded at all)
      // should _not_ be ignored
      pattern = this.include[i];

      if (this._matchesPattern(pattern, relativePath)) {
        return includeFileCache[relativePath] = true;
      }
    }

    // If no include patterns were matched, ignore this file.
    return includeFileCache[relativePath] = false;
  }

  // Otherwise, don't ignore this file
  return includeFileCache[relativePath] = true;
};

Funnel.prototype._matchesPattern = function(pattern, relativePath) {
  if (pattern instanceof RegExp) {
    return pattern.test(relativePath);
  } else if (pattern instanceof Minimatch) {
    return pattern.match(relativePath);
  } else if (typeof pattern === 'function') {
    return pattern(relativePath);
  }

  throw new Error('Pattern `' + pattern + '` was not a RegExp, Glob, or Function.');
};

Funnel.prototype.processFile = function(sourcePath, destPath /*, relativePath */) {
  this._copy(sourcePath, destPath);
};

Funnel.prototype._copy = function(sourcePath, destPath) {
  var destDir  = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    mkdirp.sync(destDir);
  }

  symlinkOrCopy.sync(sourcePath, destPath);
};

module.exports = Funnel;
