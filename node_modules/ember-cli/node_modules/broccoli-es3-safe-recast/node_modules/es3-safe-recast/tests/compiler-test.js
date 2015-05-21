var assert = require('better-assert');
var astEqual = require('ast-equality');
var readFileSync = require('fs').readFileSync;

var compiler = require('./../index');

describe('object properties', function() {
  it('works', function() {
    var path = './tests/fixtures/object-literal';
    var actual = compiler.compile(readFileSync(path + '/input.js'));
    var expected = readFileSync(path + '/output.js');

    astEqual(actual, expected, 'expected input.js and output.js to match');
  });
});

describe('parses es6-module-syntax without error', function() {
  it('works', function() {
    var path = './tests/fixtures/es6-module-syntax';
    var actual = compiler.compile(readFileSync(path + '/input.js'));
    var expected = readFileSync(path + '/output.js');

    // bring this back once we can output ES6 module syntax
    //astEqual(actual, expected, 'expected input.js and output.js to match');
  });
});

describe('object member', function() {
  it('works', function() {
    var path = './tests/fixtures/object-member';
    var actual = compiler.compile(readFileSync(path + '/input.js'));
    var expected = readFileSync(path + '/output.js');

    astEqual(actual, expected, 'expected input.js and output.js to match');
  });
});

describe('such-es2015', function() {
  it('works', function() {
    var path = './tests/fixtures/such-es2015';
    var actual = compiler.compile(readFileSync(path + '/input.js'));
    var expected = readFileSync(path + '/output.js');

    astEqual(actual, expected, 'expected input.js and output.js to match');
  });
});

it('protected local variable scope test', function() {
  var path = './tests/fixtures/local-variable';
  var actual = compiler.compile(readFileSync(path + '/input.js'));
  var expected = readFileSync(path + '/output.js');

  astEqual(actual, expected, 'expected input.js and output.js to match');
});

function literalTestSuite(literal) {
  describe(literal, function() {
    it('works with literal syntax', function() {
      var actual = compiler.compile('var object = {\n' + literal + ': null,\n};');
      var expected = 'var object = {\n"' + literal + '": null,\n};'

      astEqual(actual, expected, 'expected input.js and output.js to match');
    });

    it('works with member syntax', function() {
      var actual = compiler.compile('object.' + literal + '(function(){\n\n});');
      var expected = 'object["' + literal + '"](function(){\n\n});';

      astEqual(actual, expected, 'expected input.js and output.js to match');
    });
  });
}

// Keyword
literalTestSuite('break');
literalTestSuite('case');
literalTestSuite('catch');
literalTestSuite('continue');
literalTestSuite('default');
literalTestSuite('delete');
literalTestSuite('do');
literalTestSuite('else');
literalTestSuite('finally');
literalTestSuite('for');
literalTestSuite('function');
literalTestSuite('if');
literalTestSuite('in');
literalTestSuite('instanceof');
literalTestSuite('new');
literalTestSuite('return');
literalTestSuite('switch');
literalTestSuite('this');
literalTestSuite('throw');
literalTestSuite('try');
literalTestSuite('typeof');
literalTestSuite('var');
literalTestSuite('void');
literalTestSuite('while');
literalTestSuite('with');

// FutureReservedWords
literalTestSuite('abstract');
literalTestSuite('boolean');
literalTestSuite('byte');
literalTestSuite('char');
literalTestSuite('class');
literalTestSuite('const');
literalTestSuite('debugger');
literalTestSuite('double');
literalTestSuite('enum');
literalTestSuite('export');
literalTestSuite('extends');
literalTestSuite('final');
literalTestSuite('float');
literalTestSuite('goto');
literalTestSuite('implements');
literalTestSuite('import');
literalTestSuite('int');
literalTestSuite('interface');
literalTestSuite('long');
literalTestSuite('native');
literalTestSuite('package');
literalTestSuite('private');
literalTestSuite('protected');
literalTestSuite('public');
literalTestSuite('short');
literalTestSuite('static');
literalTestSuite('super');
literalTestSuite('synchronized');
literalTestSuite('throws');
literalTestSuite('transient');
literalTestSuite('volatile');

// NullLiteral
literalTestSuite('null');

// BooleanLiteral
literalTestSuite('true');
literalTestSuite('false');
