var fs       = require('fs');
var path     = require('path');
var crypto   = require('crypto');
var assert   = require('assert');
var walkSync = require('walk-sync');
var broccoli = require('broccoli');
var mergeTrees = require('broccoli-merge-trees');

var assetRev  = require('../lib/asset-rev');

var builder;

function confirmOutput(actualPath, expectedPath) {
  var actualFiles = walkSync(actualPath);
  var expectedFiles = walkSync(expectedPath);

  assert.deepEqual(actualFiles, expectedFiles, 'files output should be the same as those input');

  expectedFiles.forEach(function(relativePath) {
    if (relativePath.slice(-1) === '/') { return; }

    var actual   = fs.readFileSync(path.join(actualPath, relativePath), { encoding: 'utf8'});
    var expected = fs.readFileSync(path.join(expectedPath, relativePath), { encoding: 'utf8' });

    assert.equal(actual, expected, relativePath + ': does not match expected output');
  });
}

describe('broccoli-asset-rev', function() {
  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('revs the assets and rewrites the source', function(){
    var sourcePath = 'tests/fixtures/basic';

    var tree = assetRev(sourcePath + '/input', {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css']
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('revs the assets when it is not the first plugin', function () {
    var sourcePath = 'tests/fixtures/basic';

    var merged = mergeTrees([sourcePath + '/input']);

    var tree = assetRev(merged, {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css']
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('will prepend if set', function () {
    var sourcePath = 'tests/fixtures/prepend';

    var tree = assetRev(sourcePath + '/input', {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css'],
      prepend: 'https://foobar.cloudfront.net/'
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('replaces the correct match for the file extension', function () {
    var sourcePath = 'tests/fixtures/extensions';

    var tree = assetRev(sourcePath + '/input', {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'woff', 'woff2', 'ttf', 'svg', 'eot'],
      replaceExtensions: ['html', 'js' ,'css']
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function (graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('uses customHash string value', function(){
    var sourcePath = 'tests/fixtures/customHash-simple';

    var tree = assetRev(sourcePath + '/input', {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css'],
      customHash: 'test'
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('uses customHash function value', function(){
    var sourcePath = 'tests/fixtures/customHash-function';

    var tree = assetRev(sourcePath + '/input', {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css'],
      customHash: function(buf) {
        var sha1 = crypto.createHash('sha1');
        sha1.update(buf);
        return sha1.digest('hex');
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });
});
