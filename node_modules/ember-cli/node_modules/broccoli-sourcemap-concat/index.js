var SourceMapAwareConcat = require('./concat-with-maps');
var SimpleConcat = require('./simple-concat');
var merge = require('lodash-node/modern/objects/merge');

module.exports = function(inputTree, options) {
  if (!options || !options.outputFile) {
    throw new Error("outputFile is required");
  }

  var config = merge({ enabled: true}, options.sourceMapConfig);
  if (config.enabled) {
    var extensions = (config.extensions || ['js']);
    for (var i=0; i<extensions.length; i++) {
      var ext = '.' + extensions[i].replace(/^\./,'');
      if (options.outputFile.slice(-1 * ext.length) === ext) {
        return new SourceMapAwareConcat(inputTree, options);
      }
    }
  }
  return new SimpleConcat(inputTree, options);
};
