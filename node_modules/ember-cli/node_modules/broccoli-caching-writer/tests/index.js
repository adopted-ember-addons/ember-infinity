/* jshint node: true */
/* global it: true, describe: true, afterEach, beforeEach */

'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('expect.js');
var RSVP = require('rsvp');
var rimraf = require('rimraf');
var root = process.cwd();
var broccoli = require('broccoli');
var cachingWriter = require('..');

var builder;

describe('broccoli-caching-writer', function(){
  var sourcePath = 'tests/fixtures/sample-project';
  var secondaryPath = 'tests/fixtures/other-tree';

  var existingJSFile = sourcePath + '/core.js';
  var dummyChangedFile = sourcePath + '/dummy-changed-file.txt';
  var dummyJSChangedFile = sourcePath + '/dummy-changed-file.js';

  afterEach(function() {
    if (fs.existsSync(dummyChangedFile)) {
      fs.unlinkSync(dummyChangedFile);
    }

    if (fs.existsSync(dummyJSChangedFile)) {
      fs.unlinkSync(dummyJSChangedFile);
    }

    if (builder) {
      return builder.cleanup();
    }
  });

  function build() {
    return builder.build();
  }

  function buildInSeries(count) {
    var promise = RSVP.Promise.resolve();

    for (var i = 0; i < count; i++) {
      promise = promise.then(build);
    }

    return promise;
  }

  describe('enforceSingleInputTree', function() {
    it('defaults `enforceSingleInputTree` to false', function() {
      var tree = cachingWriter(sourcePath, {
        updateCache: function() { }
      });

      expect(tree.enforceSingleInputTree).to.not.be.ok();
    });

    it('throws an error if enforceSingleInputTree is true, and an array is passed', function() {
      expect(function() {
        var tree = cachingWriter([sourcePath, secondaryPath], {
          enforceSingleInputTree: true,
          updateCache: function() { }
        });
      }).throwException(/You passed an array of input trees, but only a single tree is allowed./);
    });
  });

  describe('write', function() {
    it('calls updateCache when there is no cache', function(){
      var updateCacheCalled = false;
      var tree = cachingWriter(sourcePath, {
        updateCache: function() {
          updateCacheCalled = true;
        }
      });

      builder = new broccoli.Builder(tree);
      return builder.build().finally(function() {
        expect(updateCacheCalled).to.be.ok();
      });
    });

    it('calls updateCache with a single path if enforceSingleInputTree is true', function(){
      var updateCacheCalled = false;
      var tree = cachingWriter(sourcePath, {
        enforceSingleInputTree: true,
        updateCache: function(srcDir, destDir) {
          expect(fs.statSync(srcDir).isDirectory()).to.be.ok();
          expect(fs.statSync(destDir).isDirectory()).to.be.ok();
        }
      });

      builder = new broccoli.Builder(tree);
      return builder.build();
    });

    it('is provided a source and destination directory', function(){
      var updateCacheCalled = false;
      var tree = cachingWriter(sourcePath, {
        updateCache: function(srcDir, destDir) {
          expect(fs.statSync(srcDir[0]).isDirectory()).to.be.ok();
          expect(fs.statSync(destDir).isDirectory()).to.be.ok();
        }
      });

      builder = new broccoli.Builder(tree);
      return builder.build();
    });

    it('only calls updateCache once if input is not changing', function(){
      var updateCacheCount = 0;
      var tree = cachingWriter(sourcePath, {
        updateCache: function() {
          updateCacheCount++;
        }
      });

      builder = new broccoli.Builder(tree);

      return buildInSeries(3)
        .then(function() {
          expect(updateCacheCount).to.equal(1);
        });
    });

    it('calls updateCache again if input is changed', function(){
      var updateCacheCount = 0;

      var tree = cachingWriter([sourcePath, secondaryPath], {
        updateCache: function() {
          updateCacheCount++;
        }
      });

      builder = new broccoli.Builder(tree);

      return builder.build()
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        })
        .then(function() {
          fs.writeFileSync(dummyChangedFile, 'bergh');

          return buildInSeries(3);
        })
        .finally(function() {
          expect(updateCacheCount).to.equal(2);
        })
        .then(function() {
          fs.writeFileSync(secondaryPath + '/foo-baz.js', 'bergh');

          return buildInSeries(3);
        })
        .finally(function() {
          expect(updateCacheCount).to.equal(3);
        });
    });

    it('calls updateCache again if existing file is changed', function(){
      var updateCacheCount = 0;
      var tree = cachingWriter(sourcePath, {
        updateCache: function() {
          updateCacheCount++;
        }
      });

      builder = new broccoli.Builder(tree);

      return builder.build()
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        })
        .then(function() {
          fs.writeFileSync(existingJSFile, '"YIPPIE"\n"KI-YAY!"\n');

          return buildInSeries(3);
        })
        .finally(function() {
          fs.writeFileSync(existingJSFile, '"YIPPIE"\n');
          expect(updateCacheCount).to.equal(2);
        });
    });

    it('does not call updateCache again if input is changed but filtered from cache (via exclude)', function(){
      var updateCacheCount = 0;
      var tree = cachingWriter(sourcePath, {
        updateCache: function() {
          updateCacheCount++;
        },
        filterFromCache: {
          exclude: [/.*\.txt$/]
        }
      });

      builder = new broccoli.Builder(tree);

      return builder.build()
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        })
        .then(function() {
          fs.writeFileSync(dummyChangedFile, 'bergh');

          return buildInSeries(3);
        })
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        });
    });

    it('does not call updateCache again if input is changed but filtered from cache (via include)', function(){
      var updateCacheCount = 0;
      var tree = cachingWriter(sourcePath, {
        updateCache: function() {
          updateCacheCount++;
        },
        filterFromCache: {
          include: [/.*\.js$/]
        }
      });

      builder = new broccoli.Builder(tree);

      return builder.build()
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        })
        .then(function() {
          fs.writeFileSync(dummyChangedFile, 'bergh');

          return buildInSeries(3);
        })
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        });
    });

    it('does call updateCache again if input is changed is included in the cache filter', function(){
      var updateCacheCount = 0;
      var tree = cachingWriter(sourcePath, {
        updateCache: function() {
          updateCacheCount++;
        },
        filterFromCache: {
          include: [/.*\.js$/]
        }
      });

      builder = new broccoli.Builder(tree);

      return builder.build()
        .finally(function() {
          expect(updateCacheCount).to.equal(1);
        })
        .then(function() {
          fs.writeFileSync(dummyJSChangedFile, 'bergh');

          return buildInSeries(3);
        })
        .finally(function() {
          expect(updateCacheCount).to.equal(2);
        });
    });
  });

  describe('updateCache', function() {
    it('provides array of paths if array of sourceTrees was provided', function() {
      var tree = cachingWriter([sourcePath, secondaryPath], {
        updateCache: function(srcDirs, destDir) {
          expect(fs.readFileSync(srcDirs[0] + '/core.js', {encoding: 'utf8'})).to.eql('"YIPPIE"\n');
          expect(fs.readFileSync(srcDirs[1] + '/bar.js', {encoding: 'utf8'})).to.eql('"BLAMMO!"\n');

          fs.writeFileSync(destDir + '/something-cool.js', 'zomg blammo', {encoding: 'utf8'});
        }
      });

      builder = new broccoli.Builder(tree);
      return builder.build().then(function(result) {
        var dir = result.directory;

        expect(fs.readFileSync(dir + '/something-cool.js', {encoding: 'utf8'})).to.equal('zomg blammo');
      });
    });

    it('can write files to destDir, and they will be in the final output', function(){
      var tree = cachingWriter(sourcePath, {
        updateCache: function(srcDir, destDir) {
          fs.writeFileSync(destDir + '/something-cool.js', 'zomg blammo', {encoding: 'utf8'});
        }
      });

      builder = new broccoli.Builder(tree);
      return builder.build().then(function(result) {
        var dir = result.directory;
        expect(fs.readFileSync(dir + '/something-cool.js', {encoding: 'utf8'})).to.equal('zomg blammo');
      });
    });

    it('throws an error if not overriden', function(){
      var tree = cachingWriter(sourcePath);

      builder = new broccoli.Builder(tree);
      return builder.build()
        .catch(function(reason) {
          expect(reason.message).to.equal('You must implement updateCache.');
        });
    });

    it('can return a promise that is resolved', function(){
      var thenCalled = false;
      var tree = cachingWriter(sourcePath, {
        updateCache: function(srcDir, destDir) {
          return {then: function(callback) {
            thenCalled = true;
            callback();
          }};
        }
      });

      builder = new broccoli.Builder(tree);
      return builder.build().then(function() {
        expect(thenCalled).to.be.ok();
      });
    });
  });

  describe('shouldBeIgnored', function() {
    var tree;

    beforeEach(function() {
      tree = cachingWriter(sourcePath);
    });

    it('returns true if the path is included in an exclude filter', function() {
      tree.filterFromCache.exclude = [ /.foo$/, /.bar$/ ];

      expect(tree.shouldBeIgnored('blah/blah/blah.foo')).to.be.ok();
      expect(tree.shouldBeIgnored('blah/blah/blah.bar')).to.be.ok();
      expect(tree.shouldBeIgnored('blah/blah/blah.baz')).to.not.be.ok();
    });

    it('returns false if the path is included in an include filter', function() {
      tree.filterFromCache.include = [ /.foo$/, /.bar$/ ];

      expect(tree.shouldBeIgnored('blah/blah/blah.foo')).to.not.be.ok();
      expect(tree.shouldBeIgnored('blah/blah/blah.bar')).to.not.be.ok();
    });

    it('returns true if the path is not included in an include filter', function() {
      tree.filterFromCache.include = [ /.foo$/, /.bar$/ ];

      expect(tree.shouldBeIgnored('blah/blah/blah.baz')).to.be.ok();
    });

    it('returns false if no patterns were used', function() {
      expect(tree.shouldBeIgnored('blah/blah/blah.baz')).to.not.be.ok();
    });

    it('uses a cache to ensure we do not recalculate the filtering on subsequent attempts', function() {
      expect(tree.shouldBeIgnored('blah/blah/blah.baz')).to.not.be.ok();

      // changing the filter mid-run should have no result on
      // previously calculated paths
      tree.filterFromCache.include = [ /.foo$/, /.bar$/ ];

      expect(tree.shouldBeIgnored('blah/blah/blah.baz')).to.not.be.ok();
    });
  });

  describe('extend', function() {
    it('sets the methods correctly', function() {
      var TestPlugin = cachingWriter.extend({
        foo: function() {}
      });

      expect(TestPlugin).to.be.a(Function);
      expect(TestPlugin.prototype.foo).to.be.a(Function);
    });

    it('calls CachingWriter constructor', function () {
      var MyPlugin = cachingWriter.extend({});
      var instance = new MyPlugin("foo");
      expect(instance.inputTrees).to.eql(["foo"]);
    });

    it('can write files to destDir, and they will be in the final output', function(){
      var TestWriter = cachingWriter.extend({
        updateCache: function(srcDir, destDir) {
          fs.writeFileSync(destDir + '/something-cooler.js', 'whoa', {encoding: 'utf8'});
        }
      });
      var tree = new TestWriter(sourcePath);

      builder = new broccoli.Builder(tree);
      return builder.build().then(function(result) {
        var dir = result.directory;
        expect(fs.readFileSync(dir + '/something-cooler.js', {encoding: 'utf8'})).to.equal('whoa');
      });
    });
  });
});
