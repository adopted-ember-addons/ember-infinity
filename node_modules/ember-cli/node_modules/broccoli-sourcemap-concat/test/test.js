/* global describe, afterEach, it, expect */

var expect = require('chai').expect;  // jshint ignore:line
var sinon = require('sinon');
var concat = require('..');
var RSVP = require('rsvp');
RSVP.on('error', function(err){throw err;});
var fs = require('fs');
var path = require('path');
var broccoli = require('broccoli');
var merge = require('broccoli-merge-trees');

var fixtures = path.join(__dirname, 'fixtures');
var builder;

describe('sourcemap-concat', function() {
  it('concatenates files in one dir', function() {
    var tree = concat(fixtures, {
      outputFile: '/all-inner.js',
      inputFiles: ['inner/*.js']
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('all-inner.js').in(result);
      expectFile('all-inner.map').in(result);
    });
  });

  it('concatenates files across dirs', function() {
    var tree = concat(fixtures, {
      outputFile: '/all.js',
      inputFiles: ['**/*.js']
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('all.js').in(result);
      expectFile('all.map').in(result);
    });
  });

  it('inserts header', function() {
    var tree = concat(fixtures, {
      outputFile: '/all-with-header.js',
      inputFiles: ['**/*.js'],
      header: "/* This is my header. */"
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('all-with-header.js').in(result);
      expectFile('all-with-header.map').in(result);
    });
  });

  it('inserts header when sourcemaps are disabled', function() {
    var tree = concat(fixtures, {
      outputFile: '/all-with-header.js',
      inputFiles: ['**/*.js'],
      header: "/* This is my header. */",
      sourceMapConfig: { enabled: false }
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('all-with-header.js').withoutSrcURL().in(result);
      expectFile('all-with-header.map').notIn(result);
    });
  });

  it('disables sourcemaps when requested', function() {
    var tree = concat(fixtures, {
      outputFile: '/no-sourcemap.js',
      inputFiles: ['**/*.js'],
      header: "/* This is my header. */",
      sourceMapConfig: { extensions: [] }
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('no-sourcemap.js').in(result);
      expectFile('no-sourcemap.map').notIn(result);
    });
  });

  it('assimilates existing sourcemap', function() {
    var inner = concat(fixtures, {
      outputFile: '/all-inner.js',
      inputFiles: ['inner/*.js'],
      header: "/* This is my header. */"
    });
    var other = concat(fixtures, {
      outputFile: '/all-other.js',
      inputFiles: ['other/*.js'],
      header: "/* Other header. */"
    });
    var final = concat(merge([inner, other]), {
      outputFile: '/staged.js',
      inputFiles: ['all-inner.js', 'all-other.js'],
    });

    builder = new broccoli.Builder(final);
    return builder.build().then(function(result) {
      expectFile('staged.js').in(result);
      expectFile('staged.map').in(result);
    });
  });

  it('appends footer files', function() {
    var tree = concat(fixtures, {
      outputFile: '/inner-with-footers.js',
      inputFiles: ['inner/*.js'],
      footerFiles: ['other/third.js', 'other/fourth.js']
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('inner-with-footers.js').in(result);
      expectFile('inner-with-footers.map').in(result);
    });
  });

  it('appends footer files when sourcemaps are disabled', function() {
    var tree = concat(fixtures, {
      outputFile: '/inner-with-footers.js',
      inputFiles: ['inner/*.js'],
      footerFiles: ['other/third.js', 'other/fourth.js'],
      sourceMapConfig: { extensions: [] }
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('inner-with-footers.js').withoutSrcURL().in(result);
      expectFile('inner-with-footers.map').notIn(result);
    });
  });

  it('can ignore empty content', function() {
    var tree = concat(fixtures, {
      outputFile: '/nothing.js',
      inputFiles: ['nothing/*.js'],
      allowNone: true
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('nothing.js').in(result);
      expectFile('nothing.map').in(result);
    });
  });

  it('can ignore empty content when sourcemaps are disabled', function() {
    var tree = concat(fixtures, {
      outputFile: '/nothing.css',
      inputFiles: ['nothing/*.css'],
      allowNone: true
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('nothing.css').in(result);
    });
  });

  it('does not ignore empty content when allowNone is not explicitly set', function() {
    var tree = concat(fixtures, {
      outputFile: '/nothing.js',
      inputFiles: ['nothing/*.js']
    });
    var failure = sinon.spy();
    builder = new broccoli.Builder(tree);
    return builder.build().catch(failure).then(function(){
      expect(failure.called).to.be.true();
    });
  });

  it('does not ignore empty content when allowNone is not explicitly set and sourcemaps are disabled', function() {
    var tree = concat(fixtures, {
      outputFile: '/nothing.css',
      inputFiles: ['nothing/*.css']
    });
    var failure = sinon.spy();
    builder = new broccoli.Builder(tree);
    return builder.build().catch(failure).then(function(){
      expect(failure.called).to.be.true();
    });
  });


  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });

});

function expectFile(filename) {
  var stripURL = false;
  return {
      in: function(result, subdir) {
        if (!subdir) {
          subdir = '.';
        }
        var actualContent = fs.readFileSync(path.join(result.directory, subdir, filename), 'utf-8');
        fs.writeFileSync(path.join(__dirname, 'actual', filename), actualContent);

        var expectedContent;
        try {
          expectedContent = fs.readFileSync(path.join(__dirname, 'expected', filename), 'utf-8');
          if (stripURL) {
            expectedContent = expectedContent.replace(/\/\/# sourceMappingURL=.*$/, '');
          }

        } catch (err) {
          console.warn("Missing expcted file: " + path.join(__dirname, 'expected', filename));
        }
        expectSameFiles(actualContent, expectedContent, filename);
        return this;
      },
    notIn: function(result) {
      expect(fs.existsSync(path.join(result.directory, filename))).to.equal(false, filename + ' should not have been present');
      return this;
    },
    withoutSrcURL: function() {
      stripURL = true;
      return this;
    }
  };
}

function expectSameFiles(actualContent, expectedContent, filename) {
  if (/\.map$/.test(filename)) {
    expect(JSON.parse(actualContent)).to.deep.equal(expectedContent ? JSON.parse(expectedContent) : undefined, 'discrepancy in ' + filename);
  } else {
    expect(actualContent).to.equal(expectedContent, 'discrepancy in ' + filename);
  }
}
