'use strict';

var fs = require('fs');
var broccoli = require('broccoli');
var assert = require('assert');
var templateCompilerFilter = require('../index');
var builder;

describe('templateCompilerFilter', function(){
  var sourcePath = 'test/fixtures';

  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  var htmlbarsOptions, htmlbarsPrecompile;

  beforeEach(function() {
    htmlbarsOptions = {
      isHTMLBars: true,
      templateCompiler: require('../bower_components/ember/ember-template-compiler')
    };

    htmlbarsPrecompile = htmlbarsOptions.templateCompiler.precompile;
  });

  afterEach(function() {

  });

  it('precompiles templates into htmlbars', function(){
    var tree = templateCompilerFilter(sourcePath, htmlbarsOptions);

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(results) {
      var actual = fs.readFileSync(results.directory + '/template.js', { encoding: 'utf8'});
      var source = fs.readFileSync(sourcePath + '/template.hbs', { encoding: 'utf8' });
      var expected = 'export default Ember.HTMLBars.template(' + htmlbarsPrecompile(source) + ');';

      assert.equal(actual,expected,'They dont match!');
    });
  });

  it('passes FEATURES to compiler', function(){
    htmlbarsOptions.FEATURES = {
      'ember-htmlbars-component-generation': true
    };

    var tree = templateCompilerFilter(sourcePath, htmlbarsOptions);

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(results) {
      var actual = fs.readFileSync(results.directory + '/web-component-template.js', { encoding: 'utf8'});
      var source = fs.readFileSync(sourcePath + '/web-component-template.hbs', { encoding: 'utf8' });
      var expected = 'export default Ember.HTMLBars.template(' + htmlbarsPrecompile(source) + ');';

      assert.equal(actual,expected,'They dont match!');
    });
  });
});
