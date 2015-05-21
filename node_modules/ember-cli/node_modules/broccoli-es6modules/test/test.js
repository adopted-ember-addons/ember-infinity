/* global describe, afterEach, it, expect */

var expect = require('chai').expect;  // jshint ignore:line
var ES6 = require('..');
var RSVP = require('rsvp');

RSVP.on('error', function(err){
  throw err;
});

var fs = require('fs');
var path = require('path');
var broccoli = require('broccoli');
var mkdirp = require('mkdirp');

var fixtures = path.join(__dirname, 'fixtures');
var builder;

describe('broccoli-es6modules', function() {
  describe('caching', function() {
    it('avoids a transpile of any unchanged file', function() {
      var tree = new ES6(fixtures, {
        format: 'amd',
        esperantoOptions: {
          strict: true
        }
      });

      // initial build should cache results
      builder = new broccoli.Builder(tree);
      return builder.build().then(function(){
        // subsequent builds will never call transpiler
        var results = [];
        var _toFormat = tree.toFormat;
        tree.toFormat = function(code, opts){
          results.push(code);
          return _toFormat.call(this, code, opts);
        }


        return builder.build().then(function() {
          expect(results).to.be.empty();
        });
      });
    });

    it('re-transpiles any changed files', function() {
      var tree = new ES6(fixtures, {
        format: 'amd',
        esperantoOptions: {
          strict: true
        }
      });

      // initial build should cache results
      builder = new broccoli.Builder(tree);

      return builder.build().then(function(){
        var results = [];
        var _toFormat = tree.toFormat;
        tree.toFormat = function(code, opts){
          results.push(code);
          return _toFormat.call(this, code, opts);
        }

        var fileName = 'outer.js';
        var code = 'var x="x";'

        var originalCode = readFile(fileName);
        touch(fileName, code);

        return builder.build().then(function() {
          expect(results).to.contain(code);
        }).finally(function(){
          // restore contents
          touch(fileName, originalCode);
        });
      });
    });
  });

  it('transpiles every file', function() {
    var tree = new ES6(fixtures, {
      format: 'amd',
      esperantoOptions: {
        strict: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('outer.js', 'amd').in(result);
      expectFile('reexport.js', 'amd').in(result);
      expectFile('inner/first.js', 'amd').in(result);
    });
  });

  it('uses esperantoOptions if provided', function() {
    var tree = new ES6(fixtures, {
      esperantoOptions: {
        _evilES3SafeReExports: true,
        strict: true,
        absolutePaths: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('reexport-es3.js', 'amd').in(result);
    });
  });

  it('compiles to amd with names if format = namedAmd', function() {
    var tree = new ES6(fixtures, {
      format: 'namedAmd',
      esperantoOptions: {
        strict: true,
        absolutePaths: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('outer.js', 'namedAmd').in(result);
      expectFile('reexport.js', 'namedAmd').in(result);
      expectFile('inner/first.js', 'namedAmd').in(result);
    });
  });

  it('sets sourceMapSource if source maps are enabled', function() {
    var tree = new ES6(fixtures, {
      esperantoOptions: {
        sourceMap: 'inline'
      }
    });

    var result = tree._generateEsperantoOptions('some-path/here');

    expect(result.sourceMapSource).to.equal('some-path/here');
  });

  it('compiles to cjs if format = cjs', function() {
    var tree = new ES6(fixtures, {
      format: 'cjs',
      esperantoOptions: {
        strict: true
      }
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('outer.js', 'cjs').in(result);
      expectFile('reexport.js', 'cjs').in(result);
      expectFile('inner/first.js', 'cjs').in(result);
    });
  });

  it('warns that you cannot compile to umd without bundling', function() {
    expect(function(){
      new ES6(fixtures, {
        format: 'umd'
      });
    }).to.throw(/cannot export to unbundled UMD/);

  });

  it('compiles to a bundled amd format when bundling options are provided', function(){
    var tree = new ES6(fixtures, {
      format: 'amd',
      bundleOptions: {
        entry: 'bundle.js',
        name: 'myModule'
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('myModule.js', 'bundledAmd').in(result);
    });
  });

  it('compiles to a bundled and named amd format when bundling options are provided', function(){
    var tree = new ES6(fixtures, {
      format: 'namedAmd',
      bundleOptions: {
        entry: 'bundle.js',
        name: 'myModule'
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('myModule.js', 'bundledNamedAmd').in(result);
    });
  });

  it('compiles to a bundled and named umd format when bundling options are provided', function(){
    var tree = new ES6(fixtures, {
      format: 'umd',
      bundleOptions: {
        entry: 'bundle.js',
        name: 'myModule'
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('myModule.js', 'umd').in(result);
    });
  });

  it('compiles with custom source extensions', function(){
    var tree = new ES6(fixtures, {
      format: 'amd',
      extensions: ['es6'],
      esperantoOptions: {
        strict: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('custom-ext.js', 'amd').in(result);
    });
  });

  it('compiles with more than one source extension', function(){
    var tree = new ES6(fixtures, {
      format: 'amd',
      extensions: ['es6', 'js'],
      esperantoOptions: {
        strict: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('custom-ext.js', 'amd').in(result);
      expectFile('reexport.js', 'amd').in(result);
      expectFile('outer.js', 'amd').in(result);
    });
  });

  it('compiles using custom target extensions', function(){
    var tree = new ES6(fixtures, {
      format: 'amd',
      targetExtension: 'es3',
      esperantoOptions: {
        strict: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('reexport.es3', 'amd').in(result);
      expectFile('outer.es3', 'amd').in(result);
    });
  });

  it('compiles using custom target extensions and source extensions', function(){
    var tree = new ES6(fixtures, {
      format: 'amd',
      extensions: ['es6', 'js'],
      targetExtension: 'es3',
      esperantoOptions: {
        strict: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('custom-ext.es3', 'amd').in(result);
      expectFile('reexport.es3', 'amd').in(result);
      expectFile('outer.es3', 'amd').in(result);
    });
  });

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });
});


function readFile(filename){
  var file = path.join(__dirname, 'fixtures', filename);
  return fs.readFileSync(file, 'utf-8');
}


function touch(filename, content) {
  var file = path.join(__dirname, 'fixtures', filename);
  fs.writeFileSync(file, content, 'utf-8');
}

function expectSource(expectedContent) {
  function inner(actualContent) {
    expect(actualContent).to.equal(expectedContent);
  }
  return { in: inner };
}

function expectFile(filename, format) {
  function inner(result) {
    var actualContent = fs.readFileSync(path.join(result.directory, filename), 'utf-8');
    mkdirp.sync(path.dirname(path.join(__dirname, 'actual', filename)));
    fs.writeFileSync(path.join(__dirname, 'actual', filename), actualContent);

    var expectedContent;
    try {
      expectedContent = fs.readFileSync(path.join(__dirname, 'expected', format, filename), 'utf-8');
    } catch (err) {
      console.warn("Missing expected file: " + path.join(__dirname, 'expected', format, filename));
    }

    expect(actualContent).to.equal(expectedContent, "discrepancy in " + filename);
  }
  return { in: inner };
}
