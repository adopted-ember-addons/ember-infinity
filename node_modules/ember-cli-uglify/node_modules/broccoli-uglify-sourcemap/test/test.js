/* global describe, afterEach, it, expect */

var expect = require('chai').expect;  // jshint ignore:line
var uglify = require('..');
var fs = require('fs');
var path = require('path');
var broccoli = require('broccoli');
var mkdirp = require('mkdirp');

var fixtures = path.join(__dirname, 'fixtures');
var builder;

describe('broccoli-uglify-sourcemap', function() {
  it('generates expected output', function() {
    var tree = new uglify(fixtures);
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('with-upstream-sourcemap.js').in(result, 'inside');
      expectFile('with-upstream-sourcemap.map').in(result, 'inside');
      expectFile('no-upstream-sourcemap.js').in(result);
      expectFile('no-upstream-sourcemap.map').in(result);
      expectFile('something.css').in(result);
    });
  });

  it('can disable sourcemaps', function() {
    var tree = new uglify(fixtures, {sourceMapConfig: { enable: false } });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('with-upstream-sourcemap.js').withoutSourcemapURL().in(result, 'inside');
      expectFile('with-upstream-sourcemap.map').notIn(result);
      expectFile('no-upstream-sourcemap.js').withoutSourcemapURL().in(result);
      expectFile('no-upstream-sourcemap.map').notIn(result);
      expectFile('something.css').in(result);
    });
  });

  it('supports alternate sourcemap location', function() {
    var tree = new uglify(fixtures, { sourceMapConfig: { mapDir: 'maps'}});
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('with-upstream-sourcemap.js').withSourcemapURL('/maps/with-upstream-sourcemap.map').in(result, 'inside');
      expectFile('with-upstream-sourcemap.map').in(result, 'maps');
      expectFile('no-upstream-sourcemap.js').withSourcemapURL('/maps/no-upstream-sourcemap.map').in(result);
      expectFile('no-upstream-sourcemap.map').in(result, 'maps');
      expectFile('something.css').in(result);
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
  var expectURL;

  function inner(result, subdir) {
    if (!subdir) {
      subdir = '.';
    }
    var actualContent = fs.readFileSync(path.join(result.directory, subdir, filename), 'utf-8');
    mkdirp.sync(path.dirname(path.join(__dirname, 'actual', filename)));
    fs.writeFileSync(path.join(__dirname, 'actual', filename), actualContent);

    var expectedContent;
    try {
      expectedContent = fs.readFileSync(path.join(__dirname, 'expected', filename), 'utf-8');
      if (stripURL) {
        expectedContent = expectedContent.replace(/\s*\/\/# sourceMappingURL=.*$/, '');
      }
      if (expectURL) {
        expectedContent = expectedContent.replace(/(\s*\/\/# sourceMappingURL=).*$/, function(all, capture){
          return capture + expectURL;
        });
      }

    } catch (err) {
      console.warn("Missing expcted file: " + path.join(__dirname, 'expected', filename));
    }

    expect(actualContent).to.equal(expectedContent, "discrepancy in " + filename);
    return this;
  }
  function notIn(result) {
    expect(fs.existsSync(path.join(result.directory, filename))).to.equal(false);
    return this;
  }
  function withoutSourcemapURL() {
    stripURL = true;
    return this;
  }
  function withSourcemapURL(url) {
    expectURL = url;
    return this;
  }
  return { in: inner, notIn: notIn, withoutSourcemapURL: withoutSourcemapURL, withSourcemapURL: withSourcemapURL };
}
