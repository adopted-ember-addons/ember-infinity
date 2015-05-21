var fs       = require('fs');
var path     = require('path');
var assert   = require('assert');
var walkSync = require('walk-sync');
var broccoli = require('broccoli');

var rewrite  = require('..');

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

  it('uses the provided assetMap to replace strings', function(){
    var sourcePath = 'tests/fixtures/basic';
    var tree = rewrite(sourcePath + '/input', {
      assetMap: {
        'foo/bar/widget.js': 'blahzorz-1.js',
        'images/sample.png': 'images/fingerprinted-sample.png',
        'fonts/OpenSans/Light/OpenSans-Light.eot': 'fonts/OpenSans/Light/fingerprinted-OpenSans-Light.eot',
        'fonts/OpenSans/Light/OpenSans-Light.woff': 'fonts/OpenSans/Light/fingerprinted-OpenSans-Light.woff',
        'fonts/OpenSans/Light/OpenSans-Light.ttf': 'fonts/OpenSans/Light/fingerprinted-OpenSans-Light.ttf',
        'fonts/OpenSans/Light/OpenSans-Light.svg': 'fonts/OpenSans/Light/fingerprinted-OpenSans-Light.svg',
        'fonts/OpenSans/Medium/OpenSans-Medium.eot': 'fonts/OpenSans/Medium/fingerprinted-OpenSans-Medium.eot',
        'fonts/OpenSans/Medium/OpenSans-Medium.woff': 'fonts/OpenSans/Medium/fingerprinted-OpenSans-Medium.woff',
        'fonts/OpenSans/Medium/OpenSans-Medium.ttf': 'fonts/OpenSans/Medium/fingerprinted-OpenSans-Medium.ttf',
        'fonts/OpenSans/Medium/OpenSans-Medium.svg': 'fonts/OpenSans/Medium/fingerprinted-OpenSans-Medium.svg'
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  })

  it('ignore option tell filter what files should not be processed', function(){
    var sourcePath = 'tests/fixtures/with-ignore';
    var tree = rewrite(sourcePath + '/input', {
      assetMap: {
        'foo/bar/widget.js': 'blahzorz-1.js',
        'images/sample.png': 'images/fingerprinted-sample.png',
      },
      ignore: ['ignore-this-file.html']
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('rewrites relative urls', function () {
    var sourcePath = 'tests/fixtures/relative-urls';
    var tree = rewrite(sourcePath + '/input', {
      assetMap: {
        'foo/bar/widget.js': 'blahzorz-1.js',
        'images/sample.png': 'images/fingerprinted-sample.png',
        'assets/images/foobar.png': 'assets/images/foobar-fingerprint.png',
        'assets/images/baz.png': 'assets/images/baz-fingerprint.png'
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function (graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('rewrites relative urls with prepend', function () {
    var sourcePath = 'tests/fixtures/relative-urls-prepend';
    var tree = rewrite(sourcePath + '/input', {
      assetMap: {
        'foo/bar/widget.js': 'blahzorz-1.js',
        'images/sample.png': 'images/fingerprinted-sample.png',
        'assets/images/foobar.png': 'assets/images/foobar-fingerprint.png'
      },
      prepend: 'https://cloudfront.net/'
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function (graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });

  });

  it('replaces the correct match for the file extension', function () {
    var sourcePath = 'tests/fixtures/extensions';

    var tree = rewrite(sourcePath + '/input', {
      assetMap: {
        'fonts/roboto-regular.eot': 'fonts/roboto-regular-f1.eot',
        'fonts/roboto-regular.woff': 'fonts/roboto-regular-f3.woff',
        'fonts/roboto-regular.ttf': 'fonts/roboto-regular-f4.ttf',
        'fonts/roboto-regular.svg': 'fonts/roboto-regular-f5.svg',
        'fonts/roboto-regular.woff2': 'fonts/roboto-regular-f2.woff2'
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function (graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('replaces source map URLs', function () {
    var sourcePath = 'tests/fixtures/sourcemaps';

    var tree = rewrite(sourcePath + '/input', {
      replaceExtensions: ['js'],
      assetMap: {
        'the.map' : 'the-other-map',
        'http://absolute.com/source.map' : 'http://cdn.absolute.com/other-map'
      }
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function (graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });
});
