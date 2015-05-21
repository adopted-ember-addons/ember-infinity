var assert     = require('better-assert');
var compiler   = require('./../index');
var TEST_REGEX = compiler.TEST_REGEX;

// For matching test cases
function literalMatchSuite(literal) {
  describe(literal, function() {
    it('works with property syntax', function() {
      var sample = 'var something = { ' + literal + '\t\n  :\n \'blah\' };';

      assert(sample.match(TEST_REGEX));
    });

    it('works with member syntax', function() {
      var sample = 'object\n  \t.\n\t  ' + literal + '(function(){\n\n});';

      assert(sample.match(TEST_REGEX));
    });

    it('does not match alone', function() {
      var sample = literal;

      assert(!sample.match(TEST_REGEX));
    });
  });
}

// Keyword
literalMatchSuite('break');
literalMatchSuite('case');
literalMatchSuite('catch');
literalMatchSuite('continue');
literalMatchSuite('default');
literalMatchSuite('delete');
literalMatchSuite('do');
literalMatchSuite('else');
literalMatchSuite('finally');
literalMatchSuite('for');
literalMatchSuite('function');
literalMatchSuite('if');
literalMatchSuite('in');
literalMatchSuite('instanceof');
literalMatchSuite('new');
literalMatchSuite('return');
literalMatchSuite('switch');
literalMatchSuite('this');
literalMatchSuite('throw');
literalMatchSuite('try');
literalMatchSuite('typeof');
literalMatchSuite('var');
literalMatchSuite('void');
literalMatchSuite('while');
literalMatchSuite('with');

// FutureReservedWords
literalMatchSuite('abstract');
literalMatchSuite('boolean');
literalMatchSuite('byte');
literalMatchSuite('char');
literalMatchSuite('class');
literalMatchSuite('const');
literalMatchSuite('debugger');
literalMatchSuite('double');
literalMatchSuite('enum');
literalMatchSuite('export');
literalMatchSuite('extends');
literalMatchSuite('final');
literalMatchSuite('float');
literalMatchSuite('goto');
literalMatchSuite('implements');
literalMatchSuite('import');
literalMatchSuite('int');
literalMatchSuite('interface');
literalMatchSuite('long');
literalMatchSuite('native');
literalMatchSuite('package');
literalMatchSuite('private');
literalMatchSuite('protected');
literalMatchSuite('public');
literalMatchSuite('short');
literalMatchSuite('static');
literalMatchSuite('super');
literalMatchSuite('synchronized');
literalMatchSuite('throws');
literalMatchSuite('transient');
literalMatchSuite('volatile');

// NullLiteral
literalMatchSuite('null');

// BooleanLiteral
literalMatchSuite('true');
literalMatchSuite('false');
